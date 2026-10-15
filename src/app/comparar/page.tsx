"use client";
import { DashboardFrame } from "@/components/layout/dashboard-frame";
import { ComparisonView } from "@/components/analysis/comparison-view";

export default function ComparePage() {
  return <DashboardFrame><ComparisonView/></DashboardFrame>;
}
