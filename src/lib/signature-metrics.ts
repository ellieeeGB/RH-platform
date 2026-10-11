import benchmark from "../../data/processed/benchmark.json";
import people from "../../data/processed/people-intelligence.json";
import rewards from "../../data/processed/workforce-rewards.json";

const latest = benchmark.latest;
const firstPeriod = benchmark.periods[0];

export const signatureMetrics = {
  talentMovementLoadPct: Number((((latest.hires + latest.exits) / latest.headcount) * 100).toFixed(1)),
  netTalentFlow: latest.hires - latest.exits,
  replacementRatio: Number((latest.exits / latest.hires).toFixed(2)),
  vacancyCarryoverPct: Number(((latest.vacancies.total / latest.hires) * 100).toFixed(1)),
  candidateFitPct: latest.candidateAcceptancePer10Median * 10,
  earlyAttritionSharePct: people.retention.earlyAttritionUnder3MonthsPct,
  firstYearExitSharePct: people.retention.firstYearExitSharePct,
  operationalVacancySharePct: rewards.workforcePlanning.latest.operationalSharePct,
  demandConcentrationPct: Number(((rewards.workforcePlanning.hotspots[0].demand / rewards.workforcePlanning.structuredDemand.operationalTotal) * 100).toFixed(1)),
  salaryDriftPct: Number((((latest.salaryBandsDaily.entryMedian / firstPeriod.salaryEntryMedian) - 1) * 100).toFixed(1)),
  benefitsBreadthMedian: rewards.totalRewards.packageBreadth.median,
  benefitsBreadthMax: rewards.totalRewards.packageBreadth.benefitTypes,
  dataConfidence: benchmark.quality.score,
};

export const signatureMetricDefinitions = {
  talentMovementLoadPct: {
    label: "Talent Movement Load",
    formula: "(Altas + Bajas) / Headcount × 100",
    why: "Mide la carga operativa de movimiento de talento aunque la plantilla neta parezca estable.",
  },
  vacancyCarryoverPct: {
    label: "Vacancy Carryover",
    formula: "Vacantes próximas / Altas del bimestre × 100",
    why: "Dimensiona la carga futura de reclutamiento contra la capacidad reciente de contratación.",
  },
  candidateFitPct: {
    label: "Candidate Fit",
    formula: "Candidatos adecuados de cada 10 × 10",
    why: "Resume la disponibilidad efectiva de candidatos aceptables en la muestra.",
  },
  demandConcentrationPct: {
    label: "Demand Concentration",
    formula: "Demanda del principal hotspot / Demanda operativa estructurada × 100",
    why: "Señala si el reto de contratación está concentrado en un perfil específico.",
  },
};
