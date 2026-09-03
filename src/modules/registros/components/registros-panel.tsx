"use client";

import { useState } from "react";

import { toast } from "sonner";

import { RegistrosChart } from "@/modules/registros/components/registros-chart";
import { RegistrosDialog } from "@/modules/registros/components/registros-dialog";
import { RegistrosTable } from "@/modules/registros/components/registros-table";
import {
  RegistrosViewSwitch,
  type RegistrosView,
} from "@/modules/registros/components/registros-view-switch";
import { MAX_CLINICAL_RECORDS } from "@/modules/registros/constants";
import {
  useClinicalRecords,
  useDeleteClinicalRecord,
} from "@/modules/registros/queries";
import { formatDateTime } from "@/modules/patients/display";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { ClinicalRecord, Patient } from "@/shared/types/database";

export function RegistrosPanel({ patient }: { patient: Patient }) {
  const { data, isLoading, error } = useClinicalRecords(patient.id);
  const deleteRecord = useDeleteClinicalRecord(patient.id);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClinicalRecord | null>(null);
  const [removing, setRemoving] = useState<ClinicalRecord | null>(null);
  const [view, setView] = useState<RegistrosView>("tabla");
  const records = data ?? [];
  const atLimit = records.length >= MAX_CLINICAL_RECORDS;

  if (error) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No se pudieron cargar los registros.
      </p>
    );
  }

  function openCreate() {
    if (atLimit) {
      toast.error(`Este paciente ya tiene ${MAX_CLINICAL_RECORDS} registros.`);
      return;
    }
    setCreating(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Estudio</p>
          <h2 className="text-2xl font-semibold tracking-tight">Registros</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Hasta {MAX_CLINICAL_RECORDS} mediciones por paciente. Cada columna es
            una fecha; las filas son el soporte, la ventilación y los gases.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm tabular-nums text-muted-foreground">
            {records.length}/{MAX_CLINICAL_RECORDS}
          </p>
          <RegistrosViewSwitch value={view} onChange={setView} />
          <RegistrosDialog patient={patient} recordCount={records.length} />
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-[1.6rem] bg-muted/50" />
      ) : view === "grafico" ? (
        <RegistrosChart records={records} />
      ) : (
        <RegistrosTable
          records={records}
          onEdit={setEditing}
          onDelete={setRemoving}
          onCreate={openCreate}
        />
      )}

      <RegistrosDialog
        patient={patient}
        record={editing}
        recordCount={records.length}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
      />

      <RegistrosDialog
        patient={patient}
        recordCount={records.length}
        open={creating}
        onOpenChange={setCreating}
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
            <DialogTitle>Eliminar registro</DialogTitle>
            <DialogDescription>
              {removing
                ? `Se eliminará el registro del ${formatDateTime(removing.recorded_at)}. Esta acción no se puede deshacer.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoving(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteRecord.isPending}
              onClick={() => {
                if (!removing) {
                  return;
                }
                deleteRecord.mutate(removing.id, {
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
