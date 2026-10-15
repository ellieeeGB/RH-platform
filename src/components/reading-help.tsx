"use client";
import { useRef, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { READING_TERMS } from "@/lib/executive-reading";

export function ReadingHelp() {
  const dialog=useRef<HTMLDialogElement>(null);
  const [query,setQuery]=useState("");
  const normalize=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const terms=READING_TERMS.filter(t=>normalize(`${t.term} ${t.meaning}`).includes(normalize(query)));
  return <>
    <button type="button" onClick={()=>{setQuery("");dialog.current?.showModal();}} aria-haspopup="dialog" aria-controls="reading-help" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700"><BookOpen size={15}/><span>Guía de indicadores</span></button>
    <dialog ref={dialog} id="reading-help" aria-labelledby="reading-help-title" className="scope-picker !max-w-2xl" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}>
      <div className="p-5 md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Guía de lectura</p><h2 id="reading-help-title" className="mt-1 text-2xl font-black">Conceptos y criterios de lectura</h2><p className="mt-2 text-sm leading-6 text-slate-500">Definiciones, unidades y alcance de los indicadores.</p></div><button type="button" aria-label="Cerrar guía de lectura" onClick={()=>dialog.current?.close()} className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button></div>
      <label className="my-5 flex items-center gap-2 rounded-xl border border-slate-200 p-3"><Search size={16} className="text-cyan-700"/><input autoFocus type="search" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Buscar un término" placeholder="Por ejemplo: mediana, bajas, TTF…" className="min-w-0 flex-1 text-sm"/></label>
      <dl className="space-y-4">{terms.map(t=><div key={t.term} className="rounded-xl bg-slate-50 p-4"><dt className="text-sm font-bold">{t.term}</dt><dd className="mt-2 text-sm leading-6 text-slate-600">{t.meaning}</dd></div>)}</dl>{!terms.length&&<p role="status" className="py-8 text-sm text-slate-500">No encontramos ese término. Prueba con otra palabra.</p>}
      </div>
    </dialog>
  </>;
}
