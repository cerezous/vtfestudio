"use client";

import { useState } from "react";

import { HitosDialog } from "@/modules/hitos/components/hitos-dialog";
import { HitosTimeline } from "@/modules/hitos/components/hitos-timeline";
import {
  useClinicalMilestones,
  useDeleteClinicalMilestone,
} from "@/modules/hitos/queries";
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
import type { ClinicalMilestone, Patient } from "@/shared/types/database";

export function HitosPanel({ patient }: { patient: Patient }) {
  const { data, isLoading, error } = useClinicalMilestones(patient.id);
  const deleteMilestone = useDeleteClinicalMilestone(patient.id);
  const [editing, setEditing] = useState<ClinicalMilestone | null>(null);
  const [removing, setRemoving] = useState<ClinicalMilestone | null>(null);
  const milestones = data ?? [];
  const hasIot = milestones.some((item) => item.kind === "iot");

  if (error) {
    return (
      <p className="rounded-[1.6rem] bg-[rgb(120_120_128/0.08)] px-4 py-8 text-center text-sm text-muted-foreground">
        No se pudieron cargar los hitos.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Registros</p>
          <h3 className="text-xl font-semibold tracking-tight">Hitos</h3>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Empieza por la IOT. Luego pronación, ECMO, TQT, extubación y weaning.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <HitosDialog
            patient={patient}
            initialKind="iot"
            triggerLabel="Registrar IOT"
          />
          <HitosDialog
            patient={patient}
            initialKind={hasIot ? "pronacion" : "iot"}
            triggerLabel="Nuevo hito"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-56 animate-pulse rounded-[1.6rem] bg-muted/50" />
      ) : (
        <HitosTimeline
          milestones={milestones}
          onEdit={setEditing}
          onDelete={setRemoving}
        />
      )}

      <HitosDialog
        patient={patient}
        milestone={editing}
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
            <DialogTitle>Eliminar hito</DialogTitle>
            <DialogDescription>
              {removing
                ? `Se elimina el hito del ${formatDateTime(removing.occurred_at)}. No se puede deshacer.`
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
              disabled={deleteMilestone.isPending}
              onClick={() => {
                if (!removing) {
                  return;
                }
                deleteMilestone.mutate(removing.id, {
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
