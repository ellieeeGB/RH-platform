import Link from "next/link";
import { ArrowRight, BadgeDollarSign, BriefcaseBusiness, Sparkles, Target, UsersRound } from "lucide-react";
import { DashboardFrame } from "@/components/dashboard-frame";
import { SignatureMetricStrip } from "@/components/signature-metric-strip";
import { SignatureSignalField } from "@/components/signature-signal-field";
import { signatureMetrics } from "@/lib/signature-metrics";
import people from "../../../data/processed/people-intelligence.json";
import rewards from "../../../data/processed/workforce-rewards.json";

const moves = [
  {
    label: "01 · RETENER",
    title: "Cortar la fuga temprana",
    value: `${signatureMetrics.earlyAttritionSharePct}%`,
    text: "de las bajas conciliadas sucede antes de tres meses. Contratar más sin corregir esta fuga aumenta trabajo, no estabilidad.",
    href: "/retencion",
    icon: UsersRound,
    className: "bg-[#ffdf6e] text-[#07182d]",
  },
  {
    label: "02 · RECLUTAR",
    title: "Absorber la siguiente ola",
    value: `${signatureMetrics.vacancyCarryoverPct}%`,
    text: "de la capacidad reciente de contratación ya está representada por vacantes próximas. La carga no terminó con el corte actual.",
    href: "/talent-acquisition",
    icon: BriefcaseBusiness,
    className: "bg-[#705df8] text-white",
  },
  {
    label: "03 · ENFOCAR",
    title: "Atacar el hotspot correcto",
    value: `${signatureMetrics.demandConcentrationPct}%`,
    text: `de la demanda operativa estructurada está concentrada en ${rewards.workforcePlanning.hotspots[0].role.toLowerCase()} con ${rewards.workforcePlanning.hotspots[0].education.toLowerCase()}.`,
    href: "/workforce-planning",
    icon: Target,
    className: "bg-[#0a2141] text-white",
  },
];

const bubbleSizes = [190, 110, 82, 76, 66, 58];

export default function SignalsPage() {
  return (
    <DashboardFrame>
      <div className="-mx-5 -mt-5 overflow-hidden bg-[#f3f5f8] md:-mx-8 md:-mt-8">
        <section className="relative overflow-hidden px-6 pb-14 pt-16 md:px-10 xl:px-14 xl:pb-20 xl:pt-24">
          <div className="absolute right-[-8%] top-[-18%] h-[420px] w-[420px] rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="mx-auto max-w-[1660px]">
            <div className="grid gap-10 xl:grid-cols-[1.15fr_.85fr] xl:items-end">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-cyan-700"><Sparkles size={14} /> Catch Signals</div>
                <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[.9] tracking-[-.065em] text-[#07182d] md:text-7xl xl:text-[7.2rem]">
                  Lo que el headcount <span className="text-cyan-600">no te está contando.</span>
                </h1>
              </div>
              <div className="max-w-xl xl:justify-self-end">
                <p className="text-base leading-8 text-slate-500 md:text-lg">Una lectura de segundo nivel: movimiento, carga futura, calidad de candidatos y concentración de demanda. Métricas diseñadas para descubrir tensión oculta, no para repetir el reporte.</p>
                <div className="mt-5 flex items-center gap-3 text-xs font-bold text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Datos agregados · Jul–Ago 2025 · confianza {signatureMetrics.dataConfidence}/100</div>
              </div>
            </div>
          </div>
        </section>

        <SignatureMetricStrip />

        <section className="px-6 py-16 md:px-10 xl:px-14 xl:py-24">
          <div className="mx-auto max-w-[1660px]"><SignatureSignalField /></div>
        </section>

        <section className="px-6 pb-24 md:px-10 xl:px-14 xl:pb-32">
          <div className="mx-auto max-w-[1660px]">
            <div className="mb-8 grid gap-5 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Next best moves</div>
                <h2 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#07182d] md:text-5xl">Tres decisiones. No veinte gráficas.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-500 lg:justify-self-end">Las acciones se ordenan por el patrón actual de los datos, no por una plantilla genérica. Cada tarjeta conduce a la evidencia donde puede validarse la señal.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {moves.map((move) => {
                const Icon = move.icon;
                return (
                  <Link key={move.label} href={move.href} className={`group relative min-h-[420px] overflow-hidden rounded-[34px] p-7 shadow-[0_22px_60px_rgba(7,24,45,.08)] transition duration-300 hover:-translate-y-1 md:p-8 ${move.className}`}>
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[28px] border-current opacity-[.07] transition duration-500 group-hover:scale-110" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[.2em] opacity-65">{move.label}</span><Icon size={20} /></div>
                      <div>
                        <div className="text-[5rem] font-black leading-none tracking-[-.08em] opacity-90">{move.value}</div>
                        <h3 className="mt-5 text-3xl font-black tracking-[-.035em]">{move.title}</h3>
                        <p className="mt-4 max-w-sm text-sm leading-6 opacity-70">{move.text}</p>
                        <div className="mt-8 inline-flex items-center gap-2 text-xs font-black">Abrir evidencia <ArrowRight size={14} /></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#07182d] px-6 py-24 text-white md:px-10 xl:px-14 xl:py-32">
          <div className="mx-auto max-w-[1660px]">
            <div className="mb-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-300">Visual evidence</div>
                <h2 className="mt-3 text-4xl font-black tracking-[-.05em] md:text-6xl">Dos dibujos. Dos problemas obvios.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-400 lg:justify-self-end">En lugar de otra cuadrícula de barras, la forma visual cambia según la pregunta: una fuga para antigüedad y una constelación para demanda.</p>
            </div>

            <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
              <article className="rounded-[34px] border border-white/10 bg-white/[.055] p-6 md:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[.18em] text-amber-300">Leak path</div>
                    <h3 className="mt-2 text-2xl font-black">¿Cuándo se nos va la gente?</h3>
                  </div>
                  <div className="text-right"><div className="text-4xl font-black text-amber-300">{signatureMetrics.earlyAttritionSharePct}%</div><div className="text-[10px] text-slate-500">antes de 3 meses</div></div>
                </div>
                <div className="mt-9 space-y-2.5">
                  {people.retention.tenureDistributionPct.map((item, index) => (
                    <div key={item.bucket} className="grid grid-cols-[88px_1fr_48px] items-center gap-3">
                      <div className="text-[10px] font-bold text-slate-400">{item.bucket}</div>
                      <div className="h-9 overflow-hidden rounded-full bg-white/[.04]">
                        <div className={`h-full rounded-full transition-all ${index < 2 ? "bg-gradient-to-r from-rose-400 to-amber-300" : "bg-white/15"}`} style={{ width: `${Math.min(100, item.value * 2.8)}%` }} />
                      </div>
                      <div className={`text-right text-sm font-black ${index < 2 ? "text-amber-200" : "text-slate-400"}`}>{item.value}%</div>
                    </div>
                  ))}
                </div>
                <p className="mb-0 mt-7 text-xs leading-6 text-slate-500">La forma se estrecha conforme aumenta la antigüedad: la pérdida está cargada hacia el inicio de la relación laboral.</p>
              </article>

              <article className="relative min-h-[520px] overflow-hidden rounded-[34px] border border-white/10 bg-[#0a2141] p-6 md:p-8">
                <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[.18em] text-violet-300">Demand constellation</div>
                    <h3 className="mt-2 text-2xl font-black">¿Dónde está concentrada la demanda?</h3>
                  </div>
                  <div className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-[10px] font-black text-violet-200">Tamaño = demanda</div>
                </div>
                <div className="relative z-10 mt-8 flex min-h-[360px] flex-wrap items-center justify-center gap-4">
                  {rewards.workforcePlanning.hotspots.slice(0, 6).map((item, index) => {
                    const size = bubbleSizes[index];
                    return (
                      <div key={`${item.role}-${item.education}`} className={`group flex shrink-0 items-center justify-center rounded-full border text-center shadow-[0_12px_50px_rgba(0,0,0,.18)] transition duration-300 hover:scale-105 ${index === 0 ? "border-cyan-300/50 bg-cyan-300 text-[#07182d]" : index < 3 ? "border-violet-300/30 bg-violet-400/20 text-white" : "border-white/15 bg-white/[.06] text-white"}`} style={{ width: size, height: size }}>
                        <div className="px-3">
                          <div className={`${index === 0 ? "text-4xl" : "text-xl"} font-black tracking-[-.05em]`}>{item.demand}</div>
                          <div className={`${index === 0 ? "mt-2 text-[11px]" : "mt-1 text-[9px]"} font-black uppercase leading-4 opacity-70`}>{item.role}</div>
                          {index < 3 && <div className="mt-1 text-[8px] opacity-55">{item.education}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-20 md:px-10 xl:px-14 xl:py-24">
          <div className="mx-auto grid max-w-[1660px] gap-8 rounded-[38px] border border-slate-200 bg-[#f8fafc] p-7 md:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.2em] text-violet-600">Una métrica con contexto vale más</div>
              <h2 className="mt-3 max-w-4xl text-3xl font-black tracking-[-.045em] text-[#07182d] md:text-5xl">+{signatureMetrics.salaryDriftPct}% en salario de entrada en un año, pero {signatureMetrics.candidateFitPct}% de candidate fit.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">Ese contraste abre una pregunta más útil que “¿subió el salario?”: ¿la compensación está creciendo al ritmo correcto para ampliar la oferta efectiva de talento?</p>
            </div>
            <Link href="/salarios" className="inline-flex items-center gap-2 rounded-full bg-[#07182d] px-5 py-3 text-xs font-black text-white">Explorar compensación <BadgeDollarSign size={15} /></Link>
          </div>
        </section>
      </div>
    </DashboardFrame>
  );
}
