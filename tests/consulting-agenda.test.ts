import test from "node:test";
import assert from "node:assert/strict";
import { fixedCohortTrajectory, consultingTrajectories, recoveryPlan, recoveryCsv, scopedRecoveryPlan } from "../src/lib/consulting-agenda";
import { getCompanySnapshot, getPeriodSnapshots, PERIODS } from "../src/lib/company-panel";
import { qualityReport } from "../src/lib/data-quality";
import { salaryReference, comparisonPeers, validSalaryBands, distribution } from "../src/lib/benchmark-comparison";
import { assertPanelSchema } from "../scripts/lib/panel-schema";
import panel from "../data/processed/company-periods/jul-ago-25.json";
import { checkCompany } from "../src/lib/data-quality";

test("three-cut trajectories hold exactly the same companies, excluding composition changes", () => {
  const obs = (company: string, numerator: number | null, denominator = 100) => ({ company, numerator, denominator });
  const result = fixedCohortTrajectory([
    { period: "A", rows: [obs("fixed", 1), obs("leaves", 200)] },
    { period: "B", rows: [obs("fixed", 2), obs("enters", 1)] },
    { period: "C", rows: [obs("fixed", 3), obs("enters", 1)] },
  ], 1);
  assert.deepEqual(result.ids, ["fixed"]); assert.equal(result.direction, "rising");
  assert.deepEqual(result.points.map(p => p.value), [1, 2, 3]); assert.equal(result.delta, 2);
});
test("zero is observed, a missing numerator and a zero denominator cannot create a trend", () => {
  const cuts = [0, 1, 2].map((n, i) => ({ period: String(i), rows: [{ company: "valid", numerator: n, denominator: 100 }, { company: "missing", numerator: i === 1 ? null : n, denominator: 100 }, { company: "empty", numerator: n, denominator: 0 }] }));
  assert.deepEqual(fixedCohortTrajectory(cuts, 1).ids, ["valid"]);
  assert.equal(fixedCohortTrajectory(cuts).direction, "insufficient");
  assert.ok(fixedCohortTrajectory(cuts).points.every(p => p.value === null));
  assert.equal(fixedCohortTrajectory(cuts.slice(0, 2), 1).direction, "insufficient");
  assert.throws(() => fixedCohortTrajectory([cuts[0], cuts[0]]), /Duplicate period/);
  assert.throws(() => fixedCohortTrajectory([{ ...cuts[0], rows: [cuts[0].rows[0], cuts[0].rows[0]] }]), /Duplicate company/);
});
test("every real trajectory stops at selection, shares its cohort across cuts and honors company", () => {
  for (const [index, period] of PERIODS.entries()) {
    for (const row of consultingTrajectories(period)) {
      assert.equal(row.points.at(-1)?.period, period);
      assert.ok(row.points.length <= 3 && row.points.every(p => PERIODS.indexOf(p.period) <= index));
      assert.ok(row.points.every(p => p.n === row.n));
      for (const point of row.points) if (point.value !== null) assert.equal(point.value, point.numerator / point.denominator * 100);
    }
    for (const row of consultingTrajectories(period, "COMPAÑIA 1")) assert.ok(row.ids.every(id => id === "COMPAÑIA 1"));
  }
  assert.deepEqual(qualityReport(PERIODS[0]).anomalies, []);
  const anomaly = qualityReport("Mar-Abr 25").anomalies.find(r => r.company === "COMPAÑIA 28");
  assert.ok(anomaly && anomaly.reported > anomaly.baseline * 3);
  for (const row of consultingTrajectories("May-Jun 25", "market", true)) assert.ok(!row.ids.includes("COMPAÑIA 28"));
});
test("requesting one missing population field can unlock three analyses; explicit zero is not missing", () => {
  const base = structuredClone(getCompanySnapshot("COMPAÑIA 1", "Jul-Ago 25")!);
  base.headcount = { operational: 100, administrative: 10, other: null, total: 110 };
  base.exits = 0; base.vacancies = { operational: 0, administrative: 0, total: 0 }; base.attendance.absences = 0;
  const p = recoveryPlan([base]);
  assert.equal(p.requests.length, 1); assert.equal(p.requests[0].fields.length, 1);
  assert.equal(p.requests[0].fields[0].column, "GN"); assert.equal(p.requests[0].unlocks.length, 3);
  base.headcount.other = 0;
  assert.equal(recoveryPlan([base]).requests.length, 0);
  assert.deepEqual(recoveryPlan([base]).coverage, { exits: 1, vacancies: 1, absences: 1 });
});
test("zero populations and invalid existing values need review, not promises to unlock coverage", () => {
  const row = structuredClone(getCompanySnapshot("COMPAÑIA 1", "Jul-Ago 25")!);
  row.headcount = { operational: 0, administrative: 0, other: 0, total: 0 };
  row.exits = null;
  const p = recoveryPlan([row]);
  assert.equal(p.requests[0].unlocks.length, 0); assert.equal(p.requests[0].blocked.length, 3);
  assert.deepEqual(p.potential, { exits: 0, vacancies: 0, absences: 0 });
});
test("coverage recovery conserves counts, prioritizes shared omissions and exports the selected period", () => {
  for (const period of PERIODS) {
    const p = scopedRecoveryPlan(period);
    for (const key of ["exits", "vacancies", "absences"] as const) {
      assert.equal(p.potential[key], p.requests.filter(r => r.unlocks.includes(key)).length);
      assert.ok(p.coverage[key] + p.potential[key] <= p.total);
    }
    for (let i = 1; i < p.requests.length; i++) assert.ok(p.requests[i-1].unlocks.length >= p.requests[i].unlocks.length);
    assert.ok(recoveryCsv(period, p).startsWith('\uFEFF"Bimestre"'));
    const own = scopedRecoveryPlan(period, "COMPAÑIA 14");
    assert.equal(own.total, 1); assert.ok(own.requests.every(r => r.company === "COMPAÑIA 14"));
  }
});
test("salary screens use one valid cohort per band and exclude the selected company", () => {
  for (const period of PERIODS) for (const row of getPeriodSnapshots(period)) {
    const r = salaryReference(period, row.company);
    const peers = comparisonPeers(period, "all", "all", row.company).filter(validSalaryBands);
    assert.equal(r.n, peers.length);
    assert.equal(r.bands.entry, distribution(peers.map(p => p.salaryDaily.entry)).median);
    if (validSalaryBands(row) && r.n >= 5) assert.equal(r.percentile, Math.round(peers.filter(p => p.salaryDaily.entry! <= row.salaryDaily.entry!).length / r.n * 100));
  }
});
test("pipeline schema rejects missing fields, accidental coercions, fractional counts and range errors", () => {
  assert.doesNotThrow(() => assertPanelSchema(panel));
  const mutate = (field: string, value: unknown) => { const p = structuredClone(panel) as { period: string; columns: string[]; rows: unknown[][] }; p.rows[0][p.columns.indexOf(field)] = value; return p; };
  for (const [field, value] of [["hires", "20"], ["exits", 1.5], ["hcOther", -1], ["acceptedPer10", 11], ["unionized", "Sí"], ["voucherOperationalPct", 101]] as const) assert.throws(() => assertPanelSchema(mutate(field, value)), /Invalid panel value/);
  assert.doesNotThrow(() => assertPanelSchema(mutate("hires", null)));
  assert.doesNotThrow(() => assertPanelSchema(mutate("hires", 0)));
  assert.throws(() => assertPanelSchema({ ...panel, columns: panel.columns.slice(1) }), /Panel columns/);
});

test("invalid source percentages are quarantined with original cells, and never displayed as exact rates", () => {
  for (const period of PERIODS.slice(0, 3)) {
    const row = getCompanySnapshot("COMPAÑIA 7", period)!;
    assert.equal(row.rejectionPct.antidoping, null);
    assert.equal(row.rejectionPct.lumbar, null);
    assert.equal(row.sourceIssues?.length, 4);
    assert.ok(row.sourceIssues?.some(i => i.value === 1056 && i.cell === "KS9"));
    const check = checkCompany(row).find(c => c.field === "Motivos de rechazo")!;
    assert.equal(check.state, "review"); assert.match(check.detail, /1056/);
  }
});
