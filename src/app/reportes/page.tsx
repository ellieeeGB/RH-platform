"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  FileText,
  HeartPulse,
  Handshake,
  TrendingDown,
  UsersRound,
} from "lucide-react";
import { DashboardFrame } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { deriveScopeMetrics, getMarketSnapshot, getScopeSnapshot } from "@/lib/company-panel";

import { salaryReference } from "@/lib/benchmark-comparison";

const int = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const money = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;

const chapters = [
  ["01", "Contexto y muestra", "Plantilla y composición", "/contexto", Building2],
  ["02", "Personal y compensación", "Bandas y posición de mercado", "/salarios", BadgeDollarSign],
  ["03", "Negociación colectiva", "Revisiones e incrementos", "/relaciones-laborales", Handshake],
  ["04", "Rotación bimestral", "Bajas, antigüedad y causas", "/retencion", TrendingDown],
  ["05", "Reclutamiento", "Cobertura, fuentes y candidatos", "/talent-acquisition", BriefcaseBusiness],
  ["06", "Posiciones próximas", "Vacantes y demanda futura", "/workforce-planning", UsersRound],
  ["07", "Ausentismo y salud", "Exposición e incapacidades", "/labor-risk", HeartPulse],
  ["08", "Beneficios", "Cobertura, uso y costo", "/beneficios", BadgeDollarSign],
] as const;

export default function ReportsPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const metrics = deriveScopeMetrics(scope);
  const salary = salaryReference(period, company);
  const salaryGap = salary.gap;
  const ttfGap = !isMarket && scope?.timeToFill.technical != null && market.timeToFill.technical != null
    ? scope.timeToFill.technical - market.timeToFill.technical
    : null;

  return (
    <DashboardFrame>
      <section className="overflow-hidden rounded-[36px] bg-[#07182d] text-white shadow-[0_30px_90px_rgba(7,24,45,.14)]">
        <div className="grid min-h-[430px] lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative p-7 md:p-10 xl:p-14">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-cyan-300"><FileText size={14} /> Catch Consulting · Reporte Bimestral RH</div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.065em] md:text-7xl">{period}</h1>
              <div className="mt-4 text-xl font-black text-white/90">{companyLabel}</div>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">Plantilla, compensación, contratación, rotación, relaciones laborales, beneficios y demanda futura en un solo corte.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/signals" className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-black text-[#07182d]">Ver señales clave</Link>
                <Link href="/benchmark" className="rounded-full border border-white/15 px-5 py-3 text-xs font-black text-white">Abrir benchmark</Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/10">
            {[
              [isMarket ? "Empresas" : "Headcount", isMarket ? "40" : int(scope?.headcount.total), isMarket ? "participantes" : companyLabel],
              ["Contrataciones", int(scope?.hires), "en el bimestre"],
              ["Bajas", int(scope?.exits), "en el bimestre"],
              ["Vacantes", int(scope?.vacancies.total), "próximas a cubrir"],
            ].map(([label, value, note]) => (
              <div key={label} className="flex flex-col justify-end bg-[#0a2141] p-6 md:p-7">
                <div className="text-[10px] font-black uppercase tracking-[.18em] text-slate-500">{label}</div>
                <div className="mt-2 text-4xl font-black tracking-[-.055em]">{value}</div>
                <div className="mt-1 text-xs text-slate-400">{note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[.72fr_1.28fr]">
        <aside className="panel p-5 md:p-6">
          <div className="eyebrow">Índice</div>
          <h2 className="mt-1 text-lg font-black text-[#07182d]">Secciones del reporte</h2>
          <div className="mt-5 space-y-1">
            {chapters.map(([number, title, description, href]) => (
              <Link key={number} href={href} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50">
                <span className="w-7 text-[10px] font-black text-cyan-700">{number}</span>
                <span className="flex-1"><span className="block text-xs font-bold text-slate-700 group-hover:text-slate-950">{title}</span><span className="mt-0.5 block text-[10px] text-slate-400">{description}</span></span>
                <ArrowRight size={13} className="text-slate-300 group-hover:text-cyan-600" />
              </Link>
            ))}
          </div>
        </aside>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8">
          <div className="eyebrow">Resumen ejecutivo</div>
          <h2 className="mt-2 max-w-4xl text-3xl font-black tracking-[-.04em] text-[#07182d]">{isMarket ? "Panorama del mercado en el bimestre seleccionado." : `${companyLabel} frente a las referencias del mercado.`}</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-cyan-50 p-5"><div className="text-[10px] font-black uppercase tracking-[.14em] text-cyan-700">Movimiento de plantilla</div><div className="mt-2 text-3xl font-black text-cyan-950">{pct(metrics.movementLoadPct)}</div><p className="mb-0 mt-2 text-xs leading-5 text-cyan-900/70">Altas + bajas respecto al headcount del corte.</p></div>
            <div className="rounded-2xl bg-violet-50 p-5"><div className="text-[10px] font-black uppercase tracking-[.14em] text-violet-700">Presión de contratación</div><div className="mt-2 text-3xl font-black text-violet-950">{pct(metrics.hiringPressurePct)}</div><p className="mb-0 mt-2 text-xs leading-5 text-violet-900/70">Vacantes próximas respecto a la plantilla.</p></div>
            <div className="rounded-2xl bg-emerald-50 p-5"><div className="text-[10px] font-black uppercase tracking-[.14em] text-emerald-700">Salario de ingreso</div><div className="mt-2 text-3xl font-black text-emerald-950">{money(salary.entry)}</div><p className="mb-0 mt-2 text-xs leading-5 text-emerald-900/70">{isMarket ? `Mediana diaria · ${salary.n} empresas con bandas válidas.` : salaryGap == null ? "Sin comparación disponible." : `${salaryGap >= 0 ? "+" : ""}${salaryGap.toFixed(1)}% frente a ${salary.n} empresas, excluyendo la propia.`}</p></div>
            <div className="rounded-2xl bg-amber-50 p-5"><div className="text-[10px] font-black uppercase tracking-[.14em] text-amber-700">Cobertura técnica</div><div className="mt-2 text-3xl font-black text-amber-950">{scope?.timeToFill.technical == null ? "—" : `${scope.timeToFill.technical} días`}</div><p className="mb-0 mt-2 text-xs leading-5 text-amber-900/70">{isMarket ? "Mediana de tiempo para cubrir puestos técnicos." : ttfGap == null ? "Sin comparación disponible." : `${ttfGap >= 0 ? "+" : ""}${ttfGap.toFixed(0)} días frente al mercado.`}</p></div>
          </div>
        </article>
      </section>

      <section className="mt-5">
        <div className="mb-5"><div className="eyebrow">Detalle</div><h2 className="mt-1 text-2xl font-black tracking-[-.035em] text-[#07182d]">Explora cada frente del estudio</h2></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {chapters.map(([number, title, description, href, Icon]) => (
            <Link key={number} href={href} className="group panel p-5 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between"><Icon size={18} className="text-cyan-700" /><span className="text-[10px] font-black text-slate-300">{number}</span></div>
              <h3 className="mt-7 text-lg font-black text-[#07182d]">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir sección <ArrowRight size={13} /></div>
            </Link>
          ))}
        </div>
      </section>
    </DashboardFrame>
  );
}
