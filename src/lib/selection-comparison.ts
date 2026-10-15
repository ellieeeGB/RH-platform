import { completeHeadcount, getCompanySnapshot, median, type CompanySnapshot } from "./company-panel";
import { monthlyExitSummary } from "./company-detail";
import { completeSum } from "./metric-math";
import { validSalaryBands } from "./benchmark-comparison";
import { selectionCuts, type ComparisonSelection } from "./comparison-selection";

type MetricSpec = { label: string; unit: string; aggregation: "sum" | "median" | "rate"; description: string; href: string };
export const COMPARISON_METRICS = {
  turnover: { label: "Bajas por cada 100", unit: "%", aggregation: "rate", description: "Bajas / plantilla completa al cierre × 100. La tasa conjunta usa la suma de ambas cantidades en las mismas empresas.", href: "/retencion" },
  exits: { label: "Bajas registradas", unit: "bajas", aggregation: "sum", description: "Suma de bajas reportadas. Son eventos; no identifica personas únicas entre periodos.", href: "/retencion" },
  headcount: { label: "Plantilla al cierre", unit: "personas", aggregation: "sum", description: "Personal operativo, administrativo y otros. Solo se incluye una empresa cuando reporta las tres categorías. No se suman plantillas de distintos periodos.", href: "/contexto" },
  hires: { label: "Contrataciones", unit: "altas", aggregation: "sum", description: "Suma de contrataciones reportadas por las compañías seleccionadas.", href: "/talent-acquisition" },
  vacancies: { label: "Vacantes", unit: "vacantes", aggregation: "sum", description: "Vacantes operativas y administrativas del corte. Se requieren ambas categorías. No se suman cortes porque una vacante podría repetirse.", href: "/workforce-planning" },
  vacancyRate: { label: "Vacantes por cada 100", unit: "%", aggregation: "rate", description: "Vacantes completas / plantilla completa al cierre × 100, sobre las mismas empresas.", href: "/workforce-planning" },
  salary: { label: "Salario diario de ingreso", unit: "MXN/día", aggregation: "median", description: "Mediana de las compañías seleccionadas con las cuatro bandas salariales completas y ordenadas. Es un resumen de tu selección, no un benchmark externo.", href: "/salarios" },
  absenceRate: { label: "Ausencias por cada 100", unit: "eventos/100", aggregation: "rate", description: "Eventos de ausencia / plantilla completa al cierre × 100. Una persona puede registrar varios eventos.", href: "/labor-risk" },
  timeToFill: { label: "Cobertura de vacantes operativas", unit: "días", aggregation: "median", description: "Mediana de días de cobertura reportados. Los ceros sin un plazo confirmado no se interpretan como cobertura inmediata.", href: "/talent-acquisition" },
  monthlyExits: { label: "Bajas del mes", unit: "bajas", aggregation: "sum", description: "Bajas mensuales confirmadas en la fuente. No se divide el total bimestral ni se estima una plantilla mensual.", href: "/retencion" },
} satisfies Record<string, MetricSpec>;
export type ComparisonMetric = keyof typeof COMPARISON_METRICS;
export type Observation = { company: string; numerator: number | null; denominator: number | null };

export function snapshotObservation(row: CompanySnapshot | null, metric: ComparisonMetric): Observation {
  if (!row) return { company: "", numerator: null, denominator: null };
  const vacancy = () => completeSum([row.vacancies.operational, row.vacancies.administrative]);
  const numerator = metric === "turnover" || metric === "exits" ? row.exits
    : metric === "headcount" ? completeHeadcount(row)
    : metric === "hires" ? row.hires
    : metric === "vacancies" || metric === "vacancyRate" ? vacancy()
    : metric === "salary" ? validSalaryBands(row) ? row.salaryDaily.entry : null
    : metric === "absenceRate" ? row.attendance.absences
    : metric === "timeToFill" ? row.timeToFill.operational : null;
  return { company: row.company, numerator, denominator: COMPARISON_METRICS[metric].aggregation === "rate" ? completeHeadcount(row) : null };
}

export function validObservation(row: Observation, metric: ComparisonMetric) {
  return row.numerator !== null && Number.isFinite(row.numerator) && row.numerator >= 0 &&
    (COMPARISON_METRICS[metric].aggregation !== "rate" || (row.denominator !== null && Number.isFinite(row.denominator) && row.denominator > 0));
}

export function aggregateObservations(rows: Observation[], metric: ComparisonMetric) {
  const valid = rows.filter(r => validObservation(r, metric));
  const numerator = valid.reduce((n, r) => n + r.numerator!, 0);
  const denominator = valid.reduce((n, r) => n + (r.denominator ?? 0), 0);
  const aggregation = COMPARISON_METRICS[metric].aggregation;
  const value = !valid.length ? null : aggregation === "median" ? median(valid.map(r => r.numerator)) : aggregation === "rate" ? numerator / denominator * 100 : numerator;
  return { value, n: valid.length, numerator, denominator };
}

export function compareObservations(cuts: { id: string; rows: Observation[] }[], metric: ComparisonMetric) {
  if (new Set(cuts.map(c => c.id)).size !== cuts.length) throw new Error("Duplicate comparison period");
  for (const cut of cuts) if (new Set(cut.rows.map(r => r.company)).size !== cut.rows.length) throw new Error("Duplicate comparison company");
  const common = cuts[0]?.rows.filter(r => cuts.every(c => c.rows.some(other => other.company === r.company && validObservation(other, metric)))).map(r => r.company) ?? [];
  const points = cuts.map(c => ({ id: c.id, available: aggregateObservations(c.rows, metric), fixed: aggregateObservations(c.rows.filter(r => common.includes(r.company)), metric) }));
  const first = points[0]?.fixed.value ?? null, last = points.at(-1)?.fixed.value ?? null;
  return { common, points, delta: points.length > 1 && first !== null && last !== null ? last - first : null };
}

export function buildComparison(selection: ComparisonSelection, requestedMetric: ComparisonMetric) {
  const metric: ComparisonMetric = selection.timeMode === "months" ? "monthlyExits" : requestedMetric === "monthlyExits" ? "exits" : requestedMetric;
  const cuts = selectionCuts(selection);
  const observations = cuts.map(c => ({ id: c.id, rows: selection.companies.map(company => selection.timeMode === "months"
    ? { company, numerator: monthlyExitSummary(company, c.period, c.id).count, denominator: null }
    : { ...snapshotObservation(getCompanySnapshot(company, c.period), metric), company }) }));
  const summary = compareObservations(observations, metric);
  const rows = selection.companies.map(company => ({ company, values: observations.map(c => aggregateObservations(c.rows.filter(r => r.company === company), metric).value) }));
  return { metric: metric as ComparisonMetric, cuts, rows, ...summary };
}

export function comparisonCsvRows(result: ReturnType<typeof buildComparison>) {
  const spec = COMPARISON_METRICS[result.metric];
  const header = ["Compañía", "Periodo", "Indicador", "Unidad", "Valor", "Estado", "Empresas con datos"];
  const rows: (string | number | null)[][] = result.rows.flatMap(r => result.cuts.map((c, i) => [r.company, c.label, spec.label, spec.unit, r.values[i], r.values[i] === null ? "Sin dato válido" : "Reportado", r.values[i] === null ? 0 : 1]));
  result.cuts.forEach((c, i) => {
    rows.push(["Conjunto disponible", c.label, spec.label, spec.unit, result.points[i].available.value, "Cobertura de este periodo", result.points[i].available.n]);
    rows.push(["Mismas compañías en todos los periodos", c.label, spec.label, spec.unit, result.points[i].fixed.value, "Base comparable", result.points[i].fixed.n]);
  });
  return [header, ...rows];
}
