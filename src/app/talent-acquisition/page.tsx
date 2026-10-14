"use client";

import { BriefcaseBusiness, Clock3, Radar, UserCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { getDetails } from "@/lib/company-detail";
import { useFilters } from "@/components/filter-context";
import { RecruitmentSourcesChart, TimeToFillChart } from "@/components/classic-charts";
import { HiringPressureChart } from "@/components/charts";
import {
  deriveScopeMetrics,
  getMarketSnapshot,
  getPeriodSnapshots,
  getPreviousScopeSnapshot,
  getScopeSnapshot,
  type RejectionMix,
} from "@/lib/company-panel";

const int = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const num = (value: number | null | undefined, digits = 1) => value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;

const rejectionLabels: Record<keyof RejectionMix, string> = {
  experience: "Falta de experiencia",
  antidoping: "Antidoping",
  lumbar: "Examen lumbar",
  audiometry: "Audiometría",
  residence: "Lugar de residencia",
  vision: "Examen visual",
  numerical: "Habilidad numérica",
  schooling: "Escolaridad",
  psychometric: "Psicométricas",
};

export default function TalentAcquisitionPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const previous = getPreviousScopeSnapshot(company, period);
  const metrics = deriveScopeMetrics(scope);
  const marketMetrics = deriveScopeMetrics(market);
  const rows = getPeriodSnapshots(period);
  const intervalCounts = getDetails(company,period);

  const rejectionRows = (Object.keys(rejectionLabels) as (keyof RejectionMix)[])
    .map((key) => ({
      key,
      label: rejectionLabels[key],
      value: scope?.rejectionPct[key] ?? null,
      market: market.rejectionPct[key],
      responses: rows.filter((row) => row.rejectionPct[key] !== null).length,
    }))
    .filter((row) => row.value !== null || row.market !== null)
    .sort((a, b) => (b.value ?? b.market ?? 0) - (a.value ?? a.market ?? 0));

  const technicalDelta = scope?.timeToFill.technical != null && previous?.timeToFill.technical != null
    ? scope.timeToFill.technical - previous.timeToFill.technical
    : null;

  const cards = [
    {
      label: "Vacantes próximas",
      value: int(scope?.vacancies.total),
      note: isMarket ? `${pct(metrics.hiringPressurePct)} del headcount` : `Mercado: ${int(market.vacancies.total)}`,
      icon: BriefcaseBusiness,
    },
    {
      label: "Time-to-fill técnico",
      value: scope?.timeToFill.technical == null ? "—" : `${num(scope.timeToFill.technical, 0)} días`,
      note: technicalDelta == null ? `Mercado: ${num(market.timeToFill.technical, 0)} días` : `${technicalDelta > 0 ? "+" : ""}${technicalDelta.toFixed(0)} días vs. bimestre anterior`,
      icon: Clock3,
    },
    {
      label: "Candidatos que cumplen",
      value: scope?.acceptedPer10 == null ? "—" : `${num(scope.acceptedPer10, 1)} / 10`,
      note: isMarket ? "mediana de empresas con dato" : `Mercado: ${num(market.acceptedPer10, 1)} / 10`,
      icon: UserCheck,
    },
    {
      label: "Contrataciones",
      value: int(scope?.hires),
      note: isMarket ? "altas reportadas en el bimestre" : `Presión de contratación: ${pct(metrics.hiringPressurePct)}`,
      icon: Radar,
    },
  ];

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Talent Acquisition"
        title="Reclutamiento y cobertura"
        description={isMarket
          ? "Demanda, velocidad de contratación y calidad de candidatos para el periodo seleccionado."
          : `${companyLabel}: cobertura de vacantes y fricción de selección comparadas con el mercado del mismo bimestre.`}
      />

      <details className="panel mb-4 p-4 text-xs leading-6 text-slate-600"><summary className="cursor-pointer font-bold text-slate-800">Cómo leer los tiempos de cobertura</summary><p>Medianas de respuestas exactas positivas, en días hábiles. Cero significa que la empresa no tiene esa posición.</p><p>Respuestas de más de 60 días: operativo {intervalCounts.filter(r=>r.ttfOperationalStatus==='over-60').length}, técnico {intervalCounts.filter(r=>r.ttfTechnicalStatus==='over-60').length}, administrativo {intervalCounts.filter(r=>r.ttfAdministrativeStatus==='over-60').length}, gerencial {intervalCounts.filter(r=>r.ttfManagerialStatus==='over-60').length}. Se conservan como intervalos y no se incluyen en la mediana numérica.</p></details>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="panel p-5">
            <div className="flex items-center justify-between"><div className="metric-label">{label}</div><Icon size={18} className="text-cyan-700" /></div>
            <div className="mt-3 text-3xl font-black tracking-tight text-[#07182d]">{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-500">{note}</div>
          </article>
        ))}
      </section>

      {!isMarket && (
        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="panel p-5"><div className="metric-label">Vacantes / HC</div><div className="mt-2 text-2xl font-black text-[#07182d]">{pct(metrics.hiringPressurePct)}</div><div className="mt-1 text-xs text-slate-500">mercado: {pct(marketMetrics.hiringPressurePct)}</div></article>
          <article className="panel p-5"><div className="metric-label">TTF operativo</div><div className="mt-2 text-2xl font-black text-[#07182d]">{scope?.timeToFill.operational == null ? "—" : `${num(scope.timeToFill.operational, 0)} días`}</div><div className="mt-1 text-xs text-slate-500">mercado: {num(market.timeToFill.operational, 0)} días</div></article>
          <article className="panel p-5"><div className="metric-label">TTF administrativo</div><div className="mt-2 text-2xl font-black text-[#07182d]">{scope?.timeToFill.administrative == null ? "—" : `${num(scope.timeToFill.administrative, 0)} días`}</div><div className="mt-1 text-xs text-slate-500">mercado: {num(market.timeToFill.administrative, 0)} días</div></article>
        </section>
      )}

      <section className="mt-4 panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="eyebrow">Fricción de selección</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Motivos de rechazo</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">{isMarket ? "Mediana del mercado para el bimestre seleccionado." : `${companyLabel} frente a la mediana de mercado del mismo periodo.`} Los motivos no forman un funnel y no deben sumarse entre sí.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-6 py-3">Motivo</th><th className="px-6 py-3">{isMarket ? "Mediana" : companyLabel}</th>{!isMarket && <th className="px-6 py-3">Mercado</th>}<th className="px-6 py-3">Empresas con dato</th></tr>
            </thead>
            <tbody>
              {rejectionRows.map((row) => (
                <tr key={row.key} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-semibold text-slate-800">{row.label}</td>
                  <td className="px-6 py-3 font-black text-slate-950">{pct(row.value)}</td>
                  {!isMarket && <td className="px-6 py-3 font-semibold text-cyan-800">{pct(row.market)}</td>}
                  <td className="px-6 py-3 text-slate-500">{row.responses} / 40</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="eyebrow">Referencia de mercado</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Serie y canales · Jul–Ago 25</h2></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">No cambia con el filtro de empresa</span>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">Estas visualizaciones conservan la lectura histórica y de canales del último corte de mercado. Sirven como contexto; los KPIs y la tabla superior sí corresponden a la selección activa.</p>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm font-extrabold text-slate-900">Presión de contratación</div><HiringPressureChart /></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm font-extrabold text-slate-900">Time-to-fill</div><TimeToFillChart /></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm font-extrabold text-slate-900">Fuentes utilizadas</div><RecruitmentSourcesChart /></div>
        </div>
      </section>
    </DashboardFrame>
  );
}
