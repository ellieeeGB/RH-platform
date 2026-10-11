import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";

const PERIOD_LABELS: Record<string, string> = {
  "JUL-AGO_2024": "Jul-Ago 24",
  "SEP-OCT_2024": "Sep-Oct 24",
  "NOV-DIC_2024": "Nov-Dic 24",
  "ENE-FEB_2025": "Ene-Feb 25",
  "MAR-ABR_2025": "Mar-Abr 25",
  "MAY-JUN_2025": "May-Jun 25",
  "JUL-AGO_2025": "Jul-Ago 25",
};

const COLUMNS = [
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

type OutputValue = string | number | boolean | null;

type ColumnSpec = {
  address: string;
  key: typeof COLUMNS[number];
  transform: "text" | "number" | "percent" | "yesno";
};

const COLUMN_SPECS: ColumnSpec[] = [
  { address: "F", key: "company", transform: "text" },
  { address: "GL", key: "hcOperational", transform: "number" },
  { address: "GM", key: "hcAdministrative", transform: "number" },
  { address: "GN", key: "hcOther", transform: "number" },
  { address: "GW", key: "salaryEntry", transform: "number" },
  { address: "GX", key: "salaryLow", transform: "number" },
  { address: "GY", key: "salaryHigh", transform: "number" },
  { address: "GZ", key: "salaryMax", transform: "number" },
  { address: "KE", key: "hires", transform: "number" },
  { address: "LB", key: "exits", transform: "number" },
  { address: "KN", key: "ttfOperational", transform: "number" },
  { address: "KO", key: "ttfTechnical", transform: "number" },
  { address: "KP", key: "ttfAdministrative", transform: "number" },
  { address: "KQ", key: "ttfManagerial", transform: "number" },
  { address: "KR", key: "acceptedPer10", transform: "number" },
  { address: "KS", key: "rejectionAntidoping", transform: "percent" },
  { address: "KT", key: "rejectionSchooling", transform: "percent" },
  { address: "KU", key: "rejectionVision", transform: "percent" },
  { address: "KV", key: "rejectionLumbar", transform: "percent" },
  { address: "KW", key: "rejectionAudiometry", transform: "percent" },
  { address: "KX", key: "rejectionExperience", transform: "percent" },
  { address: "KY", key: "rejectionResidence", transform: "percent" },
  { address: "KZ", key: "rejectionNumerical", transform: "percent" },
  { address: "LA", key: "rejectionPsychometric", transform: "percent" },
  { address: "RB", key: "vacanciesOperational", transform: "number" },
  { address: "RC", key: "vacanciesAdministrative", transform: "number" },
  { address: "MC", key: "absencesTotal", transform: "number" },
  { address: "ML", key: "incapacityCases", transform: "number" },
  { address: "MM", key: "incapacityWorkRisk", transform: "number" },
  { address: "MN", key: "incapacityGeneralIllness", transform: "number" },
  { address: "MO", key: "incapacityMaternity", transform: "number" },
  { address: "MT", key: "trainingOperational", transform: "number" },
  { address: "MU", key: "trainingAdministrative", transform: "number" },
  { address: "DX", key: "unionized", transform: "yesno" },
  { address: "GK", key: "unionRelationship", transform: "text" },
  { address: "ND", key: "negotiationStatus", transform: "text" },
  { address: "NF", key: "grantedSalaryOperationalPct", transform: "percent" },
  { address: "NG", key: "grantedSalaryAdministrativePct", transform: "percent" },
  { address: "NH", key: "grantedBenefitsOperationalPct", transform: "percent" },
  { address: "NI", key: "grantedBenefitsAdministrativePct", transform: "percent" },
  { address: "XD", key: "voucherOperationalPct", transform: "percent" },
  { address: "XE", key: "voucherAdministrativePct", transform: "percent" },
  { address: "XF", key: "voucherManagerialPct", transform: "percent" },
  { address: "XG", key: "savingsOperationalPct", transform: "percent" },
  { address: "XH", key: "savingsAdministrativePct", transform: "percent" },
  { address: "XI", key: "savingsManagerialPct", transform: "percent" },
  { address: "XT", key: "vacationOperationalYear1", transform: "number" },
  { address: "YB", key: "vacationAdministrativeYear1", transform: "number" },
  { address: "ABU", key: "lifeInsurance", transform: "yesno" },
  { address: "AET", key: "transportBenefit", transform: "yesno" },
  { address: "AFQ", key: "cafeteriaBenefit", transform: "yesno" },
];

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.result !== undefined) return text(record.result);
    if (record.text !== undefined) return text(record.text);
  }
  const result = String(value).trim();
  return !result || result === "-" || ["N/A", "NA"].includes(result.toUpperCase()) ? null : result;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = text(value)?.replace(/[$,%]/g, "").replace(/,/g, "");
  if (!raw || !/^-?\d+(\.\d+)?$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function percentValue(value: unknown): number | null {
  const numeric = numberValue(value);
  if (numeric === null || numeric < 0) return null;
  return Math.round((numeric <= 1.01 ? numeric * 100 : numeric) * 10000) / 10000;
}

function yesNo(value: unknown): boolean | null {
  const raw = text(value)?.toLowerCase();
  if (!raw) return null;
  if (raw === "sí" || raw === "si" || raw.startsWith("sí ") || raw.startsWith("si ")) return true;
  if (raw === "no" || raw.startsWith("no ")) return false;
  return null;
}

function transform(value: unknown, kind: ColumnSpec["transform"]): OutputValue {
  if (kind === "number") return numberValue(value);
  if (kind === "percent") return percentValue(value);
  if (kind === "yesno") return yesNo(value);
  return text(value);
}

function assertSchema(worksheet: ExcelJS.Worksheet) {
  const checks = [
    ["F1", "Compañía"],
    ["KR2", "Candidatos Aceptados"],
    ["MC1", "TOTAL de FALTAS"],
    ["ML1", "TOTAL DE CASOS DE INCAPACIDAD"],
    ["DX1", "Confederación Sindical"],
    ["XD2", "Vales de Despensa"],
    ["ABU1", "Seguro de Vida"],
    ["AET1", "Servicio de Transporte"],
    ["AFQ1", "servicio de comedor"],
  ] as const;

  for (const [address, needle] of checks) {
    const value = text(worksheet.getCell(address).value) ?? "";
    if (!value.toLowerCase().includes(needle.toLowerCase())) {
      throw new Error(`${worksheet.name}: schema anchor ${address} no longer matches '${needle}'.`);
    }
  }
}

function slug(period: string) {
  return period.toLowerCase().replace(/\s+/g, "-");
}

async function main() {
  const source = process.argv[2] ?? "data/raw/BASE HISTORICA(1).xlsx";
  const outputDir = path.resolve("data/processed/company-periods");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(source);
  await fs.mkdir(outputDir, { recursive: true });

  for (const worksheet of workbook.worksheets.filter((item) => PERIOD_LABELS[item.name])) {
    assertSchema(worksheet);
    const period = PERIOD_LABELS[worksheet.name];
    const rows: OutputValue[][] = [];

    for (let row = 3; row <= worksheet.rowCount; row += 1) {
      const company = text(worksheet.getCell(`F${row}`).value);
      if (!company || !/^COMPAÑIA\s+\d+$/i.test(company)) continue;
      const record = new Map<string, OutputValue>();
      for (const spec of COLUMN_SPECS) {
        record.set(spec.key, transform(worksheet.getCell(`${spec.address}${row}`).value, spec.transform));
      }
      rows.push(COLUMNS.map((column) => record.get(column) ?? null));
    }

    if (rows.length !== 40) throw new Error(`${worksheet.name}: expected 40 companies, found ${rows.length}.`);
    const payload = { period, columns: COLUMNS, rows };
    await fs.writeFile(path.join(outputDir, `${slug(period)}.json`), JSON.stringify(payload));
    console.log(`Company-period extract written: ${period} (${rows.length} companies).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
