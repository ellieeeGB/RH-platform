import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  CircleGauge,
  ClipboardCheck,
  Gift,
  HeartPulse,
  LayoutDashboard,
  ShieldCheck,
  Table2,
  UsersRound,
} from "lucide-react";

export const navigation = [
  {
    label: "Operación RH",
    items: [
      { label: "Executive Pulse", icon: LayoutDashboard, active: true },
      { label: "Contexto y Muestra", icon: Building2 },
      { label: "Personal y Salarios", icon: BadgeDollarSign },
      { label: "Beneficios", icon: Gift },
      { label: "Indicadores / KPI", icon: CircleGauge },
      { label: "Tabulador", icon: Table2 },
    ],
  },
  {
    label: "People Intelligence",
    items: [
      { label: "Talent Acquisition", icon: BriefcaseBusiness },
      { label: "Retención y Rotación", icon: UsersRound },
      { label: "Workforce Planning", icon: BarChart3 },
      { label: "Labor Risk", icon: HeartPulse },
      { label: "Benchmark Studio", icon: Activity },
      { label: "Data Quality", icon: ShieldCheck },
      { label: "AI HR Copilot", icon: Bot },
      { label: "What-If Lab", icon: ClipboardCheck },
    ],
  },
];
