import { AlertTriangle, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { benchmarkData, qualitySummary } from "@/lib/benchmark-data";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export default function DataQualityPage() {
  const anomalyPeriods = benchmarkData.periods.filter((period) => period.anomalyCount > 0);
  const alerts = qualitySummary.rulesEvaluated - qualitySummary.rulesPassed;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Confiabilidad del estudio"
        title="Calidad de información"
        description="Antes de comparar empresas, Catch revisa que totales, porcentajes y series históricas sean coherentes. Aquí se muestran únicamente las alertas que pueden cambiar una lectura del mercado."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-5">
          <div className="flex items-center justify-between"><div className="metric-label">Consistencia del corte</div><ShieldCheck className="text-cyan-700" size={20} /></div>
          <div className="mt-3 text-4xl font-black text-slate-950">{qualitySummary.score}%</div>
          <p className="mt-2 text-xs text-slate-500">de las comprobaciones automáticas no presentan diferencias.</p>
        </article>
        <article className="panel p-5">
          <div className="flex items-center justify-between"><div className="metric-label">Alertas por revisar</div><Database className="text-amber-600" size={20} /></div>
          <div className="mt-3 text-4xl font-black text-slate-950">{alerts}</div>
          <p className="mt-2 text-xs text-slate-500">diferencias o datos incompletos detectados en el último corte.</p>
        </article>
        <article className="panel p-5">
          <div className="flex items-center justify-between"><div className="metric-label">Alto impacto</div><AlertTriangle className="text-rose-600" size={20} /></div>
          <div className="mt-3 text-4xl font-black text-rose-700">{qualitySummary.criticalAnomalies}</div>
          <p className="mt-2 text-xs text-slate-500">dato que puede distorsionar un agregado histórico.</p>
        </article>
        <article className="panel p-5">
          <div className="flex items-center justify-between"><div className="metric-label">Historia disponible</div><CheckCircle2 className="text-emerald-600" size={20} /></div>
          <div className="mt-3 text-4xl font-black text-emerald-700">{benchmarkData.periods.length}</div>
          <p className="mt-2 text-xs text-slate-500">bimestres comparables en la serie.</p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article className="panel overflow-hidden">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="eyebrow">Alertas de alto impacto</div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950">Datos que requieren confirmación</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">Se conserva siempre el valor reportado. Cuando una cifra rompe fuertemente su propia serie histórica, se muestra también una referencia ajustada para que el comparativo no se distorsione.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-6 py-3">Periodo</th><th className="px-6 py-3">Reportado</th><th className="px-6 py-3">Referencia para análisis</th><th className="px-6 py-3">Diferencia</th><th className="px-6 py-3">Estado</th></tr></thead>
              <tbody>
                {anomalyPeriods.map((period) => {
                  const delta = period.reportedHeadcount - period.qualityAdjustedHeadcount;
                  return (
                    <tr key={period.period} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-bold text-slate-900">{period.period}</td>
                      <td className="px-6 py-4">{formatInt(period.reportedHeadcount)}</td>
                      <td className="px-6 py-4 font-semibold text-cyan-800">{formatInt(period.qualityAdjustedHeadcount)}</td>
                      <td className="px-6 py-4 font-semibold text-rose-700">+{formatInt(delta)}</td>
                      <td className="px-6 py-4"><span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">Confirmar dato</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Qué se revisa</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Controles que protegen el benchmark</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Altas", "El total coincide con nuevas posiciones y reemplazos."],
              ["Bajas", "El total se compara con sus principales desgloses y causas."],
              ["Incapacidades", "Los casos se contrastan con los tipos reportados."],
              ["Salarios", "Las bandas mantienen un orden lógico de ingreso a máximo."],
              ["Proporciones", "Los porcentajes que representan un total se revisan antes de agregarse."],
              ["Historia", "Se señalan saltos de headcount que no son consistentes con los bimestres vecinos."],
            ].map(([name, detail]) => (
              <div key={name} className="rounded-2xl border border-slate-100 p-4"><div className="text-sm font-extrabold text-slate-900">{name}</div><div className="mt-1 text-xs leading-5 text-slate-500">{detail}</div></div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Último corte</div>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">Qué conviene confirmar antes de tomar decisiones</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Género.</strong> En 9 empresas las proporciones reportadas no concilian aproximadamente a 100%, por lo que ese indicador debe leerse con cautela.</div>
          <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Campos incompletos.</strong> El corte presenta {alerts} alertas de consistencia o cobertura que no necesariamente afectan todas las métricas.</div>
          <div className="rounded-2xl bg-rose-50 p-4 text-sm leading-6 text-rose-950"><strong>Headcount.</strong> Un valor de Mar–Abr 2025 rompe la tendencia histórica y altera el total si se usa sin revisión.</div>
        </div>
      </section>
    </DashboardFrame>
  );
}
