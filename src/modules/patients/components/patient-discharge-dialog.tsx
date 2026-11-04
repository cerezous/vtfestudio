"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { patientFullName } from "@/modules/patients/display";
import { patientToFormValues } from "@/modules/patients/components/patient-form";
import { useUpsertPatient } from "@/modules/patients/queries";
import { MOTIVO_EGRESO_OPTIONS } from "@/modules/patients/schemas";
import { Button } from "@/shared/components/ui/button";
import { fieldClass, selectClass } from "@/shared/components/ui/controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { Patient } from "@/shared/types/database";

function dischargeSchema(patient: Patient) {
  const motives = new Set<string>(MOTIVO_EGRESO_OPTIONS);
  if (patient.motivo_egreso) {
    motives.add(patient.motivo_egreso);
  }

  return z
    .object({
      fecha_egreso: z.string().trim().min(1, "Indica la fecha de egreso."),
      motivo_egreso: z.string().trim().min(1, "Indica el motivo de egreso."),
    })
    .superRefine((values, ctx) => {
      const floor = patient.fecha_ingreso_uci ?? patient.fecha_ingreso_hospital;
      if (values.fecha_egreso < floor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fecha_egreso"],
          message: "No puede ser anterior al ingreso.",
        });
      }

      if (!motives.has(values.motivo_egreso)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["motivo_egreso"],
          message: "Indica el motivo de egreso.",
        });
      }
    });
}

type DischargeValues = z.infer<ReturnType<typeof dischargeSchema>>;

function DischargeForm({
  patient,
  pending,
  onSubmit,
  onClear,
  onCancel,
}: {
  patient: Patient;
  pending: boolean;
  onSubmit: (values: DischargeValues) => void;
  onClear: () => void;
  onCancel: () => void;
}) {
  const hasDischarge = Boolean(patient.fecha_egreso || patient.motivo_egreso);
  const form = useForm<DischargeValues>({
    resolver: zodResolver(dischargeSchema(patient)),
    defaultValues: {
      fecha_egreso: patient.fecha_egreso ?? "",
      motivo_egreso: patient.motivo_egreso ?? "",
    },
  });

  const motiveOptions = MOTIVO_EGRESO_OPTIONS.includes(
    patient.motivo_egreso as (typeof MOTIVO_EGRESO_OPTIONS)[number],
  )
    ? MOTIVO_EGRESO_OPTIONS
    : patient.motivo_egreso
      ? [...MOTIVO_EGRESO_OPTIONS, patient.motivo_egreso]
      : MOTIVO_EGRESO_OPTIONS;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-1.5">
        <Label htmlFor="fecha_egreso">Fecha de egreso</Label>
        <Input
          id="fecha_egreso"
          type="date"
          className={fieldClass}
          min={patient.fecha_ingreso_uci ?? patient.fecha_ingreso_hospital}
          {...form.register("fecha_egreso")}
        />
        {form.formState.errors.fecha_egreso ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.fecha_egreso.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="motivo_egreso">Motivo de egreso</Label>
        <select
          id="motivo_egreso"
          className={selectClass}
          {...form.register("motivo_egreso")}
        >
          <option value="">Selecciona</option>
          {motiveOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {form.formState.errors.motivo_egreso ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.motivo_egreso.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {hasDischarge ? (
          <Button
            type="button"
            variant="ghost"
            className="mr-auto"
            disabled={pending}
            onClick={onClear}
          >
            Quitar egreso
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          Guardar egreso
        </Button>
      </div>
    </form>
  );
}

export function PatientDischargeDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const upsertPatient = useUpsertPatient();
  const editing = Boolean(patient?.fecha_egreso || patient?.motivo_egreso);

  function save(fecha_egreso: string | null, motivo_egreso: string | null) {
    if (!patient) {
      return;
    }

    upsertPatient.mutate(
      {
        id: patient.id,
        values: {
          ...patientToFormValues(patient),
          fecha_egreso,
          motivo_egreso,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar egreso" : "Egresar paciente"}
          </DialogTitle>
          <DialogDescription>
            {patient
              ? `${patientFullName(patient)}. Fecha y motivo de egreso.`
              : "Fecha y motivo de egreso."}
          </DialogDescription>
        </DialogHeader>
        {patient ? (
          <DischargeForm
            key={`${patient.id}-${patient.fecha_egreso ?? ""}-${patient.motivo_egreso ?? ""}`}
            patient={patient}
            pending={upsertPatient.isPending}
            onSubmit={(values) =>
              save(values.fecha_egreso, values.motivo_egreso)
            }
            onClear={() => save(null, null)}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
