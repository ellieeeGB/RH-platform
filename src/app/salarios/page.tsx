"use client";

import { BadgeDollarSign, Gauge, TrendingUp } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { SalaryEntryTrendChart } from "@/components/people-intelligence-charts";
import { getMarketSalaryPercentile, getMarketSnapshot, getScopeSnapshot } from "@/lib/company-panel";

const mxn = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

export default function SalariesPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const entry = scope?.salaryDaily.entry ?? null;
  const maximum = scope?.salaryDaily.max ?? null;
  const progression = entry && maximum ? maximum / entry : null;
  const marketGap = !isMarket && entry != null && market.salaryDaily.entry != null ? ((entry / market.salaryDaily.entry) - 1) * 100 : null;
  const percentile = !isMarket ? getMarketSalaryPercentile(entry, period) : null;

  const bands = [
    ["Ingreso", scope?.salaryDaily.entry ?? null, market.salaryDaily.entry],
    ["Intermedio bajo", scope?.salaryDaily.low ?? null, market.salaryDaily.low],
    ["Intermedio alto", scope?.salaryDaily.high ?? null, market.salaryDaily.high],
    ["Máximo", scope?.salaryDaily.max ?? null, market.salaryDaily.max],
  ] as const;

  const maxScale = Math.max(...bands.flatMap(([, own, benchmark]) => [own ?? 0, benchmark ?? 0]), 1);

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Compensación"
        title="Personal y Salarios"
        description={isMarket
          ? "Bandas salariales diarias del mercado para el periodo seleccionado, con una lectura clara de progresión y dispersión."
          : `${companyLabel}: posición salarial frente a la mediana del mercado en ${period}.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-5"><div className="flex items-center justify-between"><div className="metric-label">Salario de ingreso</div><BadgeDollarSign size={18} className="text-cyan-700" /></div><div className="mt-3 text-3xl font-black text-[#07182d]">{mxn(entry)}</div><div className="mt-2 text-xs text-slate-500">MXN por día</div></article>
        <article className="panel p-5"><div className="flex items-center justify-between"><div className="metric-label">Salario máximo</div><TrendingUp size={18} className="text-violet-700" /></div><div className="mt-3 text-3xl font-black text-[#07182d]">{mxn(maximum)}</div><div className="mt-2 text-xs text-slate-500">banda superior</div></article>
        <article className="panel p-5"><div className="flex items-center justify-between"><div className="metric-label">Progresión</div><Gauge size={18} className="text-cyan-700" /></div><div className="mt-3 text-3xl font-black text-[#07182d]">{progression == null ? "—" : `${progression.toFixed(2)}×`}</div><div className="mt-2 text-xs text-slate-500">máximo / ingreso</div></article>
        <article className="panel p-5"><div className="metric-label">{isMarket ? "Referencia" : "Posición de ingreso"}</div><div className="mt-3 text-3xl font-black text-[#07182d]">{isMarket ? "Mediana" : percentile == null ? "—" : `P${percentile}`}</div><div className="mt-2 text-xs text-slate-500">{isMarket ? "40 empresas" : `${pct(marketGap)} vs. mercado`}</div></article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Arquitectura salarial</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Bandas frente al mercado</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">La longitud muestra el nivel salarial. Cuando eliges una empresa, el marcador cyan es la empresa y el violeta es la mediana del mercado.</p>
          <div className="mt-8 space-y-7">
            {bands.map(([label, own, benchmark]) => {
              const ownWidth = ((own ?? 0) / maxScale) * 100;
              const marketWidth = ((benchmark ?? 0) / maxScale) * 100;
              const gap = !isMarket && own != null && benchmark != null && benchmark !== 0 ? ((own / benchmark) - 1) * 100 : null;
              return (
                <div key={label}>
                  <div className="mb-2 flex items-end justify-between gap-4">
                    <div><div className="text-sm font-extrabold text-slate-900">{label}</div><div className="text-xs text-slate-400">{isMarket ? "Mediana de mercado" : companyLabel}</div></div>
                    <div className="text-right"><div className="text-xl font-black text-[#07182d]">{mxn(own)}</div>{gap != null && <div className={`text-xs font-black ${gap >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{pct(gap)} vs. mercado</div>}</div>
                  </div>
                  <div className="relative h-5 rounded-full bg-slate-100">
                    {!isMarket && <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-violet-300" style={{ width: `${marketWidth}%` }} />}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full ${isMarket ? "h-3 bg-cyan-500" : "h-3 bg-cyan-600"}`} style={{ width: `${isMarket ? marketWidth : ownWidth}%` }} />
                  </div>
                  {!isMarket && <div className="mt-1 text-[10px] text-slate-400">Mercado: {mxn(benchmark)}</div>}
                </div>
              );
            })}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl bg-[#07182d] p-6 text-white shadow-soft md:p-7">
          <div className="eyebrow !text-cyan-300">Lectura de compensación</div>
          <h2 className="mt-4 text-3xl font-black leading-tight">{isMarket ? "La progresión salarial ayuda a entender la carrera interna." : marketGap == null ? "No hay suficiente información para comparar este salario." : marketGap >= 0 ? `${companyLabel} está arriba de la mediana de ingreso.` : `${companyLabel} está debajo de la mediana de ingreso.`}</h2>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            {isMarket
              ? `El salario de ingreso mediano es ${mxn(market.salaryDaily.entry)} y la banda máxima mediana llega a ${mxn(market.salaryDaily.max)}.`
              : `El ingreso reportado es ${mxn(entry)} frente a ${mxn(market.salaryDaily.entry)} del mercado. La comparación usa el mismo bimestre.`}
          </p>
          {!isMarket && percentile != null && <div className="mt-7 rounded-2xl bg-white/[.06] p-5"><div className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Percentil aproximado</div><div className="mt-2 text-5xl font-black">P{percentile}</div><div className="mt-2 text-xs leading-5 text-slate-400">Porcentaje de salarios de ingreso de la muestra iguales o menores al valor de la empresa.</div></div>}
        </article>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Evolución del mercado</div>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">Salario de ingreso a través de los siete bimestres</h2>
        <p className="mt-2 text-xs leading-5 text-slate-400">Serie de referencia del mercado. El selector de periodo define el corte principal mostrado arriba.</p>
        <SalaryEntryTrendChart />
      </section>
    </DashboardFrame>
  );
}
