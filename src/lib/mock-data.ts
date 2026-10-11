export const workforceTrend = [
  { period: "Jul-Ago 24", headcount: 33720, benchmark: 32900 },
  { period: "Sep-Oct 24", headcount: 34280, benchmark: 33480 },
  { period: "Nov-Dic 24", headcount: 34810, benchmark: 33840 },
  { period: "Ene-Feb 25", headcount: 35240, benchmark: 34310 },
  { period: "Mar-Abr 25", headcount: 35610, benchmark: 34820 },
  { period: "May-Jun 25", headcount: 36150, benchmark: 35290 },
  { period: "Jul-Ago 25", headcount: 36780, benchmark: 35740 },
];

export const hiringPressure = [
  { role: "Operativo", vacancies: 1853, timeToFill: 15 },
  { role: "Técnico", vacancies: 684, timeToFill: 20 },
  { role: "Administrativo", vacancies: 471, timeToFill: 30 },
  { role: "Gerencial", vacancies: 92, timeToFill: 45 },
];

export const benchmarkRows = [
  { metric: "Salario de ingreso", company: 94, cohort: 100, position: "P42" },
  { metric: "Retención 90 días", company: 108, cohort: 100, position: "P71" },
  { metric: "Time-to-fill técnico", company: 118, cohort: 100, position: "P78" },
  { metric: "Beneficios", company: 103, cohort: 100, position: "P61" },
];

export const alerts = [
  {
    level: "high",
    title: "Presión de talento técnico",
    body: "El tiempo de contratación técnica creció y coincide con una mayor demanda futura.",
  },
  {
    level: "medium",
    title: "Competitividad salarial",
    body: "El salario de ingreso está por debajo de la mediana del cohort seleccionado.",
  },
  {
    level: "good",
    title: "Retención temprana mejora",
    body: "Las bajas durante los primeros 90 días muestran una mejora frente al bimestre anterior.",
  },
];
