import { composition } from "./lib/data-contract";
import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";

const PERIOD_LABELS: Record<string, string> = {
  "JUL-AGO_2024": "Jul-Ago 24",
  "SEP-OCT_2024": "Sep-Oct 24",
  "NOV-DIC_2024": "Nov-Dic 24",
  "ENE-FEB_2025": "Ene-Feb 25",
  "MAR-ABR_2025": "Mar-Abr 25",
  "MAY-JUN_2025": "May-Jun 25",
  "JUL-AGO_2025": "Jul-Ago 25",
};

type Header = {
  column: number;
  sub: string;
  normalizedQuestion: string;
  normalizedSub: string;
};

type BenchmarkPeriod = {
  period: string;
  qualityAdjustedHeadcount: number;
  exits: number;
  matchedRates: { exits: { value: number; n: number } };
  salaryEntryMedian: number;
};

type BenchmarkFile = {
  periods: BenchmarkPeriod[];
  latest: { period: string };
};

type DistributionItem = { bucket: string; value: number };

const normalize = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9]+/g, " ")
  .trim()
  .toLowerCase();

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.result !== undefined) return cellText(record.result);
    if (record.text !== undefined) return cellText(record.text);
    if (Array.isArray(record.richText)) {
      return record.richText.map((part) => cellText((part as Record<string, unknown>).text)).join("");
    }
  }
  return String(value);
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = cellText(value).trim().replace(/[$,%]/g, "").replace(/,/g, "");
  if (!text || ["-", "NO APLICA", "N/A", "NA", "DESCONOCIDO"].includes(text.toUpperCase())) return null;
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildHeaders(worksheet: ExcelJS.Worksheet): Header[] {
  const headers: Header[] = [];
  let activeQuestion = "";
  for (let column = 1; column <= worksheet.columnCount; column += 1) {
    const rawQuestion = cellText(worksheet.getCell(1, column).value).trim();
    if (rawQuestion && !/^Unnamed:/i.test(rawQuestion)) activeQuestion = rawQuestion;
    const sub = cellText(worksheet.getCell(2, column).value).trim();
    headers.push({
      column,
      sub,
      normalizedQuestion: normalize(activeQuestion),
      normalizedSub: normalize(sub),
    });
  }
  return headers;
}

function findColumn(headers: Header[], questionNeedle: string, subNeedle?: string): number {
  const q = normalize(questionNeedle);
  const s = subNeedle ? normalize(subNeedle) : null;
  const match = headers.find((header) => header.normalizedQuestion.includes(q) && (!s || header.normalizedSub.includes(s)));
  if (!match) throw new Error(`Column not found: ${questionNeedle}${subNeedle ? ` / ${subNeedle}` : ""}`);
  return match.column;
}

function findGroup(headers: Header[], questionNeedle: string): Header[] {
  const q = normalize(questionNeedle);
  return headers.filter((header) => header.normalizedQuestion.includes(q) && Boolean(header.sub));
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function quantile(values: number[], q: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] * (upper - position) + sorted[upper] * (position - lower);
}



function validCompanyRows(worksheet: ExcelJS.Worksheet, companyColumn: number): number[] {
  const rows: number[] = [];
  for (let row = 3; row <= worksheet.rowCount; row += 1) {
    const company = cellText(worksheet.getCell(row, companyColumn).value).trim();
    if (/^COMPAÑIA\s+\d+$/i.test(company)) rows.push(row);
  }
  return rows;
}

function weightedDistribution(
  worksheet: ExcelJS.Worksheet,
  rows: number[],
  exitsColumn: number,
  columns: Array<{ bucket: string; column: number }>,
) {
  const weighted = new Map(columns.map((item) => [item.bucket, 0]));
  let validCompanies = 0;
  let weightedExits = 0;

  for (const row of rows) {
    const exits = numberValue(worksheet.getCell(row, exitsColumn).value);
    if (!exits || exits <= 0) continue;
    const values = composition(columns.map(item => numberValue(worksheet.getCell(row, item.column).value)));
    if (!values) continue;

    validCompanies += 1;
    weightedExits += exits;
    columns.forEach((item, index) => {
      weighted.set(item.bucket, (weighted.get(item.bucket) ?? 0) + exits * (values[index] ?? 0));
    });
  }

  const distribution: DistributionItem[] = columns.map((item) => ({
    bucket: item.bucket,
    value: weightedExits ? round(((weighted.get(item.bucket) ?? 0) / weightedExits) * 100, 1) : 0,
  }));

  if (validCompanies < 5) throw new Error("Insufficient complete responses for retention distribution");
  const shares = columns.map(item => (weighted.get(item.bucket) ?? 0) / weightedExits * 100);
  return { distribution, shares, validCompanies, weightedExits: Math.round(weightedExits) };
}

async function main() {
  const source = process.argv[2] ?? "data/raw/BASE HISTORICA(1).xlsx";
  const outputDir = path.resolve(process.env.CATCH_DATA_OUTPUT ?? "data/processed");
  const benchmarkPath = path.join(outputDir, "benchmark.json");
  const benchmark = JSON.parse(await fs.readFile(benchmarkPath, "utf8")) as BenchmarkFile;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(source);
  const latestSheet = workbook.worksheets.filter((worksheet) => PERIOD_LABELS[worksheet.name]).at(-1);
  if (!latestSheet) throw new Error("No historical period worksheet found.");

  const headers = buildHeaders(latestSheet);
  const companyColumn = findColumn(headers, "Compañía");
  const rows = validCompanyRows(latestSheet, companyColumn);
  if (!rows.length) throw new Error("No company rows found in latest period.");

  const exitsColumn = findColumn(headers, "NÚMERO DE BAJAS que tuvo durante el BIMESTRE");

  const tenureColumns = [
    { bucket: "0–1 mes", column: findColumn(headers, "Qué antigüedad tenían los empleados que fueron bajas", "0 a 1 Mes") },
    { bucket: "1–3 meses", column: findColumn(headers, "Qué antigüedad tenían los empleados que fueron bajas", "1 a 3 Meses") },
    { bucket: "3–12 meses", column: findColumn(headers, "Qué antigüedad tenían los empleados que fueron bajas", "3 a 12 Meses") },
    { bucket: "1–3 años", column: findColumn(headers, "Qué antigüedad tenían los empleados que fueron bajas", "1 a 3 Años") },
    { bucket: "Más de 3 años", column: findColumn(headers, "Qué antigüedad tenían los empleados que fueron bajas", "Más de 3 Años") },
  ];
  const tenure = weightedDistribution(latestSheet, rows, exitsColumn, tenureColumns);

  const ageColumns = [
    { bucket: "Más de 50", column: findColumn(headers, "Qué edad tenían los empleados que fueron bajas", "Más de 50 años") },
    { bucket: "38–50", column: findColumn(headers, "Qué edad tenían los empleados que fueron bajas", "38 años a 50") },
    { bucket: "31–37", column: findColumn(headers, "Qué edad tenían los empleados que fueron bajas", "31 años a 37") },
    { bucket: "23–30", column: findColumn(headers, "Qué edad tenían los empleados que fueron bajas", "23 años a 30") },
    { bucket: "22 o menos", column: findColumn(headers, "Qué edad tenían los empleados que fueron bajas", "menos de 22 años") },
  ];
  const age = weightedDistribution(latestSheet, rows, exitsColumn, ageColumns);

  const reasonHeaders = findGroup(headers, "Desglose el número de bajas de acuerdo a lo siguiente");
  const reasonCounts = reasonHeaders
    .filter((header) => !normalize(header.sub).includes("open ended"))
    .map((header) => ({
      reason: header.sub,
      count: rows.reduce<number>((sum, row) => sum + (numberValue(latestSheet.getCell(row, header.column).value) ?? 0), 0),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const reportedReasonEvents = reasonCounts.reduce<number>((sum, item) => sum + item.count, 0);
  const reasonDistribution = reasonCounts.map((item) => ({
    reason: item.reason,
    count: Math.round(item.count),
    sharePct: reportedReasonEvents ? round((item.count / reportedReasonEvents) * 100, 1) : 0,
  }));

  const salarySpecs = [
    ["Ingreso", "Salario Diario Inicial"],
    ["Intermedio bajo", "Salario Diario Intermedio - Bajo"],
    ["Intermedio alto", "Salario Diario Intermedio - Alto"],
    ["Máximo", "Salario Diario Máximo"],
  ] as const;

  const bands = salarySpecs.map(([band, question]) => {
    const column = findColumn(headers, question);
    const values = rows
      .map((row) => numberValue(latestSheet.getCell(row, column).value))
      .filter((value): value is number => value !== null && value > 0);
    return {
      band,
      min: round(Math.min(...values), 2),
      q1: round(quantile(values, 0.25), 2),
      median: round(median(values), 2),
      q3: round(quantile(values, 0.75), 2),
      max: round(Math.max(...values), 2),
      n: values.length,
    };
  });

  const entry = bands[0].median;
  const low = bands[1].median;
  const high = bands[2].median;
  const maximum = bands[3].median;

  const turnoverTrendPct = benchmark.periods.map(period => ({ period: period.period, value: round(period.matchedRates.exits.value, 2), n: period.matchedRates.exits.n }));

  const output = {
    metadata: {
      source: path.basename(source),
      period: benchmark.latest.period,
      privacy: "aggregated-only",
      notes: [
        "Tenure and age distributions are exit-weighted across companies with all categories present; normalized to 100% after a 5-point reconciliation tolerance. Missing categories are not zero.",
        "Exit-reason counts may not reconcile to total exits; reason share is normalized over reported reason events.",
        "Salary distribution contains no company identifiers and represents the market sample.",
      ],
    },
    retention: {
      turnoverTrendPct,
      tenureDistributionPct: tenure.distribution,
      tenureValidCompanies: tenure.validCompanies,
      tenureWeightedExits: tenure.weightedExits,
      earlyAttritionUnder3MonthsPct: round(tenure.shares.slice(0, 2).reduce((sum, value) => sum + value, 0), 1),
      firstYearExitSharePct: round(tenure.shares.slice(0, 3).reduce((sum, value) => sum + value, 0), 1),
      ageDistributionPct: age.distribution,
      ageValidCompanies: age.validCompanies,
      ageWeightedExits: age.weightedExits,
      reportedReasonEvents: Math.round(reportedReasonEvents),
      reasonDistribution,
    },
    compensation: {
      bands,
      salaryProgressionRatio: round(maximum / entry, 2),
      entryToLowPct: round(((low / entry) - 1) * 100, 2),
      lowToHighPct: round(((high / low) - 1) * 100, 2),
      highToMaxPct: round(((maximum / high) - 1) * 100, 2),
      entryMedianTrend: benchmark.periods.map((period) => ({ period: period.period, value: period.salaryEntryMedian })),
    },
  };

  await fs.writeFile(path.join(outputDir, "people-intelligence.json"), JSON.stringify(output, null, 2));
  console.log(`People Intelligence aggregate written for ${benchmark.latest.period}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
