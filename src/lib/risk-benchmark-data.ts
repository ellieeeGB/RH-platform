import benchmark from "../../data/processed/benchmark.json";

export const laborRiskTrend = benchmark.periods.map(period => ({
  period: period.period,
  absenceEventsPer100: period.matchedRates.absences.value,
  incapacityCasesPer100: period.matchedRates.incapacity.value,
  absences: period.absences,
  incapacityCases: period.incapacityCases,
}));
