"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookmarkPlus, Check, Download, Focus, GitCompareArrows, NotebookPen, Orbit, Trash2 } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { decisionStudy, contrastPeers, type TalentPoint } from "@/lib/decision-intelligence";
import { distribution, type PeerSize, type PeerUnion } from "@/lib/benchmark-comparison";
import { MARKET_SCOPE } from "@/lib/company-panel";
import { readDecisionNotes, type DecisionNote } from "@/lib/decision-journal";
import manifest from "../../../data/processed/pipeline-manifest.json";
import { PreviousActions } from "@/components/previous-actions";

const fmt = (n: number | null, digits = 1) => n === null ? "—" : new Intl.NumberFormat("es-MX", {maximumFractionDigits: digits}).format(n);
const money = (n: number | null) => n === null ? "—" : `$${fmt(n, 2)}`;
const signed = (n: number | null) => n === null ? "—" : `${n > 0 ? "+" : ""}${fmt(n, 2)}`;
const storageKey = "catch.decision-notes.v1";
const sizeLabels = {all:"Todos los tamaños", under250:"Menos de 250 personas", "250to999":"250–999 personas", "1000plus":"1,000 o más personas"};
const unionLabels = {all:"Toda relación sindical", yes:"Con sindicato", no:"Sin sindicato"};

function TalentMap({points, selected, salaryMedian, turnoverMedian, onSelect}: {points: TalentPoint[]; selected: string; salaryMedian: number | null; turnoverMedian: number | null; onSelect: (company: string) => void}) {
  const left = 68, top = 28, width = 650, height = 290;
  const min = Math.min(...points.map(p => p.salary)), max = Math.max(...points.map(p => p.salary));
  const pad = Math.max((max - min) * .12, 15);
  const xMin = Math.max(0, min - pad), xMax = max + pad;
  const yMax = Math.max(10, Math.ceil(Math.max(...points.map(p => p.turnover)) * 1.15 / 10) * 10);
  const x = (n: number) => left + (n - xMin) / (xMax - xMin) * width;
  const y = (n: number) => top + height - n / yMax * height;
  if (points.length < 5) return <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-slate-50 p-8 text-center text-sm leading-6 text-slate-600">El mapa necesita cinco empresas con salario válido, bajas y plantilla completa. Amplía los filtros para explorar.</div>;
  return <svg viewBox="0 0 760 385" className="w-full" role="group" aria-label="Mapa de salario diario y bajas por plantilla. Selecciona una empresa para investigarla; también puedes usar la tabla.">
    <title>Salario de ingreso y bajas por plantilla al cierre</title>
    <desc>Cada círculo es una empresa; su área representa la plantilla. Las líneas discontinuas son las medianas de las empresas dibujadas.</desc>
    <rect x={left} y={top} width={width} height={height} rx="12" fill="#f8fafc" />
    {[0, .25, .5, .75, 1].map(t => <g key={t}>
      <line x1={left} x2={left + width} y1={y(t*yMax)} y2={y(t*yMax)} stroke="#e2e8f0" />
      <text x={left-12} y={y(t*yMax)+4} textAnchor="end" fill="#64748b" fontSize="11">{fmt(t*yMax)}%</text>
      <text x={x(xMin+t*(xMax-xMin))} y={top+height+23} textAnchor="middle" fill="#64748b" fontSize="11">${fmt(xMin+t*(xMax-xMin),0)}</text>
    </g>)}
    {salaryMedian !== null && <line x1={x(salaryMedian)} x2={x(salaryMedian)} y1={top} y2={top+height} stroke="#94a3b8" strokeDasharray="4 5" />}
    {turnoverMedian !== null && <line x1={left} x2={left+width} y1={y(turnoverMedian)} y2={y(turnoverMedian)} stroke="#94a3b8" strokeDasharray="4 5" />}
    <text x={left} y="16" fill="#475569" fontSize="11">Salidas por cada 100 empleados al cierre</text>
    <text x={left+width/2} y="369" textAnchor="middle" fill="#475569" fontSize="12">Salario diario de ingreso · MXN</text>
    {[...points].sort((a,b) => Number(a.company===selected)-Number(b.company===selected)).map(p => <g key={p.company} role="button" tabIndex={0} aria-pressed={p.company===selected} aria-label={`${p.company}: ${money(p.salary)} diarios, ${fmt(p.turnover)}% bajas, ${fmt(p.headcount,0)} personas${p.review?", plantilla por confirmar":""}`} onClick={()=>onSelect(p.company)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(p.company);}}} className="cursor-pointer focus:outline-none">
      <title>{p.company} · {money(p.salary)}/día · {fmt(p.turnover)}% bajas{p.review?" · confirmar plantilla":""}</title>
      <circle cx={x(p.salary)} cy={y(p.turnover)} r={Math.max(5,Math.sqrt(p.headcount)*.28)} fill={p.company===selected?"#0b2140":p.review?"#f59e0b":"#0891b2"} fillOpacity={p.company===selected?.95:.5} stroke={p.company===selected?"#22d3ee":p.review?"#b45309":"#fff"} strokeWidth={p.company===selected?3:1.5} />
      {p.company===selected && <text x={x(p.salary)} y={y(p.turnover)-Math.max(5,Math.sqrt(p.headcount)*.28)-9} textAnchor="middle" fontWeight="700" fill="#0b2140" fontSize="11">{p.company.replace("COMPAÑIA ","C")}</text>}
    </g>)}
  </svg>;
}

export default function DecisionsPage() {
  const {company, period, companyLabel, isMarket, setCompany} = useFilters();
  const [size, setSize] = useState<PeerSize>("all"), [union, setUnion] = useState<PeerUnion>("all");
  const [excludeFlagged, setExcludeFlagged] = useState(false);
  const study = useMemo(()=>decisionStudy(period, company, size, union, excludeFlagged),[period,company,size,union,excludeFlagged]);
  const selected = study.points.find(p=>p.company===company);
  const contrasts = selected ? contrastPeers(selected,study.points) : [];
  const contrastRate = distribution(contrasts.map(p=>p.turnover));
  const d = study.decomposition, comparable = d.n >= (isMarket?5:1);
  const [notes, setNotes] = useState<DecisionNote[]>([]), [ready,setReady] = useState(false);
  const [message,setMessage] = useState("");
  const [hypothesis,setHypothesis] = useState(""), [owner,setOwner] = useState(""), [due,setDue] = useState("");
  useEffect(()=>{try{setNotes(readDecisionNotes(localStorage.getItem(storageKey)));}catch{setMessage("El navegador no permite recuperar la bitácora. Puedes exportar la evidencia de esta sesión.");}setReady(true);},[]);
  const persist = (next: DecisionNote[]) => {
    setNotes(next);
    try {localStorage.setItem(storageKey,JSON.stringify(next));setMessage("Bitácora guardada en este navegador.");}
    catch {setMessage("No se pudo guardar en el navegador. Descarga la bitácora para conservar los cambios de esta sesión.");}
  };
  const saveNote = (event: React.FormEvent) => {
    event.preventDefault();
    if(!hypothesis.trim()||!ready)return;
    if(notes.length>=100){setMessage("La bitácora admite 100 hipótesis. Exporta y retira las que ya cerraste.");return;}
    persist([{id:crypto.randomUUID(),createdAt:new Date().toISOString(),period,company:companyLabel,sourceSha256:manifest.sourceSha256,implementationSha256:manifest.implementationSha256,hypothesis:hypothesis.trim(),owner:owner.trim(),due,status:"open",result:"",evidence:{salary:selected?.salary??null,turnover:selected?.turnover??null,comparableN:d.n,rateChange:comparable?d.delta:null,within:comparable?d.within:null,weight:comparable?d.weight:null,peerSize:size,peerUnion:union,excludeFlagged}},...notes]);
    setHypothesis("");
  };
  const download = () => {
    const report = {schemaVersion:1,exportedAt:new Date().toISOString(),selection:{period,company:companyLabel,size,union,excludeFlagged},sourceSha256:manifest.sourceSha256,implementationSha256:manifest.implementationSha256,method:"Salario diario de ingreso; bajas / plantilla completa al cierre × 100. Descomposición simétrica de tasas (Kitagawa). Mismas empresas, sin imputación ni inferencia causal.",sourceColumns:["GW–GZ","LB","GL–GN","DX"],study,notes};
    const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download=`catch-decisiones-${period.replaceAll(" ","-")}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const maxEffect = Math.max(.01,Math.abs(d.within??0),Math.abs(d.weight??0));
  return <DashboardFrame>
    <PageHeader eyebrow="Catch · Estudio de decisiones" title="Del dato a la decisión." description="Compara empresas, entiende por qué se mueve el promedio y guarda una pregunta para darle seguimiento." scopeMode="active" />
    <div className="mb-5 grid gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 text-xs leading-6 text-cyan-950 sm:grid-cols-3"><p><strong>1. Compara.</strong> Cada círculo es una empresa. Más a la derecha: mayor salario. Más arriba: más bajas por cada 100 personas.</p><p><strong>2. Entiende el cambio.</strong> Una tasa de mercado puede moverse porque cambian las bajas o el tamaño relativo de las empresas.</p><p><strong>3. Da seguimiento.</strong> Guarda una pregunta, un responsable y una fecha. La bitácora conserva el corte que la originó.</p></div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2"><label className="filter-chip">Tamaño <select aria-label="Tamaño de los pares" value={size} onChange={e=>setSize(e.target.value as PeerSize)} className="max-w-[200px] bg-transparent">{Object.entries(sizeLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="filter-chip"><span className="sr-only">Relación sindical de los pares</span><select aria-label="Relación sindical de los pares" value={union} onChange={e=>setUnion(e.target.value as PeerUnion)} className="max-w-[200px] bg-transparent">{Object.entries(unionLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>
      <button onClick={download} className="inline-flex items-center gap-2 rounded-xl bg-[#0b2140] px-4 py-3 text-xs font-bold text-white"><Download size={16}/> Descargar estudio y bitácora</button>
    </div>
    <label className="mb-5 flex w-fit items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-950"><input type="checkbox" checked={excludeFlagged} onChange={e=>setExcludeFlagged(e.target.checked)} className="h-4 w-4 shrink-0 accent-cyan-700"/>Probar sin saltos de plantilla por confirmar en el corte actual o anterior{excludeFlagged&&` · ${study.excludedForReview} empresas omitidas`}</label>
    <section className="grid items-start gap-4 xl:grid-cols-[1.65fr_1fr]">
      <article className="panel overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-2 md:p-6 md:pb-3"><div><div className="eyebrow flex items-center gap-2"><Orbit size={15}/> 01 · Compara empresas</div><h2 className="mt-2 text-xl font-black">¿Quién vive una situación distinta?</h2></div><span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-900">{study.points.length}/{study.total} empresas con datos válidos</span></div>
        <div className="px-2 sm:px-4"><TalentMap points={study.points} selected={company} salaryMedian={study.salary.median} turnoverMedian={study.turnover.median} onSelect={setCompany}/></div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-600"><span>● Círculo más grande = más empleados</span><span>┄ Líneas = valores centrales de las empresas</span><span className="text-amber-800">● Ámbar = confirmar plantilla</span></div>
        <p className="px-5 pb-5 text-xs leading-5 text-slate-500">La gráfica usa empresas que reportaron tanto sueldos como personal y salidas. Omisiones, en este orden: {study.exclusions.headcount} sin plantilla completa positiva, {study.exclusions.exits} sin bajas válidas y {study.exclusions.salary} sin bandas salariales válidas. El salario es operativo y las bajas abarcan la plantilla total; el cruce es exploratorio.</p>
      </article>
      <article className="decision-ink p-5 text-white md:p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><Focus size={16}/> Lectura de la selección</div>
        <h2 className="mt-4 text-2xl font-black">{isMarket?"Elige una empresa para compararla.":companyLabel}</h2>
        {selected ? <>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/5 p-4"><div className="text-xs text-slate-300">Ingreso diario</div><div className="mt-2 text-2xl font-black text-cyan-200">{money(selected.salary)}</div></div><div className="rounded-2xl bg-white/5 p-4"><div className="text-xs text-slate-300">Salidas por cada 100 empleados</div><div className="mt-2 text-2xl font-black text-cyan-200">{fmt(selected.turnover)}%</div></div></div>
          <p className="mt-4 text-sm leading-6 text-slate-300">{fmt(selected.exits,0)} bajas / {fmt(selected.headcount,0)} personas al cierre. {selected.review?"Hay un salto histórico de plantilla por confirmar; compruébalo antes de interpretar la tasa.":"El número de empleados incluye personal operativo, administrativo y otros."}</p>
          <div className="mt-5 border-t border-white/15 pt-5"><h3 className="text-sm font-bold text-white">Empresas con condiciones parecidas · {contrasts.length}</h3><p className="mt-2 text-xs leading-6 text-slate-300">Misma presencia de sindicato, plantilla entre la mitad y el doble y salario de ingreso dentro de ±10%. La empresa elegida se excluye.</p>
          {contrastRate.median!==null ? <><div className="mt-4 text-3xl font-black text-cyan-200">{fmt(contrastRate.median)}%</div><p className="mt-2 text-xs leading-5 text-slate-300">Mediana de bajas / plantilla de esos pares. Brecha propia: {signed(selected.turnover-contrastRate.median)} puntos porcentuales.</p><p className="mt-4 text-sm leading-6 text-white">¿Qué difiere en selección, incorporación y operación entre estos casos?</p></> : <p className="mt-4 rounded-xl bg-white/5 p-4 text-sm leading-6 text-slate-200">{selected.unionized===null?"Falta la respuesta sindical para formar este grupo.":"Hay menos de cinco pares con estos criterios. Amplía los filtros; no calculamos una referencia con una muestra insuficiente."}</p>}</div>
        </> : <p className="mt-5 text-sm leading-7 text-slate-300">{isMarket?"Un salario parecido puede convivir con tasas de bajas muy distintas. Selecciona una empresa en el gráfico o en la tabla y revisa sus pares.":"La selección no tiene todos los datos necesarios o queda fuera de los filtros de pares. Puedes ampliar el grupo o consultar la calidad de su información."}</p>}
        <Link href="/data-quality" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">Consultar evidencia y calidad <ArrowRight size={15}/></Link>
      </article>
    </section>

    <section className="panel mt-5 p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow flex items-center gap-2"><GitCompareArrows size={16}/> 02 · Detrás de la tasa</div><h2 className="mt-2 text-2xl font-black">¿Subieron las bajas o cambió el tamaño de las empresas?</h2><p className="mt-2 text-sm leading-6 text-slate-500">{study.previous??"Sin corte anterior"} → {period} · {companyLabel} · {d.n} empresas con bajas y plantilla completa en ambos cortes.</p></div><Link href="/signals" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-800">Revisar conteos y cobertura <ArrowRight size={14}/></Link></div>
      {comparable ? <div className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl bg-[#eaf8f8] p-5"><div className="text-xs font-bold text-cyan-900">Cambio en el mismo grupo</div><div className="mt-3 text-4xl font-black tracking-tight text-[#0b2140]">{signed(d.delta)} <span className="text-lg">pp</span></div><div className="mt-3 text-sm text-slate-600">{fmt(d.beforeRate,2)}% → {fmt(d.afterRate,2)}%</div><p className="mt-3 text-xs leading-6 text-slate-600">{fmt(d.priorHeadcount,0)} → {fmt(d.currentHeadcount,0)} personas, conservando las mismas empresas. “pp” significa puntos porcentuales: pasar de 5% a 8% son 3 puntos más (ejemplo ilustrativo).</p></div>
        <div className="space-y-5">{[{label:"Cambio dentro de las empresas",value:d.within,color:"bg-cyan-600",note:"Cuánto aporta que suba o baje la tasa de cada empresa; usamos su tamaño medio para compararlas."},{label:"Cambio de peso en la plantilla",value:d.weight,color:"bg-indigo-500",note:"Cuánto aporta que las empresas con tasas distintas ganen o pierdan peso en la plantilla del grupo."}].map(r=><div key={r.label}><div className="flex justify-between gap-3 text-sm font-bold"><span>{r.label}</span><span className="shrink-0">{signed(r.value)} pp</span></div><div className="relative my-2 h-3 rounded-full bg-slate-100"><div className={`absolute h-full rounded-full ${r.color}`} style={{left:r.value!==null&&r.value<0?`${50-Math.abs(r.value)/maxEffect*50}%`:"50%",width:`${Math.abs(r.value??0)/maxEffect*50}%`}}/><div className="absolute left-1/2 top-[-3px] h-[18px] w-px bg-slate-400"/></div><p className="text-xs leading-5 text-slate-500">{r.note}</p></div>)}<p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">Ambas aportaciones suman el cambio comparable antes de redondear. {d.within!==null&&d.delta!==null&&d.within*d.delta<0?"La dirección del agregado y la aportación interna son opuestas: investiga el cambio de peso antes de concluir una mejora o deterioro general.":"Una variación agregada puede esconder movimientos diferentes entre empresas."}</p></div>
      </div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">{study.previous?"No hay suficientes empresas con bajas y plantilla completa en los dos cortes para esta selección.":"El primer corte no tiene un periodo anterior disponible. Elige un bimestre posterior para descomponer el cambio."}</p>}
      <details className="mt-5 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-600"><summary className="cursor-pointer font-bold">Método, cobertura y límites</summary><p className="mt-3">Salidas por cada 100 empleados al cierre, no plantilla promedio. La descomposición simétrica de Kitagawa separa cambios en tasas y ponderaciones. El grupo se define con los filtros del corte actual y conserva esos códigos en el anterior; no exige salario para descomponer bajas.</p><p>Respuestas válidas: {d.previousN} antes y {d.currentN} ahora. Cambio de todas las respuestas disponibles: {signed(d.observedDelta)} pp; cambio del panel emparejado: {signed(d.delta)} pp. Su diferencia por disponibilidad de respuestas es {signed(d.coverageEffect)} pp. Las aportaciones describen una identidad aritmética; no identifican causas.</p><p>Mapa: salario diario de ingreso operativo (GW), bandas GW–GZ ordenadas, bajas totales LB, plantilla GL+GM+GN. No se estima asociación causal, productividad ni impacto de una política salarial.</p></details>
    </section>

    <section className="panel mt-5 overflow-hidden"><details><summary className="cursor-pointer p-5 text-sm font-bold md:p-6">Explorar las {study.points.length} empresas del mapa en una tabla</summary><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><caption className="sr-only">Salario y bajas por empresa. Seleccionar una empresa actualiza los filtros de la plataforma.</caption><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Empresa","Ingreso / día","Salidas por cada 100 empleados","Personas",""].map((s,i)=><th key={i} className="px-5 py-3">{s}</th>)}</tr></thead><tbody>{study.points.length>=5&&study.points.map(p=><tr key={p.company} className={`border-t border-slate-100 ${p.company===company?"bg-cyan-50":""}`}><th scope="row" className="px-5 py-3 text-xs">{p.company}{p.review&&<span className="block pt-1 text-amber-800">Confirmar plantilla</span>}</th><td className="px-5 py-3">{money(p.salary)}</td><td className="px-5 py-3">{fmt(p.turnover)}%</td><td className="px-5 py-3">{fmt(p.headcount,0)}</td><td className="px-5 py-3"><button onClick={()=>setCompany(p.company)} aria-label={`Investigar ${p.company}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-cyan-900">Investigar</button></td></tr>)}</tbody></table>{study.points.length<5&&<p className="p-5 text-sm text-slate-600">Amplía los filtros para reunir al menos cinco empresas válidas.</p>}</div></details></section>

    <section className="mt-5 grid items-start gap-4 xl:grid-cols-[1fr_1.3fr]" id="bitacora">
      <form onSubmit={saveNote} className="decision-ink p-5 text-white md:p-7"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><NotebookPen size={16}/> 03 · De la evidencia a la pregunta</div><h2 className="mt-3 text-2xl font-black">Abre una investigación.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Guarda la selección, el corte y sus resultados junto a lo que quieres comprobar.</p><label className="mt-5 block text-xs font-bold">Hipótesis o pregunta<textarea required maxLength={1500} value={hypothesis} onChange={e=>setHypothesis(e.target.value)} placeholder="¿Qué cambió en la incorporación de personal entre estos cortes?" className="mt-2 min-h-28 w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm leading-6 text-white placeholder:text-slate-400"/></label><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">Responsable<input maxLength={200} value={owner} onChange={e=>setOwner(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm" placeholder="Nombre o equipo"/></label><label className="text-xs font-bold">Fecha de revisión<input type="date" value={due} onChange={e=>setDue(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm [color-scheme:dark]"/></label></div><button disabled={!ready||!hypothesis.trim()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-[#0b2140] disabled:cursor-not-allowed disabled:opacity-50"><BookmarkPlus size={17}/> Guardar con evidencia</button><p className="mt-4 text-xs leading-5 text-slate-300">La bitácora se guarda en este navegador. Descárgala para conservar una copia; no se comparte con el equipo automáticamente.</p></form>
      <article className="panel p-5 md:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black">Bitácora de hipótesis</h2><span className="text-xs font-bold text-slate-500">{notes.length}/100</span></div><p role="status" className="mt-3 text-xs leading-5 text-cyan-900">{message}</p>{!notes.length&&<p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">Tu primera pregunta quedará aquí con una fotografía de los resultados. Al cambiar de bimestre, la evidencia guardada conserva su corte original.</p>}<div className="mt-4 space-y-4">{notes.map(note=><article key={note.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div className="text-xs font-bold text-cyan-800">{note.company} · {note.period}</div><button aria-label={`Eliminar hipótesis: ${note.hypothesis}`} onClick={()=>persist(notes.filter(n=>n.id!==note.id))} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-800"><Trash2 size={15}/></button></div><h3 className="mt-2 break-words text-sm font-bold leading-6 text-slate-900">{note.hypothesis}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{note.owner||"Sin responsable"} · {note.due?`Revisión: ${note.due}`:"Sin fecha"}</p><div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-600">Cambio en el mismo grupo: {signed(note.evidence.rateChange)} pp · n={note.evidence.comparableN}<br/>Dentro de empresas: {signed(note.evidence.within)} pp · peso: {signed(note.evidence.weight)} pp<br/>{sizeLabels[note.evidence.peerSize as PeerSize]??note.evidence.peerSize} · {unionLabels[note.evidence.peerUnion as PeerUnion]??note.evidence.peerUnion}<br/>Fuente {note.sourceSha256.slice(0,12)} · {note.evidence.excludeFlagged?"Sin saltos por confirmar":"Con datos reportados"}{(note.sourceSha256!==manifest.sourceSha256||note.implementationSha256!==manifest.implementationSha256)&&" · Edición anterior: verifica antes de reutilizar"}</div><label className="mt-3 block text-xs font-bold text-slate-600">Qué encontraste<textarea maxLength={2000} value={note.result} onChange={e=>persist(notes.map(n=>n.id===note.id?{...n,result:e.target.value}:n))} placeholder="Registra la respuesta del equipo o el resultado de la intervención…" className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6"/></label><button onClick={()=>persist(notes.map(n=>n.id===note.id?{...n,status:n.status==="open"?"reviewed":"open"}:n))} aria-pressed={note.status==="reviewed"} className={`mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${note.status==="reviewed"?"bg-cyan-50 text-cyan-900":"bg-slate-100 text-slate-600"}`}><Check size={14}/>{note.status==="reviewed"?"Revisada · reabrir":"Marcar como revisada"}</button></article>)}</div></article>
    </section>
    <PreviousActions/>
  </DashboardFrame>;
}
