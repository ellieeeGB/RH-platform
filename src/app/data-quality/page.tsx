"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, Database } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/layout/dashboard-frame";
import { useFilters } from "@/components/filters/filter-context";
import { qualityReport } from "@/lib/data-quality";
import manifest from "../../../data/processed/pipeline-manifest.json";

export default function DataQualityPage() {
  const {period, company} = useFilters();
  const report = qualityReport(period, company);
  const [view,setView] = useState("review");
  const checks = report.checks.filter(c => view === "all" || c.state === view);
  return <DashboardFrame>
    <PageHeader eyebrow="Evidencia verificable" title="Calidad y alcance de la información" description="Distingue lo que concilia, lo que falta y lo que requiere confirmación. Las comprobaciones cambian con el periodo y la empresa seleccionados." scopeMode="active"/>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      {label:"Comprobaciones consistentes",value:report.pass,note:"Dentro de las reglas evaluadas",Icon:CheckCircle2,color:"text-cyan-700"},
      {label:"Requieren revisión",value:report.review,note:"Diferencias o valores fuera de rango",Icon:AlertTriangle,color:"text-rose-700"},
      {label:"Sin datos para evaluar",value:report.missing,note:"No se consideran aprobadas ni fallidas",Icon:CircleDashed,color:"text-amber-700"},
      {label:"Empresas del corte",value:report.companies,note:`8 comprobaciones por empresa · ${period}`,Icon:Database,color:"text-slate-800"},
    ].map(c=><article key={c.label} className="panel p-5"><c.Icon size={21} className={c.color}/><div className="mt-4 text-xs font-bold text-slate-500">{c.label}</div><div className={`mt-2 text-4xl font-black ${c.color}`}>{c.value}</div><p className="mt-3 text-xs leading-5 text-slate-500">{c.note}</p></article>)}</section>
    {report.anomalies.length>0&&<section className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5"><h2 className="font-black text-rose-950">Un salto histórico necesita confirmación</h2>{report.anomalies.map(a=><p key={a.company} className="mt-2 text-sm leading-6 text-rose-900">{a.company}: {a.reported.toLocaleString("es-MX")} personas reportadas; mediana de cortes anteriores completos: {a.baseline.toLocaleString("es-MX")}. La diferencia supera el umbral de revisión (más de 3× o menos de 0.33×). Se requieren al menos tres cortes previos. No demuestra que el dato sea incorrecto y no se reemplaza automáticamente.</p>)}</section>}
    <section className="panel mt-5 overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 p-5 md:p-6"><div><div className="eyebrow">Del indicador a su origen</div><h2 className="mt-2 text-xl font-black text-slate-950">Qué revisar, empresa por empresa</h2></div><label className="text-xs font-bold text-slate-600">Mostrar <select value={view} onChange={e=>setView(e.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-slate-50 p-2"><option value="review">Requiere revisión</option><option value="missing">Faltan datos</option><option value="pass">Consistentes</option><option value="all">Todas</option></select></label></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500"><tr>{["Empresa","Indicador","Columna Excel","Resultado","Criterio"].map(h=><th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody>{checks.map(c=><tr key={`${c.company}-${c.field}`} className="border-b border-slate-100 last:border-0"><th scope="row" className="whitespace-nowrap px-5 py-4 text-xs text-slate-800">{c.company}</th><td className="px-5 py-4 text-slate-700">{c.field}</td><td className="px-5 py-4 font-mono text-xs text-slate-500">{c.source}</td><td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${c.state==="review"?"bg-rose-50 text-rose-800":c.state==="missing"?"bg-amber-50 text-amber-800":"bg-cyan-50 text-cyan-800"}`}>{c.state==="review"?"Revisar":c.state==="missing"?"Sin evaluar":"Consistente"}</span></td><td className="max-w-xs px-5 py-4 text-xs leading-5 text-slate-500">{c.detail}</td></tr>)}</tbody></table>{!checks.length&&<p className="p-6 text-sm text-slate-600">No hay comprobaciones en esta categoría para tu selección.</p>}</div></section>
    <section className="mt-5 grid gap-4 md:grid-cols-3">{[
      ["Un cero también informa","Se conserva el cero explícito. Un campo vacío, N/A o un texto como “menos de 1%” no se convierte en un número exacto."],
      ["Una unidad por pregunta","Rechazo: 0–100. Fuentes de reclutamiento: escala 0–10. Incrementos y aportaciones: fracciones convertidas a porcentaje. No se adivina la unidad por el tamaño del valor."],
      ["Comparaciones con la misma base","Las tasas usan empresas con numerador y denominador completos. Consistencia no significa representatividad ni confianza estadística; la muestra es de empresas participantes."],
    ].map(([title,body])=><article key={title} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-900">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{body}</p></article>)}</section>
    <details className="mt-5 rounded-2xl bg-slate-100 p-5 text-xs leading-6 text-slate-600"><summary className="cursor-pointer font-bold">Trazabilidad de esta edición</summary><p className="mt-3">{manifest.records} registros · {manifest.companies} empresas · {manifest.periods} bimestres. Las extracciones y el detalle de puestos se validan juntos antes de sustituir la edición anterior.</p><p className="break-all">Huella del Excel: {manifest.sourceSha256}</p><p>Estas ocho comprobaciones cubren los campos principales del panel; no certifican todas las respuestas del cuestionario.</p></details>
  </DashboardFrame>;
}
