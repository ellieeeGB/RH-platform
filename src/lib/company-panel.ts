import julAgo24 from "../../data/processed/company-periods/jul-ago-24.json";
import sepOct24 from "../../data/processed/company-periods/sep-oct-24.json";
import novDic24 from "../../data/processed/company-periods/nov-dic-24.json";
import eneFeb25 from "../../data/processed/company-periods/ene-feb-25.json";
import marAbr25 from "../../data/processed/company-periods/mar-abr-25.json";
import mayJun25 from "../../data/processed/company-periods/may-jun-25.json";
import julAgo25 from "../../data/processed/company-periods/jul-ago-25.json";

type RawValue = string | number | boolean | null;
type RawDataset = { period: string; columns: string[]; rows: RawValue[][] };

const datasets = [julAgo24, sepOct24, novDic24, eneFeb25, marAbr25, mayJun25, julAgo25] as RawDataset[];

export const PERIODS = datasets.map((item) => item.period);
export const COMPANIES = Array.from({ length: 40 }, (_, index) => `COMPAÑIA ${index + 1}`);
export const MARKET_SCOPE = "market";

export type RejectionMix = {
  antidoping: number | null;
  schooling: number | null;
  vision: number | null;
  lumbar: number | null;
  audiometry: number | null;
  experience: number | null;
  residence: number | null;
  numerical: number | null;
  psychometric: number | null;
};

export type CompanySnapshot = {
  company: string;
  period: string;
  headcount: { operational: number | null; administrative: number | null; other: number | null; total: number | null };
  salaryDaily: { entry: number | null; low: number | null; high: number | null; max: number | null };
  hires: number | null;
  exits: number | null;
  timeToFill: { operational: number | null; technical: number | null; administrative: number | null; managerial: number | null };
  acceptedPer10: number | null;
  rejectionPct: RejectionMix;
  vacancies: { operational: number | null; administrative: number | null; total: number | null };
  attendance: {
    absences: number | null;
    incapacityCases: number | null;
    workRisk: number | null;
    generalIllness: number | null;
    maternity: number | null;
  };
  training: { operationalHours: number | null; administrativeHours: number | null; totalHours: number | null };
  laborRelations: {
    unionized: boolean | null;
    relationship: string | null;
    negotiationStatus: string | null;
    grantedSalaryOperationalPct: number | null;
    grantedSalaryAdministrativePct: number | null;
    grantedBenefitsOperationalPct: number | null;
    grantedBenefitsAdministrativePct: number | null;
  };
  benefits: {
    voucherOperationalPct: number | null;
    voucherAdministrativePct: number | null;
    voucherManagerialPct: number | null;
    savingsOperationalPct: number | null;
    savingsAdministrativePct: number | null;
    savingsManagerialPct: number | null;
    vacationOperationalYear1: number | null;
    vacationAdministrativeYear1: number | null;
    lifeInsurance: boolean | null;
    transport: boolean | null;
    cafeteria: boolean | null;
  };
};

function positive(value: number | null) { return value !== null && value > 0 ? value : null; }

function num(value: RawValue): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function bool(value: RawValue): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function text(value: RawValue): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toSnapshot(dataset: RawDataset, row: RawValue[]): CompanySnapshot {
  const index = Object.fromEntries(dataset.columns.map((column, idx) => [column, idx]));
  const numberValue = (column: string) => num(row[index[column]]);
  const boolValue = (column: string) => bool(row[index[column]]);
  const textValue = (column: string) => text(row[index[column]]);
  const company = String(row[index.company]);
  const operational = numberValue("hcOperational");
  const administrative = numberValue("hcAdministrative");
  const other = numberValue("hcOther");
  const total = [operational, administrative, other].some((item) => item !== null)
    ? (operational ?? 0) + (administrative ?? 0) + (other ?? 0)
    : null;
  const vacanciesOperational = numberValue("vacanciesOperational");
  const vacanciesAdministrative = numberValue("vacanciesAdministrative");
  const vacanciesTotal = vacanciesOperational !== null || vacanciesAdministrative !== null
    ? (vacanciesOperational ?? 0) + (vacanciesAdministrative ?? 0)
    : null;
  const trainingOperational = numberValue("trainingOperational");
  const trainingAdministrative = numberValue("trainingAdministrative");
  const trainingTotal = trainingOperational !== null || trainingAdministrative !== null
    ? (trainingOperational ?? 0) + (trainingAdministrative ?? 0)
    : null;

  return {
    company,
    period: dataset.period,
    headcount: { operational, administrative, other, total },
    salaryDaily: {
      entry: numberValue("salaryEntry"),
      low: numberValue("salaryLow"),
      high: numberValue("salaryHigh"),
      max: numberValue("salaryMax"),
    },
    hires: numberValue("hires"),
    exits: numberValue("exits"),
    timeToFill: {
      operational: positive(numberValue("ttfOperational")),
      technical: positive(numberValue("ttfTechnical")),
      administrative: positive(numberValue("ttfAdministrative")),
      managerial: positive(numberValue("ttfManagerial")),
    },
    acceptedPer10: numberValue("acceptedPer10"),
    rejectionPct: {
      antidoping: numberValue("rejectionAntidoping"),
      schooling: numberValue("rejectionSchooling"),
      vision: numberValue("rejectionVision"),
      lumbar: numberValue("rejectionLumbar"),
      audiometry: numberValue("rejectionAudiometry"),
      experience: numberValue("rejectionExperience"),
      residence: numberValue("rejectionResidence"),
      numerical: numberValue("rejectionNumerical"),
      psychometric: numberValue("rejectionPsychometric"),
    },
    vacancies: { operational: vacanciesOperational, administrative: vacanciesAdministrative, total: vacanciesTotal },
    attendance: {
      absences: numberValue("absencesTotal"),
      incapacityCases: numberValue("incapacityCases"),
      workRisk: numberValue("incapacityWorkRisk"),
      generalIllness: numberValue("incapacityGeneralIllness"),
      maternity: numberValue("incapacityMaternity"),
    },
    training: {
      operationalHours: trainingOperational,
      administrativeHours: trainingAdministrative,
      totalHours: trainingTotal,
    },
    laborRelations: {
      unionized: boolValue("unionized"),
      relationship: textValue("unionRelationship"),
      negotiationStatus: textValue("negotiationStatus"),
      grantedSalaryOperationalPct: numberValue("grantedSalaryOperationalPct"),
      grantedSalaryAdministrativePct: numberValue("grantedSalaryAdministrativePct"),
      grantedBenefitsOperationalPct: numberValue("grantedBenefitsOperationalPct"),
      grantedBenefitsAdministrativePct: numberValue("grantedBenefitsAdministrativePct"),
    },
    benefits: {
      voucherOperationalPct: numberValue("voucherOperationalPct"),
      voucherAdministrativePct: numberValue("voucherAdministrativePct"),
      voucherManagerialPct: numberValue("voucherManagerialPct"),
      savingsOperationalPct: numberValue("savingsOperationalPct"),
      savingsAdministrativePct: numberValue("savingsAdministrativePct"),
      savingsManagerialPct: numberValue("savingsManagerialPct"),
      vacationOperationalYear1: numberValue("vacationOperationalYear1"),
      vacationAdministrativeYear1: numberValue("vacationAdministrativeYear1"),
      lifeInsurance: boolValue("lifeInsurance"),
      transport: boolValue("transportBenefit"),
      cafeteria: boolValue("cafeteriaBenefit"),
    },
  };
}

const snapshots = datasets.flatMap((dataset) => dataset.rows.map((row) => toSnapshot(dataset, row)));

function values(items: (number | null)[]) {
  return items.filter((value): value is number => value !== null && Number.isFinite(value));
}

export function median(items: (number | null)[]): number | null {
  const sorted = values(items).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function sum(items: (number | null)[]): number | null {
  const valid = values(items);
  return valid.length ? valid.reduce((total, value) => total + value, 0) : null;
}

export function getPeriodSnapshots(period: string) {
  return snapshots.filter((row) => row.period === period);
}

export function getCompanySnapshot(company: string, period: string) {
  return snapshots.find((row) => row.company === company && row.period === period) ?? null;
}

export function getMarketSnapshot(period: string): CompanySnapshot & { companyCount: number } {
  const rows = getPeriodSnapshots(period);
  const operational = sum(rows.map((row) => row.headcount.operational));
  const administrative = sum(rows.map((row) => row.headcount.administrative));
  const other = sum(rows.map((row) => row.headcount.other));
  const total = operational !== null || administrative !== null || other !== null
    ? (operational ?? 0) + (administrative ?? 0) + (other ?? 0)
    : null;
  const vacancyOperational = sum(rows.map((row) => row.vacancies.operational));
  const vacancyAdministrative = sum(rows.map((row) => row.vacancies.administrative));
  const trainingOperational = sum(rows.map((row) => row.training.operationalHours));
  const trainingAdministrative = sum(rows.map((row) => row.training.administrativeHours));

  return {
    company: "Mercado",
    companyCount: rows.length,
    period,
    headcount: { operational, administrative, other, total },
    salaryDaily: {
      entry: median(rows.map((row) => row.salaryDaily.entry)),
      low: median(rows.map((row) => row.salaryDaily.low)),
      high: median(rows.map((row) => row.salaryDaily.high)),
      max: median(rows.map((row) => row.salaryDaily.max)),
    },
    hires: sum(rows.map((row) => row.hires)),
    exits: sum(rows.map((row) => row.exits)),
    timeToFill: {
      operational: median(rows.map((row) => row.timeToFill.operational)),
      technical: median(rows.map((row) => row.timeToFill.technical)),
      administrative: median(rows.map((row) => row.timeToFill.administrative)),
      managerial: median(rows.map((row) => row.timeToFill.managerial)),
    },
    acceptedPer10: median(rows.map((row) => row.acceptedPer10)),
    rejectionPct: {
      antidoping: median(rows.map((row) => row.rejectionPct.antidoping)),
      schooling: median(rows.map((row) => row.rejectionPct.schooling)),
      vision: median(rows.map((row) => row.rejectionPct.vision)),
      lumbar: median(rows.map((row) => row.rejectionPct.lumbar)),
      audiometry: median(rows.map((row) => row.rejectionPct.audiometry)),
      experience: median(rows.map((row) => row.rejectionPct.experience)),
      residence: median(rows.map((row) => row.rejectionPct.residence)),
      numerical: median(rows.map((row) => row.rejectionPct.numerical)),
      psychometric: median(rows.map((row) => row.rejectionPct.psychometric)),
    },
    vacancies: {
      operational: vacancyOperational,
      administrative: vacancyAdministrative,
      total: vacancyOperational !== null || vacancyAdministrative !== null ? (vacancyOperational ?? 0) + (vacancyAdministrative ?? 0) : null,
    },
    attendance: {
      absences: sum(rows.map((row) => row.attendance.absences)),
      incapacityCases: sum(rows.map((row) => row.attendance.incapacityCases)),
      workRisk: sum(rows.map((row) => row.attendance.workRisk)),
      generalIllness: sum(rows.map((row) => row.attendance.generalIllness)),
      maternity: sum(rows.map((row) => row.attendance.maternity)),
    },
    training: {
      operationalHours: trainingOperational,
      administrativeHours: trainingAdministrative,
      totalHours: trainingOperational !== null || trainingAdministrative !== null
        ? (trainingOperational ?? 0) + (trainingAdministrative ?? 0)
        : null,
    },
    laborRelations: {
      unionized: null,
      relationship: null,
      negotiationStatus: null,
      grantedSalaryOperationalPct: median(rows.map((row) => row.laborRelations.grantedSalaryOperationalPct)),
      grantedSalaryAdministrativePct: median(rows.map((row) => row.laborRelations.grantedSalaryAdministrativePct)),
      grantedBenefitsOperationalPct: median(rows.map((row) => row.laborRelations.grantedBenefitsOperationalPct)),
      grantedBenefitsAdministrativePct: median(rows.map((row) => row.laborRelations.grantedBenefitsAdministrativePct)),
    },
    benefits: {
      voucherOperationalPct: median(rows.map((row) => row.benefits.voucherOperationalPct)),
      voucherAdministrativePct: median(rows.map((row) => row.benefits.voucherAdministrativePct)),
      voucherManagerialPct: median(rows.map((row) => row.benefits.voucherManagerialPct)),
      savingsOperationalPct: median(rows.map((row) => row.benefits.savingsOperationalPct)),
      savingsAdministrativePct: median(rows.map((row) => row.benefits.savingsAdministrativePct)),
      savingsManagerialPct: median(rows.map((row) => row.benefits.savingsManagerialPct)),
      vacationOperationalYear1: median(rows.map((row) => row.benefits.vacationOperationalYear1)),
      vacationAdministrativeYear1: median(rows.map((row) => row.benefits.vacationAdministrativeYear1)),
      lifeInsurance: null,
      transport: null,
      cafeteria: null,
    },
  };
}

export function getScopeSnapshot(company: string, period: string) {
  return company === MARKET_SCOPE ? getMarketSnapshot(period) : getCompanySnapshot(company, period);
}

export function getPreviousPeriod(period: string) {
  const index = PERIODS.indexOf(period);
  return index > 0 ? PERIODS[index - 1] : null;
}

export function getPreviousScopeSnapshot(company: string, period: string) {
  const previousPeriod = getPreviousPeriod(period);
  return previousPeriod ? getScopeSnapshot(company, previousPeriod) : null;
}

export function getMarketSalaryPercentile(value: number | null, period: string) {
  if (value === null) return null;
  const salaryValues = getPeriodSnapshots(period)
    .filter((row) => row.salaryDaily.entry !== null)
    .map((row) => row.salaryDaily.entry as number)
    .sort((a, b) => a - b);
  if (!salaryValues.length) return null;
  const belowOrEqual = salaryValues.filter((salary) => salary <= value).length;
  return Math.round((belowOrEqual / salaryValues.length) * 100);
}

export function getMarketExtendedStats(period: string) {
  const rows = getPeriodSnapshots(period);
  const market = getMarketSnapshot(period);
  const unionized = rows.filter((row) => row.laborRelations.unionized === true).length;
  const relationshipCounts = rows.reduce<Record<string, number>>((acc, row) => {
    const value = row.laborRelations.relationship;
    if (!value) return acc;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  const availability = (selector: (row: CompanySnapshot) => boolean | null) => {
    const valid = rows.map(selector).filter((value): value is boolean => value !== null);
    const yes = valid.filter(Boolean).length;
    return { yes, valid: valid.length, pct: valid.length ? (yes / valid.length) * 100 : null };
  };

  return {
    attendance: {
      absenceEventsPer100: deriveScopeMetrics(market).absenceEventsPer100,
      incapacityCasesPer100: deriveScopeMetrics(market).incapacityCasesPer100,
    },
    laborRelations: {
      unionizedCompanies: unionized,
      unionizationPct: rows.length ? (unionized / rows.length) * 100 : null,
      relationshipCounts,
    },
    benefits: {
      lifeInsurance: availability((row) => row.benefits.lifeInsurance),
      transport: availability((row) => row.benefits.transport),
      cafeteria: availability((row) => row.benefits.cafeteria),
    },
  };
}

export function completeHeadcount(row: CompanySnapshot): number | null {
  const parts = [row.headcount.operational, row.headcount.administrative, row.headcount.other];
  return parts.every(v => v !== null && v >= 0) ? row.headcount.total : null;
}

export function deriveScopeMetrics(snapshot: CompanySnapshot | null) {
  const rows = !snapshot ? [] : snapshot.company === "Mercado" ? getPeriodSnapshots(snapshot.period) : [snapshot];
  const pairedRate = (numerator: (r: CompanySnapshot) => number | null, denominator: (r: CompanySnapshot) => number | null = completeHeadcount, scale = 100) => {
    const paired = rows.filter(r => numerator(r) !== null && denominator(r) !== null && denominator(r)! > 0);
    return { n: paired.length, value: paired.length ? paired.reduce((s,r) => s + numerator(r)!, 0) / paired.reduce((s,r) => s + denominator(r)!, 0) * scale : null };
  };
  const both = rows.filter(r => r.hires !== null && r.exits !== null);
  const exits = pairedRate(r => r.exits);
  const absence = pairedRate(r => r.attendance.absences);
  const incapacity = pairedRate(r => r.attendance.incapacityCases);
  const training = pairedRate(r => r.training.operationalHours !== null && r.training.administrativeHours !== null ? r.training.totalHours : null, r => r.headcount.operational !== null && r.headcount.administrative !== null ? r.headcount.operational + r.headcount.administrative : null, 1);
  return {
    netMovement: both.length ? both.reduce((s,r) => s + r.hires! - r.exits!, 0) : null,
    movementLoadPct: pairedRate(r => r.hires !== null && r.exits !== null ? r.hires + r.exits : null).value,
    turnoverPct: exits.value,
    hiringPressurePct: pairedRate(r => r.vacancies.operational !== null && r.vacancies.administrative !== null ? r.vacancies.total : null).value,
    absenceEventsPer100: absence.value,
    incapacityCasesPer100: incapacity.value,
    trainingHoursPerHead: training.value,
    coverage: { exits: exits.n, net: both.length, absence: absence.n, incapacity: incapacity.n, training: training.n },
  };
}
