import { signatureMetrics } from "@/lib/signature-metrics";

const metrics = [
  { label: "Movimiento de plantilla", value: `${signatureMetrics.talentMovementLoadPct}%`, note: "altas + bajas / plantilla" },
  { label: "Vacantes frente a altas", value: `${signatureMetrics.vacancyCarryoverPct}%`, note: "vacantes / altas" },
  { label: "Candidatos adecuados", value: `${signatureMetrics.candidateFitPct}%`, note: "adecuados" },
  { label: "Bajas tempranas", value: `${signatureMetrics.earlyAttritionSharePct}%`, note: "< 3 meses" },
  { label: "Demanda concentrada", value: `${signatureMetrics.demandConcentrationPct}%`, note: "principal perfil operativo" },
  { label: "Cambio salarial", value: `+${signatureMetrics.salaryDriftPct}%`, note: "vs Jul-Ago 24" },
];

export function SignatureMetricStrip() {
  return (
    <section className="border-y border-slate-200/80 bg-white">
      <div className="mx-auto grid max-w-[1660px] grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-3 2xl:grid-cols-6 lg:divide-y-0">
        {metrics.map((metric) => (
          <div key={metric.label} className="group p-5 transition hover:bg-slate-50/80 md:p-6">
            <div className="text-[11px] font-black uppercase tracking-[.18em] text-slate-600">{metric.label}</div>
            <div className="mt-2 text-2xl font-black tracking-[-.04em] text-[#07182d] transition group-hover:text-cyan-700">{metric.value}</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">{metric.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
