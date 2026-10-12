"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";

function CatchMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_rgba(0,0,0,.2)] ring-1 ring-white/20">
      <img
        src="https://www.catchconsulting.com.mx/assets/iconos/logo-cc-moneda.png"
        alt="Catch Consulting"
        className="h-[115%] w-[115%] object-cover"
      />
    </div>
  );
}

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const groups = navigation.map(group => ({...group, items: group.items.filter(item => normalize(item.label).includes(normalize(query.trim())))})).filter(group => group.items.length);

  return (
    <aside aria-label="Navegación principal" className={mobile ? "flex h-full w-full flex-col bg-[#061529] text-white" : "hidden h-screen w-[278px] shrink-0 border-r border-white/10 bg-[#061529] text-white lg:sticky lg:top-0 lg:flex lg:flex-col"}>
      <div className="relative border-b border-white/10 px-5 py-5">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <CatchMark />
          <div>
            <div className="text-[15px] font-black tracking-tight">Catch Consulting</div>
            <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">HR Toolkit</div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">Estudio RH</div>
            <div className="mt-1 text-xs font-black text-white">40 empresas · 7 bimestres</div>
          </div>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,.65)]" />
        </div>
      </div>

      <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
        <Search size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
        <input type="search" aria-label="Buscar sección" placeholder="Buscar sección…" value={query} onChange={event=>setQuery(event.target.value)} className="min-w-0 w-full bg-transparent text-sm text-white placeholder:text-slate-400" />
        {query && <button type="button" aria-label="Limpiar búsqueda" onClick={()=>setQuery("")} className="rounded p-1 text-slate-300"><X size={14}/></button>}
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
        {groups.length === 0 && <p role="status" className="px-3 text-sm text-slate-300">No hay secciones con ese nombre.</p>}
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href ? pathname === item.href : false;
                const className = `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[12.5px] font-semibold transition duration-200 ${
                  active
                    ? "bg-white/[0.11] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                    : "text-slate-300 hover:bg-white/[0.055] hover:text-white"
                }`;

                return (
                  <Link key={item.label} href={item.href ?? "#"} onClick={onNavigate} aria-current={active ? "page" : undefined} className={className}>
                    {active && <span className="absolute left-0 h-5 w-0.5 rounded-full bg-cyan-300" />}
                    <Icon size={16} strokeWidth={1.8} className={active ? "text-cyan-300" : "text-slate-500 group-hover:text-cyan-300"} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-3 text-[10px] leading-4 text-slate-500">
        Catch Consulting · Información bimestral de RH
      </div>
    </aside>
  );
}
