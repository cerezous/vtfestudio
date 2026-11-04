"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { PatientDialog } from "@/modules/patients/components/patient-dialog";
import {
  formatExactAge,
  formatRut,
  patientFullName,
} from "@/modules/patients/display";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/lib/constants";
import type { Patient } from "@/shared/types/database";

function ChartBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Volver a pacientes"
      onClick={() => router.push(ROUTES.patients)}
      className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <ArrowLeft className="size-5" />
    </button>
  );
}

export function ClinicalChartHeader({ patient }: { patient: Patient }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <ChartBackButton />
          <h1 className="truncate text-2xl font-semibold">
            {patientFullName(patient)}
          </h1>
        </div>
        <p className="mt-0.5 pl-10 text-sm text-muted-foreground">
          Ficha {patient.n_ficha} · {formatRut(patient.id_rut)} ·{" "}
          {formatExactAge(patient.fecha_nacimiento)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-3.5" />
          Editar
        </Button>
      </div>
      <PatientDialog
        patient={patient}
        open={editing}
        onOpenChange={setEditing}
        onSaved={() => router.refresh()}
      />
    </header>
  );
}
