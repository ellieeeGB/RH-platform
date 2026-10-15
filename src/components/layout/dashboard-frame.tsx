"use client";
import { normalizePathname } from "@/lib/route-path";

import { useEffect, useRef } from "react";
import { Building2, CalendarDays, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useFilters } from "@/components/filters/filter-context";
import { PERIODS } from "@/lib/company-panel";

const ACTIVE_FILTER_ROUTES = new Set(["/copilot", "/signals", "/data-quality", "/benchmark","/contexto", "/salarios", "/indicadores", "/retencion", "/workforce-planning", "/beneficios", "/talent-acquisition", "/relaciones-laborales", "/labor-risk", "/tabulador"]);

export function DashboardFrame({ children }: { children: React.ReactNode }) {
  const menu = useRef<HTMLDialogElement>(null);
  const pathname = normalizePathname(usePathname());
  const { month, monthLabel, period } = useFilters();
  useEffect(() => {
    let closed: HTMLDetailsElement[] = [];
    const expandForPrint = () => {
      closed = Array.from(document.querySelectorAll<HTMLDetailsElement>("main details:not([open])"));
      closed.forEach(detail => { detail.open = true; });
    };
    const restoreAfterPrint = () => { closed.forEach(detail => { detail.open = false; }); closed = []; };
    window.addEventListener("beforeprint", expandForPrint);
    window.addEventListener("afterprint", restoreAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", expandForPrint);
      window.removeEventListener("afterprint", restoreAfterPrint);
    };
  }, []);
  return (
    <div className="dashboard-shell min-h-screen lg:flex">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <Sidebar />
      <dialog ref={menu} id="mobile-navigation" aria-label="Navegación" className="mobile-navigation" onClick={e=>{if(e.target===e.currentTarget)menu.current?.close();}}><div className="relative h-full"><button type="button" aria-label="Cerrar navegación" autoFocus onClick={()=>menu.current?.close()} className="absolute right-2 top-2 z-10 rounded-lg bg-slate-800 p-2 text-white"><X size={18}/></button><Sidebar mobile onNavigate={()=>menu.current?.close()}/></div></dialog>
      <div className="relative min-w-0 flex-1 overflow-clip">
        <Topbar onOpenMenu={()=>menu.current?.showModal()} />
        <main id="main-content" tabIndex={-1} className="relative mx-auto max-w-[1540px] p-5 md:p-7 xl:p-8">{pathname === "/retencion" && month!=="all" && <p className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-xs leading-5 text-cyan-950">Consulta de bajas: <strong>{monthLabel}</strong>. El resto de los indicadores corresponde al bimestre {period}. El desglose mensual solo se muestra cuando está confirmado en la fuente.</p>}{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  scopeMode,
}: {
  eyebrow: string;
  title: string;
  description: string;
  scopeMode?: "active" | "marketLatest" | "none";
}) {
  const pathname = normalizePathname(usePathname());
  const { period, companyLabel, isMarket } = useFilters();
  const latestPeriod = PERIODS.at(-1) ?? "Último corte";
  const effectiveScopeMode = scopeMode ?? (pathname === "/data-atlas" ? "none" : pathname === "/decisiones" || ACTIVE_FILTER_ROUTES.has(pathname) ? "active" : "marketLatest");

  return (
    <section className="page-heading mb-8 animate-reveal">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="mb-3 mt-2 text-3xl font-black tracking-[-0.035em] text-[#0b2140] md:text-[2.65rem] md:leading-[1.05]">{title}</h1>
          <p className="m-0 max-w-3xl text-sm leading-6 text-slate-500 md:text-[15px]">{description}</p>
        </div>
        {effectiveScopeMode !== "none" && (
          <div className="flex flex-wrap gap-2">
            <div className="filter-chip"><CalendarDays size={14} /> {effectiveScopeMode === "active" ? period : latestPeriod}</div>
            <div className="filter-chip"><Building2 size={14} /> {effectiveScopeMode === "active" ? (isMarket ? "Mercado · 40 empresas" : companyLabel) : "Mercado · 40 empresas"}</div>
          </div>
        )}
      </div>
    </section>
  );
}
