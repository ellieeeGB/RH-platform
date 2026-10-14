import { completeHeadcount, getPeriodSnapshots, getPreviousPeriod, MARKET_SCOPE, type CompanySnapshot } from "./company-panel";
import { comparisonPeers, distribution, validSalaryBands, type PeerSize, type PeerUnion } from "./benchmark-comparison";
import { qualityReport } from "./data-quality";

export type RateObservation = { company: string; exits: number | null; headcount: number | null };
const valid = (r: RateObservation): r is {company: string; exits: number; headcount: number} => r.exits !== null && r.headcount !== null && Number.isFinite(r.exits) && Number.isFinite(r.headcount) && r.exits >= 0 && r.headcount > 0;
const rate = (rows: RateObservation[]) => {
  const pairs = rows.filter(valid);
  return pairs.length ? pairs.reduce((s, r) => s + r.exits, 0) / pairs.reduce((s, r) => s + r.headcount, 0) * 100 : null;
};

/** Symmetric Kitagawa identity: within-rate effect + workforce-weight effect, in percentage points. */
export function decomposeRates(before: RateObservation[], after: RateObservation[]) {
  for (const rows of [before, after]) if (new Set(rows.map(r => r.company)).size !== rows.length) throw new Error("Duplicate company in rate decomposition");
  const previous = new Map(before.filter(valid).map(r => [r.company, r]));
  const current = after.filter(valid);
  const pairs = current.flatMap(now => {
    const prior = previous.get(now.company);
    return prior ? [{ company: now.company, prior, now }] : [];
  });
  const priorHeadcount = pairs.reduce((s, r) => s + r.prior.headcount, 0);
  const currentHeadcount = pairs.reduce((s, r) => s + r.now.headcount, 0);
  const contributors = pairs.map(({ company, prior, now }) => {
    const beforeRate = prior.exits / prior.headcount * 100, afterRate = now.exits / now.headcount * 100;
    const beforeWeight = prior.headcount / priorHeadcount, afterWeight = now.headcount / currentHeadcount;
    return { company, beforeRate, afterRate, beforeHeadcount: prior.headcount, afterHeadcount: now.headcount,
      within: (beforeWeight + afterWeight) / 2 * (afterRate - beforeRate),
      weight: (beforeRate + afterRate) / 2 * (afterWeight - beforeWeight) };
  });
  const beforeRate = rate(pairs.map(r => r.prior)), afterRate = rate(pairs.map(r => r.now));
  const observedBefore = rate(before), observedAfter = rate(after);
  const delta = beforeRate !== null && afterRate !== null ? afterRate - beforeRate : null;
  const observedDelta = observedBefore !== null && observedAfter !== null ? observedAfter - observedBefore : null;
  return { n: pairs.length, previousN: before.filter(valid).length, currentN: current.length, priorHeadcount, currentHeadcount,
    beforeRate, afterRate, delta, observedBefore, observedAfter, observedDelta,
    within: pairs.length ? contributors.reduce((s, r) => s + r.within, 0) : null,
    weight: pairs.length ? contributors.reduce((s, r) => s + r.weight, 0) : null,
    coverageEffect: delta !== null && observedDelta !== null ? observedDelta - delta : null,
    contributors: contributors.sort((a, b) => Math.abs(b.within + b.weight) - Math.abs(a.within + a.weight)) };
}

export type TalentPoint = { company: string; salary: number; turnover: number; headcount: number; exits: number; unionized: boolean | null; review: boolean };
export function buildTalentMap(rows: CompanySnapshot[]) {
  const exclusions = { headcount: 0, exits: 0, salary: 0 };
  const points: TalentPoint[] = [];
  for (const r of rows) {
    const hc = completeHeadcount(r);
    if (hc === null || hc <= 0) { exclusions.headcount++; continue; }
    if (r.exits === null || !Number.isFinite(r.exits) || r.exits < 0) { exclusions.exits++; continue; }
    if (!validSalaryBands(r)) { exclusions.salary++; continue; }
    points.push({ company: r.company, salary: r.salaryDaily.entry!, turnover: r.exits / hc * 100, headcount: hc, exits: r.exits, unionized: r.laborRelations.unionized, review: false });
  }
  return { points, exclusions, salary: distribution(points.map(r => r.salary)), turnover: distribution(points.map(r => r.turnover)), total: rows.length };
}

/** These are descriptive contrasts, not estimates of the effect of pay. */
export function contrastPeers(point: TalentPoint, points: TalentPoint[]) {
  if (point.unionized === null) return [];
  return points.filter(p => p.company !== point.company && p.unionized === point.unionized && p.headcount >= point.headcount * .5 && p.headcount <= point.headcount * 2 && Math.abs(p.salary / point.salary - 1) <= .1)
    .sort((a, b) => a.turnover - b.turnover || a.company.localeCompare(b.company, "es", {numeric: true}));
}

export function decisionStudy(period: string, company = MARKET_SCOPE, size: PeerSize = "all", union: PeerUnion = "all", excludeFlagged = false) {
  const candidates = comparisonPeers(period, size, union);
  const previous = getPreviousPeriod(period);
  const flagged = new Set(qualityReport(period).anomalies.map(r => r.company));
  const flaggedEitherCut = new Set([...flagged, ...(previous ? qualityReport(previous).anomalies.map(r => r.company) : [])]);
  const cohort = candidates.filter(r => !excludeFlagged || !flaggedEitherCut.has(r.company));
  const ids = new Set(cohort.filter(r => company === MARKET_SCOPE || r.company === company).map(r => r.company));
  const observations = (cut: string) => getPeriodSnapshots(cut).filter(r => ids.has(r.company)).map(r => ({ company: r.company, exits: r.exits, headcount: completeHeadcount(r) }));
  const map = buildTalentMap(cohort);
  map.points.forEach(p => { p.review = flagged.has(p.company); });
  return { ...map, previous, excludedForReview: candidates.length - cohort.length, excludeFlagged, decomposition: decomposeRates(previous ? observations(previous) : [], observations(period)) };
}
