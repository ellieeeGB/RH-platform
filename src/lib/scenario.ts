import benchmark from "../../data/processed/benchmark.json";
import peopleIntelligence from "../../data/processed/people-intelligence.json";
import workforceRewards from "../../data/processed/workforce-rewards.json";

export type ScenarioInputs = {
  turnoverTargetPct: number;
  salaryIncreasePct: number;
  technicalTimeToFillTargetDays: number;
  affectedOperationalHires: number;
};

const entryBand = peopleIntelligence.compensation.bands.find((band) => band.band === "Ingreso")!;

export const scenarioBaseline = {
  headcount: benchmark.latest.headcount,
  currentTurnoverPct: benchmark.latest.turnoverBimonthlyPct,
  currentSalaryEntryDaily: entryBand.median,
  salaryEntryQ3Daily: entryBand.q3,
  currentTechnicalTimeToFillDays: benchmark.latest.timeToFillDays.technical,
  structuredTechnicalDemand: workforceRewards.workforcePlanning.structuredDemand.technicalTotal,
  operationalVacancies: benchmark.latest.vacancies.operational,
};

export const defaultScenario: ScenarioInputs = {
  turnoverTargetPct: 6.5,
  salaryIncreasePct: 5,
  technicalTimeToFillTargetDays: 15,
  affectedOperationalHires: benchmark.latest.vacancies.operational,
};

export function calculateScenario(input: ScenarioInputs) {
  const turnoverGapPoints = Math.max(0, scenarioBaseline.currentTurnoverPct - input.turnoverTargetPct);
  const estimatedExitsAvoided = Math.round((turnoverGapPoints / 100) * scenarioBaseline.headcount);
  const scenarioExitLoad = Math.round((input.turnoverTargetPct / 100) * scenarioBaseline.headcount);

  const newSalaryEntryDaily = scenarioBaseline.currentSalaryEntryDaily * (1 + input.salaryIncreasePct / 100);
  const dailySalaryDelta = newSalaryEntryDaily - scenarioBaseline.currentSalaryEntryDaily;
  const annualizedSalaryExposure = dailySalaryDelta * input.affectedOperationalHires * 365;
  const gapToQ3Daily = scenarioBaseline.salaryEntryQ3Daily - newSalaryEntryDaily;
  const salaryIncreaseToQ3Pct = ((scenarioBaseline.salaryEntryQ3Daily / scenarioBaseline.currentSalaryEntryDaily) - 1) * 100;

  const technicalDaysSavedPerVacancy = Math.max(0, scenarioBaseline.currentTechnicalTimeToFillDays - input.technicalTimeToFillTargetDays);
  const technicalVacancyDaysAvoided = Math.round(technicalDaysSavedPerVacancy * scenarioBaseline.structuredTechnicalDemand);

  return {
    turnoverGapPoints,
    estimatedExitsAvoided,
    scenarioExitLoad,
    newSalaryEntryDaily,
    dailySalaryDelta,
    annualizedSalaryExposure,
    gapToQ3Daily,
    salaryIncreaseToQ3Pct,
    technicalDaysSavedPerVacancy,
    technicalVacancyDaysAvoided,
  };
}
