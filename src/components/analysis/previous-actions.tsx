"use client";
import { useEffect, useState } from "react";

type Action = { id: string; title: string; company: string; period: string; evidence?: string; owner?: string; due?: string; goal?: string; result?: string; status: string; [key: string]: unknown };
const key = "catch.actions.v1";

/** Keep the previous hosted edition's local records usable, without rewriting their evidence. */
export function PreviousActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { try { const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "[]"); if (Array.isArray(saved)) setActions(saved.filter((a): a is Action => a && typeof a.id === "string" && typeof a.title === "string" && typeof a.company === "string" && typeof a.period === "string" && ["planned", "active", "done", "archived"].includes(a.status))); } catch { setMessage("No se pudo leer el seguimiento guardado de la edición anterior."); } }, []);
  if (!actions.length && !message) return null;
  const save = (event: React.FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fields = Object.fromEntries(["owner", "due", "goal", "result", "status"].map(k => [k, String(form.get(k) ?? "").trim()]));
    if (fields.status === "done" && !fields.result) { setMessage("Añade un resultado observado antes de completar la acción."); return; }
    const next = actions.map(a => a.id === id ? { ...a, ...fields, updatedAt: new Date().toISOString() } : a);
    try { localStorage.setItem(key, JSON.stringify(next)); setActions(next); setMessage("Seguimiento guardado en este navegador."); } catch { setMessage("No se pudo guardar. Exporta una copia antes de salir."); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(actions, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "catch-seguimientos-anteriores.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="panel mt-5 p-5 md:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Tus seguimientos anteriores</h2><button onClick={download} className="filter-chip">Descargar copia</button></div><p className="mt-2 text-sm leading-6 text-slate-600">Conservamos las acciones que guardaste en la edición anterior, con su evidencia original.</p><p role="status" className="mt-3 text-sm text-cyan-800">{message}</p><div className="mt-4 grid gap-4 lg:grid-cols-2">{actions.map(action => <form key={action.id} onSubmit={e => save(e, action.id)} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold text-cyan-900">{action.company} · {action.period}</p><h3 className="mt-2 font-bold">{action.title}</h3><details className="mt-3 text-xs leading-6 text-slate-600"><summary className="cursor-pointer">Evidencia guardada</summary>{String(action.evidence ?? "")}</details><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">Responsable<input name="owner" defaultValue={String(action.owner ?? "")} maxLength={200} className="mt-2 w-full rounded-lg border p-2"/></label><label className="text-xs font-bold">Fecha<input type="date" name="due" defaultValue={String(action.due ?? "")} className="mt-2 w-full rounded-lg border p-2"/></label></div><label className="mt-3 block text-xs font-bold">Acción y criterio de éxito<textarea name="goal" maxLength={1000} defaultValue={String(action.goal ?? "")} className="mt-2 w-full rounded-lg border p-2 font-normal"/></label><label className="mt-3 block text-xs font-bold">Resultado observado<textarea name="result" maxLength={1000} defaultValue={String(action.result ?? "")} className="mt-2 w-full rounded-lg border p-2 font-normal"/></label><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><select name="status" aria-label={`Estado de ${action.title}`} defaultValue={action.status} className="rounded-lg border p-2 text-xs"><option value="planned">Por hacer</option><option value="active">En curso</option><option value="done">Completada</option><option value="archived">Archivada</option></select><button className="rounded-lg bg-[#0b2140] px-3 py-2 text-xs font-bold text-white">Guardar seguimiento</button></div></form>)}</div></section>;
}
