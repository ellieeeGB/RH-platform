import type { LucideIcon } from "lucide-react";
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

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigation: NavigationGroup[] = [
  {
    label: "Operación RH",
    items: [
      { label: "Executive Pulse", icon: LayoutDashboard, href: "/" },
      { label: "Contexto y Muestra", icon: Building2, href: "/contexto" },
      { label: "Personal y Salarios", icon: BadgeDollarSign, href: "/salarios" },
      { label: "Beneficios", icon: Gift, href: "/beneficios" },
      { label: "Indicadores / KPI", icon: CircleGauge, href: "/indicadores" },
      { label: "Tabulador", icon: Table2, href: "/tabulador" },
    ],
  },
  {
    label: "People Intelligence",
    items: [
      { label: "Talent Acquisition", icon: BriefcaseBusiness, href: "/talent-acquisition" },
      { label: "Retención y Rotación", icon: UsersRound, href: "/retencion" },
      { label: "Workforce Planning", icon: BarChart3, href: "/workforce-planning" },
      { label: "Labor Risk", icon: HeartPulse, href: "/labor-risk" },
      { label: "Benchmark Studio", icon: Activity, href: "/benchmark" },
      { label: "Data Quality", icon: ShieldCheck, href: "/data-quality" },
      { label: "AI HR Copilot", icon: Bot },
      { label: "What-If Lab", icon: ClipboardCheck, href: "/what-if" },
    ],
  },
];
