"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { HitosForm } from "@/modules/hitos/components/hitos-form";
import type { HitoKind } from "@/modules/hitos/constants";
import { emptyHitoForm, milestoneToFormValues } from "@/modules/hitos/model";
import { useUpsertClinicalMilestone } from "@/modules/hitos/queries";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { ClinicalMilestone, Patient } from "@/shared/types/database";

export function HitosDialog({
  patient,
  milestone,
  initialKind = "iot",
  fechaIot,
  triggerLabel = "Nuevo hito",
  open,
  onOpenChange,
}: {
  patient: Patient;
  milestone?: ClinicalMilestone | null;
  initialKind?: HitoKind;
  fechaIot?: string | null;
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const upsert = useUpsertClinicalMilestone(patient.id);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const editing = Boolean(milestone);
  const recordId = milestone?.id ?? null;
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormKey((current) => current + 1);
    }
  }, [isOpen, recordId, patient.id, initialKind]);

  return (
    <>
      {isControlled ? null : (
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          {triggerLabel}
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar hito" : triggerLabel}</DialogTitle>
            <DialogDescription>
              {initialKind === "iot" && !editing
                ? "La línea de tiempo parte por la IOT. Luego puedes marcar pronación, ECMO, TQT, extubación y weaning."
                : "Marca el hito con su fecha. Pronación, supinación y ECMO llevan GSA de respaldo."}
            </DialogDescription>
          </DialogHeader>
          {isOpen ? (
            <HitosForm
              key={`${milestone?.id ?? "new"}-${formKey}`}
              defaultValues={
                milestone
                  ? milestoneToFormValues(milestone)
                  : emptyHitoForm(initialKind, fechaIot)
              }
              pending={upsert.isPending}
              submitLabel={editing ? "Guardar cambios" : "Guardar hito"}
              onCancel={() => setOpen(false)}
              onSubmit={(values) => {
                upsert.mutate(
                  { id: milestone?.id, values },
                  { onSuccess: () => setOpen(false) },
                );
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
