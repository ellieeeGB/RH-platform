import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CircleGauge,
  ClipboardCheck,
  Database,
  FileText,
  Gift,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  Radar,
  ShieldCheck,
  Sparkles,
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
    label: "Resumen",
    items: [
      { label: "Inicio", icon: LayoutDashboard, href: "/" },
      { label: "Reporte bimestral", icon: FileText, href: "/reportes" },
      { label: "Laboratorio de señales", icon: Radar, href: "/signals" },
    ],
  },
  {
    label: "Dashboard RH",
    items: [
      { label: "Contexto y muestra", icon: Building2, href: "/contexto" },
      { label: "Personal y salarios", icon: BadgeDollarSign, href: "/salarios" },
      { label: "Beneficios", icon: Gift, href: "/beneficios" },
      { label: "Indicadores", icon: CircleGauge, href: "/indicadores" },
      { label: "Tabulador", icon: Table2, href: "/tabulador" },
    ],
  },
  {
    label: "People Intelligence",
    items: [
      { label: "Reclutamiento", icon: BriefcaseBusiness, href: "/talent-acquisition" },
      { label: "Rotación y retención", icon: UsersRound, href: "/retencion" },
      { label: "Planeación de plantilla", icon: BarChart3, href: "/workforce-planning" },
      { label: "Relaciones laborales", icon: Handshake, href: "/relaciones-laborales" },
      { label: "Ausentismo y riesgo", icon: HeartPulse, href: "/labor-risk" },
      { label: "Benchmark", icon: Activity, href: "/benchmark" },
      { label: "Simulador", icon: ClipboardCheck, href: "/what-if" },
      { label: "Asistente de análisis", icon: Sparkles, href: "/copilot" },
    ],
  },
  {
    label: "Datos y control",
    items: [
      { label: "Cobertura del estudio", icon: Database, href: "/data-atlas" },
      { label: "Calidad de información", icon: ShieldCheck, href: "/data-quality" },
    ],
  },
];
