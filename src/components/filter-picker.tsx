"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CalendarDays, Check, ChevronDown, Search, X } from "lucide-react";
import { useFilters } from "./filter-context";
import { COMPANIES, MARKET_SCOPE, PERIODS } from "@/lib/company-panel";
import { AVAILABLE_MONTHS, COMPARISON_MONTHS, companySelectionLabel, needsComparison, normalizeSelection, selectionCuts, singleSelection, timeSelectionLabel, type ComparisonSelection, type TimeMode } from "@/lib/comparison-selection";

const modes: { id: TimeMode; title: string; subtitle: string }[] = [
  { id: "single", title: "Un bimestre", subtitle: "Consulta un corte" },
  { id: "history", title: "Todo el historial", subtitle: "Los 7 bimestres juntos" },
  { id: "periods", title: "Comparar bimestres", subtitle: "Elige dos o más" },
  { id: "months", title: "Comparar meses", subtitle: "Bajas mensuales" },
];
const toggle = (values: string[], item: string) => values.includes(item) ? values.filter(v => v !== item) : [...values, item];

export function FilterPicker() {
  const { company, period, comparison, setComparison, setCompany, setPeriod } = useFilters();
  const pathname = (usePathname() ?? "").replace(/\/$/, "");
  const router = useRouter();
  const isComparison = pathname === "/comparar";
  const current = isComparison ? comparison : singleSelection(company, period);
  const modal = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ComparisonSelection>(current);
  const [query, setQuery] = useState("");
  const clean = normalizeSelection(draft);
  const searchText=(text:string)=>text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  const visibleCompanies = COMPANIES.filter(c => searchText(c).includes(searchText(query.trim())));
  const open = () => { setDraft(current); setQuery(""); modal.current?.showModal(); };
  function changeMode(timeMode: TimeMode) {
    setDraft(d => ({ ...d, timeMode,
      periods: timeMode === "single" ? [d.periods.at(-1) ?? period] : timeMode === "history" ? [...PERIODS] : d.periods.length >= 2 ? d.periods : PERIODS.slice(Math.max(0, PERIODS.indexOf(period) - 1), Math.max(2, PERIODS.indexOf(period) + 1)),
      months: d.months.length >= 2 ? d.months : AVAILABLE_MONTHS.slice(-2).map(m => m.id),
    }));
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    if (!clean) return;
    setComparison(clean);
    // Detail pages retain a literal single-company/single-period scope.
    // Multiple scopes always open the dedicated comparison, never an implicit market aggregate.
    if (!needsComparison(clean)) {
      setCompany(clean.companies.length === 1 ? clean.companies[0] : MARKET_SCOPE);
      setPeriod(clean.periods[0]);
    }
    modal.current?.close();
    if (!isComparison && needsComparison(clean)) router.push("/comparar");
  }

  return <>
    <button type="button" onClick={open} aria-haspopup="dialog" aria-controls="scope-picker" className="filter-chip !px-3 !py-2" aria-label={`Seleccionar compañías: ${companySelectionLabel(current.companies)}`}><Building2 size={14} className="text-cyan-700"/><span className="max-w-[190px] truncate">{companySelectionLabel(current.companies)}</span><ChevronDown size={13}/></button>
    <button type="button" onClick={open} aria-haspopup="dialog" aria-controls="scope-picker" className="filter-chip !px-3 !py-2" aria-label={`Seleccionar periodos: ${timeSelectionLabel(current)}`}><CalendarDays size={14} className="text-cyan-700"/><span>{timeSelectionLabel(current)}</span><ChevronDown size={13}/></button>
    <dialog ref={modal} id="scope-picker" aria-labelledby="scope-title" className="scope-picker" onClick={e=>{if(e.target===e.currentTarget)modal.current?.close();}}>
      <form onSubmit={apply}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div><p className="eyebrow">Tu selección</p><h2 id="scope-title" className="mt-1 text-xl font-black">¿Qué quieres comparar?</h2><p className="mt-2 text-sm text-slate-500">Una, dos, varias o todas las compañías. Tú eliges.</p></div>
          <button type="button" aria-label="Cerrar filtros" onClick={()=>modal.current?.close()} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button>
        </div>
        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_1.1fr]">
          <fieldset className="min-w-0"><legend className="mb-3 text-sm font-black">1. Compañías <span className="ml-2 rounded-full bg-cyan-50 px-2 py-1 text-xs text-cyan-800">{draft.companies.length} seleccionadas</span></legend>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2"><Search size={16} className="text-slate-400"/><input autoFocus type="search" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Buscar compañía" placeholder="Busca por código…" className="min-w-0 flex-1 bg-transparent text-sm"/></label>
            <div className="my-3 flex flex-wrap gap-3 text-xs font-bold"><button type="button" onClick={()=>setDraft(d=>({...d,companies:[...COMPANIES]}))} className="text-cyan-800 underline underline-offset-4">Todas las compañías</button><button type="button" onClick={()=>setDraft(d=>({...d,companies:[]}))} className="text-slate-500 underline underline-offset-4">Quitar todas</button></div>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 p-1.5">
              {!visibleCompanies.length && <p className="p-3 text-sm text-slate-500">No hay compañías con ese código.</p>}
              {visibleCompanies.map(c=><div key={c} className="flex items-center gap-2 rounded-lg px-2 hover:bg-slate-50"><label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2 text-sm"><input type="checkbox" checked={draft.companies.includes(c)} onChange={()=>setDraft(d=>({...d,companies:toggle(d.companies,c)}))} className="h-4 w-4 accent-cyan-700"/>{c}</label><button type="button" aria-label={`Seleccionar solo ${c}`} onClick={()=>setDraft(d=>({...d,companies:[c]}))} className="rounded-md px-2 py-1 text-xs font-semibold text-cyan-800 hover:bg-cyan-50">Solo esta</button></div>)}
            </div>
          </fieldset>
          <fieldset className="min-w-0"><legend className="mb-3 text-sm font-black">2. Tiempo</legend>
            <div className="grid grid-cols-2 gap-2">{modes.map(m=><label key={m.id} className={`cursor-pointer rounded-xl border p-3 ${draft.timeMode===m.id?"border-cyan-600 bg-cyan-50":"border-slate-200 bg-white"}`}><div className="flex items-center gap-2"><input type="radio" name="time-mode" value={m.id} checked={draft.timeMode===m.id} onChange={()=>changeMode(m.id)} className="accent-cyan-700"/><span className="text-xs font-bold">{m.title}</span></div><span className="mt-1 block pl-5 text-[11px] text-slate-500">{m.subtitle}</span></label>)}</div>
            <div className="mt-4">
              {draft.timeMode==="single" && <label className="block text-xs text-slate-500">Bimestre<select aria-label="Bimestre de consulta" value={draft.periods[0]} onChange={e=>setDraft(d=>({...d,periods:[e.target.value]}))} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800">{PERIODS.map(p=><option key={p}>{p}</option>)}</select></label>}
              {draft.timeMode==="history" && <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">De <strong>{PERIODS[0]}</strong> a <strong>{PERIODS.at(-1)}</strong>. Verás cada bimestre por separado en una misma gráfica y tabla.</p>}
              {draft.timeMode==="periods" && <div className="grid grid-cols-2 gap-2">{PERIODS.map(p=><label key={p} className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-xs"><input type="checkbox" checked={draft.periods.includes(p)} onChange={()=>setDraft(d=>({...d,periods:toggle(d.periods,p)}))} className="accent-cyan-700"/>{p}</label>)}</div>}
              {draft.timeMode==="months" && <><p className="mb-3 text-xs leading-5 text-slate-500">El archivo confirma bajas mensuales en julio–agosto de 2024 y 2025. Los otros meses no tienen un desglose confirmado.</p><div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto">{COMPARISON_MONTHS.map(m=><label key={m.id} className={`flex items-center gap-2 rounded-lg p-2 text-xs ${m.available?"cursor-pointer bg-cyan-50":"bg-slate-50 text-slate-400"}`}><input type="checkbox" disabled={!m.available} checked={draft.months.includes(m.id)} onChange={()=>setDraft(d=>({...d,months:toggle(d.months,m.id)}))} className="accent-cyan-700"/><span>{m.label}{!m.available&&<span className="block text-[10px]">Sin desglose</span>}</span></label>)}</div><button type="button" onClick={()=>setDraft(d=>({...d,months:AVAILABLE_MONTHS.map(m=>m.id)}))} className="mt-3 text-xs font-bold text-cyan-800 underline underline-offset-4">Todos los meses disponibles</button></>}
            </div>
          </fieldset>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7"><p role="status" aria-live="polite" className="max-w-md text-xs leading-5 text-slate-600">{!draft.companies.length?"Selecciona al menos una compañía.":!clean?`Selecciona al menos dos ${draft.timeMode==="months"?"meses disponibles":"bimestres"}.`:`${companySelectionLabel(clean.companies)} · ${timeSelectionLabel(clean)}${selectionCuts(clean).length>1?" · Cada periodo conserva su valor.":""}`}</p><div className="flex gap-2"><button type="button" onClick={()=>modal.current?.close()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold">Cancelar</button><button type="submit" disabled={!clean} className="flex items-center gap-2 rounded-xl bg-[#0b2140] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Check size={15}/>Aplicar selección</button></div></div>
      </form>
    </dialog>
  </>;
}
