import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto max-w-[1600px] p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mb-2 mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h1>
        <p className="m-0 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Periodo · Jul–Ago 2025", "Empresa · American Industries", "Benchmark · Cohort similar"].map((label) => (
          <button key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm">{label}</button>
        ))}
      </div>
    </section>
  );
}
