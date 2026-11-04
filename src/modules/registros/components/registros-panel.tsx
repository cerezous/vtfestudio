"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { HitosDialog } from "@/modules/hitos/components/hitos-dialog";
import { HitosPanel } from "@/modules/hitos/components/hitos-panel";
import { useClinicalMilestones } from "@/modules/hitos/queries";
import { hasVmiAirway, VMI_AIRWAY_KINDS } from "@/modules/hitos/rules";
import { formatDateTime } from "@/modules/patients/display";
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
  useUpsertClinicalRecord,
} from "@/modules/registros/queries";
import type { RecordFormValues } from "@/modules/registros/schemas";
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

type PendingVmiRecord = {
  record: ClinicalRecord | null;
  values: RecordFormValues;
};

export function RegistrosPanel({ patient }: { patient: Patient }) {
  const { data, isLoading, error } = useClinicalRecords(patient.id);
  const milestonesQuery = useClinicalMilestones(patient.id);
  const deleteRecord = useDeleteClinicalRecord(patient.id);
  const upsertRecord = useUpsertClinicalRecord(patient.id);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClinicalRecord | null>(null);
  const [removing, setRemoving] = useState<ClinicalRecord | null>(null);
  const [view, setView] = useState<RegistrosView>("tabla");
  const [airwayOpen, setAirwayOpen] = useState(false);
  const [recordDraft, setRecordDraft] = useState<RecordFormValues | null>(null);
  const pendingVmiRef = useRef<PendingVmiRecord | null>(null);
  const airwaySavedRef = useRef(false);
  const records = data ?? [];
  const atLimit = records.length >= MAX_CLINICAL_RECORDS;
  const milestones = milestonesQuery.data ?? [];
  const hasAirwayHito = hasVmiAirway(milestones);
  const airwayReady = !milestonesQuery.isLoading && !milestonesQuery.error;

  if (error) {
    return (
      <p className="rounded-[1.6rem] bg-[rgb(120_120_128/0.08)] px-4 py-8 text-center text-sm text-muted-foreground">
        No se pudieron cargar los registros.
      </p>
    );
  }

  function openCreate() {
    if (atLimit) {
      toast.error(`Este paciente ya tiene ${MAX_CLINICAL_RECORDS} registros.`);
      return;
    }
    setRecordDraft(null);
    setCreating(true);
  }

  function requestAirwayHito(
    values: RecordFormValues,
    record: ClinicalRecord | null,
  ) {
    pendingVmiRef.current = { record, values };
    airwaySavedRef.current = false;
    setRecordDraft(values);
    setCreating(false);
    setEditing(null);
    setAirwayOpen(true);
    toast.message("Para VMI, registra IOT o TQT.");
  }

  function restorePendingRecord() {
    const pending = pendingVmiRef.current;
    if (!pending) {
      return;
    }
    setRecordDraft(pending.values);
    if (pending.record) {
      setEditing(pending.record);
    } else {
      setCreating(true);
    }
  }

  function savePendingRecord() {
    const pending = pendingVmiRef.current;
    if (!pending) {
      return;
    }

    upsertRecord.mutate(
      { id: pending.record?.id, values: pending.values },
      {
        onSuccess: () => {
          pendingVmiRef.current = null;
          setRecordDraft(null);
        },
        onError: () => {
          restorePendingRecord();
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Estudio</p>
          <h2 className="text-2xl font-semibold tracking-tight">Registros</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Hasta {MAX_CLINICAL_RECORDS} mediciones. Cada columna es una fecha.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm tabular-nums text-muted-foreground">
            {records.length}/{MAX_CLINICAL_RECORDS}
          </p>
          <RegistrosViewSwitch value={view} onChange={setView} />
          <Button type="button" disabled={atLimit} onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo registro
          </Button>
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

      <div className="pt-2">
        <HitosPanel patient={patient} />
      </div>

      <RegistrosDialog
        patient={patient}
        record={editing}
        recordCount={records.length}
        open={Boolean(editing)}
        draftValues={editing ? recordDraft : null}
        hasAirwayHito={hasAirwayHito}
        airwayReady={airwayReady}
        onNeedAirwayHito={(values) => requestAirwayHito(values, editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            if (!airwayOpen) {
              setRecordDraft(null);
            }
          }
        }}
      />

      <RegistrosDialog
        patient={patient}
        recordCount={records.length}
        open={creating}
        draftValues={creating ? recordDraft : null}
        hasAirwayHito={hasAirwayHito}
        airwayReady={airwayReady}
        onNeedAirwayHito={(values) => requestAirwayHito(values, null)}
        onOpenChange={(open) => {
          setCreating(open);
          if (!open && !airwayOpen) {
            setRecordDraft(null);
          }
        }}
      />

      <HitosDialog
        patient={patient}
        open={airwayOpen}
        initialKind="iot"
        allowedKinds={VMI_AIRWAY_KINDS}
        title="Registrar IOT o TQT"
        triggerLabel="Registrar IOT o TQT"
        submitLabel="Guardar hito y continuar"
        description="VMI exige IOT o TQT. Después se guarda el registro."
        onSaved={() => {
          airwaySavedRef.current = true;
          setAirwayOpen(false);
          savePendingRecord();
        }}
        onOpenChange={(open) => {
          if (open) {
            airwaySavedRef.current = false;
            setAirwayOpen(true);
            return;
          }
          setAirwayOpen(false);
          if (!airwaySavedRef.current) {
            window.setTimeout(() => restorePendingRecord(), 50);
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
            <DialogTitle>Eliminar registro</DialogTitle>
            <DialogDescription>
              {removing
                ? `Se elimina el registro del ${formatDateTime(removing.recorded_at)}. No se puede deshacer.`
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
