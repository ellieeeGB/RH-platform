import assert from "node:assert/strict";
import test from "node:test";
import { calculateScenario, defaultScenario, scenarioBaseline } from "../src/lib/scenario";

test("default scenario reproduces transparent expected outputs", () => {
  const result = calculateScenario(defaultScenario);
  assert.equal(scenarioBaseline.headcount, 26977);
  assert.equal(result.estimatedExitsAvoided, Math.round(2791 - 0.065 * 26977));
  assert.equal(result.technicalVacancyDaysAvoided, 465);
  assert.ok(Math.abs(result.newSalaryEntryDaily - 356.6115) < 0.0001);
  assert.ok(Math.abs(result.annualizedSalaryExposure - 11485352.6175) < 0.01);
  assert.ok(Math.abs(result.salaryIncreaseToQ3Pct - ((370.03 / 339.63 - 1) * 100)) < 0.001);
});

test("scenario never reports negative avoided exits or vacancy-days", () => {
  const result = calculateScenario({
    turnoverTargetPct: scenarioBaseline.currentTurnoverPct + 2,
    salaryIncreasePct: 0,
    technicalTimeToFillTargetDays: scenarioBaseline.currentTechnicalTimeToFillDays + 5,
    affectedOperationalHires: 100,
  });
  assert.equal(result.estimatedExitsAvoided, 0);
  assert.equal(result.technicalVacancyDaysAvoided, 0);
});

test("salary exposure scales only with explicitly affected hires", () => {
  const oneHundred = calculateScenario({ ...defaultScenario, affectedOperationalHires: 100 });
  const twoHundred = calculateScenario({ ...defaultScenario, affectedOperationalHires: 200 });
  assert.ok(Math.abs(twoHundred.annualizedSalaryExposure - oneHundred.annualizedSalaryExposure * 2) < 0.01);
});
