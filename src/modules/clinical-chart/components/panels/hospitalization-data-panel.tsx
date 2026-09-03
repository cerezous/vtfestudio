import {
  ChartFact,
  ClinicalChartGrid,
  ClinicalChartSlot,
} from "@/modules/clinical-chart/components/clinical-chart-slot";
import { formatDate } from "@/modules/patients/display";
import type { Patient } from "@/shared/types/database";

export function HospitalizationDataPanel({ patient }: { patient: Patient }) {
  return (
    <ClinicalChartGrid layout="grid-2">
      <ClinicalChartSlot title="Diagnóstico">
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartFact
            label="Diagnóstico principal"
            value={patient.diagnostico}
          />
          <ChartFact
            label="Grupo diagnóstico"
            value={patient.grupo_diagnostico ?? "—"}
          />
          <div className="sm:col-span-2">
            <ChartFact
              label="Antecedentes mórbidos"
              value={patient.antecedentes_morbidos ?? "—"}
            />
          </div>
        </div>
      </ClinicalChartSlot>
      <ClinicalChartSlot title="Estadía">
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartFact
            label="Ingreso hospital"
            value={formatDate(patient.fecha_ingreso_hospital)}
          />
          <ChartFact
            label="Ingreso UCI"
            value={formatDate(patient.fecha_ingreso_uci)}
          />
          <ChartFact
            label="Fecha de egreso"
            value={formatDate(patient.fecha_egreso)}
          />
          <ChartFact
            label="Motivo de egreso"
            value={patient.motivo_egreso ?? "—"}
          />
        </div>
      </ClinicalChartSlot>
    </ClinicalChartGrid>
  );
}
