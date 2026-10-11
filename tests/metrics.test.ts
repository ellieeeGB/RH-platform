import assert from "node:assert/strict";
import test from "node:test";
import {
  earlyAttritionShare,
  hiringPressure,
  salaryIndex,
  salaryProgression,
  trainingIntensity,
  turnoverRate,
  workforceGrowth,
} from "../src/lib/metrics";

function close(actual: number | null, expected: number, tolerance = 0.01) {
  assert.notEqual(actual, null);
  assert.ok(Math.abs(actual! - expected) <= tolerance, `expected ${actual} ≈ ${expected}`);
}

test("workforce growth matches latest historical aggregate", () => {
  close(workforceGrowth(35005, 35128), 0.3514, 0.001);
});

test("bimonthly turnover uses average opening/closing headcount", () => {
  close(turnoverRate({ separations: 2807, openingHeadcount: 35005, closingHeadcount: 35128 }), 8.003, 0.01);
});

test("hiring pressure is vacancies divided by headcount", () => {
  close(hiringPressure(2324, 35128), 6.6158, 0.001);
});

test("training intensity is hours per head", () => {
  close(trainingIntensity(159851, 35128), 4.5504, 0.001);
});

test("salary index and progression remain dimensionless references", () => {
  close(salaryIndex(339.63, 339.63), 100, 0.001);
  close(salaryProgression(339.63, 560.64), 1.6507, 0.001);
});

test("early attrition is a share of separations, not headcount", () => {
  close(earlyAttritionShare(599, 1000), 59.9, 0.001);
});

test("metric functions reject invalid denominators", () => {
  assert.equal(workforceGrowth(0, 100), null);
  assert.equal(hiringPressure(100, 0), null);
  assert.equal(turnoverRate({ separations: 1, openingHeadcount: 0, closingHeadcount: 0 }), null);
  assert.equal(salaryIndex(100, 0), null);
});
