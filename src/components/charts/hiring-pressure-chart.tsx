"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { hiringPressure } from "@/lib/benchmark-data";

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 30px rgba(15, 23, 42, .08)",
  fontSize: 12,
};

export function HiringPressureChart() {
  return (
    <div className="h-[290px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={hiringPressure} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="role" tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar yAxisId="left" dataKey="vacancies" name="Vacantes próximas" fill="#163c67" radius={[8, 8, 2, 2]} />
          <Line yAxisId="right" type="monotone" dataKey="timeToFill" name="Time-to-fill (días)" stroke="#0ea5b7" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
