import benchmark from "../../data/processed/benchmark.json";
import peopleIntelligence from "../../data/processed/people-intelligence.json";
import workforceRewards from "../../data/processed/workforce-rewards.json";

export const laborRiskTrend = benchmark.periods.map((period) => ({
  period: period.period,
  absenceEventsPer100: Number(((period.absences / period.qualityAdjustedHeadcount) * 100).toFixed(2)),
  incapacityCasesPer100: Number(((period.incapacityCases / period.qualityAdjustedHeadcount) * 100).toFixed(2)),
  absences: period.absences,
  incapacityCases: period.incapacityCases,
}));

const currentRisk = laborRiskTrend.at(-1)!;
const previousRisk = laborRiskTrend.at(-2)!;
const firstRisk = laborRiskTrend[0];

export const laborRiskSummary = {
  current: currentRisk,
  previous: previousRisk,
  absenceRateChangePct: Number((((currentRisk.absenceEventsPer100 / previousRisk.absenceEventsPer100) - 1) * 100).toFixed(1)),
  incapacityRateChangePct: Number((((currentRisk.incapacityCasesPer100 / previousRisk.incapacityCasesPer100) - 1) * 100).toFixed(1)),
  absenceVsFirstPct: Number((((currentRisk.absenceEventsPer100 / firstRisk.absenceEventsPer100) - 1) * 100).toFixed(1)),
  incapacityVsFirstPct: Number((((currentRisk.incapacityCasesPer100 / firstRisk.incapacityCasesPer100) - 1) * 100).toFixed(1)),
  peakAbsence: laborRiskTrend.reduce((best, row) => row.absenceEventsPer100 > best.absenceEventsPer100 ? row : best),
  peakIncapacity: laborRiskTrend.reduce((best, row) => row.incapacityCasesPer100 > best.incapacityCasesPer100 ? row : best),
};

const salaryEntry = peopleIntelligence.compensation.bands.find((band) => band.band === "Ingreso")!;
const currentPeriod = benchmark.periods.at(-1)!;
const previousPeriod = benchmark.periods.at(-2)!;

export const benchmarkReference = [
  {
    category: "Compensación",
    metric: "Salario ingreso diario",
    current: salaryEntry.median,
    q1: salaryEntry.q1,
    q3: salaryEntry.q3,
    format: "currency",
    context: "Q1–Q3 del mercado",
  },
  {
    category: "Retención",
    metric: "Rotación bimestral",
    current: benchmark.latest.turnoverBimonthlyPct,
    q1: null,
    q3: null,
    format: "percent",
    context: "bajas / headcount promedio",
  },
  {
    category: "Atracción",
    metric: "Time-to-fill técnico",
    current: benchmark.latest.timeToFillDays.technical,
    q1: null,
    q3: null,
    format: "days",
    context: `vs. ${previousPeriod.timeToFill.technical} días previos`,
  },
  {
    category: "Planeación",
    metric: "Hiring pressure",
    current: benchmark.latest.hiringPressurePct,
    q1: null,
    q3: null,
    format: "percent",
    context: `${benchmark.latest.vacancies.total.toLocaleString("es-MX")} vacantes`,
  },
  {
    category: "Rewards",
    metric: "Amplitud beneficios",
    current: workforceRewards.totalRewards.packageBreadth.average,
    q1: null,
    q3: workforceRewards.totalRewards.packageBreadth.benefitTypes,
    format: "score6",
    context: "promedio de 6 beneficios clave",
  },
  {
    category: "Desarrollo",
    metric: "Horas capacitación / head",
    current: benchmark.latest.trainingHoursPerHead,
    q1: null,
    q3: null,
    format: "hours",
    context: `${currentPeriod.trainingHours.toLocaleString("es-MX")} horas agregadas`,
  },
];

export const benchmarkPrivacy = {
  minimumCohortSize: 5,
  companyCount: benchmark.metadata.companyCount,
  policy: "No se muestra un benchmark filtrado cuando el cohort resultante contiene menos de cinco compañías.",
};

export const marketPulse = {
  currentPeriod: benchmark.latest.period,
  companyCount: benchmark.metadata.companyCount,
  salaryEntryMedian: salaryEntry.median,
  salaryEntryQ1: salaryEntry.q1,
  salaryEntryQ3: salaryEntry.q3,
  turnover: benchmark.latest.turnoverBimonthlyPct,
  technicalTimeToFill: benchmark.latest.timeToFillDays.technical,
  benefitBreadth: workforceRewards.totalRewards.packageBreadth.average,
  hiringPressure: benchmark.latest.hiringPressurePct,
  headcount: benchmark.latest.headcount,
  headcountChangePct: benchmark.latest.headcountChangePct,
  hiresChangePct: Number((((currentPeriod.hires / previousPeriod.hires) - 1) * 100).toFixed(1)),
};
