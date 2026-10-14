import { completeHeadcount, getPeriodSnapshots, MARKET_SCOPE, PERIODS, type CompanySnapshot } from "./company-panel";
import { completeSum } from "./metric-math";
import { qualityReport } from "./data-quality";

export const trajectoryMetrics = {
  exits: { label: "Bajas", unit: "bajas por cada 100 personas", href: "/retencion", source: "LB / (GL + GM + GN)", get: (r: CompanySnapshot) => r.exits },
  vacancies: { label: "Vacantes", unit: "vacantes por cada 100 personas", href: "/workforce-planning", source: "(RB + RC) / (GL + GM + GN)", get: (r: CompanySnapshot) => completeSum([r.vacancies.operational, r.vacancies.administrative]) },
  absences: { label: "Ausencias", unit: "eventos por cada 100 personas", href: "/labor-risk", source: "MC / (GL + GM + GN)", get: (r: CompanySnapshot) => r.attendance.absences },
} as const;
export type TrajectoryMetric = keyof typeof trajectoryMetrics;
export type RateObservation = { company: string; numerator: number | null; denominator: number | null };
const isValid = (r: RateObservation) => r.numerator !== null && Number.isFinite(r.numerator) && r.numerator >= 0 && r.denominator !== null && Number.isFinite(r.denominator) && r.denominator > 0;

/** Intersect once across the whole window, not separately across each adjacent pair. */
export function fixedCohortTrajectory(cuts: { period: string; rows: RateObservation[] }[], minimum = 5) {
  if (new Set(cuts.map(c => c.period)).size !== cuts.length) throw new Error("Duplicate period");
  for (const cut of cuts) if (new Set(cut.rows.map(r => r.company)).size !== cut.rows.length) throw new Error("Duplicate company");
  const maps = cuts.map(c => new Map(c.rows.filter(isValid).map(r => [r.company, r])));
  const ids = [...(maps[0]?.keys() ?? [])].filter(id => maps.every(m => m.has(id))).sort();
  const eligible = ids.length >= minimum;
  const points = cuts.map((cut, i) => {
    const numerator = ids.reduce((s, id) => s + maps[i].get(id)!.numerator!, 0);
    const denominator = ids.reduce((s, id) => s + maps[i].get(id)!.denominator!, 0);
    return { period: cut.period, n: ids.length, availableN: maps[i].size, numerator, denominator, value: eligible && denominator > 0 ? numerator / denominator * 100 : null };
  });
  const changes = points.slice(1).map((p, i) => p.value !== null && points[i].value !== null ? p.value - points[i].value! : null);
  const enough = cuts.length === 3 && eligible;
  const direction = !enough ? "insufficient" : changes.every(v => v! > 1e-9) ? "rising" : changes.every(v => v! < -1e-9) ? "falling" : changes.every(v => Math.abs(v!) <= 1e-9) ? "flat" : "mixed";
  return { ids, n: ids.length, points, changes, direction,
    delta: enough ? points.at(-1)!.value! - points[0].value! : null,
  };
}

export function consultingTrajectories(period: string, company = MARKET_SCOPE, excludeFlagged = false) {
  const index = PERIODS.indexOf(period);
  const periods = index < 0 ? [] : PERIODS.slice(Math.max(0, index - 2), index + 1);
  const flagged = new Set(periods.flatMap(p => qualityReport(p, company).anomalies.map(r => r.company)));
  return (Object.keys(trajectoryMetrics) as TrajectoryMetric[]).map(key => {
    const spec = trajectoryMetrics[key];
    const cuts = periods.map(p => ({ period: p, rows: getPeriodSnapshots(p)
      .filter(r => (company === MARKET_SCOPE || r.company === company) && (!excludeFlagged || !flagged.has(r.company)))
      .map(r => ({ company: r.company, numerator: spec.get(r), denominator: completeHeadcount(r) })) }));
    return { key, ...spec, ...fixedCohortTrajectory(cuts, company === MARKET_SCOPE ? 5 : 1), flagged: [...flagged], excludeFlagged };
  });
}

const fields = {
  operational: { label: "Plantilla operativa", column: "GL", get: (r: CompanySnapshot) => r.headcount.operational },
  administrative: { label: "Plantilla administrativa", column: "GM", get: (r: CompanySnapshot) => r.headcount.administrative },
  other: { label: "Otros integrantes de plantilla", column: "GN", get: (r: CompanySnapshot) => r.headcount.other },
  exits: { label: "Bajas del bimestre", column: "LB", get: (r: CompanySnapshot) => r.exits },
  vacanciesOperational: { label: "Vacantes operativas", column: "RB", get: (r: CompanySnapshot) => r.vacancies.operational },
  vacanciesAdministrative: { label: "Vacantes administrativas", column: "RC", get: (r: CompanySnapshot) => r.vacancies.administrative },
  absences: { label: "Eventos de ausencia", column: "MC", get: (r: CompanySnapshot) => r.attendance.absences },
} as const;
type Field = keyof typeof fields;
const population: Field[] = ["operational", "administrative", "other"];
const requirements: Record<TrajectoryMetric, Field[]> = {
  exits: [...population, "exits"], vacancies: [...population, "vacanciesOperational", "vacanciesAdministrative"], absences: [...population, "absences"],
};

/** Rank coverage recovery, never invented outcomes or statistical confidence. */
export function recoveryPlan(rows: CompanySnapshot[]) {
  const coverage = { exits: 0, vacancies: 0, absences: 0 };
  const potential = { exits: 0, vacancies: 0, absences: 0 };
  const requests = rows.flatMap(row => {
    const missingFields = new Set<Field>();
    const unlocks: TrajectoryMetric[] = [];
    const blocked: TrajectoryMetric[] = [];
    for (const key of Object.keys(requirements) as TrajectoryMetric[]) {
      const required = requirements[key];
      const missing = required.filter(f => fields[f].get(row) === null);
      const invalid = required.some(f => { const v = fields[f].get(row); return v !== null && (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)); });
      const hc = completeHeadcount(row);
      if (invalid || hc === 0) { blocked.push(key); continue; }
      if (!missing.length) { coverage[key]++; continue; }
      unlocks.push(key); potential[key]++;
      missing.forEach(f => missingFields.add(f));
    }
    if (!missingFields.size && !blocked.length) return [];
    return [{ company: row.company, headcount: completeHeadcount(row), unlocks, blocked,
      fields: [...missingFields].map(key => ({ key, label: fields[key].label, column: fields[key].column })),
    }];
  }).sort((a, b) => b.unlocks.length - a.unlocks.length || a.fields.length - b.fields.length || a.company.localeCompare(b.company, "es", { numeric: true }));
  return { total: rows.length, coverage, potential, requests };
}

export function scopedRecoveryPlan(period: string, company = MARKET_SCOPE) {
  return recoveryPlan(getPeriodSnapshots(period).filter(r => company === MARKET_SCOPE || r.company === company));
}

export function recoveryCsv(period: string, plan: ReturnType<typeof recoveryPlan>) {
  const cell = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return '\uFEFF' + [
    ["Bimestre", "Empresa", "Campos a solicitar", "Columnas", "Análisis que se completarían", "Revisión adicional"],
    ...plan.requests.map(r => [period, r.company, r.fields.map(f => f.label).join("; "), r.fields.map(f => f.column).join("; "), r.unlocks.map(k => trajectoryMetrics[k].label).join("; "), r.blocked.map(k => trajectoryMetrics[k].label).join("; ")]),
  ].map(row => row.map(cell).join(",")).join("\r\n");
}
