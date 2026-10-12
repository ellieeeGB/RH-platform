import Link from "next/link";
import { ArrowUpRight, CircleDot, Radar, Sparkles, Target } from "lucide-react";
import { signatureMetrics } from "@/lib/signature-metrics";

const signals = [
  {
    label: "Movimiento",
    value: `${signatureMetrics.talentMovementLoadPct}%`,
    detail: "altas + bajas / plantilla",
    x: "18%",
    y: "24%",
    tone: "cyan",
  },
  {
    label: "Carga futura",
    value: `${signatureMetrics.vacancyCarryoverPct}%`,
    detail: "vacantes vs altas recientes",
    x: "73%",
    y: "19%",
    tone: "violet",
  },
  {
    label: "Candidatos adecuados",
    value: `${signatureMetrics.candidateFitPct}%`,
    detail: "candidatos adecuados",
    x: "80%",
    y: "67%",
    tone: "amber",
  },
  {
    label: "Rotación temprana",
    value: `${signatureMetrics.earlyAttritionSharePct}%`,
    detail: "bajas < 3 meses",
    x: "20%",
    y: "72%",
    tone: "rose",
  },
];

const toneClass: Record<string, string> = {
  cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  violet: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  amber: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  rose: "border-rose-300/30 bg-rose-300/10 text-rose-100",
};

export function SignatureSignalField() {
  return (
    <section className="signal-field relative overflow-hidden rounded-[34px] bg-[#06111f] px-5 py-7 text-white md:px-8 md:py-9 xl:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.10)_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[.72fr_1.28fr] xl:items-center">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-cyan-300">
            <Radar size={14} /> Movimiento de talento
          </div>
          <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-.045em] md:text-4xl">La plantilla parece estable. La operación no.</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
            El headcount casi no cambió, pero altas y bajas equivalen a {signatureMetrics.talentMovementLoadPct}% de la plantilla en un solo bimestre. Esta vista muestra la tensión que una métrica neta escondería.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Balance neto</div>
              <div className="mt-2 text-3xl font-black">{signatureMetrics.netTalentFlow}</div>
              <div className="mt-1 text-xs text-slate-400">personas · casi cero crecimiento</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Demanda concentrada</div>
              <div className="mt-2 text-3xl font-black">{signatureMetrics.demandConcentrationPct}%</div>
              <div className="mt-1 text-xs text-slate-400">en el principal perfil operativo</div>
            </div>
          </div>

          <Link href="/workforce-planning" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-slate-950 transition hover:-translate-y-0.5">
            Explorar tensión de talento <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="relative mx-auto grid w-full max-w-[620px] grid-cols-2 gap-3 sm:block sm:aspect-square">
          <div className="hidden sm:block absolute inset-[13%] rounded-full border border-white/10" />
          <div className="hidden sm:block absolute inset-[27%] rounded-full border border-white/10" />
          <div className="hidden sm:block absolute inset-[39%] rounded-full border border-dashed border-white/15" />
          <div className="hidden sm:block absolute left-1/2 top-[8%] h-[84%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="hidden sm:block absolute left-[8%] top-1/2 h-px w-[84%] -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="absolute left-1/2 top-1/2 hidden sm:grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/20 bg-[#091b2e]/95 text-center shadow-[0_0_90px_rgba(34,199,220,.12)]">
            <div>
              <Sparkles className="mx-auto text-cyan-300" size={18} />
              <div className="mt-2 text-[9px] font-black uppercase tracking-[.18em] text-slate-500">Movimiento</div>
              <div className="mt-1 text-3xl font-black">{signatureMetrics.talentMovementLoadPct}%</div>
            </div>
          </div>

          {signals.map((signal) => (
            <div key={signal.label} className={`relative !left-auto !top-auto min-w-0 rounded-2xl sm:absolute sm:!left-[var(--signal-x)] sm:!top-[var(--signal-y)] sm:w-[150px] sm:-translate-x-1/2 sm:-translate-y-1/2 border p-3 backdrop-blur-md ${toneClass[signal.tone]}`} style={{ "--signal-x": signal.x, "--signal-y": signal.y } as React.CSSProperties}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase tracking-[.14em] opacity-65">{signal.label}</span>
                <CircleDot size={12} className="opacity-70" />
              </div>
              <div className="mt-1.5 text-2xl font-black">{signal.value}</div>
              <div className="mt-1 text-[10px] leading-4 opacity-60">{signal.detail}</div>
            </div>
          ))}

          <div className="hidden sm:flex absolute bottom-[4%] left-1/2 -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold text-slate-400 backdrop-blur-md">
            Mercado · Jul–Ago 2025
          </div>
        </div>
      </div>
    </section>
  );
}
