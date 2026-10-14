"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, Building2, UsersRound, UserPlus, UserMinus, Orbit, GitCompareArrows, ShieldCheck } from "lucide-react";
import { DashboardFrame } from "@/components/dashboard-frame";
import { SignalPreview } from "@/components/signal-preview";
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
    {label:"Plantilla informada",value:int(scope?.headcount.total),metric:"headcount" as SignalMetric,n:coverage.headcount,Icon:UsersRound,href:"/contexto",note:"Suma de componentes reportados"},
    {label:"Contrataciones",value:int(scope?.hires),metric:"hires" as SignalMetric,n:coverage.hires,Icon:UserPlus,href:"/talent-acquisition",note:"Altas reportadas del bimestre"},
    {label:"Bajas",value:int(scope?.exits),metric:"exits" as SignalMetric,n:coverage.exits,Icon:UserMinus,href:"/retencion",note:"Bajas reportadas del bimestre"},
    {label:"Vacantes próximas",value:int(scope?.vacancies.total),metric:"vacancies" as SignalMetric,n:coverage.vacancies,Icon:BriefcaseBusiness,href:"/workforce-planning",note:"Suma de plazas informadas"},
  ];
  return <DashboardFrame>
    <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div><div className="eyebrow">Catch Consulting · People Intelligence</div><h1 className="mt-2 text-3xl font-black tracking-tight text-[#0b2140] md:text-4xl">El bimestre, en perspectiva.</h1><p className="mt-2 text-sm leading-6 text-slate-500">Detecta el movimiento. Comprueba la evidencia. Decide qué investigar.</p></div>
      <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600"><span className="filter-chip"><CalendarDays size={14}/>{period}</span><span className="filter-chip"><Building2 size={14}/>{companyLabel}</span></div>
    </section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores del bimestre">
      {cards.map(c=>{const change=analyzeSignal(c.metric,period,company);const ready=change.n>=(isMarket?5:1);return <Link key={c.label} href={c.href} className="panel group p-5 transition hover:border-cyan-400"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-600">{c.label}</span><c.Icon size={17} className="text-cyan-700"/></div><div className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{c.value}</div><p className="mt-2 text-xs leading-5 text-slate-500">{c.note} · {c.n}/{coverage.total} {c.metric==="headcount"||c.metric==="vacancies"?"completas":"respuestas"}</p><div className="mt-4 border-t border-slate-100 pt-3 text-xs font-bold text-cyan-800">{ready&&change.matchedPct!==null?`${change.matchedPct>0?"+":""}${change.matchedPct.toFixed(1)}% · ${change.n} empresas comparables`:change.previous?"Sin variación comparable suficiente":"Primer corte disponible"}</div></Link>})}
    </section>
    <section className="decision-ink mt-5 grid gap-6 p-5 text-white md:p-7 xl:grid-cols-[1fr_1.1fr] xl:items-center">
      <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><GitCompareArrows size={17}/> El movimiento detrás del total</div><h2 className="mt-4 max-w-lg text-2xl font-black leading-tight md:text-3xl">{net===null?"Faltan movimientos para calcular el balance.":net===0?"Las altas y bajas se compensan.":`${net>0?"+":""}${int(net)} personas en el balance de altas y bajas.`}</h2><p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">{metrics.coverage.net}/{coverage.total} empresas con ambos movimientos reportados. El balance no equivale al cambio de plantilla: los conceptos y las respuestas pueden diferir entre cortes.</p><div className="mt-5 grid max-w-lg grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-300">Bajas / plantilla al cierre</div><div className="mt-2 text-2xl font-black text-cyan-200">{pct(metrics.turnoverPct)}</div><div className="mt-2 text-xs text-slate-400">{metrics.coverage.exits}/{coverage.total} empresas emparejadas</div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-slate-300">Vacantes / plantilla</div><div className="mt-2 text-2xl font-black text-cyan-200">{pct(metrics.hiringPressurePct)}</div><div className="mt-2 text-xs text-slate-400">Con ambas poblaciones completas</div></div></div><Link href="/decisiones" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">Separar las explicaciones del cambio <ArrowRight size={16}/></Link></div>
      <SignalPreview/>
    </section>
    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <Link href="/decisiones" className="group relative overflow-hidden rounded-[26px] border border-cyan-200 bg-[#eaf8f8] p-6 md:p-7"><div className="flex items-center justify-between"><Orbit size={24} className="text-cyan-800"/><span className="rounded-full border border-cyan-200 bg-white/70 px-3 py-1 text-xs font-bold text-cyan-800">Estudio de decisiones</span></div><h2 className="mt-6 max-w-md text-2xl font-black leading-tight">Mismo salario.<br/>¿La misma retención?</h2><p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">Explora el mapa entre pares, identifica contrastes y guarda una hipótesis con el corte exacto que la originó.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-900">Abrir el mapa y la bitácora <ArrowUpRight size={17}/></span></Link>
      <Link href="/data-quality" className="group rounded-[26px] border border-slate-200 bg-white p-6 md:p-7"><div className="flex items-center justify-between"><ShieldCheck size={24} className="text-indigo-600"/><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Evidencia del corte</span></div><h2 className="mt-6 max-w-lg text-2xl font-black leading-tight">La cobertura también<br/>cambia la lectura.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">{coverage.headcount}/{coverage.total} empresas con plantilla completa. {quality.anomalies.length?`${quality.anomalies.length} saltos históricos por confirmar.`:"Sin saltos de plantilla que superen el umbral histórico de revisión."} Consulta los faltantes y las discrepancias antes de interpretar una señal.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-900">Revisar la información <ArrowUpRight size={17}/></span></Link>
    </section>
    <section className="mt-7"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><h2 className="text-lg font-black">Continúa por una pregunta de negocio</h2><Link href="/reportes" className="text-xs font-bold text-cyan-800">Ver reporte bimestral →</Link></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["¿Dónde perdemos talento?","Rotación, antigüedad y motivos","/retencion"],["¿Cómo compite la oferta?","Salario y prestaciones","/benchmark"],["¿Qué plazas vienen?","Demanda y capacidad de contratación","/workforce-planning"],["¿Cómo va la negociación?","Contrato colectivo e incrementos","/relaciones-laborales"]].map(([title,note,href])=><Link key={href} href={href} className="panel p-5 transition hover:border-cyan-400"><h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{note}</p><ArrowRight size={15} className="mt-4 text-cyan-800"/></Link>)}</div></section>
  </DashboardFrame>;
}
