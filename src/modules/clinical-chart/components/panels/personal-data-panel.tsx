import {
  ChartFact,
  ClinicalChartSlot,
} from "@/modules/clinical-chart/components/clinical-chart-slot";
import { formatKg } from "@/modules/patients/anthropometry";
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
    <div className="flex flex-col gap-4">
      <ClinicalChartSlot title="Identidad" className="min-h-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <ChartFact label="Nacionalidad" value={patient.nacionalidad ?? "—"} />
          <ChartFact
            label="Talla"
            value={patient.talla == null ? "—" : `${patient.talla} cm`}
          />
          <ChartFact label="Peso ideal" value={formatKg(patient.peso_ideal)} />
        </div>
      </ClinicalChartSlot>

      <ClinicalChartSlot title="Hospitalización" className="min-h-0">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <h4 className="text-sm font-semibold sm:col-span-2">Diagnóstico</h4>
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
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <h4 className="text-sm font-semibold sm:col-span-2">Estadía</h4>
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
        </div>
      </ClinicalChartSlot>
    </div>
  );
}
