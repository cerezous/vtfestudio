"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { ApacheForm, ApacheScoreSummary } from "@/modules/apache/components/apache-form";
import { useUpsertApacheScore } from "@/modules/apache/queries";
import {
  ageBandFromYears,
  emptyApacheState,
  stateFromPayload,
  type ApacheFormState,
} from "@/modules/apache/scoring";
import { exactAge } from "@/modules/patients/display";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { ApacheScore, Patient } from "@/shared/types/database";

function defaultAgeBand(patient: Patient) {
  const age = exactAge(patient.fecha_nacimiento);
  return age ? ageBandFromYears(age.years) : null;
}

function initialState(patient: Patient, record?: ApacheScore | null): ApacheFormState {
  const fallback = defaultAgeBand(patient);
  if (!record) {
    return emptyApacheState(fallback);
  }

  return stateFromPayload(record.payload, record.scored_at, fallback);
}

export function ApacheDialog({
  patient,
  record,
  open,
  onOpenChange,
}: {
  patient: Patient;
  record?: ApacheScore | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const upsert = useUpsertApacheScore(patient.id);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const editing = Boolean(record);
  const recordId = record?.id ?? null;
  const [state, setState] = useState<ApacheFormState>(() =>
    initialState(patient, record),
  );

  useEffect(() => {
    if (isOpen) {
      setState(initialState(patient, record));
    }
    // Solo al abrir o cambiar de registro; no al re-renderizar el paciente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, recordId, patient.id]);

  function handleOpenChange(next: boolean) {
    if (next) {
      setState(initialState(patient, record));
    }
    setOpen(next);
  }

  return (
    <>
      {isControlled ? null : (
        <Button type="button" onClick={() => handleOpenChange(true)}>
          <Plus className="size-4" />
          Nuevo APACHE II
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-6xl">
          <DialogHeader className="flex-row flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0 space-y-1.5">
              <DialogTitle>
                {editing ? "Editar APACHE II" : "Nuevo APACHE II"}
              </DialogTitle>
              <DialogDescription>
                Haz clic en el rango de cada parámetro. El puntaje y la
                mortalidad se calculan al instante.
              </DialogDescription>
            </div>
            <ApacheScoreSummary state={state} />
          </DialogHeader>
          <ApacheForm
            key={`${record?.id ?? "new"}-${String(isOpen)}`}
            state={state}
            onChange={setState}
            pending={upsert.isPending}
            submitLabel={editing ? "Guardar cambios" : "Guardar APACHE II"}
            onCancel={() => handleOpenChange(false)}
            onSubmit={() => {
              upsert.mutate(
                { id: record?.id, state },
                { onSuccess: () => handleOpenChange(false) },
              );
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
