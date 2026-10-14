import { completeHeadcount, getPeriodSnapshots, getPreviousPeriod, MARKET_SCOPE, PERIODS, type CompanySnapshot } from "./company-panel";
import { completeSum } from "./metric-math";

export const signalMetrics = {
  exits: { label: "Bajas", unit: "bajas", source: "LB", get: (r: CompanySnapshot) => r.exits },
  hires: { label: "Contrataciones", unit: "altas", source: "KE", get: (r: CompanySnapshot) => r.hires },
  headcount: { label: "Plantilla completa", unit: "personas", source: "GL + GM + GN", get: completeHeadcount },
  vacancies: { label: "Vacantes próximas", unit: "vacantes", source: "RB + RC", get: (r: CompanySnapshot) => completeSum([r.vacancies.operational, r.vacancies.administrative]) },
  training: { label: "Capacitación", unit: "horas", source: "MT + MU", get: (r: CompanySnapshot) => completeSum([r.training.operationalHours, r.training.administrativeHours]) },
} as const;
export type SignalMetric = keyof typeof signalMetrics;
export type Observation = { company: string; value: number | null };
const valid = (rows: Observation[]) => rows.filter((r): r is {company: string; value: number} => r.value !== null && Number.isFinite(r.value) && r.value >= 0);
const total = (rows: Array<{value: number}>) => rows.reduce((s, r) => s + r.value, 0);
const change = (after: number, before: number) => before > 0 ? (after - before) / before * 100 : null;

export function compareObservations(before: Observation[], after: Observation[]) {
  const previous = valid(before), current = valid(after);
  const prior = new Map(previous.map(r => [r.company, r.value]));
  const now = new Map(current.map(r => [r.company, r.value]));
  const pairs = current.filter(r => prior.has(r.company)).map(r => ({ company: r.company, before: prior.get(r.company)!, after: r.value, delta: r.value - prior.get(r.company)! }));
  const beforeTotal = total(previous), afterTotal = total(current);
  const matchedBefore = pairs.reduce((s, r) => s + r.before, 0), matchedAfter = pairs.reduce((s, r) => s + r.after, 0);
  const entering = current.filter(r => !prior.has(r.company)), leaving = previous.filter(r => !now.has(r.company));
  const matchedDelta = pairs.length ? matchedAfter - matchedBefore : null;
  const delta = previous.length && current.length ? afterTotal - beforeTotal : null;
  const compositionDelta = delta !== null && matchedDelta !== null ? delta - matchedDelta : null;
  const sensitivity = pairs.length >= 6 ? pairs.map(r => ({company: r.company, value: change(matchedAfter - r.after, matchedBefore - r.before)})).filter((r): r is {company: string; value: number} => r.value !== null) : [];
  const pct = pairs.length ? change(matchedAfter, matchedBefore) : null;
  return {
    previousN: previous.length, currentN: current.length, n: pairs.length,
    beforeTotal: previous.length ? beforeTotal : null, afterTotal: current.length ? afterTotal : null,
    matchedBefore, matchedAfter, delta, matchedDelta, compositionDelta,
    observedPct: previous.length && current.length ? change(afterTotal, beforeTotal) : null, matchedPct: pct,
    entering: entering.length, leaving: leaving.length,
    sensitivity: sensitivity.length === pairs.length && sensitivity.length > 0 ? {
      min: Math.min(...sensitivity.map(r => r.value)), max: Math.max(...sensitivity.map(r => r.value)),
      directionStable: pct !== null && pct !== 0 && sensitivity.every(r => Math.sign(r.value) === Math.sign(pct)),
    } : null,
    contributors: pairs.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.company.localeCompare(b.company, "es", {numeric:true})),
  };
}

export function analyzeSignal(metric: SignalMetric, period: string, company = MARKET_SCOPE) {
  const rows = (cut: string) => getPeriodSnapshots(cut).filter(r => company === MARKET_SCOPE || r.company === company).map(r => ({ company: r.company, value: signalMetrics[metric].get(r) }));
  const previous = getPreviousPeriod(period);
  return { ...compareObservations(previous ? rows(previous) : [], rows(period)), previous, period, metric };
}

export function signalCoverage(metric: SignalMetric, company = MARKET_SCOPE) {
  return PERIODS.map(period => ({period, n: getPeriodSnapshots(period).filter(r => (company === MARKET_SCOPE || r.company === company) && (() => { const value = signalMetrics[metric].get(r); return value !== null && Number.isFinite(value) && value >= 0; })()).length}));
}
