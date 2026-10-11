import { Activity, BadgeDollarSign, BriefcaseBusiness, Clock3, UsersRound } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { latestMarket, recruitmentSourceBenchmark, rejectionReasonBenchmark } from "@/lib/benchmark-data";
import peopleIntelligence from "../../../data/processed/people-intelligence.json";

const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

export default function BenchmarkPage() {
  const bands = peopleIntelligence.compensation.bands;
  const maxSource = Math.max(...recruitmentSourceBenchmark.map((item) => item.value));
  const maxReason = Math.max(...rejectionReasonBenchmark.map((item) => item.medianPct));

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Market Intelligence"
        title="Benchmark Studio"
        description="Compara la muestra con percentiles y medianas robustas. La vista agregada evita exponer empresas individuales y permite entender dónde está la presión real del mercado."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Salario ingreso", `${money(latestMarket.salaryBandsDaily.entryMedian)}/día`, BadgeDollarSign, "Mediana de 40 compañías"],
          ["Time-to-fill técnico", `${latestMarket.timeToFillDays.technical} días`, Clock3, "Mediana del último corte"],
          ["Candidatos adecuados", `${latestMarket.candidateAcceptancePer10Median}/10`, UsersRound, "Por cada 10 entrevistados"],
          ["Hiring pressure", `${latestMarket.hiringPressurePct.toFixed(1)}%`, BriefcaseBusiness, "Vacantes próximas / headcount"],
        ].map(([label, value, Icon, note]) => (
          <article key={String(label)} className="panel p-5">
            <div className="flex items-center justify-between"><div className="eyebrow">{String(label)}</div><Icon className="text-cyan-700" size={20}/></div>
            <div className="mt-3 text-3xl font-black text-slate-950">{String(value)}</div>
            <p className="mb-0 mt-2 text-xs text-slate-400">{String(note)}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="panel overflow-hidden">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="eyebrow">Compensation market</div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950">Bandas salariales por percentil</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-6 py-3">Banda</th><th className="px-6 py-3">Mínimo</th><th className="px-6 py-3">Q1</th><th className="px-6 py-3">Mediana</th><th className="px-6 py-3">Q3</th><th className="px-6 py-3">Máximo</th></tr></thead>
              <tbody>
                {bands.map((band) => (
                  <tr key={band.band} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-extrabold text-slate-900">{band.band}</td>
                    <td className="px-6 py-4 text-slate-500">{money(band.min)}</td>
                    <td className="px-6 py-4 text-slate-600">{money(band.q1)}</td>
                    <td className="px-6 py-4 font-black text-cyan-800">{money(band.median)}</td>
                    <td className="px-6 py-4 text-slate-600">{money(band.q3)}</td>
                    <td className="px-6 py-4 text-slate-500">{money(band.max)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-xs text-slate-500">Progresión mediana ingreso → máximo: <strong>{peopleIntelligence.compensation.salaryProgressionRatio.toFixed(2)}×</strong>.</div>
        </article>

        <article className="panel p-5 md:p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700"><Activity size={19}/></div><div><div className="eyebrow">Retention signal</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Salida temprana</h2></div></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-rose-50 p-4"><div className="text-xs font-bold uppercase tracking-wide text-rose-500">≤ 3 meses</div><div className="mt-2 text-3xl font-black text-rose-800">{peopleIntelligence.retention.earlyAttritionUnder3MonthsPct}%</div></div>
            <div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-bold uppercase tracking-wide text-amber-600">≤ 1 año</div><div className="mt-2 text-3xl font-black text-amber-800">{peopleIntelligence.retention.firstYearExitSharePct}%</div></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Distribución ponderada sobre empresas cuyos porcentajes de antigüedad conciliaron con suficiente calidad. No se presenta como tasa causal.</p>
          <div className="mt-5 space-y-2">
            {peopleIntelligence.retention.tenureDistributionPct.map((item) => (
              <div key={item.bucket}>
                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600"><span>{item.bucket}</span><span>{item.value}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-600" style={{ width: `${item.value}%` }}/></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Recruitment channels</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Prevalencia entre empresas</h2>
          <div className="mt-5 space-y-3">
            {recruitmentSourceBenchmark.map((item) => (
              <div key={item.source}><div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold text-slate-600"><span>{item.source}</span><span>{item.companies} empresas · {item.value}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-600" style={{ width: `${item.value / maxSource * 100}%` }}/></div></div>
            ))}
          </div>
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Candidate friction</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Motivos de rechazo · mediana</h2>
          <div className="mt-5 space-y-3">
            {rejectionReasonBenchmark.map((item) => (
              <div key={item.cause}><div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold text-slate-600"><span>{item.cause}</span><span>{item.medianPct}% · n={item.responses}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-700" style={{ width: `${maxReason ? item.medianPct / maxReason * 100 : 0}%` }}/></div></div>
            ))}
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}
