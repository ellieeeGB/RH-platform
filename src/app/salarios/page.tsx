"use client";

import { BadgeDollarSign, Gauge, TrendingUp } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/layout/dashboard-frame";
import { useFilters } from "@/components/filters/filter-context";
import { SalaryEntryTrendChart } from "@/components/charts/people-intelligence-charts";
import { salaryReference } from "@/lib/benchmark-comparison";
import { PERIODS, MARKET_SCOPE } from "@/lib/company-panel";

const mxn = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

export default function SalariesPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const reference = salaryReference(period, company);
  const own = isMarket ? reference.bands : reference.ownBands;
  const market = { salaryDaily: reference.bands };
  const entry = reference.entry;
  const maximum = own?.max ?? null;
  const progression = entry && maximum ? maximum / entry : null;
  const marketGap = reference.gap;
  const percentile = reference.percentile;
  const bands = [
    ["Ingreso", own?.entry ?? null, reference.bands.entry],
    ["Intermedio bajo", own?.low ?? null, reference.bands.low],
    ["Intermedio alto", own?.high ?? null, reference.bands.high],
    ["Máximo", own?.max ?? null, reference.bands.max],
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
        <article className="panel p-5"><div className="metric-label">{isMarket ? "Referencia" : "Posición de ingreso"}</div><div className="mt-3 text-3xl font-black text-[#07182d]">{isMarket ? "Mediana" : percentile == null ? "—" : `P${percentile}`}</div><div className="mt-2 text-xs text-slate-500">{isMarket ? `${reference.n} empresas con bandas válidas` : `${pct(marketGap)} vs. ${reference.n} empresas`}</div></article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Arquitectura salarial</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Bandas frente al mercado</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">{reference.n} empresas con las cuatro bandas completas y ordenadas. {isMarket ? "Se usa el mismo grupo en todas las bandas." : "La empresa elegida se excluye de la referencia: turquesa = empresa, violeta = mercado."} Se requieren cinco respuestas para publicar medianas.</p>
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
              : `El ingreso reportado es ${mxn(entry)} frente a ${mxn(market.salaryDaily.entry)} del grupo. La comparación usa el mismo bimestre y excluye a la empresa seleccionada.`}
          </p>
          {!isMarket && percentile != null && <div className="mt-7 rounded-2xl bg-white/[.06] p-5"><div className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Posición frente al grupo</div><div className="mt-2 text-5xl font-black">P{percentile}</div><div className="mt-2 text-xs leading-5 text-slate-400">P{percentile}: {percentile}% de las {reference.n} empresas de referencia reporta un ingreso igual o menor. No incluye a la empresa seleccionada.</div></div>}
        </article>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Evolución del mercado</div>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">Referencia salarial hasta {period}</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">Mediana de bandas válidas por bimestre{isMarket ? "" : ", excluyendo a la empresa seleccionada"}. La cobertura puede cambiar entre cortes; esta serie describe la referencia disponible, no un aumento para las mismas personas.</p>
        <SalaryEntryTrendChart data={PERIODS.slice(0, PERIODS.indexOf(period)+1).map(p => ({ period: p, value: salaryReference(p, isMarket ? MARKET_SCOPE : company).bands.entry }))}/>
      </section>
    </DashboardFrame>
  );
}
