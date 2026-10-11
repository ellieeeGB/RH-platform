"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { laborRiskTrend } from "@/lib/risk-benchmark-data";
import { compensationData } from "@/lib/people-intelligence-data";

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 30px rgba(15, 23, 42, .08)",
  fontSize: 12,
};

export function LaborRiskTrendChart() {
  return (
    <div className="h-[310px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={laborRiskTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value).toFixed(2), "eventos / 100 HC"]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="absenceEventsPer100" name="Ausencias / 100 HC" stroke="#0ea5b7" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="incapacityCasesPer100" name="Incapacidades / 100 HC" stroke="#163c67" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LaborRiskEventsChart() {
  return (
    <div className="h-[285px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={laborRiskTrend} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString("es-MX"), "eventos/casos"]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="absences" name="Eventos ausencia" fill="#0ea5b7" radius={[6, 6, 2, 2]} />
          <Bar dataKey="incapacityCases" name="Casos incapacidad" fill="#163c67" radius={[6, 6, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BenchmarkSalaryRangeChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={compensationData.bands} margin={{ top: 8, right: 8, left: -2, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="band" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${Number(value).toLocaleString("es-MX", { maximumFractionDigits: 2 })}`, ""]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="q1" name="Q1" fill="#cbd5e1" radius={[6, 6, 2, 2]} />
          <Bar dataKey="median" name="Mediana" fill="#0ea5b7" radius={[6, 6, 2, 2]} />
          <Bar dataKey="q3" name="Q3" fill="#163c67" radius={[6, 6, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
