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

type Header = { column: number; question: string; sub: string; nq: string; ns: string };

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
    if (Array.isArray(record.richText)) return record.richText.map((part) => cellText((part as Record<string, unknown>).text)).join("");
  }
  return String(value);
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = cellText(value).trim().replace(/[$,%]/g, "").replace(/,/g, "");
  if (!text || ["-", "N/A", "NA", "NO APLICA", "NINGUNO", "NINGUNA", "DESCONOCIDO"].includes(text.toUpperCase())) return null;
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function percentValue(value: unknown): number | null { return percentagePoints(value, "fraction"); }

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function mean(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function buildHeaders(worksheet: ExcelJS.Worksheet): Header[] {
  const headers: Header[] = [];
  let activeQuestion = "";
  for (let column = 1; column <= worksheet.columnCount; column += 1) {
    const raw = cellText(worksheet.getCell(1, column).value).trim();
    if (raw && !/^Unnamed:/i.test(raw)) activeQuestion = raw;
    const sub = cellText(worksheet.getCell(2, column).value).trim();
    if (!raw && !sub) continue; // Trailing unnamed cells are not survey fields.
    headers.push({ column, question: activeQuestion, sub, nq: normalize(activeQuestion), ns: normalize(sub) });
  }
  return headers;
}

function findColumn(headers: Header[], questionNeedle: string, subNeedle?: string): number {
  const q = normalize(questionNeedle);
  const s = subNeedle ? normalize(subNeedle) : "";
  const match = headers.find((header) => header.nq.includes(q) && (!s || header.ns.includes(s)));
  if (!match) throw new Error(`Column not found: ${questionNeedle}${subNeedle ? ` / ${subNeedle}` : ""}`);
  return match.column;
}

function findGroup(headers: Header[], questionNeedle: string): Header[] {
  const q = normalize(questionNeedle);
  return headers.filter((header) => header.nq.includes(q) && Boolean(header.sub));
}

function companyRows(worksheet: ExcelJS.Worksheet, headers: Header[]): number[] {
  const companyColumn = findColumn(headers, "Compañía");
  const rows: number[] = [];
  for (let row = 3; row <= worksheet.rowCount; row += 1) {
    if (/^COMPAÑIA\s+\d+$/i.test(cellText(worksheet.getCell(row, companyColumn).value).trim())) rows.push(row);
  }
  return rows;
}

function present(value: unknown): boolean {
  const text = cellText(value).trim();
  return Boolean(text && text !== "-");
}

function counts(worksheet: ExcelJS.Worksheet, rows: number[], column: number) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const value = cellText(worksheet.getCell(row, column).value).trim();
    if (!value || value === "-") continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([label, companies]) => ({ label, companies }));
}

function numericStats(worksheet: ExcelJS.Worksheet, rows: number[], column: number, percentage = false) {
  const values = rows
    .map((row) => percentage ? percentValue(worksheet.getCell(row, column).value) : numberValue(worksheet.getCell(row, column).value))
    .filter((value): value is number => value !== null);
  return { median: round(median(values)), mean: round(mean(values)), n: values.length };
}

function selectionStats(worksheet: ExcelJS.Worksheet, rows: number[], group: Header[]) {
  return group.filter(header => !["no aplica", "ninguno", "ninguna", "open ended"].some(label => header.ns.includes(label))).map((header) => {
    const companies = rows.filter((row) => present(worksheet.getCell(row, header.column).value)).length;
    return { label: header.sub, companies, pct: round((companies / rows.length) * 100, 1) };
  }).filter((item) => item.companies > 0).sort((a, b) => b.companies - a.companies);
}

function sourceMix(worksheet: ExcelJS.Worksheet, rows: number[], headers: Header[], questionNeedle: string) {
  return findGroup(headers, questionNeedle).map((header) => {
    const values = rows
      .map((row) => numberValue(worksheet.getCell(row, header.column).value))
      .filter((value): value is number => value !== null && value >= 0 && value <= 10);
    return { source: header.sub, scale: "0–10", medianUsageScore: round(median(values), 1), n: values.length };
  }).filter((item) => item.n >= 10).sort((a, b) => b.medianUsageScore - a.medianUsageScore).slice(0, 6);
}

async function main() {
  const source = process.argv[2] ?? "data/raw/BASE HISTORICA(1).xlsx";
  const output = path.resolve(process.env.CATCH_DATA_OUTPUT ?? "data/processed", "extended-intelligence.json");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(source);
  const periodSheets = workbook.worksheets.filter((worksheet) => PERIOD_LABELS[worksheet.name]);
  if (!periodSheets.length) throw new Error("No historical period worksheets found.");

  const sheet = periodSheets.at(-1)!;
  const headers = buildHeaders(sheet);
  const rows = companyRows(sheet, headers);

  const unionCol = findColumn(headers, "cuenta con alguna Confederación Sindical", "Response");
  const relationCol = findColumn(headers, "Cómo calificaría la relación actual entre su compañía y el sindicato", "Response");
  const unionCounts = counts(sheet, rows, unionCol);
  const unionYes = unionCounts.find((item) => normalize(item.label) === "si")?.companies ?? 0;
  const unionNo = unionCounts.find((item) => normalize(item.label) === "no")?.companies ?? 0;

  const negotiationCol = findColumn(headers, "Estatus Actual de su Negociación de Contrato Colectivo", "Response");
  const grantedQuestion = "porcentaje de incrementos de SALARIOS Y BENEFICIOS que haya otorgado";
  const salaryOpGranted = findColumn(headers, grantedQuestion, "SALARIO - Personal Operativo");
  const salaryAdminGranted = findColumn(headers, grantedQuestion, "SALARIO - Personal Administrativo");
  const benefitsOpGranted = findColumn(headers, grantedQuestion, "BENEFICIOS - Personal Operativo");
  const benefitsAdminGranted = findColumn(headers, grantedQuestion, "BENEFICIOS - Personal Administrativo");
  const plannedQuestion = "Qué porcentaje de incremento salarial y de prestaciones consideran otorgar";
  const salaryOpPlanned = findColumn(headers, plannedQuestion, "Incremento en Salario - Personal Operativo");
  const benefitsOpPlanned = findColumn(headers, plannedQuestion, "Incremento en Prestaciones - Personal Operativo");

  const reviewMonthGroup = findGroup(headers, "seleccione el mes o los meses cuando realizan los incrementos de este año");
  const actualBenefitsGroup = findGroup(headers, "De acuerdo al porcentaje de incremento en Prestaciones, seleccione el o los beneficios que se incluyen en este incremento").filter((header) => header.column < salaryOpPlanned);

  const legalColumns = [
    findColumn(headers, "citatorios conciliatorios", "Centro de Conciliación"),
    findColumn(headers, "citatorios conciliatorios", "Tribunal Local"),
    findColumn(headers, "citatorios conciliatorios", "Tribunal Federal"),
  ];
  const contingencyGroup = findGroup(headers, "Seleccione los planes de contingencia con los que cuenta su empresa");

  const currentOperational = findColumn(headers, "Número de Empleados Actual de Personal Operativo");
  const currentAdministrative = findColumn(headers, "Número de Empleados Personal Administrativo");
  const plannedOperational = findColumn(headers, "Cuántos empleados operativos planean ser en promedio dentro de 1 año");
  const plannedAdministrative = findColumn(headers, "Cuántos empleados administrativos planean ser en promedio dentro 1 año");
  const mobilityQuestion = "en porcentaje, Cuántos colaboradores se trasladan desde otros Estados";
  const mobilityOperational = findColumn(headers, mobilityQuestion, "Personal Operativo - Porcentaje");
  const mobilityAdministrative = findColumn(headers, mobilityQuestion, "Personal Administrativo - Porcentaje");

  const techRoleGroup = findGroup(headers, "posiciones Técnicas que tiene laborando");
  const techMinGroup = findGroup(headers, "SALARIO MÍNIMO MENSUAL");
  const techAvgGroup = findGroup(headers, "SALARIO PROMEDIO MENSUAL");
  const techMaxGroup = findGroup(headers, "SALARIO MÁXIMO MENSUAL");
  const techHeadcountGroup = findGroup(headers, "cuántos empleados tiene dentro de cada posición");
  const technicalRoles = techRoleGroup.map((roleHeader) => {
    const key = normalize(roleHeader.sub);
    const minHeader = techMinGroup.find((item) => normalize(item.sub) === key);
    const avgHeader = techAvgGroup.find((item) => normalize(item.sub) === key);
    const maxHeader = techMaxGroup.find((item) => normalize(item.sub) === key);
    const hcHeader = techHeadcountGroup.find((item) => normalize(item.sub) === key);
    if (!minHeader || !avgHeader || !maxHeader || !hcHeader) return null;
    const companies = rows.filter((row) => present(sheet.getCell(row, roleHeader.column).value)).length;
    const min = numericStats(sheet, rows, minHeader.column);
    const avg = numericStats(sheet, rows, avgHeader.column);
    const max = numericStats(sheet, rows, maxHeader.column);
    const hcValues = rows.map((row) => numberValue(sheet.getCell(row, hcHeader.column).value)).filter((value): value is number => value !== null);
    return {
      role: roleHeader.sub,
      companies,
      prevalencePct: round((companies / rows.length) * 100, 1),
      salaryMinMedian: min.median,
      salaryMarketMedian: avg.median,
      salaryMaxMedian: max.median,
      reportedHeadcount: Math.round(hcValues.reduce((sum, value) => sum + value, 0)),
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null).sort((a, b) => b.companies - a.companies).slice(0, 10);

  const crossState = [
    { population: "Operativo", column: mobilityOperational },
    { population: "Administrativo", column: mobilityAdministrative },
  ].map((item) => ({ population: item.population, ...numericStats(sheet, rows, item.column, true) }));

  const oneYearPlan = [
    { population: "Operativo", current: currentOperational, planned: plannedOperational },
    { population: "Administrativo", current: currentAdministrative, planned: plannedAdministrative },
  ].map((item) => {
    const growth = rows.map((row) => {
      const current = numberValue(sheet.getCell(row, item.current).value);
      const planned = numberValue(sheet.getCell(row, item.planned).value);
      if (current === null || planned === null || current <= 0) return null;
      return ((planned - current) / current) * 100;
    }).filter((value): value is number => value !== null);
    return { population: item.population, medianGrowthPct: round(median(growth)), meanGrowthPct: round(mean(growth)), n: growth.length };
  });

  const lifeResponse = findColumn(headers, "Otorga Seguro de Vida como prestación", "Response");
  const companyCarResponse = findColumn(headers, "Asigna un Automóvil de la compañía", "Response");
  const gasolineResponse = findColumn(headers, "Otorga Apoyo de Gasolina", "Response");
  const gasolineBudget = findColumn(headers, "presupuesto Mensual Promedio por Persona que se asigna para Gasolina");
  const transportResponse = findColumn(headers, "Otorga Servicio de Transporte de Personal", "Response");
  const transportRoutes = findColumn(headers, "Cuántas rutas de transporte tiene asignadas", "Cantidad de rutas de transporte");
  const transportCost = findColumn(headers, "costo promedio mensual por persona de su servicio de transporte");
  const cafeteriaResponse = findColumn(headers, "Otorga el servicio de comedor", "Response");
  const cafeteriaTotal = findColumn(headers, "costo promedio por platillo", "Costo TOTAL del Platillo");
  const cafeteriaEmployee = findColumn(headers, "costo promedio por platillo", "PAGA EL EMPLEADO");
  const cafeteriaCompany = findColumn(headers, "costo promedio por platillo", "PAGA LA EMPRESA");
  const relocationResponse = findColumn(headers, "Política de Relocalización", "Response");

  const outsourcingGroup = findGroup(headers, "Seleccione los servicios de subcontratación que ocupa");
  const outsourcingRatings = findGroup(headers, "calificación de 0 a 10 que daría a los servicios de subcontratación");
  const outsourcingAdoption = selectionStats(sheet, rows, outsourcingGroup).slice(0, 8).map((item) => {
    const ratingHeader = outsourcingRatings.find((header) => normalize(header.sub) === normalize(item.label));
    const rating = ratingHeader ? numericStats(sheet, rows, ratingHeader.column) : null;
    return { service: item.label, companies: item.companies, pct: item.pct, medianRating: rating?.median ?? null };
  });

  const internsResponse = findColumn(headers, "Contrata practicantes en su compañía", "Response");
  const internSupport = findColumn(headers, "apoyo económico que reciben mensualmente", "Practicantes Estudiantes");
  const internAreas = selectionStats(sheet, rows, findGroup(headers, "seleccione las áreas donde contrata practicantes")).slice(0, 8);
  const internBenefits = selectionStats(sheet, rows, findGroup(headers, "beneficios adicionales que otorga a sus practicantes")).slice(0, 6);

  const shiftRotation = findColumn(headers, "personal operativo tiene la opción de Rotar o rolar turnos", "Response");
  const twelveHour = findColumn(headers, "maneja jornadas de 12 horas", "Response");
  const officeFlexibility = selectionStats(sheet, rows, findGroup(headers, "personal administrativo o de oficina, cuentan con algún beneficio adicional en su jornada laboral")).slice(0, 8);

  const improvement = selectionStats(sheet, rows, findGroup(headers, "programas de ideas de mejora que implementa")).slice(0, 8);
  const retentionBonus = findColumn(headers, "Otorga algún bono de permanencia", "Response");
  const socialPractices = selectionStats(sheet, rows, findGroup(headers, "listado seleccione algunas prácticas que actualmente tiene implementadas")).slice(0, 10);

  const yesCount = (column: number) => counts(sheet, rows, column).find((item) => normalize(item.label) === "si")?.companies ?? 0;
  const usageAfter = (questionNeedle: string) => {
    const start = Math.min(...findGroup(headers, questionNeedle).map((header) => header.column));
    const usage = headers.find((header) => header.column > start && header.column <= start + 16 && header.nq.includes(normalize("Cuántos colaboradores hacen uso efectivo de esta prestación")));
    return usage ? numericStats(sheet, rows, usage.column).median : null;
  };

  const payload = {
    metadata: {
      source: path.basename(source),
      period: PERIOD_LABELS[sheet.name],
      companyCount: rows.length,
      periodCount: periodSheets.length,
      logicalQuestionBlocks: headers.filter((header, index) => index === 0 || header.question !== headers[index - 1].question).length,
      effectiveColumns: headers.filter((header) => header.question || header.sub).length,
      privacy: "aggregated-only",
      parserStrategy: "semantic question + subquestion matching",
    },
    laborRelations: {
      unionization: { yes: unionYes, no: unionNo, pct: round((unionYes / rows.length) * 100, 1) },
      relationship: counts(sheet, rows, relationCol).map((item) => ({ rating: item.label, companies: item.companies })),
      collectiveBargaining: {
        status: counts(sheet, rows, negotiationCol).map((item) => ({ status: item.label.replace(" (Especifique)", ""), companies: item.companies })),
        granted: {
          salaryOperationalPct: numericStats(sheet, rows, salaryOpGranted, true),
          salaryAdministrativePct: numericStats(sheet, rows, salaryAdminGranted, true),
          benefitsOperationalPct: numericStats(sheet, rows, benefitsOpGranted, true),
          benefitsAdministrativePct: numericStats(sheet, rows, benefitsAdminGranted, true),
        },
        planned: {
          salaryOperationalPct: numericStats(sheet, rows, salaryOpPlanned, true),
          benefitsOperationalPct: numericStats(sheet, rows, benefitsOpPlanned, true),
        },
        reviewMonths: selectionStats(sheet, rows, reviewMonthGroup).map((item) => ({ month: item.label, companies: item.companies })).slice(0, 5),
        benefitsAdjusted: selectionStats(sheet, rows, actualBenefitsGroup).map((item) => ({ benefit: item.label.replace("Incremento en ", ""), companies: item.companies })).slice(0, 8),
      },
      legalExposure: legalColumns.map((column) => ({
        channel: headers[column - 1].sub.replace(" - Recibidos", ""),
        cases: Math.round(rows.reduce((sum, row) => sum + (numberValue(sheet.getCell(row, column).value) ?? 0), 0)),
        reportingCompanies: rows.filter((row) => numberValue(sheet.getCell(row, column).value) !== null).length,
      })),
      contingencyPlans: selectionStats(sheet, rows, contingencyGroup).map((item) => ({ plan: item.label, companies: item.companies, pct: item.pct })).slice(0, 8),
    },
    talentMarket: {
      crossStateMobility: crossState.map((item) => ({ population: item.population, medianPct: item.median, meanPct: item.mean, n: item.n })),
      oneYearHeadcountPlan: oneYearPlan,
      technicalRoles,
      recruitingSourceMix: {
        Operativo: sourceMix(sheet, rows, headers, "principal medio que utilizan para reclutar a su personal operativo"),
        Técnico: sourceMix(sheet, rows, headers, "principal medio que utilizan para reclutar a su personal técnico"),
        Administrativo: sourceMix(sheet, rows, headers, "principal medio que utilizan para reclutar a su personal administrativo"),
        Gerencial: sourceMix(sheet, rows, headers, "principal medio que utilizan para reclutar a su personal gerencial"),
      },
    },
    rewardsEconomics: {
      lifeInsurance: { companies: yesCount(lifeResponse), usageMedianPct: usageAfter("Seguro de Vida - ¿A qué personal le ofrece") },
      companyCar: { companies: yesCount(companyCarResponse), usageMedianPct: usageAfter("Asignación de Automóvil - ¿Qué tipo de auto") },
      gasoline: { companies: yesCount(gasolineResponse), usageMedianPct: usageAfter("Gasolina - ¿A qué personal le ofrece"), monthlyBudgetMedian: numericStats(sheet, rows, gasolineBudget).median },
      transport: { companies: yesCount(transportResponse), usageMedianPct: usageAfter("Transporte - ¿A qué personal le ofrece"), routesMedian: numericStats(sheet, rows, transportRoutes).median, monthlyCostPerPersonMedian: numericStats(sheet, rows, transportCost).median },
      cafeteria: { companies: yesCount(cafeteriaResponse), usageMedianPct: usageAfter("Comedor - ¿A qué personal le ofrece"), mealTotalMedian: numericStats(sheet, rows, cafeteriaTotal).median, employeeShareMedian: numericStats(sheet, rows, cafeteriaEmployee).median, companyShareMedian: numericStats(sheet, rows, cafeteriaCompany).median },
      relocation: { companies: yesCount(relocationResponse) },
    },
    vendorEcosystem: { outsourcingAdoption },
    earlyCareer: {
      companiesHiringInterns: yesCount(internsResponse),
      studentSupportMonthlyMedian: numericStats(sheet, rows, internSupport).median,
      topAreas: internAreas.map((item) => ({ area: item.label, companies: item.companies, pct: item.pct })),
      benefits: internBenefits.map((item) => ({ benefit: item.label, companies: item.companies, pct: item.pct })),
    },
    workDesign: {
      twelveHourShift: { yes: yesCount(twelveHour), no: rows.length - yesCount(twelveHour) },
      shiftRotation: counts(sheet, rows, shiftRotation).map((item) => ({ pattern: item.label, companies: item.companies })),
      officeFlexibility: officeFlexibility.map((item) => ({ practice: item.label, companies: item.companies, pct: item.pct })),
    },
    employeeExperience: {
      continuousImprovement: improvement.map((item) => ({ practice: item.label, companies: item.companies, pct: item.pct })),
      retentionBonus: { yes: yesCount(retentionBonus), no: rows.length - yesCount(retentionBonus) },
      socialPractices: socialPractices.map((item) => ({ practice: item.label, companies: item.companies, pct: item.pct })),
    },
    qualityFlags: [
      "Review survey matrices with suspiciously universal selection before publishing them as insight.",
      "Always show response count for sparse medians.",
      "Keep company-level and contact data outside the public processed layer.",
    ],
  };

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
