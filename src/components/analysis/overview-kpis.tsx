"use client";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, UsersRound, UserPlus, UserMinus } from "lucide-react";
import { useFilters } from "@/components/filters/filter-context";
import { DataQuality, MetricValue, Sparkline, StatusChip, TrendLens } from "@/components/ui/data-visuals";
import { getScopeSnapshot, scopeCoverage, PERIODS } from "@/lib/company-panel";
import { analyzeSignal, type SignalMetric } from "@/lib/signal-analysis";
import { movementSentence, movementTone } from "@/lib/visual-reading";
import { buildComparison } from "@/lib/selection-comparison";
import { singleSelection } from "@/lib/comparison-selection";

const format = (value: number | null | undefined) => value == null ? "—" : value.toLocaleString("es-MX");
export function OverviewKpis() {
  const {company,period,isMarket} = useFilters();
  const scope=getScopeSnapshot(company,period), coverage=scopeCoverage(company,period);
  const cards = [
    {label:"Salidas de personal",value:scope?.exits,metric:"exits" as const,n:coverage.exits,Icon:UserMinus,href:"/retencion",note:"Salidas registradas en estos dos meses",chapter:"Permanencia",context:"Cada salida puede abrir una necesidad de reemplazo."},
    {label:"Empleados reportados",value:scope?.headcount.total,metric:"headcount" as const,n:coverage.headcount,Icon:UsersRound,href:"/contexto",note:"Personal registrado; puede haber categorías sin respuesta",chapter:"Dimensión del equipo",context:"Personal al cierre; contrástalo con la carga de trabajo."},
    {label:"Contrataciones",value:scope?.hires,metric:"hires" as const,n:coverage.hires,Icon:UserPlus,href:"/talent-acquisition",note:"Contrataciones registradas en estos dos meses",chapter:"Incorporación",context:"Distingue crecimiento de reemplazos antes de evaluar el avance."},
    {label:"Puestos por cubrir",value:scope?.vacancies.total,metric:"vacancies" as const,n:coverage.vacancies,Icon:BriefcaseBusiness,href:"/workforce-planning",note:"Puestos que las empresas planean cubrir",chapter:"Demanda de personal",context:"Prioriza por impacto operativo y fecha de incorporación."},
  ];
  return <section className="pulse-board" aria-label="Indicadores del bimestre">{cards.map((c,index)=>{
    const change=analyzeSignal(c.metric as SignalMetric,period,company), ready=change.n>=(isMarket?5:1)&&!!change.previous;
    const delta=ready?change.matchedDelta:null, tone=movementTone(c.metric,delta);
    const selection=singleSelection(company,period); selection.timeMode="history"; selection.periods=PERIODS;
    const trend=buildComparison(selection,c.metric);
    const values=trend.points.map(p=>trend.common.length>=(isMarket?5:1)?p.fixed.value:null);
    const different=change.n!==c.n || (change.matchedAfter!==c.value&&delta!==null);
    const status=delta===null?"Sin comparación suficiente":tone==="good"?"Mejora frente al bimestre anterior":tone==="alert"?"Requiere atención":tone==="attention"?"Priorizar cobertura":delta===0?"Sin cambio": "Revisar contra el plan";
    return <article key={c.metric} className={`pulse-card pulse-${c.metric}`}>
      <div className="pulse-kicker"><span>{String(index+1).padStart(2,"0")} / {c.chapter}</span><c.Icon size={20} aria-hidden="true"/></div>
      <div className="pulse-content">
        <div className="pulse-fact"><h2>{c.label}</h2><div className="pulse-value"><MetricValue amount={c.value}>{format(c.value)}</MetricValue></div><span className="pulse-period">{period} · dato del corte</span><StatusChip tone={tone}>{status}</StatusChip></div>
        {index===0 ? <div className="pulse-trend"><TrendLens key={`${company}:${period}`} values={values} labels={PERIODS} selected={PERIODS.indexOf(period)} label="Salidas en el grupo comparable"/><span className="pulse-cohort">Mismas {trend.common.length} empresas en el historial</span></div> : <Sparkline values={values} labels={PERIODS} selected={PERIODS.indexOf(period)} label={`${c.label}, mismas empresas en siete bimestres`}/>}
      </div>
      <div className="pulse-reading"><strong>{movementSentence(c.metric,delta)}</strong>{ready&&<span>De {format(change.matchedBefore)} a {format(change.matchedAfter)} · mismas {change.n} {change.n===1?"empresa":"empresas"}</span>}<p>{c.context}</p></div>
      <div className="pulse-footer"><DataQuality different={different}><p>{c.note}. {c.n} de {coverage.total} empresas con {c.metric==="headcount"||c.metric==="vacancies"?"categorías completas":"respuesta"}.</p><p>El cambio usa las mismas {change.n} empresas: {change.matchedBefore} → {change.matchedAfter}. Variación: {ready&&change.matchedPct!==null?`${change.matchedPct.toFixed(1)}%`:"sin base suficiente"}. {different?"La base del cambio es distinta de la del total del corte.":""}</p><p>La tendencia conserva {trend.common.length} empresas con datos en los siete bimestres. {isMarket?"Se requieren al menos cinco para trazarla.":"Los faltantes no se convierten en cero."}</p></DataQuality><Link href={c.href} aria-label={`Ver detalle de ${c.label}`} className="pulse-detail"><span>Explorar</span><ArrowUpRight size={18}/></Link></div>
    </article>;
  })}</section>;
}
