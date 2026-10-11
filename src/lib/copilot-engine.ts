import benchmark from "../../data/processed/benchmark.json";
import peopleIntelligence from "../../data/processed/people-intelligence.json";
import workforceRewards from "../../data/processed/workforce-rewards.json";

export type EvidenceItem = {
  label: string;
  value: string;
  href: string;
  source: string;
};

export type CopilotAnswer = {
  intent: string;
  title: string;
  answer: string;
  evidence: EvidenceItem[];
  action: string;
  actionHref: string;
  caveat?: string;
};

const current = benchmark.periods.at(-1)!;
const previous = benchmark.periods.at(-2)!;
const retention = peopleIntelligence.retention;
const compensation = peopleIntelligence.compensation;
const rewards = workforceRewards.totalRewards;
const planning = workforceRewards.workforcePlanning;
const salaryEntry = compensation.bands.find((band) => band.band === "Ingreso")!;

const pctChange = (now: number, before: number) => ((now / before) - 1) * 100;
const fmt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function answerRetention(): CopilotAnswer {
  return {
    intent: "retention",
    title: "La señal más fuerte está en la rotación temprana.",
    answer: `La rotación bimestral del mercado está en ${benchmark.latest.turnoverBimonthlyPct.toFixed(1)}%. En el subconjunto con desglose de antigüedad consistente, ${retention.earlyAttritionUnder3MonthsPct}% de las bajas ocurre antes de 3 meses y ${retention.firstYearExitSharePct}% antes del año. Eso sugiere priorizar onboarding, calidad de selección y experiencia de primeras semanas antes de asumir que el problema es exclusivamente salarial.`,
    evidence: [
      { label: "Rotación bimestral", value: `${benchmark.latest.turnoverBimonthlyPct.toFixed(1)}%`, href: "/retencion", source: "benchmark.json" },
      { label: "Bajas < 3 meses", value: `${retention.earlyAttritionUnder3MonthsPct}%`, href: "/retencion", source: "people-intelligence.json" },
      { label: "Bajas < 1 año", value: `${retention.firstYearExitSharePct}%`, href: "/retencion", source: "people-intelligence.json" },
    ],
    action: "Abrir Retención y Rotación",
    actionHref: "/retencion",
    caveat: "La distribución de antigüedad usa únicamente empresas cuyos porcentajes concilian aproximadamente a 100%.",
  };
}

function answerCompensation(): CopilotAnswer {
  return {
    intent: "compensation",
    title: "El salario de ingreso está estable, pero la distribución importa más que un promedio.",
    answer: `La mediana de ingreso es ${money(salaryEntry.median)} diarios. El 50% central del mercado está entre ${money(salaryEntry.q1)} y ${money(salaryEntry.q3)}. Un aumento cercano a ${(((salaryEntry.q3 / salaryEntry.median) - 1) * 100).toFixed(1)}% llevaría la mediana actual hasta Q3; eso sirve como referencia de escenario, no como recomendación causal.`,
    evidence: [
      { label: "Q1 ingreso", value: money(salaryEntry.q1), href: "/salarios", source: "people-intelligence.json" },
      { label: "Mediana ingreso", value: money(salaryEntry.median), href: "/salarios", source: "people-intelligence.json" },
      { label: "Q3 ingreso", value: money(salaryEntry.q3), href: "/salarios", source: "people-intelligence.json" },
    ],
    action: "Simular política salarial",
    actionHref: "/what-if",
    caveat: "Subir salario no implica automáticamente menor rotación; el What-If solo calcula exposición presupuestal y posición de mercado.",
  };
}

function answerAcquisition(): CopilotAnswer {
  const hiresChange = pctChange(current.hires, previous.hires);
  return {
    intent: "acquisition",
    title: "El cuello de botella visible es técnico, no solo de volumen.",
    answer: `El time-to-fill técnico subió de ${previous.timeToFill.technical} a ${current.timeToFill.technical} días, mientras las contrataciones agregadas bajaron ${Math.abs(hiresChange).toFixed(1)}% frente al bimestre anterior. La muestra también reporta ${fmt(benchmark.latest.vacancies.total)} vacantes próximas y una mediana de solo ${benchmark.latest.candidateAcceptancePer10Median}/10 candidatos que cumplen requisitos.`,
    evidence: [
      { label: "TTF técnico", value: `${current.timeToFill.technical} días`, href: "/talent-acquisition", source: "benchmark.json" },
      { label: "Vacantes próximas", value: fmt(benchmark.latest.vacancies.total), href: "/workforce-planning", source: "benchmark.json" },
      { label: "Candidatos adecuados", value: `${benchmark.latest.candidateAcceptancePer10Median}/10`, href: "/talent-acquisition", source: "benchmark.json" },
    ],
    action: "Abrir Talent Acquisition",
    actionHref: "/talent-acquisition",
  };
}

function answerPlanning(): CopilotAnswer {
  return {
    intent: "planning",
    title: "La demanda futura sigue alta y está muy concentrada en operación.",
    answer: `Hay ${fmt(planning.latest.total)} vacantes próximas: ${fmt(planning.latest.operational)} operativas y ${fmt(planning.latest.administrative)} administrativas. El detalle estructurado señala a Operador de producción + Secundaria como el hotspot de mayor volumen. La demanda total bajó ${Math.abs(planning.latest.changeVsPreviousPct).toFixed(1)}% frente a May–Jun, pero sigue elevada dentro de la serie histórica.`,
    evidence: [
      { label: "Vacantes totales", value: fmt(planning.latest.total), href: "/workforce-planning", source: "workforce-rewards.json" },
      { label: "Share operativo", value: `${planning.latest.operationalSharePct.toFixed(1)}%`, href: "/workforce-planning", source: "workforce-rewards.json" },
      { label: "Top hotspot", value: "Operador + Secundaria", href: "/workforce-planning", source: "workforce-rewards.json" },
    ],
    action: "Abrir Workforce Planning",
    actionHref: "/workforce-planning",
    caveat: "El detalle puesto × escolaridad no concilia exactamente con el total general, por eso se usa como señal de composición.",
  };
}

function answerRewards(): CopilotAnswer {
  return {
    intent: "rewards",
    title: "Los beneficios básicos ya son comunes; la diferenciación está en generosidad y uso.",
    answer: `La empresa promedio de la muestra ofrece ${rewards.packageBreadth.average.toFixed(2)} de 6 beneficios clave y ${rewards.packageBreadth.allSixPct}% ofrece los seis. Vales (${rewards.benefitPrevalence[0].pct}%) y fondo de ahorro (${rewards.benefitPrevalence[1].pct}%) son casi estándar. En uso efectivo, transporte tiene mediana de ${rewards.usageMedianPct.find((item) => item.benefit === "Transporte")?.median}% y comedor ${rewards.usageMedianPct.find((item) => item.benefit === "Comedor")?.median}%.`,
    evidence: [
      { label: "Amplitud promedio", value: `${rewards.packageBreadth.average.toFixed(2)}/6`, href: "/beneficios", source: "workforce-rewards.json" },
      { label: "Paquete completo", value: `${rewards.packageBreadth.allSixPct}%`, href: "/beneficios", source: "workforce-rewards.json" },
      { label: "Vales", value: `${rewards.benefitPrevalence[0].pct}%`, href: "/beneficios", source: "workforce-rewards.json" },
    ],
    action: "Abrir Total Rewards",
    actionHref: "/beneficios",
  };
}

function answerRisk(): CopilotAnswer {
  const absenceNow = (current.absences / current.qualityAdjustedHeadcount) * 100;
  const absencePrev = (previous.absences / previous.qualityAdjustedHeadcount) * 100;
  const incapacityNow = (current.incapacityCases / current.qualityAdjustedHeadcount) * 100;
  const incapacityPrev = (previous.incapacityCases / previous.qualityAdjustedHeadcount) * 100;
  return {
    intent: "risk",
    title: "Ausentismo mejora, incapacidades permanecen cerca del máximo reciente.",
    answer: `Las ausencias normalizadas bajaron ${Math.abs(pctChange(absenceNow, absencePrev)).toFixed(1)}% frente al bimestre previo y quedaron en ${absenceNow.toFixed(1)} eventos por cada 100 de headcount. Las incapacidades están en ${incapacityNow.toFixed(1)} casos por 100 HC, apenas ${Math.abs(pctChange(incapacityNow, incapacityPrev)).toFixed(1)}% debajo del corte anterior.`,
    evidence: [
      { label: "Ausencias / 100 HC", value: absenceNow.toFixed(1), href: "/labor-risk", source: "benchmark.json" },
      { label: "Incapacidades / 100 HC", value: incapacityNow.toFixed(1), href: "/labor-risk", source: "benchmark.json" },
      { label: "Casos incapacidad", value: fmt(current.incapacityCases), href: "/labor-risk", source: "benchmark.json" },
    ],
    action: "Abrir Labor Risk",
    actionHref: "/labor-risk",
    caveat: "Son eventos/casos normalizados, no porcentaje de personas únicas afectadas.",
  };
}

function answerQuality(): CopilotAnswer {
  return {
    intent: "quality",
    title: "La calidad es suficientemente buena para análisis, pero no para ignorar excepciones.",
    answer: `El corte tiene un Data Quality Score de ${benchmark.quality.score}/100: ${benchmark.quality.rulesPassed} de ${benchmark.quality.rulesEvaluated} reglas pasaron. Existe ${benchmark.quality.criticalAnomalies} anomalía longitudinal crítica y el histórico conserva separado el valor reportado del ajustado analítico.`,
    evidence: [
      { label: "Quality Score", value: `${benchmark.quality.score}/100`, href: "/data-quality", source: "benchmark.json" },
      { label: "Reglas aprobadas", value: `${benchmark.quality.rulesPassed}/${benchmark.quality.rulesEvaluated}`, href: "/data-quality", source: "benchmark.json" },
      { label: "Anomalías críticas", value: String(benchmark.quality.criticalAnomalies), href: "/data-quality", source: "benchmark.json" },
    ],
    action: "Abrir Data Quality Center",
    actionHref: "/data-quality",
  };
}

function answerSummary(): CopilotAnswer {
  const hiresChange = pctChange(current.hires, previous.hires);
  return {
    intent: "summary",
    title: "Tres cambios merecen atención en el último bimestre.",
    answer: `1) El headcount agregado se mantiene prácticamente estable (${benchmark.latest.headcountChangePct.toFixed(2)}%). 2) Las contrataciones bajaron ${Math.abs(hiresChange).toFixed(1)}%, mientras el time-to-fill técnico subió a ${current.timeToFill.technical} días. 3) La rotación se mantiene alrededor de ${benchmark.latest.turnoverBimonthlyPct.toFixed(1)}% y la mayor oportunidad estructural está en early attrition: ${retention.earlyAttritionUnder3MonthsPct}% de bajas antes de 3 meses en el subconjunto válido.`,
    evidence: [
      { label: "Headcount", value: fmt(benchmark.latest.headcount), href: "/", source: "benchmark.json" },
      { label: "Contrataciones", value: fmt(current.hires), href: "/talent-acquisition", source: "benchmark.json" },
      { label: "Early attrition", value: `${retention.earlyAttritionUnder3MonthsPct}%`, href: "/retencion", source: "people-intelligence.json" },
    ],
    action: "Abrir Executive Pulse",
    actionHref: "/",
  };
}

export function answerCopilot(question: string): CopilotAnswer {
  const q = normalize(question.trim());
  if (containsAny(q, ["rotacion", "retencion", "bajas", "abandono", "renuncia", "permanencia"])) return answerRetention();
  if (containsAny(q, ["salario", "sueldo", "compensacion", "pago", "q1", "q3"])) return answerCompensation();
  if (containsAny(q, ["contrat", "reclut", "candidato", "time to fill", "time-to-fill", "fuente"])) return answerAcquisition();
  if (containsAny(q, ["vacante", "demanda", "workforce", "planeacion", "puesto", "escolaridad"])) return answerPlanning();
  if (containsAny(q, ["beneficio", "prestacion", "rewards", "vales", "seguro", "comedor", "transporte"])) return answerRewards();
  if (containsAny(q, ["ausent", "incapacidad", "riesgo", "falta", "labor risk"])) return answerRisk();
  if (containsAny(q, ["calidad", "anomalia", "error", "dato", "quality"])) return answerQuality();
  return answerSummary();
}

export const copilotPrompts = [
  "¿Qué cambió este bimestre?",
  "¿Dónde está el principal riesgo de contratación?",
  "¿Qué está pasando con la rotación?",
  "¿Cómo está el salario de ingreso contra mercado?",
  "¿Qué beneficios ya son estándar?",
  "¿Hay problemas de calidad de datos?",
];
