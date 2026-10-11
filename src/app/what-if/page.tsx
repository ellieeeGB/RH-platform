import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { WhatIfSimulator } from "@/components/what-if-simulator";
import { latestMarket } from "@/lib/benchmark-data";

export default function WhatIfPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Decision Lab"
        title="What-If · Workforce Digital Twin"
        description="Simula cambios en rotación, vacantes y salario con fórmulas transparentes. El objetivo es comparar decisiones, no ocultar supuestos detrás de una predicción negra."
      />
      <WhatIfSimulator marketSalaryDaily={latestMarket.salaryBandsDaily.entryMedian} />
    </DashboardFrame>
  );
}
