"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, Building2, UsersRound, UserPlus, UserMinus, Orbit, GitCompareArrows, ShieldCheck } from "lucide-react";
import { DashboardFrame } from "@/components/dashboard-frame";
import { SignalPreview } from "@/components/signal-preview";
import { ExecutiveBrief } from "@/components/executive-brief";
import { AgendaPreview } from "@/components/agenda-preview";
import { useFilters } from "@/components/filter-context";
import { deriveScopeMetrics, getScopeSnapshot, scopeCoverage } from "@/lib/company-panel";
import { analyzeSignal, type SignalMetric } from "@/lib/signal-analysis";
import { qualityReport } from "@/lib/data-quality";

const int = (v: number | null | undefined) => v == null ? "—" : new Intl.NumberFormat("es-MX",{maximumFractionDigits:0}).format(v);
const pct = (v: number | null) => v === null ? "—" : `${v.toFixed(1)}%`;

export default function Home() {
  const {period,company,companyLabel,isMarket} = useFilters();
  const scope = getScopeSnapshot(company,period), metrics = deriveScopeMetrics(scope);
  const coverage = scopeCoverage(company,period), quality = qualityReport(period,company);
  const net = metrics.netMovement;
  const cards = [
    {label:"Empleados reportados",value:int(scope?.headcount.total),metric:"headcount" as SignalMetric,n:coverage.headcount,Icon:UsersRound,href:"/contexto",note:"Personal registrado; puede haber categorías sin respuesta"},
    {label:"Contrataciones",value:int(scope?.hires),metric:"hires" as SignalMetric,n:coverage.hires,Icon:UserPlus,href:"/talent-acquisition",note:"Contrataciones registradas en estos dos meses"},
    {label:"Salidas de personal",value:int(scope?.exits),metric:"exits" as SignalMetric,n:coverage.exits,Icon:UserMinus,href:"/retencion",note:"Salidas registradas en estos dos meses"},
    {label:"Puestos por cubrir",value:int(scope?.vacancies.total),metric:"vacancies" as SignalMetric,n:coverage.vacancies,Icon:BriefcaseBusiness,href:"/workforce-planning",note:"Puestos que las empresas planean cubrir"},
  ];
  return <DashboardFrame>
    <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div><div className="eyebrow">Catch Consulting · People Intelligence</div><h1 className="mt-2 text-3xl font-black tracking-tight text-[#0b2140] md:text-4xl">Lo que necesita saber dirección.</h1><p className="mt-2 text-sm leading-6 text-slate-500">Personas, contrataciones y puestos pendientes en el periodo elegido. Cada bimestre abarca dos meses.</p></div>
      <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600"><span className="filter-chip"><CalendarDays size={14}/>{period}</span><span className="filter-chip"><Building2 size={14}/>{companyLabel}</span></div>
    </section>
    <ExecutiveBrief/>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores del bimestre">
      {cards.map(c=>{const change=analyzeSignal(c.metric,period,company);const ready=change.n>=(isMarket?5:1);return <Link key={c.label} href={c.href} className="panel group p-5 transition hover:border-cyan-400"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-600">{c.label}</span><c.Icon size={17} className="text-cyan-700"/></div><div className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{c.value}</div><p className="mt-2 text-xs leading-5 text-slate-500">{c.note} · {c.n} de {coverage.total} empresas con {c.metric==="headcount"||c.metric==="vacancies"?"categorías completas":"respuesta"}</p><div className="mt-4 border-t border-slate-100 pt-3 text-xs font-bold text-cyan-800">{ready&&change.matchedPct!==null?`${change.matchedPct>0?"Subió ":change.matchedPct<0?"Bajó ":"Sin cambio: "}${Math.abs(change.matchedPct).toFixed(1)}% frente al bimestre anterior · mismas ${change.n} empresas`:change.previous?"Faltan datos para comparar el cambio":"Primer bimestre disponible"}</div></Link>})}
    </section>
    <AgendaPreview/>
    <details className="mt-5"><summary className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700">Ver movimientos y comparación con el bimestre anterior</summary><section className="decision-ink mt-3 grid gap-6 p-5 text-white md:p-7 xl:grid-cols-[1fr_1.1fr] xl:items-center">
      <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><GitCompareArrows size={17}/> El movimiento detrás del total</div><h2 className="mt-4 max-w-lg text-2xl font-black leading-tight md:text-3xl">{net===null?"Faltan datos de contrataciones o salidas.":net===0?"Se registró el mismo número de contrataciones y salidas.":`${int(Math.abs(net))} más ${net>0?"contrataciones que salidas":"salidas que contrataciones"}.`}</h2><p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">{metrics.coverage.net}/{coverage.total} empresas informaron contrataciones y salidas. Esta diferencia no demuestra cuánto creció el equipo; para eso se comparan los empleados al cierre de cada periodo.</p><div className="mt-5 grid max-w-lg grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-300">Salidas por cada 100 empleados</div><div className="mt-2 text-2xl font-black text-cyan-200">{pct(metrics.turnoverPct)}</div><div className="mt-2 text-xs text-slate-400">{metrics.coverage.exits}/{coverage.total} empresas con salidas y personal reportados</div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-300">Puestos pendientes por cada 100 empleados</div><div className="mt-2 text-2xl font-black text-cyan-200">{pct(metrics.hiringPressurePct)}</div><div className="mt-2 text-xs text-slate-400">Con datos completos de puestos y personal</div></div></div><Link href="/decisiones" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">Entender de dónde viene el cambio <ArrowRight size={16}/></Link></div>
      <SignalPreview/>
    </section></details>
    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <Link href="/decisiones" className="group relative overflow-hidden rounded-[26px] border border-cyan-200 bg-[#eaf8f8] p-6 md:p-7"><div className="flex items-center justify-between"><Orbit size={24} className="text-cyan-800"/><span className="rounded-full border border-cyan-200 bg-white/70 px-3 py-1 text-xs font-bold text-cyan-800">Estudio de decisiones</span></div><h2 className="mt-6 max-w-md text-2xl font-black leading-tight">Sueldos parecidos.<br/>¿También las salidas de personal?</h2><p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">Compara empresas, revisa sus diferencias y guarda una pregunta para que RH investigue con la fecha del dato.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-900">Abrir el mapa y la bitácora <ArrowUpRight size={17}/></span></Link>
      <Link href="/data-quality" className="group rounded-[26px] border border-slate-200 bg-white p-6 md:p-7"><div className="flex items-center justify-between"><ShieldCheck size={24} className="text-indigo-600"/><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Evidencia del corte</span></div><h2 className="mt-6 max-w-lg text-2xl font-black leading-tight">¿Qué información<br/>falta confirmar?</h2><p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">{coverage.headcount}/{coverage.total} empresas reportaron todas las categorías de personal. {quality.anomalies.length?`${quality.anomalies.length} cambios inusuales de personal por confirmar.`:"No se detectaron cambios inusuales de personal con este control."} Revisa qué información falta antes de extender la conclusión a todas las empresas.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-900">Revisar la información <ArrowUpRight size={17}/></span></Link>
    </section>
    <section className="mt-7"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><h2 className="text-lg font-black">Continúa por una pregunta de negocio</h2><Link href="/reportes" className="text-xs font-bold text-cyan-800">Ver reporte bimestral →</Link></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["¿Dónde perdemos talento?","Rotación, antigüedad y motivos","/retencion"],["¿Cómo compite la oferta?","Salario y prestaciones","/benchmark"],["¿Qué plazas vienen?","Demanda y capacidad de contratación","/workforce-planning"],["¿Cómo va la negociación?","Contrato colectivo e incrementos","/relaciones-laborales"]].map(([title,note,href])=><Link key={href} href={href} className="panel p-5 transition hover:border-cyan-400"><h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{note}</p><ArrowRight size={15} className="mt-4 text-cyan-800"/></Link>)}</div></section>
  </DashboardFrame>;
}
