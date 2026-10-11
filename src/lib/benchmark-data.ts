import marketData from "../../data/processed/benchmark.json";

export const benchmarkData = marketData;
export const latestMarket = marketData.latest;
export const qualitySummary = marketData.quality;

const latestPeriod = marketData.periods.at(-1)!;
const previousPeriod = marketData.periods.at(-2)!;

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

export const timeToFillComparison = [
  { role: "Operativo", previous: previousPeriod.timeToFill.operational, current: latestPeriod.timeToFill.operational },
  { role: "Técnico", previous: previousPeriod.timeToFill.technical, current: latestPeriod.timeToFill.technical },
  { role: "Administrativo", previous: previousPeriod.timeToFill.administrative, current: latestPeriod.timeToFill.administrative },
  { role: "Gerencial", previous: previousPeriod.timeToFill.managerial, current: latestPeriod.timeToFill.managerial },
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

export const marketChange = {
  technicalTimeToFillDays: latestPeriod.timeToFill.technical - previousPeriod.timeToFill.technical,
  hiresPct: ((latestPeriod.hires / previousPeriod.hires) - 1) * 100,
  exitsPct: ((latestPeriod.exits / previousPeriod.exits) - 1) * 100,
  trainingHoursPct: ((latestPeriod.trainingHours / previousPeriod.trainingHours) - 1) * 100,
};
