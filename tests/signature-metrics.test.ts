import test from "node:test";
import assert from "node:assert/strict";
import { signatureMetrics } from "../src/lib/signature-metrics";

test("signature metrics stay grounded in the processed benchmark", () => {
  assert.equal(signatureMetrics.talentMovementLoadPct, 15.9);
  assert.equal(signatureMetrics.netTalentFlow, -28);
  assert.equal(signatureMetrics.vacancyCarryoverPct, 83.6);
  assert.equal(signatureMetrics.candidateFitPct, 45);
  assert.equal(signatureMetrics.earlyAttritionSharePct, 59.9);
  assert.equal(signatureMetrics.operationalVacancySharePct, 79.73);
  assert.equal(signatureMetrics.demandConcentrationPct, 74);
  assert.equal(signatureMetrics.salaryDriftPct, 12.8);
  assert.equal(signatureMetrics.dataConfidence, 90);
});
