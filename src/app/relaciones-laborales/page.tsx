"use client";

import { AlertTriangle, CalendarRange, Gavel, Handshake, ShieldCheck, UsersRound } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { getMarketExtendedStats, getMarketSnapshot, getPeriodSnapshots, getScopeSnapshot } from "@/lib/company-panel";
import { laborRelations } from "@/lib/extended-intelligence";

const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;
const maxMonth = Math.max(...laborRelations.collectiveBargaining.reviewMonths.map((item) => item.companies));
const totalLegalCases = laborRelations.legalExposure.reduce((sum, item) => sum + item.cases, 0);

export default function LaborRelationsPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const stats = getMarketExtendedStats(period);
  const rows = getPeriodSnapshots(period);
  const pending = rows.filter((row) => row.laborRelations.negotiationStatus?.toLowerCase().includes("pendiente")).length;
  const completed = rows.filter((row) => row.laborRelations.negotiationStatus?.toLowerCase().includes("ya tuvimos")).length;
  const relationshipEntries = Object.entries(stats.laborRelations.relationshipCounts).sort((a, b) => b[1] - a[1]);
  const dominantRelationship = relationshipEntries[0] ?? ["Sin dato", 0];

  const cards = isMarket ? [
    { label: "Empresas sindicalizadas", value: pct(stats.laborRelations.unionizationPct), note: `${stats.laborRelations.unionizedCompanies} de 40 empresas`, icon: UsersRound },
    { label: "Relación predominante", value: String(dominantRelationship[0]), note: `${dominantRelationship[1]} empresas con esa valoración`, icon: Handshake },
    { label: "Revisiones pendientes", value: String(pending), note: `${completed} reportan revisión realizada`, icon: CalendarRange },
    { label: "Incremento salarial op.", value: pct(market.laborRelations.grantedSalaryOperationalPct), note: "mediana del bimestre", icon: Gavel },
  ] : [
    { label: "Sindicalizada", value: scope?.laborRelations.unionized == null ? "Sin dato" : scope.laborRelations.unionized ? "Sí" : "No", note: `mercado: ${pct(stats.laborRelations.unionizationPct)}`, icon: UsersRound },
    { label: "Relación sindical", value: scope?.laborRelations.relationship ?? "Sin dato", note: `más común: ${dominantRelationship[0]}`, icon: Handshake },
    { label: "Estado de revisión", value: scope?.laborRelations.negotiationStatus?.replace("Pendiente de realizarlo, aun no llega la fecha", "Pendiente")?.replace("Ya tuvimos la revisión de incrementos salariales del 2026", "Realizada")?.replace("Ya tuvimos la revisión de incrementos salariales del 2025", "Realizada")?.replace("Ya tuvimos la revisión de incrementos salariales del 2024", "Realizada") ?? "Sin dato", note: `${pending} pendientes en mercado`, icon: CalendarRange },
    { label: "Incremento salarial op.", value: pct(scope?.laborRelations.grantedSalaryOperationalPct), note: `mediana mercado: ${pct(market.laborRelations.grantedSalaryOperationalPct)}`, icon: Gavel },
  ];

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Relaciones laborales"
        title="Negociación colectiva y clima sindical"
        description={isMarket
          ? "Sindicalización, relación laboral y resultados de negociación para el periodo seleccionado."
          : `${companyLabel}: situación sindical e incrementos reportados comparados con el mercado del mismo bimestre.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="panel p-5">
            <div className="flex items-center justify-between"><div className="metric-label">{label}</div><Icon size={18} className="text-cyan-700" /></div>
            <div className="mt-3 text-2xl font-black leading-tight text-[#07182d]">{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-500">{note}</div>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Incrementos reportados</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Salario y prestaciones · {period}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Salario operativo", scope?.laborRelations.grantedSalaryOperationalPct, market.laborRelations.grantedSalaryOperationalPct],
              ["Salario administrativo", scope?.laborRelations.grantedSalaryAdministrativePct, market.laborRelations.grantedSalaryAdministrativePct],
              ["Prestaciones operativas", scope?.laborRelations.grantedBenefitsOperationalPct, market.laborRelations.grantedBenefitsOperationalPct],
              ["Prestaciones administrativas", scope?.laborRelations.grantedBenefitsAdministrativePct, market.laborRelations.grantedBenefitsAdministrativePct],
            ].map(([label, value, marketValue]) => (
              <div key={String(label)} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-800">{String(label)}</div>
                <div className="mt-3 text-3xl font-black text-[#07182d]">{pct(value as number | null)}</div>
                {!isMarket && <div className="mt-1 text-[11px] text-slate-500">mediana mercado: {pct(marketValue as number | null)}</div>}
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[28px] bg-[#0a2141] p-6 text-white md:p-7">
          <div className="eyebrow !text-cyan-300">Clima sindical</div>
          <h2 className="mt-2 text-xl font-black">Distribución del mercado · {period}</h2>
          <div className="mt-6 space-y-3">
            {relationshipEntries.length ? relationshipEntries.map(([label, count]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-white/[.06] p-4">
                <span className="text-sm text-slate-300">{label}</span><strong>{count}</strong>
              </div>
            )) : <div className="rounded-2xl bg-white/[.06] p-4 text-sm text-slate-300">Sin respuestas válidas para este periodo.</div>}
          </div>
          <p className="mb-0 mt-5 text-[11px] leading-5 text-slate-400">La valoración de relación es auto-reportada por las empresas participantes. Se usa como contexto operativo, no como conclusión sobre riesgo legal o sindical.</p>
        </article>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="eyebrow">Referencia de mercado</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Calendario y exposición · Jul–Ago 25</h2></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">Último corte agregado</span>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">Los bloques siguientes profundizan en calendario de revisiones, prestaciones negociadas, continuidad y casos reportados del último corte. No cambian con el selector de empresa.</p>

        <div className="mt-5 grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
          <article className="rounded-2xl bg-[#0a2141] p-5 text-white">
            <div className="text-sm font-black">Calendario de revisión</div>
            <div className="mt-5 space-y-3">
              {laborRelations.collectiveBargaining.reviewMonths.map((item) => (
                <div key={item.month} className="grid grid-cols-[70px_1fr_32px] items-center gap-3">
                  <div className="text-xs font-bold text-slate-300">{item.month}</div>
                  <div className="h-6 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-cyan-300/85" style={{ width: `${(item.companies / maxMonth) * 100}%` }} /></div>
                  <div className="text-right text-xs font-black">{item.companies}</div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl bg-slate-50 p-5">
            <div className="text-sm font-black text-slate-900">Prestaciones negociadas</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {laborRelations.collectiveBargaining.benefitsAdjusted.map((item) => (
                <div key={item.benefit} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="text-xs font-black text-slate-900">{item.benefit}</div>
                  <div className="mt-2 text-2xl font-black text-cyan-700">{item.companies}</div>
                  <div className="text-[10px] text-slate-400">empresas reportan ajuste</div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Continuidad · mercado Jul–Ago 25</div>
          <h2 className="mt-1 text-lg font-black text-[#07182d]">Preparación ante eventos laborales y operativos</h2>
          <div className="mt-5 space-y-3">
            {laborRelations.contingencyPlans.map((item) => (
              <div key={item.plan} className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-xs font-bold text-slate-600">{item.plan}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0b82b9]" style={{ width: `${item.pct}%` }} /></div>
                <div className="w-12 text-right text-xs font-black text-slate-700">{item.pct}%</div>
              </div>
            ))}
          </div>
        </article>
        <article className="panel p-5 md:p-6">
          <div className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber-600" /><div className="eyebrow">Casos reportados · mercado</div></div>
          <div className="mt-3 text-4xl font-black text-[#07182d]">{totalLegalCases}</div>
          <div className="mt-4 grid gap-2">
            {laborRelations.legalExposure.map((item) => <div key={item.channel} className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-xs"><span className="text-amber-900/75">{item.channel}</span><strong className="text-amber-950">{item.cases}</strong></div>)}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-600" />Esta lectura es analítica y no constituye una conclusión legal. Los casos deben interpretarse con contexto de tamaño, actividad y periodo.</div>
        </article>
      </section>
    </DashboardFrame>
  );
}
