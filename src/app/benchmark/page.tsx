"use client";

import { useState } from "react";
import { Building2, Scale, Timer, UsersRound } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/layout/dashboard-frame";
import { KpiCard } from "@/components/ui/kpi-card";
import { useFilters } from "@/components/filters/filter-context";
import { getCompanySnapshot, PERIODS } from "@/lib/company-panel";
import { comparisonPeers, distribution, validSalaryBands, type PeerSize, type PeerUnion } from "@/lib/benchmark-comparison";

const money = (n: number | null | undefined) => n == null ? "—" : new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(n);
const number = (n: number | null | undefined, suffix = "") => n == null ? "—" : `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(n)}${suffix}`;
const bands = [["entry", "Ingreso"], ["low", "Intermedio bajo"], ["high", "Intermedio alto"], ["max", "Máximo"]] as const;

export default function BenchmarkStudioPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const [size, setSize] = useState<PeerSize>("all");
  const [union, setUnion] = useState<PeerUnion>("all");
  const peers = comparisonPeers(period, size, union, isMarket ? undefined : company);
  const own = isMarket ? null : getCompanySnapshot(company, period);
  const salaryPeers = peers.filter(validSalaryBands);
  const salary = bands.map(([key, label]) => ({key, label, ...distribution(salaryPeers.map(row => row.salaryDaily[key])), own: own && validSalaryBands(own) ? own.salaryDaily[key] : null}));
  const coverage = distribution(peers.map(row => row.timeToFill.technical));
  const candidates = distribution(peers.map(row => row.acceptedPer10));
  const maximum = Math.max(1, ...salary.flatMap(row => [row.q3 ?? 0, row.own ?? 0]));

  const history=PERIODS.map(cut=>{
    const group=comparisonPeers(cut,size,union,isMarket?undefined:company);
    return [group.length,distribution(group.filter(validSalaryBands).map(r=>r.salaryDaily.entry)).median,distribution(group.map(r=>r.timeToFill.technical)).median,distribution(group.map(r=>r.acceptedPer10)).median];
  });
  const trend=(index:number)=>({values:history.map(row=>row[index]),labels:PERIODS,selected:PERIODS.indexOf(period)});
  return <DashboardFrame>
    <PageHeader eyebrow="Comparación de mercado" title="Comparación con el mercado" scopeMode="active" description="Compara salarios y contratación con empresas del mismo bimestre. Elige una empresa en la barra superior para ver su posición frente al grupo." />
    <section aria-label="Grupo de comparación" className="panel mb-5 p-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-semibold text-slate-700">Tamaño de plantilla
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={size} onChange={e=>setSize(e.target.value as PeerSize)}>
            <option value="all">Todos los tamaños</option><option value="under250">Menos de 250 personas</option><option value="250to999">250 a 999 personas</option><option value="1000plus">1,000 personas o más</option>
          </select>
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-semibold text-slate-700">Relación laboral
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={union} onChange={e=>setUnion(e.target.value as PeerUnion)}>
            <option value="all">Todas las empresas</option><option value="yes">Sindicalizadas</option><option value="no">No sindicalizadas</option>
          </select>
        </label>
        <button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={()=>{setSize("all");setUnion("all");}}>Restablecer grupo</button>
      </div>
      <p role="status" className="mb-0 mt-3 text-sm text-slate-600">{peers.length} empresas en el grupo{!isMarket && ` · ${companyLabel} se compara por separado`}. Cada referencia necesita al menos cinco respuestas válidas.</p>
    </section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Empresas comparables" value={String(peers.length)} changeLabel={period} icon={Building2} trend={trend(0)}/>
      <KpiCard label="Sueldo diario de entrada · valor central" value={money(salary[0].median)} changeLabel={`${salary[0].n} respuestas válidas · MXN/día`} icon={Scale} trend={trend(1)}/>
      <KpiCard label="Días para cubrir puestos técnicos" value={number(coverage.median," días")} changeLabel={`${coverage.n} respuestas con plazo exacto`} icon={Timer} trend={trend(2)}/>
      <KpiCard label="Candidatos adecuados" value={number(candidates.median," de cada 10")} changeLabel={`${candidates.n} respuestas válidas · mediana`} icon={UsersRound} trend={trend(3)}/>
    </section>
    <section className="panel mt-5 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="eyebrow">Salario diario · MXN</div><h2 className="mt-1 text-xl font-extrabold">Posición salarial frente al grupo</h2><p className="mt-2 text-sm text-slate-600">La franja contiene la mitad central de los sueldos reportados. La línea indica el valor central al ordenar las respuestas (mediana).</p></div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-700"><span>━ Grupo (Q1–Q3)</span>{!isMarket && <span className="text-violet-700">● {companyLabel}</span>}</div>
      </div>
      {salary[0].median == null ? <div className="my-5 rounded-2xl bg-amber-50 p-6 text-amber-950"><h3 className="font-bold">Faltan respuestas para esta comparación</h3><p className="mb-0 mt-2 text-sm">Hay {salary[0].n} empresas con bandas salariales completas y ordenadas. Amplía el grupo o cambia de bimestre.</p></div> : <div className="mt-6 space-y-6">
        {salary.map(row=><div key={row.key} className="grid gap-2 md:grid-cols-[150px_1fr_140px] md:items-center">
          <div className="text-sm font-bold">{row.label}</div>
          <div aria-hidden="true" className="relative mx-2 h-9">
            <div className="absolute inset-x-0 top-4 h-px bg-slate-200"/>
            <div className="absolute top-2.5 h-3 rounded-full bg-cyan-200" style={{left:`${row.q1!/maximum*100}%`,width:`${(row.q3!-row.q1!)/maximum*100}%`}}/>
            <span className="absolute top-1.5 h-5 w-1 -translate-x-1/2 rounded bg-cyan-800" style={{left:`${row.median!/maximum*100}%`}}/>
            {row.own != null && <span className="absolute top-2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-violet-600 ring-1 ring-violet-600" style={{left:`${row.own/maximum*100}%`}}/>}
          </div>
          <div className="text-sm font-bold md:text-right">{money(row.median)}<span className="ml-1 text-xs font-normal text-slate-500">mediana</span></div>
        </div>)}
      </div>}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[620px] text-left text-sm"><caption className="sr-only">Bandas salariales del grupo y empresa seleccionada, en pesos diarios</caption><thead className="bg-slate-50 text-slate-600"><tr>{["Banda","Inicio de la mitad central (Q1)","Valor central (mediana)","Fin de la mitad central (Q3)", "Empresa seleccionada", "Brecha vs. mediana"].map(label=><th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
          <tbody>{salary.map(row=><tr key={row.key} className="border-t border-slate-100"><th className="px-4 py-3 font-semibold">{row.label}</th><td className="px-4 py-3">{money(row.q1)}</td><td className="px-4 py-3 font-bold">{money(row.median)}</td><td className="px-4 py-3">{money(row.q3)}</td><td className="px-4 py-3 text-violet-700">{money(row.own)}</td><td className="px-4 py-3">{row.own != null && row.median != null ? number((row.own/row.median-1)*100,"%") : "—"}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="mb-0 mt-4 text-xs leading-5 text-slate-600">Q1: 25% de las respuestas queda por debajo. Q3: 75% queda por debajo. La brecha indica una diferencia salarial, no si el salario es adecuado para un puesto específico. Los tiempos mayores de 60 días no entran en la mediana de plazos exactos.</p>
    </section>
  </DashboardFrame>;
}
