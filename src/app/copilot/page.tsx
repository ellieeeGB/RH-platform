import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { HRCopilot } from "@/components/hr-copilot";

export default function CopilotPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Catch · Evidencia para decidir"
        title="Asistente de análisis"
        scopeMode="active"
        description="Explora tu empresa y periodo, entiende los cambios y abre la evidencia de cada respuesta."
      />
      <HRCopilot />
    </DashboardFrame>
  );
}
