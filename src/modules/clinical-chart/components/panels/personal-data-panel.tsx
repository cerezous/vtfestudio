import {
  ChartFact,
  ClinicalChartGrid,
  ClinicalChartSlot,
} from "@/modules/clinical-chart/components/clinical-chart-slot";
import {
  formatDate,
  formatExactAge,
  formatRut,
  patientFullName,
  sexoLabel,
} from "@/modules/patients/display";
import type { Patient } from "@/shared/types/database";

export function PersonalDataPanel({ patient }: { patient: Patient }) {
  return (
    <ClinicalChartGrid layout="grid-2">
      <ClinicalChartSlot title="Identidad">
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartFact label="Nombre" value={patientFullName(patient)} />
          <ChartFact label="RUT" value={formatRut(patient.id_rut)} />
          <ChartFact label="N° ficha" value={String(patient.n_ficha)} />
          <ChartFact label="Sexo" value={sexoLabel(patient.sexo)} />
          <ChartFact
            label="Fecha de nacimiento"
            value={formatDate(patient.fecha_nacimiento)}
          />
          <ChartFact
            label="Edad exacta"
            value={formatExactAge(patient.fecha_nacimiento)}
          />
          <ChartFact
            label="Nacionalidad"
            value={patient.nacionalidad ?? "—"}
          />
        </div>
      </ClinicalChartSlot>
    </ClinicalChartGrid>
  );
}
