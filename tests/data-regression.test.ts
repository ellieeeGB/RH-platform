import assert from "node:assert/strict";
import test from "node:test";
import benchmark from "../data/processed/benchmark.json";
import peopleIntelligence from "../data/processed/people-intelligence.json";
import workforceRewards from "../data/processed/workforce-rewards.json";

test("historical aggregate retains expected panel shape", () => {
  assert.equal(benchmark.metadata.companyCount, 40);
  assert.equal(benchmark.metadata.periodCount, 7);
  assert.equal(benchmark.periods.length, 7);
});

test("latest benchmark regression anchors remain stable", () => {
  assert.equal(benchmark.latest.period, "Jul-Ago 25");
  assert.equal(benchmark.latest.headcount, 35128);
  assert.equal(benchmark.latest.vacancies.total, 2324);
  assert.equal(benchmark.latest.timeToFillDays.technical, 20);
  assert.equal(benchmark.quality.score, 90);
});

test("people intelligence aggregates preserve key validated signals", () => {
  assert.equal(peopleIntelligence.retention.earlyAttritionUnder3MonthsPct, 59.9);
  assert.equal(peopleIntelligence.retention.firstYearExitSharePct, 77.2);
  assert.equal(peopleIntelligence.compensation.bands[0].median, 339.63);
});

test("workforce and rewards aggregates retain privacy-safe anchors", () => {
  assert.equal(workforceRewards.workforcePlanning.latest.total, 2324);
  assert.equal(workforceRewards.workforcePlanning.structuredDemand.reconciles, false);
  assert.equal(workforceRewards.totalRewards.packageBreadth.allSixPct, 50);
});
