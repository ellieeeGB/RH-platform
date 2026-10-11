"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compensationData, retentionData, topExitReasons } from "@/lib/people-intelligence-data";

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 30px rgba(15, 23, 42, .08)",
  fontSize: 12,
};

export function TurnoverTrendChart() {
  return (
    <div className="h-[285px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={retentionData.turnoverTrendPct} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(2)}%`, "Rotación"]} />
          <Line type="monotone" dataKey="value" stroke="#0ea5b7" strokeWidth={3} dot={{ r: 4, fill: "#0ea5b7" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExitTenureChart() {
  return (
    <div className="h-[290px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={retentionData.tenureDistributionPct} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="bucket" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 35]} tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Bajas"]} />
          <Bar dataKey="value" fill="#163c67" radius={[8, 8, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExitAgeChart() {
  return (
    <div className="h-[285px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={retentionData.ageDistributionPct} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" horizontal={false} />
          <XAxis type="number" domain={[0, 50]} tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <YAxis type="category" dataKey="bucket" width={90} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Bajas"]} />
          <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExitReasonsChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topExitReasons} layout="vertical" margin={{ top: 0, right: 10, left: 16, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" horizontal={false} />
          <XAxis type="number" domain={[0, 45]} tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <YAxis type="category" width={145} dataKey="reason" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Participación"]} />
          <Bar dataKey="sharePct" fill="#0f766e" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalaryDistributionChart() {
  return (
    <div className="h-[315px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={compensationData.bands} margin={{ top: 8, right: 8, left: -2, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="band" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${Number(value).toLocaleString("es-MX", { maximumFractionDigits: 2 })}`, ""]} />
          <Bar dataKey="q1" name="Q1" fill="#cbd5e1" radius={[6, 6, 2, 2]} />
          <Bar dataKey="median" name="Mediana" fill="#0ea5b7" radius={[6, 6, 2, 2]} />
          <Bar dataKey="q3" name="Q3" fill="#163c67" radius={[6, 6, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalaryEntryTrendChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={compensationData.entryMedianTrend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis domain={[280, 360]} tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${Number(value).toLocaleString("es-MX", { maximumFractionDigits: 2 })}`, "Mediana diaria"]} />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
