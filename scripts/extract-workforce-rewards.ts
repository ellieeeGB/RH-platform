import { percentagePoints } from "./lib/data-contract";
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
  question: string;
  sub: string;
  normalizedQuestion: string;
  normalizedSub: string;
};

type DemandHotspot = {
  family: string;
  role: string;
  education: string;
  demand: number;
};

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
  if (!text || ["-", "NO APLICA", "N/A", "NA", "NINGUNA", "NINGUNO", "DESCONOCIDO"].includes(text.toUpperCase())) return null;
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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

function median(values: number[]): number {
  return quantile(values, 0.5);
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
      question: activeQuestion,
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

function findUsageAfter(headers: Header[], startColumn: number, maxDistance = 16): number {
  const usageNeedle = normalize("Cuántos colaboradores hacen uso efectivo de esta prestación");
  const match = headers.find((header) =>
    header.column > startColumn
    && header.column <= startColumn + maxDistance
    && header.normalizedQuestion.includes(usageNeedle),
  );
  if (!match) throw new Error(`Usage column not found after column ${startColumn}`);
  return match.column;
}

function companyRows(worksheet: ExcelJS.Worksheet, headers: Header[]): number[] {
  const companyCol = findColumn(headers, "Compañía");
  const rows: number[] = [];
  for (let row = 3; row <= worksheet.rowCount; row += 1) {
    if (/^COMPAÑIA\s+\d+$/i.test(cellText(worksheet.getCell(row, companyCol).value).trim())) rows.push(row);
  }
  return rows;
}

function sumColumn(worksheet: ExcelJS.Worksheet, rows: number[], column: number): number {
  return rows.reduce<number>((sum, row) => sum + (numberValue(worksheet.getCell(row, column).value) ?? 0), 0);
}

function percentValue(value: unknown): number | null {
  return percentagePoints(value, "fraction");
}

function yes(value: unknown): boolean {
  const text = normalize(cellText(value));
  return text === "si" || text.startsWith("si ") || text === "yes";
}

function stats(values: number[]) {
  return {
    median: round(median(values), 2),
    q1: round(quantile(values, 0.25), 2),
    q3: round(quantile(values, 0.75), 2),
    n: values.length,
  };
}

function splitRoleEducation(sub: string): { role: string; education: string } {
  const separator = " - ";
  const index = sub.indexOf(separator);
  if (index < 0) return { role: sub, education: "No especificada" };
  const role = sub.slice(0, index).trim();
  let education = sub.slice(index + separator.length).trim();
  education = education
    .replace("Técnico TSU (Técnico Superior Universitario)", "Técnico / TSU")
    .replace("Universidad Ingeniería", "Universidad / Ingeniería")
    .replace("Universidad Licenciatura", "Licenciatura");
  return { role, education };
}

function demandFromGroup(
  worksheet: ExcelJS.Worksheet,
  rows: number[],
  headers: Header[],
  questionNeedle: string,
  family: string,
): DemandHotspot[] {
  return findGroup(headers, questionNeedle)
    .filter((header) => !normalize(header.sub).includes("otra opcion"))
    .map((header) => {
      const { role, education } = splitRoleEducation(header.sub);
      return { family, role, education, demand: Math.round(sumColumn(worksheet, rows, header.column)) };
    })
    .filter((item) => item.demand > 0)
    .sort((a, b) => b.demand - a.demand);
}

async function main() {
  const source = process.argv[2] ?? "data/raw/BASE HISTORICA(1).xlsx";
  const outputDir = path.resolve(process.env.CATCH_DATA_OUTPUT ?? "data/processed");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(source);

  const periodSheets = workbook.worksheets.filter((worksheet) => PERIOD_LABELS[worksheet.name]);
  if (!periodSheets.length) throw new Error("No historical period worksheets found.");

  const vacancyTrend = periodSheets.map((worksheet) => {
    const headers = buildHeaders(worksheet);
    const rows = companyRows(worksheet, headers);
    const operationalCol = findColumn(headers, "PLAZAS OPERATIVAS y PLAZAS ADMINISTRATIVAS", "Plazas operativas próximas a contratar");
    const administrativeCol = findColumn(headers, "PLAZAS OPERATIVAS y PLAZAS ADMINISTRATIVAS", "Plazas administrativas próximas a contratar");
    const operational = Math.round(sumColumn(worksheet, rows, operationalCol));
    const administrative = Math.round(sumColumn(worksheet, rows, administrativeCol));
    return {
      period: PERIOD_LABELS[worksheet.name],
      operational,
      administrative,
      total: operational + administrative,
    };
  });

  const latestSheet = periodSheets.at(-1)!;
  const headers = buildHeaders(latestSheet);
  const rows = companyRows(latestSheet, headers);
  const latestVacancy = vacancyTrend.at(-1)!;
  const previousVacancy = vacancyTrend.at(-2)!;

  const operationalHotspots = demandFromGroup(
    latestSheet,
    rows,
    headers,
    "vacantes a cubrir de nivel OPERATIVO EN GENERAL",
    "Operativo",
  );
  const technicalHotspots = demandFromGroup(
    latestSheet,
    rows,
    headers,
    "vacantes a cubrir de nivel TÉCNICO EN GENERAL",
    "Técnico",
  );
  const professionalHotspots = demandFromGroup(
    latestSheet,
    rows,
    headers,
    "vacantes a cubrir de nivel ADMINISTRATIVO - GERENCIA",
    "Profesional",
  );

  const structuredOperational = operationalHotspots.reduce<number>((sum, item) => sum + item.demand, 0);
  const structuredTechnical = technicalHotspots.reduce<number>((sum, item) => sum + item.demand, 0);
  const structuredProfessional = professionalHotspots.reduce<number>((sum, item) => sum + item.demand, 0);
  const structuredCombined = structuredOperational + structuredTechnical + structuredProfessional;
  const allHotspots = [...operationalHotspots, ...technicalHotspots, ...professionalHotspots]
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 10);

  const valesCols = [
    findColumn(headers, "porcentaje de VALES DE DESPENSA y FONDO DE AHORRO", "Vales de Despensa - Personal Operativo"),
    findColumn(headers, "porcentaje de VALES DE DESPENSA y FONDO DE AHORRO", "Vales de Despensa - Personal Administrativo"),
    findColumn(headers, "porcentaje de VALES DE DESPENSA y FONDO DE AHORRO", "Vales de Despensa - Personal Gerencial"),
  ];
  const fundCols = [
    findColumn(headers, "porcentaje de VALES DE DESPENSA y FONDO DE AHORRO", "Fondo de Ahorro - Personal Operativo"),
    findColumn(headers, "porcentaje de VALES DE DESPENSA y FONDO DE AHORRO", "Fondo de Ahorro - Personal Administrativo"),
    findColumn(headers, "porcentaje de VALES DE DESPENSA y FONDO DE AHORRO", "Fondo de Ahorro - Personal Gerencial"),
  ];

  const lifeCol = findColumn(headers, "Otorga Seguro de Vida como prestación a sus empleados", "Response");
  const transportCol = findColumn(headers, "Otorga Servicio de Transporte de Personal como prestación a sus empleados", "Response");
  const comedorCol = findColumn(headers, "Otorga el servicio de comedor como prestación a sus empleados", "Response");

  const sgmmPopulationHeaders = findGroup(headers, "SGMM - ¿A qué personal le ofrece la prestación");
  const sgmmEligibleHeaders = sgmmPopulationHeaders.filter((header) =>
    ["directores", "gerentes", "administrativos", "operadores", "para todo el personal"].some((label) => header.normalizedSub.includes(normalize(label))),
  );
  const sgmmStart = Math.min(...sgmmPopulationHeaders.map((header) => header.column));
  const sgmmUsageCol = findUsageAfter(headers, sgmmStart);

  const transportGroup = findGroup(headers, "Transporte - ¿A qué personal le ofrece la prestación");
  const transportUsageCol = findUsageAfter(headers, Math.min(...transportGroup.map((header) => header.column)));
  const comedorGroup = findGroup(headers, "Comedor - ¿A qué personal le ofrece la prestación");
  const comedorUsageCol = findUsageAfter(headers, Math.min(...comedorGroup.map((header) => header.column)));

  const availability = {
    vouchers: rows.filter((row) => valesCols.some((column) => (numberValue(latestSheet.getCell(row, column).value) ?? 0) > 0)).length,
    savings: rows.filter((row) => fundCols.some((column) => (numberValue(latestSheet.getCell(row, column).value) ?? 0) > 0)).length,
    sgmm: rows.filter((row) => sgmmEligibleHeaders.some((header) => Boolean(cellText(latestSheet.getCell(row, header.column).value).trim()))).length,
    life: rows.filter((row) => yes(latestSheet.getCell(row, lifeCol).value)).length,
    transport: rows.filter((row) => yes(latestSheet.getCell(row, transportCol).value)).length,
    comedor: rows.filter((row) => yes(latestSheet.getCell(row, comedorCol).value)).length,
  };

  const benefitCounts = rows.map((row) => [
    valesCols.some((column) => (numberValue(latestSheet.getCell(row, column).value) ?? 0) > 0),
    fundCols.some((column) => (numberValue(latestSheet.getCell(row, column).value) ?? 0) > 0),
    sgmmEligibleHeaders.some((header) => Boolean(cellText(latestSheet.getCell(row, header.column).value).trim())),
    yes(latestSheet.getCell(row, lifeCol).value),
    yes(latestSheet.getCell(row, transportCol).value),
    yes(latestSheet.getCell(row, comedorCol).value),
  ].filter(Boolean).length);

  const breadthDistribution = Array.from({ length: 6 }, (_, index) => index + 1)
    .map((count) => ({ count, companies: benefitCounts.filter((value) => value === count).length }));

  const voucherStats = valesCols.map((column, index) => ({
    population: ["Operativo", "Administrativo", "Gerencial"][index],
    ...stats(rows.map((row) => percentValue(latestSheet.getCell(row, column).value)).filter((value): value is number => value !== null && value > 0)),
  }));
  const fundStats = fundCols.map((column, index) => ({
    population: ["Operativo", "Administrativo", "Gerencial"][index],
    ...stats(rows.map((row) => percentValue(latestSheet.getCell(row, column).value)).filter((value): value is number => value !== null && value > 0)),
  }));

  const vacationQuestion = "días de vacaciones que proporciona";
  const vacationCols = [
    findColumn(headers, vacationQuestion, "PersonalOPERATIVO - 1° Año"),
    findColumn(headers, vacationQuestion, "PersonalADMINISTRATIVO - 1° Año"),
    findColumn(headers, vacationQuestion, "PersonalGERENCIAL - 1° Año"),
  ];
  const aguinaldoQuestion = "días de AGUINALDO que proporciona";
  const aguinaldoCols = [
    findColumn(headers, aguinaldoQuestion, "PersonalOPERATIVO - 1° Año"),
    findColumn(headers, aguinaldoQuestion, "PersonalADMINISTRATIVO - 1° Año"),
    findColumn(headers, aguinaldoQuestion, "PersonalGERENCIAL - 1° Año"),
  ];

  const numericStatsForColumns = (columns: number[]) => columns.map((column, index) => ({
    population: ["Operativo", "Administrativo", "Gerencial"][index],
    ...stats(rows.map((row) => numberValue(latestSheet.getCell(row, column).value)).filter((value): value is number => value !== null && value > 0)),
  }));

  const usageStats = [
    ["SGMM", sgmmUsageCol],
    ["Transporte", transportUsageCol],
    ["Comedor", comedorUsageCol],
  ] as const;

  const benefitPrevalence = [
    ["Vales", availability.vouchers, false],
    ["Fondo de ahorro", availability.savings, false],
    ["SGMM", availability.sgmm, true],
    ["Seguro de vida", availability.life, false],
    ["Transporte", availability.transport, false],
    ["Comedor", availability.comedor, false],
  ].map(([benefit, companies, inferred]) => ({
    benefit: String(benefit),
    companies: Number(companies),
    pct: round((Number(companies) / rows.length) * 100, 1),
    ...(inferred ? { inferred: true } : {}),
  }));

  const allSixCompanies = benefitCounts.filter((value) => value === 6).length;

  const output = {
    metadata: {
      source: path.basename(source),
      period: PERIOD_LABELS[latestSheet.name],
      privacy: "aggregated-only",
      notes: [
        "Structured vacancy detail does not fully reconcile to headline vacancies and is used as a demand-pattern signal, not as the official vacancy total.",
        "SGMM availability is inferred from selected eligible populations because the direct yes/no response is mostly blank in the source.",
        "Benefit usage medians include only companies with valid numeric usage values.",
      ],
    },
    workforcePlanning: {
      vacancyTrend,
      latest: {
        operational: latestVacancy.operational,
        administrative: latestVacancy.administrative,
        total: latestVacancy.total,
        changeVsPreviousPct: round(((latestVacancy.total / previousVacancy.total) - 1) * 100, 2),
        operationalSharePct: round((latestVacancy.operational / latestVacancy.total) * 100, 2),
        administrativeSharePct: round((latestVacancy.administrative / latestVacancy.total) * 100, 2),
      },
      structuredDemand: {
        operationalTotal: structuredOperational,
        technicalTotal: structuredTechnical,
        professionalTotal: structuredProfessional,
        combinedTotal: structuredCombined,
        headlineTotal: latestVacancy.total,
        difference: structuredCombined - latestVacancy.total,
        reconciles: structuredCombined === latestVacancy.total,
      },
      hotspots: allHotspots,
      technicalHotspots: technicalHotspots.slice(0, 5).map(({ role, education, demand }) => ({ role, education, demand })),
      professionalHotspots: professionalHotspots.slice(0, 5).map(({ role, education, demand }) => ({ role, education, demand })),
    },
    totalRewards: {
      benefitPrevalence,
      packageBreadth: {
        benefitTypes: 6,
        average: round(benefitCounts.reduce<number>((sum, value) => sum + value, 0) / benefitCounts.length, 2),
        median: round(median(benefitCounts), 1),
        allSixCompanies,
        allSixPct: round((allSixCompanies / rows.length) * 100, 1),
        distribution: breadthDistribution,
      },
      generosity: {
        vouchersPct: voucherStats,
        savingsFundPct: fundStats,
        firstYearVacationDays: numericStatsForColumns(vacationCols),
        bonusDays: numericStatsForColumns(aguinaldoCols),
      },
      usageMedianPct: usageStats.map(([benefit, column]) => {
        const values = rows
          .map((row) => percentagePoints(latestSheet.getCell(row, column).value, "points"))
          .filter((value): value is number => value !== null && value >= 0);
        return { benefit, ...stats(values) };
      }),
    },
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "workforce-rewards.json"), JSON.stringify(output, null, 2));
  console.log(`Workforce & Rewards aggregate written for ${PERIOD_LABELS[latestSheet.name]}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
