"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PatientForm } from "@/modules/patients/components/patient-form";
import { useUpsertPatient } from "@/modules/patients/queries";
import type { PatientFormValues } from "@/modules/patients/schemas";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { Patient } from "@/shared/types/database";

export function PatientDialog({
  patient,
  open,
  onOpenChange,
  onSaved,
}: {
  patient?: Patient | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const upsertPatient = useUpsertPatient();
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const editing = Boolean(patient);

  function handleSubmit(values: PatientFormValues) {
    upsertPatient.mutate(
      {
        id: patient?.id,
        values: {
          ...values,
          fecha_egreso: patient?.fecha_egreso ?? null,
          motivo_egreso: patient?.motivo_egreso ?? null,
        },
      },
      { onSuccess: () => {
          setOpen(false);
          onSaved?.();
        } },
    );
  }

  return (
    <>
      {isControlled ? null : (
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Nuevo paciente
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar paciente" : "Nuevo paciente"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la ficha."
                : "Identificación y datos del estudio."}
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            key={`${patient?.id ?? "new"}-${String(isOpen)}`}
            patient={patient}
            pending={upsertPatient.isPending}
            submitLabel={editing ? "Guardar cambios" : "Crear paciente"}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
