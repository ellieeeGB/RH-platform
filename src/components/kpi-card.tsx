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
    <div className="panel p-5">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="eyebrow">{label}</div>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</div>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-700">
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          <TrendIcon size={13} /> {change > 0 ? "+" : ""}{change}%
        </span>
        <span className="text-right text-slate-400">{changeLabel}</span>
      </div>
    </div>
  );
}
