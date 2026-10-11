export const timeToFillByRole = [
  { role: "Operativo", company: 15, benchmark: 18 },
  { role: "Técnico", company: 20, benchmark: 26 },
  { role: "Administrativo", company: 30, benchmark: 38 },
  { role: "Gerencial", company: 45, benchmark: 40 },
];

export const recruitmentSources = [
  { source: "Facebook", value: 16 },
  { source: "Referencias", value: 15 },
  { source: "Promociones", value: 12 },
  { source: "Reclutamiento", value: 11 },
  { source: "Anuncios", value: 11 },
  { source: "Bolsas empleo", value: 10 },
  { source: "Portal", value: 10 },
  { source: "LinkedIn", value: 5 },
];

export const rejectionReasons = [
  { cause: "Antidoping", sample: 0, benchmark: 19.4 },
  { cause: "Escolaridad", sample: 0, benchmark: 5.7 },
  { cause: "Examen visual", sample: 0, benchmark: 2.5 },
  { cause: "Examen lumbar", sample: 0, benchmark: 30.8 },
  { cause: "Audiometría", sample: 0, benchmark: 7.5 },
  { cause: "Experiencia industria", sample: 0, benchmark: 14.2 },
  { cause: "Lugar de residencia", sample: 0, benchmark: 16.4 },
  { cause: "Habilidad numérica", sample: 0, benchmark: 18.8 },
];

export const salaryBands = [
  { band: "Ingreso", company: 345.16, benchmark: 478, marketMin: 325, marketMax: 700 },
  { band: "Medio bajo", company: 402, benchmark: 510, marketMin: 350, marketMax: 735 },
  { band: "Medio alto", company: 475, benchmark: 545, marketMin: 390, marketMax: 790 },
  { band: "Máximo", company: 560.64, benchmark: 610, marketMin: 430, marketMax: 860 },
];

export const salaryTrend = [
  { period: "Jul-Ago 24", company: 318, benchmark: 420 },
  { period: "Sep-Oct 24", company: 322, benchmark: 431 },
  { period: "Nov-Dic 24", company: 329, benchmark: 445 },
  { period: "Ene-Feb 25", company: 334, benchmark: 455 },
  { period: "Mar-Abr 25", company: 338, benchmark: 463 },
  { period: "May-Jun 25", company: 341, benchmark: 470 },
  { period: "Jul-Ago 25", company: 345.16, benchmark: 478 },
];

export const companyTenure = [
  { range: "> 40 años", value: 21 },
  { range: "11–15 años", value: 20 },
  { range: "20–30 años", value: 19 },
  { range: "7–10 años", value: 11 },
  { range: "16–20 años", value: 11 },
  { range: "30–40 años", value: 10 },
  { range: "1–3 años", value: 3 },
];

export const benefitAdoption = [
  { benefit: "Vales de despensa", availability: 94, usage: 88, benchmark: 91 },
  { benefit: "Fondo de ahorro", availability: 82, usage: 76, benchmark: 79 },
  { benefit: "Comedor", availability: 72, usage: 64, benchmark: 70 },
  { benefit: "Transporte", availability: 67, usage: 59, benchmark: 62 },
  { benefit: "Seguro de vida", availability: 91, usage: 91, benchmark: 86 },
  { benefit: "SGMM", availability: 48, usage: 44, benchmark: 51 },
];

export const tabulatorRows = [
  { code: "ADM01", role: "Director de Administración y Finanzas Sr", minimum: 215700, q1: 230130, median: 249960, market: 268300, q3: 308850, maximum: 383580, company: null },
  { code: "ADM04", role: "Contralor", minimum: 79510, q1: 96260, median: 108370, market: 118010, q3: 121800, maximum: 137310, company: 80000 },
  { code: "ADM06", role: "Gerente de Finanzas", minimum: 63660, q1: 73440, median: 80370, market: 88690, q3: 101290, maximum: 116260, company: 72230 },
  { code: "ADM09", role: "Analista Financiero Sr", minimum: 29590, q1: 36820, median: 45510, market: 46990, q3: 48650, maximum: 53760, company: null },
  { code: "ADM10", role: "Analista Financiero", minimum: 22880, q1: 24300, median: 26830, market: 28850, q3: 33310, maximum: 37660, company: 28907 },
];
