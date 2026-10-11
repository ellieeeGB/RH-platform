import assert from "node:assert/strict";
import test from "node:test";
import extended from "../data/processed/extended-intelligence.json";

test("extended dataset coverage retains expected survey shape", () => {
  assert.equal(extended.metadata.companyCount, 40);
  assert.equal(extended.metadata.periodCount, 7);
  assert.equal(extended.metadata.logicalQuestionBlocks, 208);
  assert.equal(extended.metadata.effectiveColumns, 1142);
});

test("labor relations sample reconciles", () => {
  assert.equal(extended.laborRelations.unionization.yes + extended.laborRelations.unionization.no, 40);
  assert.equal(extended.laborRelations.unionization.pct, 80);
  assert.ok(extended.laborRelations.collectiveBargaining.granted.salaryOperationalPct.median >= 0);
});

test("technical salary bands remain ordered", () => {
  for (const role of extended.talentMarket.technicalRoles) {
    assert.ok(role.salaryMinMedian <= role.salaryMarketMedian, role.role);
    assert.ok(role.salaryMarketMedian <= role.salaryMaxMedian, role.role);
    assert.ok(role.prevalencePct >= 0 && role.prevalencePct <= 100, role.role);
  }
});

test("percentage metrics remain within bounds", () => {
  assert.ok(extended.rewardsEconomics.transport.usageMedianPct <= 100);
  assert.ok(extended.rewardsEconomics.cafeteria.usageMedianPct <= 100);
  for (const level of Object.values(extended.talentMarket.recruitingSourceMix)) {
    for (const source of level) assert.ok(source.medianUsePct >= 0 && source.medianUsePct <= 100);
  }
});
