"use client";

import Link from "next/link";
import { CalendarDays, Search, Sparkles, Building2 } from "lucide-react";
import { useFilters } from "@/components/filter-context";
import { MARKET_SCOPE } from "@/lib/company-panel";

export function Topbar() {
  const { period, company, periods, companies, setPeriod, setCompany } = useFilters();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f7f9fc]/92 backdrop-blur-2xl">
      <div className="flex min-h-[72px] flex-wrap items-center gap-2 px-5 py-2 md:px-7">
        <div className="hidden min-w-0 flex-1 items-center gap-3 xl:flex">
          <div className="flex min-w-[260px] items-center gap-2 rounded-xl border border-slate-200/80 bg-white/85 px-3.5 py-2.5 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <span className="truncate text-xs text-slate-400">Buscar tema, indicador o módulo…</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400">HR Toolkit · Catch Consulting</div>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <CalendarDays size={14} className="text-cyan-600" />
            <span className="hidden text-[10px] font-black uppercase tracking-wide text-slate-400 sm:inline">Periodo</span>
            <select
              aria-label="Filtrar por periodo"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="cursor-pointer bg-transparent text-xs font-bold text-slate-800 outline-none"
            >
              {periods.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Building2 size={14} className="text-violet-600" />
            <span className="hidden text-[10px] font-black uppercase tracking-wide text-slate-400 sm:inline">Empresa</span>
            <select
              aria-label="Filtrar por empresa"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="max-w-[190px] cursor-pointer bg-transparent text-xs font-bold text-slate-800 outline-none"
            >
              <option value={MARKET_SCOPE}>Mercado completo</option>
              {companies.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <Link href="/copilot" className="hidden items-center gap-2 rounded-xl bg-[#0b2140] px-3.5 py-2.5 text-xs font-black text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 md:flex">
            <Sparkles size={14} className="text-cyan-300" /> Catch AI
          </Link>
        </div>
      </div>
    </header>
  );
}
