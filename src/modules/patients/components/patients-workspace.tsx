"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { PatientDialog } from "@/modules/patients/components/patient-dialog";
import { PatientDischargeDialog } from "@/modules/patients/components/patient-discharge-dialog";
import { PatientsTable } from "@/modules/patients/components/patients-table";
import { patientFullName } from "@/modules/patients/display";
import { useDeletePatient, usePatients } from "@/modules/patients/queries";
import { patientMatchesQuery } from "@/modules/patients/search";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
  const [discharging, setDischarging] = useState<Patient | null>(null);
  const [removing, setRemoving] = useState<Patient | null>(null);
  const [query, setQuery] = useState("");
  const patients = data ?? [];
  const filtered = useMemo(
    () => patients.filter((patient) => patientMatchesQuery(patient, query)),
    [patients, query],
  );
  const searching = query.trim().length > 0;

  if (error) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No se cargaron los pacientes.
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
            Elige un paciente para abrir su ficha.
          </p>
        </div>
        <PatientDialog />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, RUT, ficha o diagnóstico"
          aria-label="Buscar pacientes"
          className="h-11 rounded-[1.4rem] border bg-card pr-11 pl-10 shadow-sm"
        />
        {searching ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-[1.6rem] bg-muted/50" />
      ) : (
        <PatientsTable
          patients={filtered}
          emptyMessage={
            searching
              ? `Ningún paciente coincide con “${query.trim()}”.`
              : undefined
          }
          onEdit={setEditing}
          onDelete={setRemoving}
          onDischarge={setDischarging}
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

      <PatientDischargeDialog
        patient={discharging}
        open={Boolean(discharging)}
        onOpenChange={(open) => {
          if (!open) {
            setDischarging(null);
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
                ? `Se elimina a ${patientFullName(removing)} del estudio. No se puede deshacer.`
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
