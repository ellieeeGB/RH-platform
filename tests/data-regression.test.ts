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
  // Excel LQ:LU: companies 2,13,25,31,36,38; company 15 sums to 90% and is excluded.
  // Complete reconciled sample = 19+61+33+21+103+498 = 735 exits.
  assert.equal(peopleIntelligence.retention.tenureValidCompanies, 6);
  assert.equal(peopleIntelligence.retention.tenureWeightedExits, 735);
  assert.equal(peopleIntelligence.retention.earlyAttritionUnder3MonthsPct, 54.5);
  assert.equal(peopleIntelligence.retention.firstYearExitSharePct, 76.7);
  assert.equal(peopleIntelligence.compensation.bands[0].median, 339.63);
});

test("workforce and rewards aggregates retain privacy-safe anchors", () => {
  assert.equal(workforceRewards.workforcePlanning.latest.total, 2324);
  assert.equal(workforceRewards.workforcePlanning.structuredDemand.reconciles, false);
  assert.equal(workforceRewards.totalRewards.packageBreadth.allSixPct, 50);
});
