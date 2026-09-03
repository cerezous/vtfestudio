"use client";

import { useState } from "react";

import { VmiDialog } from "@/modules/vmi/components/vmi-dialog";
import { VmiTable } from "@/modules/vmi/components/vmi-table";
import { useDeleteVmiEpisode, useVmiEpisodes } from "@/modules/vmi/queries";
import { formatDate } from "@/modules/patients/display";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { Patient, VmiEpisode } from "@/shared/types/database";

export function VmiPanel({ patient }: { patient: Patient }) {
  const { data, isLoading, error } = useVmiEpisodes(patient.id);
  const deleteEpisode = useDeleteVmiEpisode(patient.id);
  const [editing, setEditing] = useState<VmiEpisode | null>(null);
  const [removing, setRemoving] = useState<VmiEpisode | null>(null);
  const episodes = data ?? [];

  if (error) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No se pudieron cargar los datos de VMI.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Estudio</p>
          <h2 className="text-2xl font-semibold tracking-tight">Datos de VMI</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Registra el motivo, la fecha de IOT y los datos previos al ingreso a
            UCI.
          </p>
        </div>
        <VmiDialog patient={patient} />
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-[1.6rem] bg-muted/50" />
      ) : (
        <VmiTable
          episodes={episodes}
          onEdit={setEditing}
          onDelete={setRemoving}
        />
      )}

      <VmiDialog
        patient={patient}
        episode={editing}
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
            <DialogTitle>Eliminar datos de VMI</DialogTitle>
            <DialogDescription>
              {removing
                ? `Se eliminará el registro de IOT del ${formatDate(removing.fecha_iot)}. Esta acción no se puede deshacer.`
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
              disabled={deleteEpisode.isPending}
              onClick={() => {
                if (!removing) {
                  return;
                }
                deleteEpisode.mutate(removing.id, {
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
