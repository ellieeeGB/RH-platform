import { Bell, ChevronDown, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl md:px-8">
      <div className="hidden items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5 md:flex">
        <Search size={17} className="text-slate-400" />
        <span className="text-sm text-slate-400">Buscar métrica, puesto o insight…</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600">
          <Bell size={17} />
        </button>
        <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">AI</div>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-bold text-slate-900">American Industries</div>
            <div className="text-[11px] text-slate-400">Administrador RH</div>
          </div>
          <ChevronDown size={15} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}
