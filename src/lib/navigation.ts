import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeDollarSign,
  BarChart3,
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
    label: "Entender",
    items: [
      { label: "Resumen ejecutivo", icon: LayoutDashboard, href: "/" },
      { label: "Contexto y muestra", icon: Building2, href: "/contexto" },
      { label: "KPIs y métricas", icon: CircleGauge, href: "/indicadores" },
    ],
  },
  {
    label: "Talento",
    items: [
      { label: "Personal y salarios", icon: BadgeDollarSign, href: "/salarios" },
      { label: "Reclutamiento", icon: BriefcaseBusiness, href: "/talent-acquisition" },
      { label: "Rotación y retención", icon: UsersRound, href: "/retencion" },
      { label: "Beneficios", icon: Gift, href: "/beneficios" },
    ],
  },
  {
    label: "Decidir",
    items: [
      { label: "Benchmark Intelligence", icon: Activity, href: "/benchmark" },
      { label: "Workforce Planning", icon: BarChart3, href: "/workforce-planning" },
      { label: "Labor Risk", icon: HeartPulse, href: "/labor-risk" },
      { label: "Scenario Lab", icon: ClipboardCheck, href: "/what-if" },
    ],
  },
  {
    label: "Control",
    items: [
      { label: "Tabulador", icon: Table2, href: "/tabulador" },
      { label: "Data Health", icon: ShieldCheck, href: "/data-quality" },
    ],
  },
];
