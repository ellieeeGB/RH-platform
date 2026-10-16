import { DataQuality, Sparkline, StatusChip } from "@/components/ui/data-visuals";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  inverse = false,
  trend,
}: {
  label: string;
  value: string;
  change?: number;
  changeLabel: string;
  icon: LucideIcon;
  inverse?: boolean;
  trend?: { values: (number|null)[]; labels: string[]; selected: number };
}) {
  const hasChange = change != null && Number.isFinite(change);
  const isPositive = hasChange && (inverse ? change < 0 : change > 0);
  const isNeutral = !hasChange || change === 0;
  const TrendIcon = change === 0 ? Minus : (change ?? 0) > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="kpi-editorial">

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="metric-label">{label}</div>
          <div className="mt-2 text-[1.8rem] font-black tracking-[-0.045em] text-[#0b2140]">{value}</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-cyan-50 group-hover:text-cyan-700">
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>
      <div className="mt-4"><StatusChip tone={isNeutral?"neutral":isPositive?"good":"attention"}>{value==="—"?"Información pendiente":"Referencia del grupo"}</StatusChip></div>
      {trend && <><Sparkline values={trend.values} labels={trend.labels} selected={trend.selected} label={`${label}: referencias de cada bimestre`}/><span className="cohort-label">Cobertura variable entre periodos</span></>}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[11px]">
        {hasChange && <span className={`inline-flex items-center gap-1 font-black ${isNeutral ? "text-slate-500" : isPositive ? "text-emerald-700" : "text-rose-700"}`}>
          <TrendIcon size={12} /> {(change ?? 0) > 0 ? "+" : ""}{change}%
        </span>}
        <DataQuality different={!!trend}>{changeLabel}{trend && <p>La tendencia aplica los filtros de tamaño y relación laboral en cada bimestre; las empresas que cumplen pueden cambiar. No representa la evolución de un grupo fijo.</p>}</DataQuality>
      </div>
    </article>
  );
}
