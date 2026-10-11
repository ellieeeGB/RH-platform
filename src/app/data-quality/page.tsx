import { AlertTriangle, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { benchmarkData, qualitySummary } from "@/lib/benchmark-data";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export default function DataQualityPage() {
  const anomalyPeriods = benchmarkData.periods.filter((period) => period.anomalyCount > 0);

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Trust layer"
        title="Data Quality Center"
        description="Valida reconciliaciones, porcentajes, bandas salariales y anomalías longitudinales antes de que un dato alimente benchmarks, predicciones o IA."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-5">
          <div className="flex items-center justify-between"><div className="eyebrow">Quality score</div><ShieldCheck className="text-cyan-700" size={20} /></div>
          <div className="mt-3 text-4xl font-black text-slate-950">{qualitySummary.score}<span className="text-lg text-slate-400">/100</span></div>
          <p className="mt-2 text-xs text-slate-400">Reglas aprobadas / reglas aplicables.</p>
        </article>
        <article className="panel p-5">
          <div className="flex items-center justify-between"><div className="eyebrow">Reglas evaluadas</div><Database className="text-slate-500" size={20} /></div>
          <div className="mt-3 text-4xl font-black text-slate-950">{qualitySummary.rulesEvaluated}</div>
          <p className="mt-2 text-xs text-slate-400">Sobre el bimestre más reciente.</p>
        </article>
        <article className="panel p-5">
          <div className="flex items-center justify-between"><div className="eyebrow">Aprobadas</div><CheckCircle2 className="text-emerald-600" size={20} /></div>
          <div className="mt-3 text-4xl font-black text-emerald-700">{qualitySummary.rulesPassed}</div>
          <p className="mt-2 text-xs text-slate-400">Consistencias y reconciliaciones válidas.</p>
        </article>
        <article className="panel p-5">
          <div className="flex items-center justify-between"><div className="eyebrow">Anomalías críticas</div><AlertTriangle className="text-rose-600" size={20} /></div>
          <div className="mt-3 text-4xl font-black text-rose-700">{qualitySummary.criticalAnomalies}</div>
          <p className="mt-2 text-xs text-slate-400">Requieren validación antes de modelar.</p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article className="panel overflow-hidden">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="eyebrow">Anomaly ledger</div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950">Valores que cambian la lectura del mercado</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr><th className="px-6 py-3">Periodo</th><th className="px-6 py-3">Reportado</th><th className="px-6 py-3">Ajustado analítico</th><th className="px-6 py-3">Diferencia</th><th className="px-6 py-3">Estado</th></tr>
              </thead>
              <tbody>
                {anomalyPeriods.map((period) => {
                  const delta = period.reportedHeadcount - period.qualityAdjustedHeadcount;
                  return (
                    <tr key={period.period} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-bold text-slate-900">{period.period}</td>
                      <td className="px-6 py-4">{formatInt(period.reportedHeadcount)}</td>
                      <td className="px-6 py-4 font-semibold text-cyan-800">{formatInt(period.qualityAdjustedHeadcount)}</td>
                      <td className="px-6 py-4 font-semibold text-rose-700">+{formatInt(delta)}</td>
                      <td className="px-6 py-4"><span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">Validar fuente</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-xs leading-5 text-slate-500">
            El valor ajustado es una estimación para análisis comparativo. El dato original permanece inmutable y auditable.
          </div>
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Reglas activas</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Qué estamos validando</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Contrataciones", "Total = nueva creación + reemplazos"],
              ["Bajas", "Total = operativo + administrativo y desglose de causas"],
              ["Incapacidades", "Total = riesgo de trabajo + enfermedad + maternidad"],
              ["Salarios", "Ingreso ≤ intermedio bajo ≤ intermedio alto ≤ máximo"],
              ["Género", "Mujeres + hombres ≈ 100%"],
              ["Longitudinal", "Headcount no presenta saltos incompatibles con su propia historia"],
            ].map(([name, rule]) => (
              <div key={name} className="rounded-2xl border border-slate-100 p-4">
                <div className="text-sm font-extrabold text-slate-900">{name}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500">{rule}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Hallazgos del último corte</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950"><strong>9</strong> empresas con proporciones de género que no concilian aproximadamente a 100% entre las 37 con ambos campos presentes.</div>
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950"><strong>24</strong> fallos de regla sobre 240 verificaciones aplicables en el corte analizado.</div>
          <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-950"><strong>1</strong> anomalía longitudinal crítica de headcount que distorsiona el agregado de Mar–Abr 2025.</div>
        </div>
      </section>
    </DashboardFrame>
  );
}
