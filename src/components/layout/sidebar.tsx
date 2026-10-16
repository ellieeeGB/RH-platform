"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { normalizePathname } from "@/lib/route-path";

function CatchMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-white/20">
      <img
        src="https://www.catchconsulting.com.mx/assets/iconos/logo-cc-moneda.png"
        alt="Catch Consulting"
        className="h-[115%] w-[115%] object-cover"
      />
    </div>
  );
}

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = normalizePathname(usePathname());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setCollapsed(Object.fromEntries(navigation.map(group => [group.label, !group.items.some(item => item.href === pathname)])));
  }, [pathname]);
  const [query, setQuery] = useState("");
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const groups = navigation.map(group => ({...group, items: group.items.filter(item => normalize(item.label).includes(normalize(query.trim())))})).filter(group => group.items.length);

  return (
    <aside aria-label="Navegación principal" className={mobile ? "flex h-full w-full flex-col bg-[#f4f2eb] text-[#183641]" : "hidden h-screen w-[254px] shrink-0 border-r border-[#d9dfd9] bg-[#f4f2eb] text-[#183641] lg:sticky lg:top-0 lg:flex lg:flex-col"}>
      <div className="relative border-b border-[#d9dfd9] px-5 py-5">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <CatchMark />
          <div>
            <div className="text-[15px] font-semibold tracking-tight">Catch Consulting</div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#096773]">HR Toolkit</div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-2xl border border-[#d9dfd9] bg-white/60 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#096773]">Estudio RH</div>
            <div className="mt-1 text-xs font-semibold text-[#183641]">40 empresas · 7 bimestres</div>
          </div>
          <div className="h-1.5 w-7 rounded-full bg-cyan-300/70" />
        </div>
      </div>

      <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-[#d2dad6] bg-white/70 px-3 py-2">
        <Search size={15} className="shrink-0 text-[#526773]" aria-hidden="true" />
        <input type="search" aria-label="Buscar sección" placeholder="Buscar sección…" value={query} onChange={event=>setQuery(event.target.value)} className="min-w-0 w-full bg-transparent text-sm text-[#183641] placeholder:text-[#526773]" />
        {!query && <kbd className="text-[12px] text-[#4b626c]" aria-hidden="true">⌘K</kbd>}
        {query && <button type="button" aria-label="Limpiar búsqueda" onClick={()=>setQuery("")} className="rounded p-1 text-[#4b626c]"><X size={14}/></button>}
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
        {groups.length === 0 && <p role="status" className="px-3 text-sm text-[#4b626c]">No hay secciones con ese nombre.</p>}
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <button type="button" className="nav-group-toggle" aria-expanded={!!query || !collapsed[group.label]} aria-controls={`${mobile?"mobile":"desktop"}-${group.label.replaceAll(" ","-")}`} onClick={()=>setCollapsed(state=>({...state,[group.label]:!state[group.label]}))}><span>{group.label}</span><ChevronDown size={14}/></button>
            <div id={`${mobile?"mobile":"desktop"}-${group.label.replaceAll(" ","-")}`} hidden={!query && !!collapsed[group.label]} className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href ? pathname === item.href : false;
                const className = `group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-semibold transition duration-200 ${
                  active
                    ? "bg-cyan-100 text-[#061529] shadow-sm"
                    : "text-[#4b626c] hover:bg-white/60 hover:text-[#183641]"
                }`;

                return (
                  <Link key={item.label} href={item.href ?? "#"} onClick={onNavigate} aria-current={active ? "page" : undefined} className={className}>
                    {active && <span className="absolute left-0 h-5 w-1 rounded-full bg-cyan-600" />}
                    {item.href === "/" || item.href === "/comparar" ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[#096773]">{item.href === "/" ? <><path d="M4 4h7v16H4zM15 4h5v6h-5zM15 14h5M15 18h5"/><path d="M6.5 15v-4M8.5 15V8"/></> : <><path d="M4 5v14M20 5v14M4 8l16 8M4 16l16-8"/><circle cx="4" cy="8" r="2" fill="#f4f2eb"/><circle cx="20" cy="16" r="2" fill="#f4f2eb"/></>}</svg> : <Icon size={18} strokeWidth={active ? 2 : 1.6} className={active ? "text-cyan-900" : "text-[#526773] group-hover:text-[#096773]"} />}
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#d9dfd9] px-5 py-3 text-[12px] leading-4 text-[#526773]">
        Catch Consulting · Información bimestral de RH
      </div>
    </aside>
  );
}
