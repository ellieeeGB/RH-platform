import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { WhatIfLab } from "@/components/what-if-lab";

export default function WhatIfPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Planeación de escenarios"
        title="Explora una decisión antes de aplicarla"
        description="Ajusta metas de bajas, salario y tiempo de contratación. Consulta su equivalente en personas, días y exposición salarial para el último corte del mercado."
      />
      <WhatIfLab />
    </DashboardFrame>
  );
}
