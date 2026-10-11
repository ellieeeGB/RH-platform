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
  benefitPrevalence,
  benefitUsage,
  topWorkforceHotspots,
  workforcePlanningData,
} from "@/lib/workforce-rewards-data";

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 30px rgba(15, 23, 42, .08)",
  fontSize: 12,
};

export function VacancyTrendChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={workforcePlanningData.vacancyTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="operational" name="Operativas" stackId="a" fill="#163c67" radius={[0, 0, 2, 2]} />
          <Bar dataKey="administrative" name="Administrativas" stackId="a" fill="#0ea5b7" radius={[7, 7, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TalentHotspotsChart() {
  const data = topWorkforceHotspots.map((item) => ({
    label: `${item.role} · ${item.education}`,
    demand: item.demand,
    family: item.family,
  }));

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" width={180} dataKey="label" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="demand" name="Demanda estructurada" fill="#2563eb" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BenefitPrevalenceChart() {
  return (
    <div className="h-[310px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={benefitPrevalence} layout="vertical" margin={{ top: 0, right: 10, left: 2, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <YAxis type="category" dataKey="benefit" width={105} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Empresas"]} />
          <Bar dataKey="pct" fill="#0ea5b7" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BenefitUsageChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={benefitUsage} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="benefit" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Uso mediano"]} />
          <Bar dataKey="median" name="Uso mediano" fill="#163c67" radius={[8, 8, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VacancyTotalTrendLine() {
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={workforcePlanningData.vacancyTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="total" name="Vacantes" stroke="#0ea5b7" strokeWidth={3} dot={{ r: 4, fill: "#0ea5b7" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
