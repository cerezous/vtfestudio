"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { RegistrosForm } from "@/modules/registros/components/registros-form";
import {
  MAX_CLINICAL_RECORDS,
  supportNeedsVmi,
} from "@/modules/registros/constants";
import { emptyRecordForm, recordToFormValues } from "@/modules/registros/model";
import { useUpsertClinicalRecord } from "@/modules/registros/queries";
import type { RecordFormValues } from "@/modules/registros/schemas";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { ClinicalRecord, Patient } from "@/shared/types/database";

export function RegistrosDialog({
  patient,
  record,
  recordCount = 0,
  open,
  onOpenChange,
  draftValues,
  hasAirwayHito = true,
  airwayReady = true,
  onNeedAirwayHito,
}: {
  patient: Patient;
  record?: ClinicalRecord | null;
  recordCount?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  draftValues?: RecordFormValues | null;
  hasAirwayHito?: boolean;
  airwayReady?: boolean;
  onNeedAirwayHito?: (values: RecordFormValues) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const upsert = useUpsertClinicalRecord(patient.id);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const editing = Boolean(record);
  const recordId = record?.id ?? null;
  const atLimit = !editing && recordCount >= MAX_CLINICAL_RECORDS;
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormKey((current) => current + 1);
    }
  }, [isOpen, recordId, patient.id, draftValues]);

  function handleOpenChange(next: boolean) {
    if (next && atLimit) {
      return;
    }
    setOpen(next);
  }

  return (
    <>
      {isControlled ? null : (
        <Button
          type="button"
          disabled={atLimit}
          onClick={() => handleOpenChange(true)}
        >
          <Plus className="size-4" />
          Nuevo registro
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar registro" : "Nuevo registro"}
            </DialogTitle>
            <DialogDescription>
              Soporte y gases. En VMI elige el modo del Puritan Bennett 980 y
              completa sus parámetros. ml/kg/PI usa el Vt y el peso ideal.
            </DialogDescription>
          </DialogHeader>
          {isOpen ? (
            <RegistrosForm
              key={`${record?.id ?? "new"}-${formKey}`}
              defaultValues={
                draftValues ??
                (record ? recordToFormValues(record) : emptyRecordForm())
              }
              pending={upsert.isPending}
              hasAirwayHito={hasAirwayHito}
              pesoIdeal={patient.peso_ideal}
              submitLabel={editing ? "Guardar cambios" : "Guardar registro"}
              onCancel={() => handleOpenChange(false)}
              onSubmit={(values) => {
                if (supportNeedsVmi(values.support) && onNeedAirwayHito) {
                  if (!airwayReady) {
                    toast.error("Cargando hitos. Intenta de nuevo.");
                    return;
                  }
                  if (!hasAirwayHito) {
                    handleOpenChange(false);
                    onNeedAirwayHito(values);
                    return;
                  }
                }

                upsert.mutate(
                  { id: record?.id, values },
                  { onSuccess: () => handleOpenChange(false) },
                );
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
