export type PeriodKey =
  | "2024-07_08"
  | "2024-09_10"
  | "2024-11_12"
  | "2025-01_02"
  | "2025-03_04"
  | "2025-05_06"
  | "2025-07_08";

export type CompanyPeriod = {
  organizationId: string;
  companyId: string;
  period: PeriodKey;
};

export type WorkforceMetric = CompanyPeriod & {
  openingHeadcount?: number | null;
  closingHeadcount: number;
  operationalHeadcount?: number | null;
  administrativeHeadcount?: number | null;
  womenPct?: number | null;
  menPct?: number | null;
};

export type TalentMetric = CompanyPeriod & {
  hires?: number | null;
  separations?: number | null;
  earlySeparations90d?: number | null;
  futureVacancies?: number | null;
  timeToFillOperational?: number | null;
  timeToFillTechnical?: number | null;
  timeToFillAdministrative?: number | null;
  timeToFillManagerial?: number | null;
};

export type CompensationMetric = CompanyPeriod & {
  entrySalaryDaily?: number | null;
  midLowSalaryDaily?: number | null;
  midHighSalaryDaily?: number | null;
  maxSalaryDaily?: number | null;
  benchmarkEntrySalaryDaily?: number | null;
};

export type DataQualityEvent = CompanyPeriod & {
  ruleId: string;
  severity: "info" | "warning" | "critical";
  field?: string;
  observedValue?: number | string | null;
  message: string;
};
