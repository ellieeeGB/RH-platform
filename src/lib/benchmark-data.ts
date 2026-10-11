import marketData from "../../data/processed/benchmark.json";

export const benchmarkData = marketData;
export const latestMarket = marketData.latest;
export const qualitySummary = marketData.quality;

export const workforceTrend = marketData.periods.map((period) => ({
  period: period.period,
  reportedHeadcount: period.reportedHeadcount,
  qualityAdjustedHeadcount: period.qualityAdjustedHeadcount,
  anomalyCount: period.anomalyCount,
}));

export const hiringPressure = [
  {
    role: "Operativo",
    vacancies: marketData.latest.vacancies.operational,
    timeToFill: marketData.latest.timeToFillDays.operational,
  },
  {
    role: "Administrativo",
    vacancies: marketData.latest.vacancies.administrative,
    timeToFill: marketData.latest.timeToFillDays.administrative,
  },
];

export const timeToFillMarket = [
  { role: "Operativo", benchmark: marketData.latest.timeToFillDays.operational },
  { role: "Técnico", benchmark: marketData.latest.timeToFillDays.technical },
  { role: "Administrativo", benchmark: marketData.latest.timeToFillDays.administrative },
  { role: "Gerencial", benchmark: marketData.latest.timeToFillDays.managerial },
];

export const recruitmentSourceBenchmark = marketData.latest.recruitmentSourcePrevalence.map((item) => ({
  source: item.source,
  value: item.pct,
  companies: item.companies,
}));

export const rejectionReasonBenchmark = marketData.latest.rejectionReasonMedianPct;

export const salaryBandBenchmark = [
  { band: "Ingreso", value: marketData.latest.salaryBandsDaily.entryMedian },
  { band: "Intermedio bajo", value: marketData.latest.salaryBandsDaily.lowMedian },
  { band: "Intermedio alto", value: marketData.latest.salaryBandsDaily.highMedian },
  { band: "Máximo", value: marketData.latest.salaryBandsDaily.maxMedian },
];

export const salaryEntryTrend = marketData.periods.map((period) => ({
  period: period.period,
  value: period.salaryEntryMedian,
}));
