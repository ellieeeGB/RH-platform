import Link from "next/link";
import { Bell, ChevronDown, Command, Search, Sparkles } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f7f9fc]/88 backdrop-blur-2xl">
      <div className="flex min-h-[72px] items-center gap-3 px-5 md:px-7">
        <div className="hidden min-w-0 flex-1 items-center gap-3 xl:flex">
          <div className="flex min-w-[260px] items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <span className="truncate text-xs text-slate-400">Busca “rotación”, “salarios”, “vacantes”…</span>
            <span className="ml-auto flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400"><Command size={11} />K</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-[11px] font-semibold text-slate-400">Intelligence Workspace</div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm md:flex">
            <span className="h-2 w-2 rounded-full bg-cyan-500" /> Jul–Ago 2025 <ChevronDown size={13} className="text-slate-400" />
          </button>
          <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm lg:flex">
            Benchmark · 40 empresas <ChevronDown size={13} className="text-slate-400" />
          </button>
          <Link href="/copilot" className="hidden items-center gap-2 rounded-xl bg-[#0b2140] px-3.5 py-2.5 text-xs font-black text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 md:flex">
            <Sparkles size={14} className="text-cyan-300" /> Preguntar a Catch AI
          </Link>
          <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 shadow-sm">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 text-[10px] font-black text-white">CC</div>
            <ChevronDown size={13} className="text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
