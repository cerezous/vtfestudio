"use client";

import { useState } from "react";

import { PatientDialog } from "@/modules/patients/components/patient-dialog";
import { PatientsTable } from "@/modules/patients/components/patients-table";
import { patientFullName } from "@/modules/patients/display";
import { useDeletePatient, usePatients } from "@/modules/patients/queries";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { Patient } from "@/shared/types/database";

export function PatientsWorkspace({
  initialPatients,
}: {
  initialPatients: Patient[];
}) {
  const { data, isLoading, error } = usePatients(initialPatients);
  const deletePatient = useDeletePatient();
  const [editing, setEditing] = useState<Patient | null>(null);
  const [removing, setRemoving] = useState<Patient | null>(null);
  const patients = data ?? [];

  if (error) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No se pudo cargar el registro de pacientes.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Registro</p>
          <h1 className="text-3xl font-semibold tracking-tight">Pacientes</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Censo del estudio VMI. Haz clic en un paciente para abrir su ficha.
          </p>
        </div>
        <PatientDialog />
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-[1.6rem] bg-muted/50" />
      ) : (
        <PatientsTable
          patients={patients}
          onEdit={setEditing}
          onDelete={setRemoving}
        />
      )}

      <PatientDialog
        patient={editing}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
      />

      <Dialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open) {
            setRemoving(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar paciente</DialogTitle>
            <DialogDescription>
              {removing
                ? `Se eliminará a ${patientFullName(removing)} del estudio. Esta acción no se puede deshacer.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRemoving(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePatient.isPending}
              onClick={() => {
                if (!removing) {
                  return;
                }
                deletePatient.mutate(removing.id, {
                  onSuccess: () => setRemoving(null),
                });
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
