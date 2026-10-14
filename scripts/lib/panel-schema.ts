export const PANEL_COLUMNS = [
  "company",
  "hcOperational", "hcAdministrative", "hcOther",
  "salaryEntry", "salaryLow", "salaryHigh", "salaryMax",
  "hires", "exits",
  "ttfOperational", "ttfTechnical", "ttfAdministrative", "ttfManagerial", "acceptedPer10",
  "rejectionAntidoping", "rejectionSchooling", "rejectionVision", "rejectionLumbar", "rejectionAudiometry",
  "rejectionExperience", "rejectionResidence", "rejectionNumerical", "rejectionPsychometric",
  "vacanciesOperational", "vacanciesAdministrative",
  "absencesTotal", "incapacityCases", "incapacityWorkRisk", "incapacityGeneralIllness", "incapacityMaternity",
  "trainingOperational", "trainingAdministrative",
  "unionized", "unionRelationship", "negotiationStatus",
  "grantedSalaryOperationalPct", "grantedSalaryAdministrativePct", "grantedBenefitsOperationalPct", "grantedBenefitsAdministrativePct",
  "voucherOperationalPct", "voucherAdministrativePct", "voucherManagerialPct",
  "savingsOperationalPct", "savingsAdministrativePct", "savingsManagerialPct",
  "vacationOperationalYear1", "vacationAdministrativeYear1",
  "lifeInsurance", "transportBenefit", "cafeteriaBenefit",
] as const;

const booleanFields = new Set(["unionized", "lifeInsurance", "transportBenefit", "cafeteriaBenefit"]);
const textFields = new Set(["company", "unionRelationship", "negotiationStatus"]);
const countFields = new Set(["hcOperational", "hcAdministrative", "hcOther", "hires", "exits", "vacanciesOperational", "vacanciesAdministrative", "absencesTotal", "incapacityCases", "incapacityWorkRisk", "incapacityGeneralIllness", "incapacityMaternity"]);

export function assertPanelSchema(panel: { period: string; columns: string[]; rows: unknown[][]; issues?: Array<{company: string; field: string; cell: string; value: number; reason: string}> }) {
  if (!Array.isArray(panel.columns) || panel.columns.join("|") !== PANEL_COLUMNS.join("|")) throw new Error("Panel columns do not match the extraction schema");
  if (!Array.isArray(panel.rows)) throw new Error("Panel rows must be an array");
  for (const row of panel.rows) {
    if (!Array.isArray(row) || row.length !== PANEL_COLUMNS.length) throw new Error("Ragged panel row");
    for (const [i, key] of PANEL_COLUMNS.entries()) {
      const value = row[i];
      if (value === null && key !== "company") continue;
      const typeValid = booleanFields.has(key) ? typeof value === "boolean" : textFields.has(key) ? typeof value === "string" && value.trim().length > 0 : typeof value === "number" && Number.isFinite(value) && value >= 0;
      const rangeValid = typeof value !== "number" || ((!countFields.has(key) || Number.isInteger(value)) && (key !== "acceptedPer10" || value <= 10) && (!(key.endsWith("Pct") || key.startsWith("rejection")) || value <= 100));
      if (!typeValid || !rangeValid) throw new Error(`Invalid panel value: ${panel.period}/${row[0]}/${key}`);
    }
  }
  for (const issue of panel.issues ?? []) {
    const index = panel.columns.indexOf(issue.field);
    const row = panel.rows.find(r => r[0] === issue.company);
    if (!row || index < 0 || !issue.field.startsWith("rejection") || row[index] !== null || !/^[A-Z]+\d+$/.test(issue.cell) || !Number.isFinite(issue.value) || (issue.value >= 0 && issue.value <= 100) || typeof issue.reason !== "string" || !issue.reason.trim()) throw new Error("Invalid quarantine evidence");
  }
}
