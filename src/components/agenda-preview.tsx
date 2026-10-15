"use client";
import Link from "next/link";
import { ArrowUpRight, ListChecks } from "lucide-react";
import { useFilters } from "./filter-context";
import { consultingTrajectories, scopedRecoveryPlan } from "@/lib/consulting-agenda";

export function AgendaPreview() {
  const { period, company } = useFilters();
  const rows = consultingTrajectories(period, company);
  const repeated = rows.filter(r => r.direction === "rising" || r.direction === "falling");
  const comparable = rows.some(r => r.direction !== "insufficient");
  const plan = scopedRecoveryPlan(period, company);
  const pending = plan.requests.filter(r => r.unlocks.length).length;
  return <Link href="/agenda" className="agenda-preview mt-5 grid gap-5 p-5 md:p-6 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center"><div><div className="flex items-center gap-2 text-xs font-bold text-cyan-800"><ListChecks size={17}/> Agenda de consultoría</div><h2 className="mt-2 text-xl font-black">Prioridades de seguimiento</h2></div><div className="grid grid-cols-2 gap-4 text-sm"><div><strong className="block text-2xl">{comparable ? repeated.length : "—"}<span className="text-sm font-medium text-slate-500"> / 3</span></strong><span className="mt-1 block text-xs leading-5 text-slate-600">{comparable ? "indicadores con dos cambios consecutivos en el mismo sentido" : "faltan tres bimestres con datos suficientes de las mismas empresas"}</span></div><div><strong className="block text-2xl">{pending}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">empresas con datos pendientes para completar el análisis</span></div></div><span className="inline-flex items-center gap-2 text-xs font-bold text-cyan-900">Ver agenda <ArrowUpRight size={17}/></span></Link>;
}
