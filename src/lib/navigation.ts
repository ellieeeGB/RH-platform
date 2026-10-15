import type { LucideIcon } from "lucide-react";
import {
  Activity,
  GitCompareArrows,
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
  Orbit,
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
      { label: "Comparar compañías y periodos", icon: GitCompareArrows, href: "/comparar" },
      { label: "Agenda de consultoría", icon: ClipboardCheck, href: "/agenda" },
      { label: "Estudio de decisiones", icon: Orbit, href: "/decisiones" },
      { label: "Reporte bimestral", icon: FileText, href: "/reportes" },
      { label: "Laboratorio de señales", icon: Radar, href: "/signals" },
    ],
  },
  {
    label: "Dashboard RH",
    items: [
      { label: "Personas y empresas del estudio", icon: Building2, href: "/contexto" },
      { label: "Personal y salarios", icon: BadgeDollarSign, href: "/salarios" },
      { label: "Beneficios", icon: Gift, href: "/beneficios" },
      { label: "Indicadores principales", icon: CircleGauge, href: "/indicadores" },
      { label: "Sueldos por puesto", icon: Table2, href: "/tabulador" },
    ],
  },
  {
    label: "People Intelligence",
    items: [
      { label: "Reclutamiento", icon: BriefcaseBusiness, href: "/talent-acquisition" },
      { label: "Salidas y permanencia", icon: UsersRound, href: "/retencion" },
      { label: "Puestos por cubrir", icon: BarChart3, href: "/workforce-planning" },
      { label: "Relaciones laborales", icon: Handshake, href: "/relaciones-laborales" },
      { label: "Ausentismo y riesgo", icon: HeartPulse, href: "/labor-risk" },
      { label: "Comparación con otras empresas", icon: Activity, href: "/benchmark" },
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
