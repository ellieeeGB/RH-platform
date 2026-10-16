"use client";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, UsersRound, UserPlus, UserMinus } from "lucide-react";
import { useFilters } from "@/components/filters/filter-context";
import { DataQuality, MetricValue, Sparkline, StatusChip } from "@/components/ui/data-visuals";
import { getScopeSnapshot, scopeCoverage, PERIODS } from "@/lib/company-panel";
import { analyzeSignal, type SignalMetric } from "@/lib/signal-analysis";
import { movementSentence, movementTone } from "@/lib/visual-reading";
import { buildComparison } from "@/lib/selection-comparison";
import { singleSelection } from "@/lib/comparison-selection";

export function OverviewKpis() {
  const {company,period,isMarket} = useFilters();
  const scope=getScopeSnapshot(company,period), coverage=scopeCoverage(company,period);
  const cards = [
    {label:"Salidas de personal",value:scope?.exits,metric:"exits" as const,n:coverage.exits,Icon:UserMinus,href:"/retencion",note:"Salidas registradas en estos dos meses"},
    {label:"Empleados reportados",value:scope?.headcount.total,metric:"headcount" as const,n:coverage.headcount,Icon:UsersRound,href:"/contexto",note:"Personal registrado; puede haber categorías sin respuesta"},
    {label:"Contrataciones",value:scope?.hires,metric:"hires" as const,n:coverage.hires,Icon:UserPlus,href:"/talent-acquisition",note:"Contrataciones registradas en estos dos meses"},
    {label:"Puestos por cubrir",value:scope?.vacancies.total,metric:"vacancies" as const,n:coverage.vacancies,Icon:BriefcaseBusiness,href:"/workforce-planning",note:"Puestos que las empresas planean cubrir"},
  ];
  return <section className="kpi-bento" aria-label="Indicadores del bimestre">{cards.map((c,index)=>{
    const change=analyzeSignal(c.metric as SignalMetric,period,company), ready=change.n>=(isMarket?5:1)&&!!change.previous;
    const delta=ready?change.matchedDelta:null, tone=movementTone(c.metric,delta);
    const selection=singleSelection(company,period); selection.timeMode="history"; selection.periods=PERIODS;
    const trend=buildComparison(selection,c.metric);
    const values=trend.points.map(p=>trend.common.length>=(isMarket?5:1)?p.fixed.value:null);
    const different=change.n!==c.n || (change.matchedAfter!==c.value&&delta!==null);
    const status=delta===null?"Sin comparación suficiente":tone==="good"?"Mejora frente al bimestre anterior":tone==="alert"?"Requiere atención":tone==="attention"?"Priorizar cobertura":delta===0?"Sin cambio": "Revisar contra el plan";
    return <article key={c.metric} className={`kpi-editorial ${index===0?"kpi-hero":""}`}>
      <div className="kpi-heading"><span>{index===0?"Foco del bimestre":c.label}</span><c.Icon size={21}/></div>
      {index===0&&<h2 className="kpi-hero-title">Salidas de personal</h2>}
      <div className="kpi-value"><MetricValue amount={c.value}>{c.value==null?"—":c.value.toLocaleString("es-MX")}</MetricValue></div>
      <StatusChip tone={tone}>{status}</StatusChip>
      <p className="kpi-interpretation">{movementSentence(c.metric,delta)}</p>
      {different&&delta!==null&&<span className="cohort-label">Cambio calculado con un grupo distinto del total</span>}
      <Sparkline values={values} labels={PERIODS} selected={PERIODS.indexOf(period)} label={`${c.label}, mismas empresas en siete bimestres`}/>
      <div className="kpi-bottom"><DataQuality different={different}><p>{c.note}. {c.n} de {coverage.total} empresas con {c.metric==="headcount"||c.metric==="vacancies"?"categorías completas":"respuesta"}.</p><p>El cambio usa las mismas {change.n} {change.n===1?"empresa":"empresas"}: {change.matchedBefore} → {change.matchedAfter}. Variación: {ready&&change.matchedPct!==null?`${change.matchedPct.toFixed(1)}%`:"sin base suficiente"}.</p><p>La tendencia conserva {trend.common.length} empresas con datos en los siete bimestres. {isMarket?"Se requieren al menos cinco para trazarla.":"Los faltantes no se convierten en cero."}</p></DataQuality><Link href={c.href} aria-label={`Ver detalle de ${c.label}`} className="kpi-detail"><ArrowUpRight size={18}/><span className="sr-only">Detalle</span></Link></div>
    </article>;
  })}</section>;
}
