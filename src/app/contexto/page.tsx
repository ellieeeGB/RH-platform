import { Building2, Factory, MapPinned, UsersRound } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { CompanyTenureChart } from "@/components/classic-charts";

export default function ContextPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Contexto de mercado"
        title="Contexto y Muestra"
        description="Perfil de la muestra, composición de personal, tamaño, antigüedad y contexto geográfico para entender correctamente cada benchmark."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Empresas muestra" value="40" change={0} changeLabel="presentes en 7 bimestres" icon={Building2} />
        <KpiCard label="Personal operativo" value="122,938" change={2.4} changeLabel="muestra agregada" icon={UsersRound} />
        <KpiCard label="Estados cubiertos" value="6" change={0} changeLabel="zona centro / bajío" icon={MapPinned} />
        <KpiCard label="Proceso principal" value="47%" change={1.1} changeLabel="metalmecánica" icon={Factory} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Madurez empresarial</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Tiempo de operación</h2>
          <CompanyTenureChart />
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Composición de muestra</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Perfil comparativo</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Género", "53% / 47%", "Hombres / Mujeres"],
              ["Tamaño", "52%", "empresa pequeña"],
              ["Origen inversión", "34%", "capital mexicano"],
              ["Proceso", "47%", "metalmecánica"],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-3xl bg-slate-50 p-5">
                <div className="eyebrow">{label}</div>
                <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-3xl border border-cyan-100 bg-cyan-50 p-5 text-sm leading-6 text-cyan-900">
            El benchmark futuro se calculará contra compañías comparables por tamaño, proceso, ubicación y contexto laboral, no solamente contra el promedio general.
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}
