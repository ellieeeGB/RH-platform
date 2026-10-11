"use client";

import { Building2, CalendarDays } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useFilters } from "@/components/filter-context";
import { PERIODS } from "@/lib/company-panel";

export function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] lg:flex">
      <Sidebar />
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute left-[35%] top-[38%] h-80 w-80 rounded-full bg-violet-300/10 blur-3xl" />
        <Topbar />
        <main className="relative mx-auto max-w-[1540px] p-5 md:p-7 xl:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  scopeMode = "marketLatest",
}: {
  eyebrow: string;
  title: string;
  description: string;
  scopeMode?: "active" | "marketLatest" | "none";
}) {
  const { period, companyLabel, isMarket } = useFilters();
  const latestPeriod = PERIODS.at(-1) ?? "Último corte";

  return (
    <section className="mb-8 animate-reveal">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="mb-3 mt-2 text-3xl font-black tracking-[-0.035em] text-[#0b2140] md:text-[2.65rem] md:leading-[1.05]">{title}</h1>
          <p className="m-0 max-w-3xl text-sm leading-6 text-slate-500 md:text-[15px]">{description}</p>
        </div>
        {scopeMode !== "none" && (
          <div className="flex flex-wrap gap-2">
            <div className="filter-chip"><CalendarDays size={14} /> {scopeMode === "active" ? period : latestPeriod}</div>
            <div className="filter-chip"><Building2 size={14} /> {scopeMode === "active" ? (isMarket ? "Mercado · 40 empresas" : companyLabel) : "Mercado · 40 empresas"}</div>
          </div>
        )}
      </div>
    </section>
  );
}
