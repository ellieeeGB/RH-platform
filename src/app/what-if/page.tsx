import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { WhatIfLab } from "@/components/what-if-lab";

export default function WhatIfPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Decision Intelligence · What-If"
        title="Workforce What-If Lab"
        description="Explora escenarios con fórmulas visibles y supuestos editables. El simulador distingue cálculos determinísticos de futuras predicciones estadísticas."
      />
      <WhatIfLab />
    </DashboardFrame>
  );
}
