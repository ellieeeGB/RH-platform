import { signatureMetrics } from "@/lib/signature-metrics";

const metrics = [
  { label: "Talent movement", value: `${signatureMetrics.talentMovementLoadPct}%`, note: "altas + bajas / HC" },
  { label: "Vacancy carryover", value: `${signatureMetrics.vacancyCarryoverPct}%`, note: "vacantes / altas" },
  { label: "Candidate fit", value: `${signatureMetrics.candidateFitPct}%`, note: "adecuados" },
  { label: "Early attrition", value: `${signatureMetrics.earlyAttritionSharePct}%`, note: "< 3 meses" },
  { label: "Demand concentration", value: `${signatureMetrics.demandConcentrationPct}%`, note: "hotspot operativo" },
  { label: "Salary drift", value: `+${signatureMetrics.salaryDriftPct}%`, note: "vs Jul-Ago 24" },
];

export function SignatureMetricStrip() {
  return (
    <section className="border-y border-slate-200/80 bg-white">
      <div className="mx-auto grid max-w-[1660px] grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {metrics.map((metric) => (
          <div key={metric.label} className="group p-5 transition hover:bg-slate-50/80 md:p-6">
            <div className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">{metric.label}</div>
            <div className="mt-2 text-2xl font-black tracking-[-.04em] text-[#07182d] transition group-hover:text-cyan-700">{metric.value}</div>
            <div className="mt-1 text-[10px] font-semibold text-slate-400">{metric.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
