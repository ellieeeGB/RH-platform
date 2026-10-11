function finite(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  return numerator / denominator;
}

export function workforceGrowth(previousHeadcount?: number | null, currentHeadcount?: number | null) {
  if (!finite(previousHeadcount) || !finite(currentHeadcount)) return null;
  const ratio = safeDivide(currentHeadcount - previousHeadcount, previousHeadcount);
  return ratio === null ? null : ratio * 100;
}

export function turnoverRate(params: {
  separations?: number | null;
  openingHeadcount?: number | null;
  closingHeadcount?: number | null;
}) {
  const { separations, openingHeadcount, closingHeadcount } = params;
  if (!finite(separations) || !finite(openingHeadcount) || !finite(closingHeadcount)) return null;
  const averageHeadcount = (openingHeadcount + closingHeadcount) / 2;
  const ratio = safeDivide(separations, averageHeadcount);
  return ratio === null ? null : ratio * 100;
}

export function hiringPressure(futureVacancies?: number | null, headcount?: number | null) {
  if (!finite(futureVacancies) || !finite(headcount)) return null;
  const ratio = safeDivide(futureVacancies, headcount);
  return ratio === null ? null : ratio * 100;
}

export function earlyAttritionShare(earlySeparations90d?: number | null, totalSeparations?: number | null) {
  if (!finite(earlySeparations90d) || !finite(totalSeparations)) return null;
  const ratio = safeDivide(earlySeparations90d, totalSeparations);
  return ratio === null ? null : ratio * 100;
}

export function trainingIntensity(trainingHours?: number | null, headcount?: number | null) {
  if (!finite(trainingHours) || !finite(headcount)) return null;
  return safeDivide(trainingHours, headcount);
}

export function salaryIndex(companySalary?: number | null, benchmarkSalary?: number | null) {
  if (!finite(companySalary) || !finite(benchmarkSalary)) return null;
  const ratio = safeDivide(companySalary, benchmarkSalary);
  return ratio === null ? null : ratio * 100;
}

export function salaryProgression(entrySalary?: number | null, maxSalary?: number | null) {
  if (!finite(entrySalary) || !finite(maxSalary)) return null;
  return safeDivide(maxSalary, entrySalary);
}

export function dataQualityScore(params: { passed: number; warnings: number; critical: number }) {
  const total = params.passed + params.warnings + params.critical;
  if (total <= 0) return null;

  // Critical errors penalize more because they can invalidate downstream KPIs/models.
  const penalty = params.warnings + params.critical * 4;
  return Math.max(0, Math.round(100 * (1 - penalty / (total * 4))));
}
