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
import {
  companyTenure,
  salaryBands,
  salaryTrend,
} from "@/lib/classic-data";
import {
  recruitmentSourceBenchmark,
  timeToFillComparison,
} from "@/lib/benchmark-data";

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 30px rgba(15, 23, 42, .08)",
  fontSize: 12,
};

export function TimeToFillChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={timeToFillComparison} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="role" tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="previous" name="May–Jun 2025" fill="#cbd5e1" radius={[7, 7, 2, 2]} />
          <Bar dataKey="current" name="Jul–Ago 2025" fill="#0ea5b7" radius={[7, 7, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RecruitmentSourcesChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={recruitmentSourceBenchmark.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" width={138} dataKey="source" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Empresas que usan la fuente"]} />
          <Bar dataKey="value" name="Prevalencia %" fill="#163c67" radius={[0, 7, 7, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalaryBandsChart() {
  return (
    <div className="h-[310px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={salaryBands} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="band" tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${Number(value).toLocaleString("es-MX")}`, ""]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="company" name="Empresa" fill="#2563eb" radius={[7, 7, 2, 2]} />
          <Bar dataKey="benchmark" name="Benchmark" fill="#50b982" radius={[7, 7, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalaryTrendChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={salaryTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="company" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompanyTenureChart() {
  return (
    <div className="h-[290px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={companyTenure} layout="vertical" margin={{ top: 0, right: 10, left: 12, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" width={90} dataKey="range" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" name="Empresas %" fill="#0ea5b7" radius={[0, 7, 7, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
