"use client";
import { normalizePathname } from "@/lib/route-path";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, Sparkles, Menu } from "lucide-react";
import { useFilters } from "@/components/filter-context";
import { FilterPicker } from "./filter-picker";
import { ReadingHelp } from "./reading-help";
import { navigation } from "@/lib/navigation";

import { MONTH_PERIODS } from "@/lib/company-detail";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = normalizePathname(usePathname());
  const currentSection = navigation.flatMap(group => group.items).find(item => item.href === pathname)?.label ?? "People Intelligence";
  const hasFilters = !["/data-atlas", "/what-if"].includes(pathname);
  const { month, setMonth } = useFilters();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f7f9fc]/92 backdrop-blur-2xl">
      <div className="flex min-h-[72px] flex-wrap items-center gap-3 px-5 py-2 md:px-7">
        <button type="button" aria-label="Abrir navegación" aria-controls="mobile-navigation" onClick={onOpenMenu} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 lg:hidden"><Menu size={21} /></button>
        <div className="min-w-0 flex-1 basis-40">
          <div className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-700">Catch Consulting</div>
          <div className="mt-0.5 text-sm font-black text-[#07182d]">{currentSection}</div>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {hasFilters && <>
          <FilterPicker />
          {pathname === "/retencion" && <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"><span className="text-xs text-slate-500">Mes</span><select aria-label="Filtrar por mes" value={month} onChange={e=>setMonth(e.target.value)} className="max-w-[155px] bg-transparent text-xs font-bold text-slate-800"><option value="all">Bimestre completo</option>{MONTH_PERIODS.map(p=><optgroup key={p.id} label={p.label}>{p.months.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</optgroup>)}</select></label>}
          </>}
          {!hasFilters && <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">{pathname === "/data-atlas" ? "Cobertura del estudio" : "Vista de mercado · Jul–Ago 25"}</span>}
          {pathname !== "/comparar" && <Link href="/comparar" className="flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2.5 text-xs font-bold text-cyan-900"><GitCompareArrows size={15}/> Comparar</Link>}
          <ReadingHelp />
          <Link href="/copilot" className="hidden items-center gap-2 rounded-xl bg-[#0b2140] px-3.5 py-2.5 text-xs font-black text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 md:flex">
            <Sparkles size={14} className="text-cyan-300" /> Asistente
          </Link>
        </div>
      </div>
    </header>
  );
}
