import { COMPANIES, MARKET_SCOPE, PERIODS, getScopeSnapshot, getPeriodSnapshots, deriveScopeMetrics } from "./company-panel";
import { comparisonPeers, distribution, validSalaryBands } from "./benchmark-comparison";
import { analyzeSignal, signalMetrics, type SignalMetric } from "./signal-analysis";
import { qualityReport } from "./data-quality";
import people from "../../data/processed/people-intelligence.json";

export type CopilotScope = { company: string; period: string };
export type EvidenceItem = { label: string; value: string; href: string; source: string };
export type CopilotAnswer = {
  intent: string; title: string; answer: string; evidence: EvidenceItem[];
  action: string; actionHref: string; caveat?: string; scope: CopilotScope;
};
const fmt = (n: number | null | undefined, unit = "") => n == null || !Number.isFinite(n) ? "Sin dato" : `${new Intl.NumberFormat("es-MX", {maximumFractionDigits: 1}).format(n)}${unit}`;
const money = (n: number | null) => n === null ? "Sin dato" : new Intl.NumberFormat("es-MX", {style:"currency",currency:"MXN",maximumFractionDigits:2}).format(n);
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const has = (text: string, words: string[]) => words.some(w => text.includes(w));

export function answerCopilot(question: string, selection: Partial<CopilotScope> = {}): CopilotAnswer {
  const scope = {company: selection.company ?? MARKET_SCOPE, period: selection.period ?? PERIODS.at(-1)!};
  const isMarket = scope.company === MARKET_SCOPE;
  const label = isMarket ? "Mercado completo" : scope.company;
  const reply = (intent:string,title:string,answer:string,evidence:EvidenceItem[],actionHref:string,caveat?:string):CopilotAnswer => ({intent,title,answer,evidence,action:"Abrir evidencia",actionHref,caveat,scope});
  const unavailable = (answer:string):CopilotAnswer => ({...reply("unsupported","Necesitamos precisar la consulta",answer,[],"/data-atlas"), action:"Ver temas disponibles"});
  if (!PERIODS.includes(scope.period) || (!isMarket && !COMPANIES.includes(scope.company))) return unavailable("La selección no corresponde a una empresa o bimestre disponible. Elige una opción de los filtros.");
  const q = normalize(question.trim());
  const mentionedYear = q.match(/\b(20\d{2})\b/)?.[1];
  const mentionedPeriod = PERIODS.find(p => q.replace(/[–—]/g,"-").includes(normalize(p)));
  if ((mentionedYear && !scope.period.endsWith(mentionedYear.slice(2))) || (mentionedPeriod && mentionedPeriod !== scope.period)) return unavailable(`La selección activa es ${label} · ${scope.period}. Cambia el periodo del filtro para consultar ese otro corte.`);
  if (/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/.test(q)) return unavailable("El asistente trabaja con bimestres. Para bajas de un mes, abre Retención y utiliza el selector mensual cuando la fuente tenga el desglose confirmado.");
  const mentionedCompany = q.match(/(?:compania|empresa)\s+(\d+)/)?.[1];
  if (mentionedCompany && `COMPAÑIA ${Number(mentionedCompany)}` !== scope.company) return unavailable(`La consulta sigue en ${label} · ${scope.period}. Selecciona COMPAÑIA ${Number(mentionedCompany)} en el filtro para consultar sus datos.`);
  if (has(q,["proximo ano","predice","pronostica","prediccion","causa exacta"])) return unavailable("Estos datos no permiten pronosticar ni determinar una causa exacta. Podemos comparar cortes, comprobar cobertura y revisar qué empresas explican un cambio.");
  const snapshot = getScopeSnapshot(scope.company,scope.period)!;
  const rows = getPeriodSnapshots(scope.period).filter(r => isMarket || r.company === scope.company);
  const metrics = deriveScopeMetrics(snapshot);
  const item = (label:string,value:string,href:string,source:string):EvidenceItem => ({label,value,href,source:`${scope.period} · ${source}`});
  const scopeNote = `${label} · ${scope.period}.`;

  if(has(q,["calidad","anomalia","error","datos falt","falta de datos","dato falt","cobertura","sin dato"])) {
    const quality = qualityReport(scope.period,scope.company);
    return reply("quality","Qué podemos comprobar en esta selección",`${scopeNote} Hay ${quality.pass} comprobaciones consistentes, ${quality.review} por confirmar y ${quality.missing} sin datos para evaluar. Se detectan ${quality.anomalies.length} saltos de plantilla respecto a otros cortes completos.`,[
      item("Consistentes",fmt(quality.pass),"/data-quality","8 reglas por empresa"),item("Por confirmar",fmt(quality.review),"/data-quality","Conciliación y rangos"),item("Sin evaluar",fmt(quality.missing),"/data-quality","Componentes ausentes")
    ],"/data-quality","Consistencia no equivale a confianza estadística. Un dato ausente no se sustituye por cero.");
  }
  if(has(q,["cambio","cambiaron","sensibilidad","sostiene","explica el","misma","depende de"])) {
    const metric:SignalMetric = has(q,["baja","rotacion"])?"exits":has(q,["contrat","alta"])?"hires":has(q,["vacante"])?"vacancies":has(q,["capacit"])?"training":"headcount";
    const r=analyzeSignal(metric,scope.period,scope.company), spec=signalMetrics[metric];
    if(!r.previous || r.n < (isMarket?5:1)) return reply("signals","Todavía no hay una comparación suficiente",`${scopeNote} ${r.previous ? `Solo ${r.n} empresas tienen ${spec.label.toLowerCase()} en ambos cortes.` : "Es el primer corte disponible; no existe un bimestre anterior en la fuente."}`,[],"/signals");
    const direction=r.matchedDelta!>0?"aumentó":r.matchedDelta!<0?"disminuyó":"no cambió";
    const leading=r.contributors[0];
    const contribution=leading?` La mayor aportación absoluta corresponde a ${leading.company}: ${fmt(leading.delta)} ${spec.unit}.`:"";
    const sensitivity=r.sensitivity?` Al retirar una empresa a la vez, el cambio va de ${fmt(r.sensitivity.min,"%") } a ${fmt(r.sensitivity.max,"%")}; ${r.sensitivity.directionStable?"mantiene":"puede cambiar"} su dirección.`:" No hay base suficiente para la prueba de sensibilidad al retirar una empresa.";
    return reply("signals",`${spec.label}: separa cambio de cobertura`,`${scopeNote} Entre ${r.previous} y ${r.period}, ${spec.label.toLowerCase()} ${direction}: ${fmt(r.matchedBefore)} → ${fmt(r.matchedAfter)} ${spec.unit}, con ${r.n} empresas presentes en ambos cortes. La aportación de respuestas que aparecen o faltan es ${fmt(r.compositionDelta)} ${spec.unit}.${contribution}${sensitivity}`,[
      item("Mismas empresas",fmt(r.matchedDelta),"/signals",spec.source),item("Empresas comparables",fmt(r.n),"/signals","Datos en ambos cortes"),item("Respuestas que cambian",fmt(r.compositionDelta),"/signals","Diferencia de cobertura")
    ],"/signals","La descomposición describe los datos; no identifica causas. El laboratorio permite elegir el indicador y explorar cada aportación.");
  }
  if(has(q,["rotacion","retencion","bajas","abandono","renuncia","permanencia"])) {
    const latestMarket=isMarket&&scope.period===PERIODS.at(-1);
    const detail=latestMarket?` Solo ${people.retention.tenureValidCompanies} empresas tienen antigüedad completa: ${people.retention.earlyAttritionUnder3MonthsPct}% de sus bajas ocurre antes de tres meses.`:" No hay un desglose validado de antigüedad para esta selección; no se atribuye a esta empresa o periodo el patrón del último mercado.";
    return reply("retention","Bajas con una base explícita",`${scopeNote} Bajas reportadas: ${fmt(snapshot.exits)}. La tasa de bajas por plantilla completa al cierre es ${fmt(metrics.turnoverPct,"%")}, calculada con ${metrics.coverage.exits} empresas con ambos datos.${detail}`,[
      item("Bajas reportadas",fmt(snapshot.exits),"/retencion","LB"),item("Bajas / plantilla al cierre",fmt(metrics.turnoverPct,"%"),"/retencion","LB / (GL + GM + GN)"),item("Empresas con ambos datos",fmt(metrics.coverage.exits),"/retencion","Cohorte de la tasa")
    ],"/retencion","Las bajas reportadas pueden incluir más empresas que la tasa. La tasa no usa plantilla promedio; el desglose de antigüedad del último mercado no representa a las 40 empresas.");
  }
  if(has(q,["salario","sueldo","compensacion","pago","q1","q3"])) {
    const peers=comparisonPeers(scope.period,"all","all",isMarket?undefined:scope.company).filter(validSalaryBands);
    const d=distribution(peers.map(r=>r.salaryDaily.entry));
    const own=!isMarket&&validSalaryBands(snapshot)?snapshot.salaryDaily.entry:null;
    return reply("compensation","Salario diario frente a un grupo comparable",`${scopeNote} ${isMarket?"La mediana de ingreso del grupo válido": "El salario de ingreso de la empresa"} es ${money(isMarket?d.median:own)}. El grupo de referencia tiene ${d.n} empresas con bandas completas y ordenadas${isMarket?"":" y excluye a la empresa seleccionada"}. Su 50% central se encuentra entre ${money(d.q1)} y ${money(d.q3)}.`,[
      item(isMarket?"Mediana ingreso":"Ingreso de la empresa",money(isMarket?d.median:own),"/salarios","GW · bandas válidas"),item("Mediana de referencia",money(d.median),"/benchmark",`${d.n} respuestas válidas`),item("Q3 de referencia",money(d.q3),"/benchmark","Percentil 75")
    ],"/benchmark","Sin cinco respuestas válidas no se publica una distribución. El salario por sí solo no demuestra una causa de bajas o contratación.");
  }
  if(has(q,["fuente de reclut","fuentes de reclut","canal de reclut"])) return unavailable("No hay un desglose de canales conectado a esta selección en el asistente. Puedes revisar contratación y cobertura; no se infiere qué canal funciona mejor a partir del total de altas.");
  if(has(q,["contrat","reclut","candidato","time to fill","time-to-fill","fuente"])) {
    return reply("acquisition","Contratación y cobertura de posiciones",`${scopeNote} Se reportan ${fmt(snapshot.hires)} altas y un plazo técnico ${isMarket?"mediano ":""}de ${fmt(snapshot.timeToFill.technical," días")}. Candidatos adecuados: ${fmt(snapshot.acceptedPer10," de cada 10")}.`,[
      item("Altas reportadas",fmt(snapshot.hires),"/talent-acquisition","KE"),item("Plazo técnico",fmt(snapshot.timeToFill.technical," días"),"/talent-acquisition","KO · plazos exactos"),item("Candidatos adecuados",fmt(snapshot.acceptedPer10,"/10"),"/talent-acquisition","KR")
    ],"/talent-acquisition","Los plazos no reportados y los intervalos no se convierten en días exactos. Para investigar un cambio usa el laboratorio de señales.");
  }
  if(has(q,["vacante","demanda","planeacion","puesto","escolaridad","workforce"])) {
    const r=analyzeSignal("vacancies",scope.period,scope.company);
    return reply("planning","Vacantes con cobertura visible",`${scopeNote} El total con ambos tipos de vacante reportados es ${fmt(r.afterTotal)} en ${r.currentN} empresas. La presión de vacantes sobre plantilla completa es ${fmt(metrics.hiringPressurePct,"%")}.`,[
      item("Vacantes completas",fmt(r.afterTotal),"/workforce-planning","RB + RC"),item("Empresas con ambos tipos",fmt(r.currentN),"/workforce-planning","Operativo y administrativo"),item("Vacantes / plantilla",fmt(metrics.hiringPressurePct,"%"),"/workforce-planning","Mismas empresas en ambos datos")
    ],"/workforce-planning","El detalle de puesto y escolaridad del mercado más reciente no se atribuye a una empresa seleccionada.");
  }
  if(has(q,["beneficio","prestacion","rewards","vales","seguro","comedor","transporte"])) {
    const benefits=([['Seguro de vida','lifeInsurance'],['Transporte','transport'],['Comedor','cafeteria']] as const).map(([name,key])=>{
      const valid=rows.map(r=>r.benefits[key]).filter(v=>v!==null);const yes=valid.filter(Boolean).length;
      return item(name,isMarket?(valid.length?`${yes}/${valid.length} respuestas`:"Sin dato"):valid.length?(yes?"Sí":"No"):"Sin dato","/beneficios",`${valid.length} respuestas sí/no`);
    });
    return reply("rewards","Prestaciones efectivamente reportadas",`${scopeNote} Se muestran respuestas explícitas de seguro de vida, transporte y comedor. Las empresas que no respondieron no cuentan como un “no”.`,benefits,"/beneficios","La presencia de una prestación no mide su uso ni demuestra una mejora de retención.");
  }
  if(has(q,["ausent","incapacidad","riesgo","falta","labor risk"])) {
    return reply("risk","Eventos laborales, sin confundirlos con personas",`${scopeNote} Ausencias: ${fmt(metrics.absenceEventsPer100)} eventos por 100 personas de plantilla completa, con ${metrics.coverage.absence} empresas. Incapacidades: ${fmt(metrics.incapacityCasesPer100)} casos por 100, con ${metrics.coverage.incapacity} empresas.`,[
      item("Ausencias / 100 personas",fmt(metrics.absenceEventsPer100),"/labor-risk","MC / plantilla completa"),item("Incapacidades / 100 personas",fmt(metrics.incapacityCasesPer100),"/labor-risk","ML / plantilla completa"),item("Empresas con ausencias y plantilla",fmt(metrics.coverage.absence),"/labor-risk","Cohorte de la tasa")
    ],"/labor-risk","Son eventos, no personas únicas: la tasa puede superar 100. La cobertura puede variar entre indicadores.");
  }
  if(has(q,["resumen","general","panorama","lectura ejecutiva"])) {
    return reply("summary","Tu selección en tres indicadores",`${scopeNote} Plantilla reportada: ${fmt(snapshot.headcount.total)} personas; altas menos bajas: ${fmt(metrics.netMovement)} en ${metrics.coverage.net} empresas con ambos datos. Para interpretar los cambios, revisa las mismas empresas entre cortes.`,[
      item("Plantilla reportada",fmt(snapshot.headcount.total),"/contexto","GL + GM + GN · componentes disponibles"),item("Altas menos bajas",fmt(metrics.netMovement),"/retencion","KE − LB · respuestas emparejadas"),item("Empresas con ambos movimientos",fmt(metrics.coverage.net),"/retencion","Cobertura del balance")
    ],"/signals","La plantilla reportada suma los componentes disponibles; no sustituye la plantilla completa requerida para calcular tasas.");
  }
  return unavailable("Puedo ayudarte con cambios comparables, salarios, bajas, contratación, vacantes, prestaciones, ausencias y calidad. Elige una pregunta sugerida o especifica uno de esos temas. Las respuestas usan los filtros de arriba; otros periodos se seleccionan allí.");
}

export const copilotPrompts = [
  "Dame un resumen de mi selección",
  "¿Qué cambió en las bajas entre las mismas empresas?",
  "¿De qué empresa depende el cambio en contrataciones?",
  "¿Cómo está el salario de ingreso contra mercado?",
  "¿Qué datos faltan y qué debo confirmar?",
  "¿Qué prestaciones se reportaron?",
];
