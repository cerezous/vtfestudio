"use client";

import { useRouter } from "next/navigation";
import { DoorOpen, Pencil, Trash2 } from "lucide-react";

import { clinicalChartHref } from "@/modules/clinical-chart/href";
import {
  formatDate,
  formatExactAge,
  formatRut,
  patientFullName,
} from "@/modules/patients/display";
import { Button } from "@/shared/components/ui/button";
import type { Patient } from "@/shared/types/database";

export function PatientsTable({
  patients,
  emptyMessage = "Sin pacientes. Crea el primero arriba.",
  onEdit,
  onDelete,
  onDischarge,
}: {
  patients: Patient[];
  emptyMessage?: string;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onDischarge: (patient: Patient) => void;
}) {
  const router = useRouter();

  function openChart(patient: Patient) {
    router.push(clinicalChartHref(patient.id));
  }

  if (patients.length === 0) {
    return (
      <div className="grid min-h-40 place-items-center rounded-[1.4rem] border border-dashed bg-muted/40 px-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[1.6rem] border bg-card shadow-sm">
      <table className="w-full min-w-[72rem] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre completo</th>
            <th className="px-4 py-3 font-medium">RUT</th>
            <th className="px-4 py-3 font-medium">Diagnóstico principal</th>
            <th className="px-4 py-3 font-medium">Ingreso hospital</th>
            <th className="px-4 py-3 font-medium">Ingreso UCI</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Egreso</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Motivo de egreso
            </th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.id}
              tabIndex={0}
              className="cursor-pointer border-b last:border-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
              onClick={() => openChart(patient)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) {
                  return;
                }
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openChart(patient);
                }
              }}
            >
              <td className="px-4 py-3 font-medium">
                <div>{patientFullName(patient)}</div>
                <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                  {formatExactAge(patient.fecha_nacimiento)}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatRut(patient.id_rut)}
              </td>
              <td className="max-w-[16rem] px-4 py-3">
                <div className="truncate">{patient.diagnostico}</div>
                {patient.grupo_diagnostico ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {patient.grupo_diagnostico}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(patient.fecha_ingreso_hospital)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(patient.fecha_ingreso_uci)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(patient.fecha_egreso)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {patient.motivo_egreso ? (
                  <span
                    className={
                      patient.motivo_egreso === "Fallecido"
                        ? "inline-flex rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive"
                        : "inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground"
                    }
                  >
                    {patient.motivo_egreso}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                    aria-label={
                      patient.fecha_egreso || patient.motivo_egreso
                        ? "Editar egreso"
                        : "Egresar"
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      onDischarge(patient);
                    }}
                  >
                    <DoorOpen className="size-4" />
                    {patient.fecha_egreso || patient.motivo_egreso
                      ? "Egreso"
                      : "Egresar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(patient);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Eliminar"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(patient);
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
