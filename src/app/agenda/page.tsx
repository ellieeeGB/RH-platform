"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Download, FileCheck2, ListChecks, Printer, ScanLine, TrendingUp } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { consultingTrajectories, scopedRecoveryPlan, trajectoryMetrics, recoveryCsv } from "@/lib/consulting-agenda";

type Trajectory = ReturnType<typeof consultingTrajectories>[number];
const format = (n: number | null, digits = 1) => n === null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: digits }).format(n);
const labels: Record<string, string> = { rising: "Sube dos veces seguidas", falling: "Baja dos veces seguidas", flat: "Sin cambio", mixed: "Cambia de dirección", insufficient: "Faltan datos para comparar" };
const followUp = { exits: "Revisar incorporación, turnos y motivos de salida reportados.", vacancies: "Distinguir plazas por expansión, reemplazo y búsquedas pendientes.", absences: "Identificar recurrencias por turno y motivo de ausencia." };

function Trend({ row }: { row: Trajectory }) {
  const valid = row.points.every(p => p.value !== null) && row.points.length > 0;
  if (!valid) return <div className="my-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">No se dibuja una tendencia con datos incompletos o una muestra insuficiente.</div>;
  const max = Math.max(1, ...row.points.map(p => p.value!)) * 1.25;
  const x = (i: number) => 28 + i * 132;
  const y = (v: number) => 100 - v / max * 75;
  return <div className="my-5">
    <svg viewBox="0 0 320 126" className="w-full" role="img" aria-label={`${row.label}: ${row.points.map(p => `${p.period}: ${format(p.value)} por 100`).join(", ")}. Misma base de ${row.n} empresas.`}>
      <line x1="28" x2="292" y1="100" y2="100" stroke="#cbd5e1" />
      <text x="8" y="103" fill="#64748b" fontSize="10">0</text>
      <polyline points={row.points.map((p, i) => `${x(i)},${y(p.value!)}`).join(" ")} fill="none" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
      {row.points.map((p, i) => <g key={p.period}><circle cx={x(i)} cy={y(p.value!)} r="5" fill="#0e7490" stroke="white" strokeWidth="2"/><text x={x(i)} y={y(p.value!)-12} textAnchor="middle" fill="#0b2140" fontSize="13" fontWeight="700">{format(p.value)}</text><text x={x(i)} y="121" textAnchor="middle" fill="#64748b" fontSize="10">{p.period}</text></g>)}
    </svg>
  </div>;
}

export default function AgendaPage() {
  const { company, companyLabel, period, isMarket, setCompany } = useFilters();
  const [excludeFlagged, setExcludeFlagged] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const rows = useMemo(() => consultingTrajectories(period, company, excludeFlagged), [period, company, excludeFlagged]);
  const plan = useMemo(() => scopedRecoveryPlan(period, company), [period, company]);
  const persistent = rows.filter(r => r.direction === "rising" || r.direction === "falling");
  const ready = rows.filter(r => r.direction !== "insufficient");
  const firstRequest = plan.requests.find(r => r.unlocks.length > 0);
  const title = !ready.length ? "Información insuficiente para evaluar tendencias." : persistent.length ? `${persistent.length} de 3 indicadores suben o bajan dos veces seguidas.` : "Sin una tendencia sostenida en los indicadores disponibles.";
  const download = () => {
    const url = URL.createObjectURL(new Blob([recoveryCsv(period, plan)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `catch-solicitud-datos-${period.replaceAll(" ", "-")}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <DashboardFrame>
    <PageHeader eyebrow="Catch · Mide / Analiza / Mejora" title="Agenda de consultoría" description="Tendencias, prioridades de seguimiento e información pendiente del bimestre seleccionado." scopeMode="active"/>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print-hidden"><nav aria-label="Secciones de la agenda" className="flex flex-wrap gap-2 text-xs font-bold"><a className="filter-chip" href="#lectura">01 · Resumen</a><a className="filter-chip" href="#persistencia">02 · Tendencias</a><a className="filter-chip" href="#recuperacion">03 · Información pendiente</a></nav><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold"><Printer size={16}/> Imprimir agenda</button></div>

    <section id="lectura" className="agenda-hero scroll-mt-36 p-5 md:p-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200"><ScanLine size={17}/> Resumen del bimestre</div>
      <h2 className="mt-3 max-w-4xl text-2xl font-black leading-snug text-white">{title}</h2>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-200">{ready.length ? "Comparación de los últimos tres bimestres, con las mismas empresas por indicador." : "Se requieren tres bimestres con información suficiente de las mismas empresas."} Dos cambios consecutivos no demuestran una causa ni predicen el siguiente periodo.</p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-cyan-100"><span><strong>{ready.length} / 3</strong> indicadores comparables</span><a href="#recuperacion" className="underline underline-offset-4"><strong>{plan.requests.length}</strong> empresas con información pendiente</a></div>
    </section>

    <section id="persistencia" className="mt-8 scroll-mt-36">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow">02 · Tendencias</div><h2 className="mt-2 text-2xl font-black">Evolución en tres bimestres</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Cada indicador conserva el mismo grupo de empresas en los tres bimestres.</p></div><label className="flex max-w-sm items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950 print-hidden"><input type="checkbox" checked={excludeFlagged} onChange={e => setExcludeFlagged(e.target.checked)} className="mt-1 accent-cyan-700"/>Probar sin empresas con saltos de plantilla por confirmar en estos bimestres</label></div>
      <div className="grid gap-4 xl:grid-cols-3">{rows.map(row => <article key={row.key} className="panel flex flex-col p-5 md:p-6">
        <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-black">{row.label}</h3><TrendingUp size={20} className="text-cyan-700"/></div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{row.unit}</p>
        <span className={`mt-4 w-fit rounded-full px-3 py-1.5 text-xs font-bold ${row.direction === "insufficient" ? "bg-slate-100 text-slate-600" : row.direction === "rising" ? "bg-amber-50 text-amber-900" : "bg-cyan-50 text-cyan-900"}`}>{labels[row.direction]}</span>
        <Trend row={row}/>
        <p className="text-xs leading-6 text-slate-600"><strong className="text-slate-900">{row.n} {isMarket ? "empresas" : "empresa"}</strong> con datos en los tres bimestres{row.delta !== null ? ` · cambio total: ${row.delta > 0 ? "+" : ""}${format(row.delta, 2)} por cada 100 personas.` : "."}</p>
        {row.flagged.length > 0 && <p className="mt-2 text-xs leading-5 text-amber-800">{row.excludeFlagged ? "Se omiten" : "Por confirmar"}: {row.flagged.join(", ")}.</p>}
        <details className="mt-4 border-t border-slate-100 pt-4 text-xs"><summary className="cursor-pointer font-bold text-cyan-800">Seguimiento sugerido</summary><p className="mt-2 text-sm leading-6 text-slate-600">{followUp[row.key]}</p></details>
        <details className="mt-4 text-xs leading-6 text-slate-600"><summary className="cursor-pointer font-bold">Ver base y cálculo</summary><p className="mt-2">Sumamos los eventos y los dividimos entre la plantilla completa al cierre de las mismas empresas; multiplicamos por 100. Los eventos pueden superar el número de personas. Fuente: {row.source}.</p><ul className="mt-2 list-disc pl-4">{row.points.map(p => <li key={p.period}>{p.period}: {format(p.numerator, 0)} / {format(p.denominator, 0)} · {p.availableN} respuestas válidas antes de fijar el grupo.</li>)}</ul><p className="mt-2">Mínimo: {isMarket ? "cinco empresas" : "una empresa"}. Cada indicador puede tener una base distinta. Sin rellenar faltantes ni usar cortes posteriores.</p></details>
        <Link href={row.href} className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-bold text-cyan-900">Abrir {row.label.toLowerCase()} <ArrowUpRight size={15}/></Link>
      </article>)}</div>
    </section>

    <section id="recuperacion" className="mt-8 scroll-mt-36">
      <div className="flex flex-wrap items-end justify-between gap-4"><div className="max-w-2xl"><div className="eyebrow">03 · Cobertura</div><h2 className="mt-2 text-2xl font-black">Información pendiente</h2><p className="mt-2 text-sm leading-6 text-slate-600">Solicitudes priorizadas según los análisis que permitirían completar.</p></div><button onClick={download} disabled={!plan.requests.length} className="inline-flex items-center gap-2 rounded-xl bg-[#0b2140] px-4 py-3 text-xs font-bold text-white disabled:opacity-40 print-hidden"><Download size={16}/> Descargar solicitud CSV</button></div>
      <details className="panel mt-5 overflow-hidden">
        <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-cyan-900">Cobertura y solicitudes por empresa · {plan.requests.length} pendientes</summary>
        <div className="border-t border-slate-100 px-5 pb-5">
        {firstRequest && <p className="mt-4 text-sm leading-6 text-slate-600">Prioridad inicial: <strong>{firstRequest.company}</strong>. {firstRequest.fields.length} datos pendientes permitirían completar {firstRequest.unlocks.length} análisis si se confirman con valores válidos.</p>}
      <div className="my-5 grid gap-3 md:grid-cols-3">{(Object.keys(trajectoryMetrics) as Array<keyof typeof trajectoryMetrics>).map(key => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm font-bold">{trajectoryMetrics[key].label} / plantilla</div><div className="mt-3 flex items-baseline gap-2"><strong className="text-3xl">{plan.coverage[key]}</strong><span className="text-xs text-slate-500">de {plan.total} empresas hoy</span><span className="ml-auto rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-900">+{plan.potential[key]} posibles</span></div><div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="bg-cyan-700" style={{ width: `${plan.total ? plan.coverage[key] / plan.total * 100 : 0}%` }}/><div className="bg-cyan-200" style={{ width: `${plan.total ? plan.potential[key] / plan.total * 100 : 0}%` }}/></div></div>)}</div>
      <p className="mb-4 text-xs leading-6 text-slate-600">Los análisis que se podrían completar corresponden al bimestre {period}, seleccionado. Depende de recuperar todos los campos indicados con valores válidos y plantilla positiva. Más respuestas no aseguran que el grupo represente a todas las empresas.</p>
      <div className="panel overflow-hidden">{!plan.requests.length ? <div className="flex items-start gap-3 p-6 text-sm leading-7 text-slate-600"><Check size={22} className="shrink-0 text-cyan-700"/>Los campos requeridos por estos tres análisis están completos. Puedes revisar las demás comprobaciones en Calidad de información.</div> : <>
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><caption className="sr-only">Solicitud priorizada de datos faltantes para {companyLabel}, {period}</caption><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-4">Prioridad / empresa</th><th className="px-5 py-4">Solicitar</th><th className="px-5 py-4">Permitiría completar</th><th className="px-5 py-4 print-hidden">Detalle</th></tr></thead><tbody>{(showAll ? plan.requests : plan.requests.slice(0, 5)).map((request, i) => <tr key={request.company} className="border-t border-slate-100"><th scope="row" className="px-5 py-5"><span className="mb-2 block text-xs font-normal text-slate-400">{String(i+1).padStart(2, "0")}</span>{request.company}</th><td className="max-w-sm px-5 py-5 text-xs leading-6 text-slate-600">{request.fields.length ? request.fields.map(f => f.label).join(" · ") : "Revisar valores existentes"}<span className="mt-1 block text-slate-400">{request.fields.map(f => f.column).join(", ")}</span></td><td className="px-5 py-5"><div className="flex flex-wrap gap-2">{request.unlocks.map(key => <span key={key} className="rounded-lg bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-900">{trajectoryMetrics[key].label}</span>)}</div>{request.blocked.length > 0 && <p className="mt-2 text-xs leading-5 text-amber-800">Requiere confirmar valores existentes: {request.blocked.map(k => trajectoryMetrics[k].label).join(", ")}.</p>}</td><td className="px-5 py-5 print-hidden"><Link href="/data-quality" onClick={() => setCompany(request.company)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-cyan-900">Revisar <ArrowRight size={13}/></Link></td></tr>)}</tbody></table></div>
        {plan.requests.length > 5 && <button onClick={() => setShowAll(!showAll)} className="w-full border-t border-slate-100 p-4 text-xs font-bold text-cyan-900 print-hidden">{showAll ? "Mostrar las primeras cinco" : `Ver las ${plan.requests.length} solicitudes`}</button>}
      </>}</div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Orden: más análisis completables por empresa; en caso de empate, menos campos pendientes.</p>
        </div>
      </details>
    </section>
    <section className="mt-6 grid gap-4 md:grid-cols-2"><Link href="/decisiones#bitacora" className="agenda-next"><ListChecks size={23}/><div><h2 className="font-bold">Registro de seguimiento</h2><p className="mt-1 text-xs leading-6 text-slate-600">Registra responsable y fecha en la bitácora del estudio.</p></div><ArrowRight className="ml-auto shrink-0" size={18}/></Link><Link href="/reportes" className="agenda-next"><FileCheck2 size={23}/><div><h2 className="font-bold">Reporte bimestral</h2><p className="mt-1 text-xs leading-6 text-slate-600">Consulta compensación, contratación y relaciones laborales.</p></div><ArrowRight className="ml-auto shrink-0" size={18}/></Link></section>
  </DashboardFrame>;
}
