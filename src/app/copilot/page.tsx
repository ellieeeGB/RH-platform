import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { HRCopilot } from "@/components/hr-copilot";

export default function CopilotPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Decision Intelligence · Evidence Copilot"
        title="AI HR Copilot"
        description="Pregunta en lenguaje natural y recibe respuestas ancladas a métricas verificadas, con evidencia navegable y advertencias de calidad."
      />
      <HRCopilot />
    </DashboardFrame>
  );
}
