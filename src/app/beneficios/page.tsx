import { Gift, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { benefitAdoption } from "@/lib/classic-data";

export default function BenefitsPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Total Rewards"
        title="Beneficios"
        description="Disponibilidad, uso efectivo y competitividad de prestaciones para distinguir entre tener un beneficio y que realmente genere valor al colaborador."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Rewards score" value="81 / 100" change={4.1} changeLabel="vs. bimestre anterior" icon={Sparkles} />
        <KpiCard label="Beneficios activos" value="14" change={2} changeLabel="prestaciones reportadas" icon={Gift} />
        <KpiCard label="Uso efectivo" value="76%" change={5.8} changeLabel="promedio ponderado" icon={HeartHandshake} />
        <KpiCard label="Sobre benchmark" value="4 / 6" change={8.3} changeLabel="beneficios principales" icon={ShieldCheck} />
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Benefit adoption</div>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">Disponibilidad vs. uso efectivo</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {benefitAdoption.map((row) => (
            <div key={row.benefit} className="rounded-3xl border border-slate-100 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="font-extrabold text-slate-900">{row.benefit}</div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${row.usage >= row.benchmark ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.usage >= row.benchmark ? "sobre benchmark" : "oportunidad"}</span>
              </div>
              <div className="space-y-3 text-xs">
                <div><div className="mb-1 flex justify-between text-slate-500"><span>Disponibilidad</span><strong>{row.availability}%</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-slate-800" style={{ width: `${row.availability}%` }} /></div></div>
                <div><div className="mb-1 flex justify-between text-slate-500"><span>Uso efectivo</span><strong>{row.usage}%</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-cyan-500" style={{ width: `${row.usage}%` }} /></div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardFrame>
  );
}
