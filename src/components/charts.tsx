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
import { hiringPressure, workforceTrend } from "@/lib/mock-data";

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 30px rgba(15, 23, 42, .08)",
  fontSize: 12,
};

export function WorkforceTrendChart() {
  return (
    <div className="h-[290px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={workforceTrend} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="benchmark" stroke="#9aa8b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="headcount" stroke="#0ea5b7" strokeWidth={3} dot={{ r: 4, fill: "#0ea5b7" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HiringPressureChart() {
  return (
    <div className="h-[290px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={hiringPressure} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="role" tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7b8798", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="vacancies" fill="#163c67" radius={[8, 8, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
