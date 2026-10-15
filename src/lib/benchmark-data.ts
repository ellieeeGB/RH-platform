import marketData from "../../data/processed/benchmark.json";


const latestPeriod = marketData.periods.at(-1)!;
const previousPeriod = marketData.periods.at(-2)!;

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
