import { reconcile } from "./lib/data-contract";
import { completeSum, matchedRate } from "../src/lib/metric-math";
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

type CompanyPeriodRecord = {
  company: string;
  period: string;
  sheet: string;
  headcountOperational: number | null;
  headcountAdministrative: number | null;
  headcountOther: number | null;
  salaryEntry: number | null;
  salaryLow: number | null;
  salaryHigh: number | null;
  salaryMax: number | null;
  hiresTotal: number | null;
  hiresNew: number | null;
  hiresReplacement: number | null;
  timeToFillOperational: number | null;
  timeToFillTechnical: number | null;
  timeToFillAdministrative: number | null;
  timeToFillManagerial: number | null;
  acceptedCandidatesPer10: number | null;
  exitsTotal: number | null;
  exitsOperational: number | null;
  exitsAdministrative: number | null;
  exitsByMonth: Array<number | null>;
  exitsByReason: Array<number | null>;
  absencesTotal: number | null;
  incapacityTotal: number | null;
  incapacityRisk: number | null;
  incapacityIllness: number | null;
  incapacityMaternity: number | null;
  trainingOperational: number | null;
  trainingAdministrative: number | null;
  vacanciesOperational: number | null;
  vacanciesAdministrative: number | null;
  genderWomen: number | null;
  genderMen: number | null;
  recruitmentSources: Record<string, boolean>;
  rejectionReasons: Record<string, number | null>;
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
  if (!text || ["-", "NO APLICA", "N/A", "NA", "DESCONOCIDO"].includes(text.toUpperCase())) return null;
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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

function findColumn(headers: Header[], questionNeedle: string, subNeedle?: string, exactQuestion = false): number {
  const q = normalize(questionNeedle);
  const s = subNeedle ? normalize(subNeedle) : null;
  const match = headers.find((header) => {
    const questionMatches = exactQuestion ? header.normalizedQuestion === q : header.normalizedQuestion.includes(q);
    const subMatches = s ? header.normalizedSub.includes(s) : true;
    return questionMatches && subMatches;
  });
  if (!match) throw new Error(`Column not found: ${questionNeedle}${subNeedle ? ` / ${subNeedle}` : ""}`);
  return match.column;
}

function findGroup(headers: Header[], questionNeedle: string): Header[] {
  const q = normalize(questionNeedle);
  return headers.filter((header) => header.normalizedQuestion.includes(q));
}

function valueAt(worksheet: ExcelJS.Worksheet, row: number, column: number): unknown {
  return worksheet.getCell(row, column).value;
}

function numericAt(worksheet: ExcelJS.Worksheet, row: number, column: number): number | null {
  return numberValue(valueAt(worksheet, row, column));
}

function isPresent(value: unknown): boolean {
  const text = cellText(value).trim();
  return Boolean(text && text !== "-");
}

function mapWorksheet(worksheet: ExcelJS.Worksheet): CompanyPeriodRecord[] {
  const headers = buildHeaders(worksheet);
  const companyCol = findColumn(headers, "Compañía", undefined, true);

  const cols = {
    headcountOperational: findColumn(headers, "Número de Empleados Actual de Personal Operativo"),
    headcountAdministrative: findColumn(headers, "Número de Empleados Personal Administrativo"),
    headcountOther: findColumn(headers, "En caso de contar con otro tipo de personal que labora"),
    salaryEntry: findColumn(headers, "Salario Diario Inicial"),
    salaryLow: findColumn(headers, "Salario Diario Intermedio Bajo"),
    salaryHigh: findColumn(headers, "Salario Diario Intermedio Alto"),
    salaryMax: findColumn(headers, "Salario Diario Máximo"),
    hiresTotal: findColumn(headers, "TOTAL DE CONTRATACIONES"),
    hiresNew: findColumn(headers, "ESPECIFIQUE Contrataciones realizadas", "nueva creación"),
    hiresReplacement: findColumn(headers, "ESPECIFIQUE Contrataciones realizadas", "cubrir alguna baja"),
    timeToFillOperational: findColumn(headers, "Cuántos días hábiles", "Operativos"),
    timeToFillTechnical: findColumn(headers, "Cuántos días hábiles", "Técnico"),
    timeToFillAdministrative: findColumn(headers, "Cuántos días hábiles", "Administrativo"),
    timeToFillManagerial: findColumn(headers, "Cuántos días hábiles", "Gerencial"),
    acceptedCandidatesPer10: findColumn(headers, "de cada 10 candidatos entrevistados"),
    exitsTotal: findColumn(headers, "NÚMERO DE BAJAS que tuvo durante el BIMESTRE"),
    exitsOperational: findColumn(headers, "Desglose de acuerdo al tipo de empleado", "Bajas de Personal Operativo"),
    exitsAdministrative: findColumn(headers, "Desglose de acuerdo al tipo de empleado", "Bajas de Personal Administrativo"),
    absencesTotal: findColumn(headers, "TOTAL de FALTAS que tuvo durante el bimestre"),
    incapacityTotal: findColumn(headers, "TOTAL DE CASOS DE INCAPACIDAD"),
    incapacityRisk: findColumn(headers, "desglose el número de incapacidades", "Riesgo de Trabajo"),
    incapacityIllness: findColumn(headers, "desglose el número de incapacidades", "Enfermedad General"),
    incapacityMaternity: findColumn(headers, "desglose el número de incapacidades", "Maternidad"),
    trainingOperational: findColumn(headers, "TOTAL DE HORAS DE CAPACITACIÓN", "personal operativo"),
    trainingAdministrative: findColumn(headers, "TOTAL DE HORAS DE CAPACITACIÓN", "personal administrativo"),
    vacanciesOperational: findColumn(headers, "PLAZAS OPERATIVAS y PLAZAS ADMINISTRATIVAS", "Plazas operativas"),
    vacanciesAdministrative: findColumn(headers, "PLAZAS OPERATIVAS y PLAZAS ADMINISTRATIVAS", "Plazas administrativas"),
    genderWomen: findColumn(headers, "Qué proporción hay de mujeres y hombres", "Mujeres"),
    genderMen: findColumn(headers, "Qué proporción hay de mujeres y hombres", "Hombres"),
  };

  const exitsByMonthGroup = findGroup(headers, "DESGLOSE LAS BAJAS DEL BIMESTRE de acuerdo a cómo se presentaron durante el periodo");
  const exitsByReasonGroup = findGroup(headers, "Desglose el número de bajas de acuerdo a lo siguiente");
  const recruitmentGroup = findGroup(headers, "seleccione sus principales fuentes de reclutamiento");
  const rejectionGroup = findGroup(headers, "motivos por los cuales son rechazados");
  const period = PERIOD_LABELS[worksheet.name] ?? worksheet.name;
  const records: CompanyPeriodRecord[] = [];

  for (let row = 3; row <= worksheet.rowCount; row += 1) {
    const company = cellText(valueAt(worksheet, row, companyCol)).trim();
    if (!/^COMPAÑIA\s+\d+$/i.test(company)) continue;

    const recruitmentSources = Object.fromEntries(
      recruitmentGroup
        .filter((header) => header.sub && !normalize(header.sub).includes("otro especifique"))
        .map((header) => [header.sub, isPresent(valueAt(worksheet, row, header.column))]),
    );

    const rejectionReasons = Object.fromEntries(
      rejectionGroup
        .filter((header) => header.sub)
        .map((header) => [header.sub, numericAt(worksheet, row, header.column)]),
    );

    records.push({
      company,
      period,
      sheet: worksheet.name,
      headcountOperational: numericAt(worksheet, row, cols.headcountOperational),
      headcountAdministrative: numericAt(worksheet, row, cols.headcountAdministrative),
      headcountOther: numericAt(worksheet, row, cols.headcountOther),
      salaryEntry: numericAt(worksheet, row, cols.salaryEntry),
      salaryLow: numericAt(worksheet, row, cols.salaryLow),
      salaryHigh: numericAt(worksheet, row, cols.salaryHigh),
      salaryMax: numericAt(worksheet, row, cols.salaryMax),
      hiresTotal: numericAt(worksheet, row, cols.hiresTotal),
      hiresNew: numericAt(worksheet, row, cols.hiresNew),
      hiresReplacement: numericAt(worksheet, row, cols.hiresReplacement),
      timeToFillOperational: numericAt(worksheet, row, cols.timeToFillOperational),
      timeToFillTechnical: numericAt(worksheet, row, cols.timeToFillTechnical),
      timeToFillAdministrative: numericAt(worksheet, row, cols.timeToFillAdministrative),
      timeToFillManagerial: numericAt(worksheet, row, cols.timeToFillManagerial),
      acceptedCandidatesPer10: numericAt(worksheet, row, cols.acceptedCandidatesPer10),
      exitsTotal: numericAt(worksheet, row, cols.exitsTotal),
      exitsOperational: numericAt(worksheet, row, cols.exitsOperational),
      exitsAdministrative: numericAt(worksheet, row, cols.exitsAdministrative),
      exitsByMonth: exitsByMonthGroup.map((header) => numericAt(worksheet, row, header.column)),
      exitsByReason: exitsByReasonGroup.filter(header => !normalize(header.sub).includes("open ended")).map((header) => numericAt(worksheet, row, header.column)),
      absencesTotal: numericAt(worksheet, row, cols.absencesTotal),
      incapacityTotal: numericAt(worksheet, row, cols.incapacityTotal),
      incapacityRisk: numericAt(worksheet, row, cols.incapacityRisk),
      incapacityIllness: numericAt(worksheet, row, cols.incapacityIllness),
      incapacityMaternity: numericAt(worksheet, row, cols.incapacityMaternity),
      trainingOperational: numericAt(worksheet, row, cols.trainingOperational),
      trainingAdministrative: numericAt(worksheet, row, cols.trainingAdministrative),
      vacanciesOperational: numericAt(worksheet, row, cols.vacanciesOperational),
      vacanciesAdministrative: numericAt(worksheet, row, cols.vacanciesAdministrative),
      genderWomen: numericAt(worksheet, row, cols.genderWomen),
      genderMen: numericAt(worksheet, row, cols.genderMen),
      recruitmentSources,
      rejectionReasons,
    });
  }

  return records;
}

function headcount(record: CompanyPeriodRecord): number | null {
  const values = [record.headcountOperational, record.headcountAdministrative, record.headcountOther];
  return values.some((value) => value !== null)
    ? values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
    : null;
}

function sumNumbers(values: Array<number | null>): number {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

const evaluateRule = reconcile;

function qualityForLatest(records: CompanyPeriodRecord[]) {
  let evaluated = 0;
  let passed = 0;
  let incomplete = 0;

  const recordRule = (result: boolean | null) => {
    if (result === null) { incomplete += 1; return; }
    evaluated += 1;
    if (result) passed += 1;
  };

  for (const record of records) {
    recordRule(evaluateRule([record.hiresNew, record.hiresReplacement], record.hiresTotal));
    recordRule(evaluateRule([record.exitsOperational, record.exitsAdministrative], record.exitsTotal));
    recordRule(record.exitsByMonth.length ? evaluateRule(record.exitsByMonth, record.exitsTotal) : null);
    recordRule(record.exitsByReason.length ? evaluateRule(record.exitsByReason, record.exitsTotal) : null);
    recordRule(evaluateRule([record.incapacityRisk, record.incapacityIllness, record.incapacityMaternity], record.incapacityTotal));

    const salaries = [record.salaryEntry, record.salaryLow, record.salaryHigh, record.salaryMax];
    recordRule(salaries.every((value) => value !== null)
      ? (salaries[0]! <= salaries[1]! && salaries[1]! <= salaries[2]! && salaries[2]! <= salaries[3]!)
      : null);

    if (record.genderWomen !== null && record.genderMen !== null) {
      const total = record.genderWomen + record.genderMen;
      recordRule(Math.abs(total - 100) <= 2 || Math.abs(total - 1) <= 0.02);
    } else recordRule(null);
  }

  return {
    score: evaluated ? Math.round((passed / evaluated) * 100) : 0,
    rulesEvaluated: evaluated,
    rulesPassed: passed,
    rulesIncomplete: incomplete,
    ruleFailures: evaluated - passed,
  };
}

function detectHeadcountAnomalies(records: CompanyPeriodRecord[]) {
  const byCompany = new Map<string, CompanyPeriodRecord[]>();
  for (const record of records) {
    const list = byCompany.get(record.company) ?? [];
    list.push(record);
    byCompany.set(record.company, list);
  }

  const anomalies = new Map<string, { baseline: number; reported: number }>();
  for (const [company, companyRecords] of byCompany) {
    for (const record of companyRecords) {
      const reported = headcount(record);
      if (reported === null || reported <= 0) continue;
      const peers = companyRecords
        .filter((candidate) => candidate.period !== record.period)
        .map(headcount)
        .filter((value): value is number => value !== null && value > 0);
      const baseline = median(peers);
      if (!baseline) continue;
      const ratio = reported / baseline;
      if (ratio > 3 || ratio < 0.33) {
        anomalies.set(`${company}|${record.period}`, { baseline, reported });
      }
    }
  }
  return anomalies;
}

const fullHeadcount = (r: CompanyPeriodRecord) => completeSum([r.headcountOperational, r.headcountAdministrative, r.headcountOther]);

function aggregate(records: CompanyPeriodRecord[]) {
  const anomalies = detectHeadcountAnomalies(records);
  const periodOrder = Object.values(PERIOD_LABELS);
  const periods = periodOrder
    .map((period) => {
      const rows = records.filter((record) => record.period === period);
      if (!rows.length) return null;
      const reportedHeadcount = rows.reduce((sum, record) => sum + (headcount(record) ?? 0), 0);
      const qualityAdjustedHeadcount = rows.reduce((sum, record) => {
        const anomaly = anomalies.get(`${record.company}|${record.period}`);
        return sum + (anomaly?.baseline ?? headcount(record) ?? 0);
      }, 0);
      const positiveMedian = (selector: (record: CompanyPeriodRecord) => number | null) => median(rows.map(selector).filter((value): value is number => value !== null && value > 0));

      const rates = {
        exits: matchedRate(rows, r => r.exitsTotal, fullHeadcount),
        absences: matchedRate(rows, r => r.absencesTotal, fullHeadcount),
        incapacity: matchedRate(rows, r => r.incapacityTotal, fullHeadcount),
      };
      if (Object.values(rates).some(r => r.value === null)) throw new Error(`No matched rate coverage: ${period}`);
      return {
        period,
        matchedRates: rates,
        reportedHeadcount: Math.round(reportedHeadcount),
        qualityAdjustedHeadcount: Math.round(qualityAdjustedHeadcount),
        operational: Math.round(sumNumbers(rows.map((record) => record.headcountOperational))),
        administrative: Math.round(sumNumbers(rows.map((record) => record.headcountAdministrative))),
        other: Math.round(sumNumbers(rows.map((record) => record.headcountOther))),
        hires: Math.round(sumNumbers(rows.map((record) => record.hiresTotal))),
        exits: Math.round(sumNumbers(rows.map((record) => record.exitsTotal))),
        absences: Math.round(sumNumbers(rows.map((record) => record.absencesTotal))),
        incapacityCases: Math.round(sumNumbers(rows.map((record) => record.incapacityTotal))),
        trainingHours: Math.round(sumNumbers(rows.flatMap((record) => [record.trainingOperational, record.trainingAdministrative]))),
        salaryEntryMedian: round(positiveMedian((record) => record.salaryEntry) ?? 0),
        timeToFill: {
          operational: positiveMedian((record) => record.timeToFillOperational) ?? 0,
          technical: positiveMedian((record) => record.timeToFillTechnical) ?? 0,
          administrative: positiveMedian((record) => record.timeToFillAdministrative) ?? 0,
          managerial: positiveMedian((record) => record.timeToFillManagerial) ?? 0,
        },
        anomalyCount: rows.filter((record) => anomalies.has(`${record.company}|${record.period}`)).length,
      };
    })
    .filter(Boolean);

  const latestRows = records.filter((record) => record.period === periodOrder.at(-1));
  const latestPeriod = periods.at(-1)!;
  const previousPeriod = periods.at(-2)!;
  const quality = qualityForLatest(latestRows);

  const sourceNames = [...new Set(latestRows.flatMap((record) => Object.keys(record.recruitmentSources)))];
  const recruitmentSourcePrevalence = sourceNames
    .map((source) => {
      const companies = latestRows.filter((record) => record.recruitmentSources[source]).length;
      return { source, companies, pct: round((companies / latestRows.length) * 100, 1) };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);

  const rejectionNames = [...new Set(latestRows.flatMap((record) => Object.keys(record.rejectionReasons)))];
  const rejectionReasonMedianPct = rejectionNames.map((cause) => {
    const values = latestRows
      .map((record) => record.rejectionReasons[cause])
      .filter((value): value is number => value !== null);
    return { cause, medianPct: round(median(values) ?? 0, 1), responses: values.length };
  });

  const salaries = (selector: (record: CompanyPeriodRecord) => number | null) => latestRows.map(selector).filter((value): value is number => value !== null && value > 0);
  const accepted = latestRows.map((record) => record.acceptedCandidatesPer10).filter((value): value is number => value !== null);
  const vacanciesOperational = sumNumbers(latestRows.map((record) => record.vacanciesOperational));
  const vacanciesAdministrative = sumNumbers(latestRows.map((record) => record.vacanciesAdministrative));
  const vacanciesTotal = vacanciesOperational + vacanciesAdministrative;
  const latestHeadcount = latestPeriod.reportedHeadcount;

  let validGenderCompanies = 0;
  let weightedWomen = 0;
  let weightedMen = 0;
  let weightedHeadcount = 0;
  for (const record of latestRows) {
    const hc = headcount(record);
    if (!hc || record.genderWomen === null || record.genderMen === null) continue;
    const total = record.genderWomen + record.genderMen;
    let womenRatio: number;
    let menRatio: number;
    if (Math.abs(total - 1) <= 0.02) {
      womenRatio = record.genderWomen;
      menRatio = record.genderMen;
    } else if (Math.abs(total - 100) <= 2) {
      womenRatio = record.genderWomen / 100;
      menRatio = record.genderMen / 100;
    } else continue;
    validGenderCompanies += 1;
    weightedHeadcount += hc;
    weightedWomen += hc * womenRatio;
    weightedMen += hc * menRatio;
  }

  const exitsRate = matchedRate(latestRows, r => r.exitsTotal, fullHeadcount);
  const vacancyRate = matchedRate(latestRows, r => completeSum([r.vacanciesOperational, r.vacanciesAdministrative]), fullHeadcount);
  const trainingRate = matchedRate(latestRows, r => completeSum([r.trainingOperational, r.trainingAdministrative]), r => completeSum([r.headcountOperational, r.headcountAdministrative]), 1);
  if (exitsRate.value === null || vacancyRate.value === null || trainingRate.value === null) throw new Error("Insufficient matched coverage for required latest metrics");
  const turnoverBimonthlyPct = exitsRate.value;

  return {
    metadata: {
      companyCount: new Set(records.map((record) => record.company)).size,
      periodCount: periods.length,
      privacy: "aggregated-only",
    },
    periods,
    latest: {
      period: latestPeriod.period,
      headcount: latestHeadcount,
      headcountChangePct: round(((latestHeadcount / previousPeriod.reportedHeadcount) - 1) * 100),
      turnoverBimonthlyPct: round(turnoverBimonthlyPct),
      hires: latestPeriod.hires,
      exits: latestPeriod.exits,
      vacancies: {
        operational: Math.round(vacanciesOperational),
        administrative: Math.round(vacanciesAdministrative),
        total: Math.round(vacanciesTotal),
      },
      hiringPressurePct: round(vacancyRate.value),
      salaryBandsDaily: {
        entryMedian: round(median(salaries((record) => record.salaryEntry)) ?? 0),
        lowMedian: round(median(salaries((record) => record.salaryLow)) ?? 0),
        highMedian: round(median(salaries((record) => record.salaryHigh)) ?? 0),
        maxMedian: round(median(salaries((record) => record.salaryMax)) ?? 0),
      },
      candidateAcceptancePer10Median: median(accepted) ?? 0,
      trainingHoursPerHead: round(trainingRate.value),
      matchedCoverage: { exits: exitsRate, vacancies: vacancyRate, training: trainingRate },
      rateDefinition: "Bajas / plantilla completa al cierre, mismas empresas; no rotación sobre plantilla promedio.",
      genderValidCompanyCount: validGenderCompanies,
      womenWeightedPct: weightedHeadcount ? round((weightedWomen / weightedHeadcount) * 100, 1) : 0,
      menWeightedPct: weightedHeadcount ? round((weightedMen / weightedHeadcount) * 100, 1) : 0,
      timeToFillDays: latestPeriod.timeToFill,
      recruitmentSourcePrevalence,
      rejectionReasonMedianPct,
    },
    quality: {
      ...quality,
      criticalAnomalies: anomalies.size,
      notes: [
        "Reported values are immutable; quality-adjusted values are analytical estimates only.",
        "Longitudinal headcount anomalies use the median of the same company across the other periods as the comparison baseline.",
      ],
    },
  };
}

async function main() {
  const source = process.argv[2] ?? "data/raw/BASE HISTORICA(1).xlsx";
  const outputDir = path.resolve(process.env.CATCH_DATA_OUTPUT ?? "data/processed");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(source);

  const records = workbook.worksheets
    .filter((worksheet) => PERIOD_LABELS[worksheet.name])
    .flatMap(mapWorksheet);

  if (!records.length) throw new Error("No company-period records were extracted.");

  const benchmark = aggregate(records);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "company-period.private.json"), JSON.stringify(records, null, 2));
  await fs.writeFile(path.join(outputDir, "benchmark.json"), JSON.stringify(benchmark, null, 2));

  console.log(`Extracted ${records.length} company-period rows from ${workbook.worksheets.length} worksheets.`);
  console.log(`Private panel: data/processed/company-period.private.json (gitignored)`);
  console.log(`Safe aggregate: data/processed/benchmark.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
