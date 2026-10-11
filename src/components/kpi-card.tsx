import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  inverse = false,
}: {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
  inverse?: boolean;
}) {
  const isPositive = inverse ? change <= 0 : change >= 0;
  const TrendIcon = change >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-slate-200/75 bg-white/90 p-5 shadow-[0_12px_34px_rgba(15,35,65,.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(15,35,65,.075)]">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${isPositive ? "bg-gradient-to-r from-emerald-400 to-cyan-400" : "bg-gradient-to-r from-amber-400 to-rose-400"}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="metric-label">{label}</div>
          <div className="mt-2 text-[1.8rem] font-black tracking-[-0.045em] text-[#0b2140]">{value}</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-cyan-50 group-hover:text-cyan-700">
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[11px]">
        <span className={`inline-flex items-center gap-1 font-black ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
          <TrendIcon size={12} /> {change > 0 ? "+" : ""}{change}%
        </span>
        <span className="text-right font-semibold text-slate-400">{changeLabel}</span>
      </div>
    </article>
  );
}
