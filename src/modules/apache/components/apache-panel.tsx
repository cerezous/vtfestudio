"use client";

import { useState } from "react";

import { ApacheDialog } from "@/modules/apache/components/apache-dialog";
import { ApacheTable } from "@/modules/apache/components/apache-table";
import {
  useApacheScores,
  useDeleteApacheScore,
} from "@/modules/apache/queries";
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
import type { ApacheScore, Patient } from "@/shared/types/database";

export function ApachePanel({ patient }: { patient: Patient }) {
  const { data, isLoading, error } = useApacheScores(patient.id);
  const deleteScore = useDeleteApacheScore(patient.id);
  const [editing, setEditing] = useState<ApacheScore | null>(null);
  const [removing, setRemoving] = useState<ApacheScore | null>(null);
  const records = data ?? [];

  if (error) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No se pudo cargar el APACHE II.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Escala</p>
          <h2 className="text-2xl font-semibold tracking-tight">APACHE II</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Registra cada medición. Se guarda la fecha, el puntaje y el % de
            mortalidad.
          </p>
        </div>
        <ApacheDialog patient={patient} />
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-[1.6rem] bg-muted/50" />
      ) : (
        <ApacheTable
          records={records}
          onEdit={setEditing}
          onDelete={setRemoving}
        />
      )}

      <ApacheDialog
        patient={patient}
        record={editing}
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
            <DialogTitle>Eliminar APACHE II</DialogTitle>
            <DialogDescription>
              {removing
                ? `Se eliminará el registro del ${formatDateTime(removing.scored_at)}. Esta acción no se puede deshacer.`
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
              disabled={deleteScore.isPending}
              onClick={() => {
                if (!removing) {
                  return;
                }
                deleteScore.mutate(removing.id, {
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
