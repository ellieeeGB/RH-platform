import { Download, Search } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { tabulatorRows } from "@/lib/classic-data";

const money = (value: number | null) => value === null ? "—" : `$${value.toLocaleString("es-MX")}`;

export default function TabulatorPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Compensation market"
        title="Tabulador"
        description="Consulta puestos homologados, percentiles y sueldo interno sin perder la estructura tabular que ya utilizan los equipos de compensaciones."
      />

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 md:max-w-xl">
            <Search size={17} className="text-slate-400" />
            <span className="text-sm text-slate-400">Buscar código, área o puesto…</span>
          </div>
          <div className="flex gap-2">
            <button className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700">Guardar vista</button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white"><Download size={14} /> Descargar informe</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-xs">
            <thead className="bg-slate-50 uppercase tracking-wide text-slate-400">
              <tr>{["Código", "Puesto tipo (mercado)", "Mínimo", "Q1", "Mediana", "Promedio mercado", "Q3", "Máximo", "Sueldo empresa"].map((head) => <th key={head} className="px-5 py-3 font-bold">{head}</th>)}</tr>
            </thead>
            <tbody>
              {tabulatorRows.map((row) => (
                <tr key={row.code} className="border-t border-slate-100 hover:bg-cyan-50/40">
                  <td className="px-5 py-4 font-black text-slate-700">{row.code}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{row.role}</td>
                  <td className="px-5 py-4">{money(row.minimum)}</td>
                  <td className="bg-blue-50/70 px-5 py-4 font-semibold text-blue-900">{money(row.q1)}</td>
                  <td className="px-5 py-4">{money(row.median)}</td>
                  <td className="px-5 py-4">{money(row.market)}</td>
                  <td className="px-5 py-4">{money(row.q3)}</td>
                  <td className="px-5 py-4">{money(row.maximum)}</td>
                  <td className="px-5 py-4 font-black text-cyan-800">{money(row.company)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs text-slate-400"><span>5 posiciones de demostración</span><span>Los datos reales se cargarán desde la capa normalizada.</span></div>
      </section>
    </DashboardFrame>
  );
}
