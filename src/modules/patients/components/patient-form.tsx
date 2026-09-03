"use client";

import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { formatExactAge, formatRutInput } from "@/modules/patients/display";
import {
  ANTECEDENTES_OPTIONS,
  GRUPO_DIAGNOSTICO_OPTIONS,
  MOTIVO_EGRESO_OPTIONS,
  parseAntecedentes,
  patientFormSchema,
  type PatientFormValues,
} from "@/modules/patients/schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { Patient } from "@/shared/types/database";

const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60";

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function patientToFormValues(patient?: Patient | null): PatientFormValues {
  return {
    id_rut: patient?.id_rut ? formatRutInput(patient.id_rut) : "",
    n_ficha: patient?.n_ficha ?? ("" as unknown as number),
    nombres: patient?.nombres ?? "",
    apellido1: patient?.apellido1 ?? "",
    apellido2: patient?.apellido2 ?? "",
    sexo:
      patient?.sexo === "H" || patient?.sexo === "M" || patient?.sexo === "I"
        ? patient.sexo
        : "",
    fecha_nacimiento: patient?.fecha_nacimiento ?? "",
    nacionalidad: patient?.nacionalidad ?? "",
    diagnostico: patient?.diagnostico ?? "",
    grupo_diagnostico: patient?.grupo_diagnostico ?? "",
    antecedentes: parseAntecedentes(patient?.antecedentes_morbidos),
    fecha_ingreso_hospital: patient?.fecha_ingreso_hospital ?? "",
    fecha_ingreso_uci: patient?.fecha_ingreso_uci ?? "",
    fecha_egreso: patient?.fecha_egreso ?? "",
    motivo_egreso: patient?.motivo_egreso ?? "",
  };
}

export function PatientForm({
  patient,
  editing = false,
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  patient?: Patient | null;
  editing?: boolean;
  pending: boolean;
  submitLabel: string;
  onSubmit: (values: PatientFormValues) => void;
  onCancel?: () => void;
}) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patientToFormValues(patient),
  });

  const birthDate = form.watch("fecha_nacimiento");
  const antecedentes = form.watch("antecedentes") ?? [];

  function toggleAntecedente(option: string) {
    const current = form.getValues("antecedentes");
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    form.setValue("antecedentes", next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <section className="grid gap-3 sm:grid-cols-2">
        <Field label="RUT *" error={form.formState.errors.id_rut?.message}>
          <Controller
            control={form.control}
            name="id_rut"
            render={({ field }) => (
              <Input
                className={fieldClass}
                inputMode="text"
                autoComplete="off"
                placeholder="12.345.678-9"
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(formatRutInput(event.target.value))
                }
              />
            )}
          />
        </Field>
        <Field label="N° ficha *" error={form.formState.errors.n_ficha?.message}>
          <Input
            type="number"
            className={fieldClass}
            {...form.register("n_ficha")}
          />
        </Field>
        <Field label="Nombres *" error={form.formState.errors.nombres?.message}>
          <Input className={fieldClass} {...form.register("nombres")} />
        </Field>
        <Field
          label="Primer apellido *"
          error={form.formState.errors.apellido1?.message}
        >
          <Input className={fieldClass} {...form.register("apellido1")} />
        </Field>
        <Field label="Segundo apellido">
          <Input className={fieldClass} {...form.register("apellido2")} />
        </Field>
        <Field label="Sexo">
          <select className={cn(fieldClass, "bg-background")} {...form.register("sexo")}>
            <option value="">Sin dato</option>
            <option value="H">Hombre</option>
            <option value="M">Mujer</option>
            <option value="I">Indeterminado</option>
          </select>
        </Field>
        <Field
          label="Fecha de nacimiento *"
          error={form.formState.errors.fecha_nacimiento?.message}
        >
          <Input
            type="date"
            className={fieldClass}
            {...form.register("fecha_nacimiento")}
          />
        </Field>
        <Field label="Edad exacta">
          <Input
            readOnly
            tabIndex={-1}
            className={cn(fieldClass, "bg-muted/50")}
            value={birthDate ? formatExactAge(birthDate) : "Se calcula con la fecha de nacimiento"}
          />
        </Field>
        <Field label="Nacionalidad">
          <Input className={fieldClass} {...form.register("nacionalidad")} />
        </Field>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:col-span-2">
          Estudio VMI
        </p>
        <Field
          label="Diagnóstico principal *"
          className="sm:col-span-2"
          error={form.formState.errors.diagnostico?.message}
        >
          <Input className={fieldClass} {...form.register("diagnostico")} />
        </Field>
        <Field
          label="Grupo diagnóstico *"
          className="sm:col-span-2"
          error={form.formState.errors.grupo_diagnostico?.message}
        >
          <select
            className={cn(fieldClass, "bg-background")}
            {...form.register("grupo_diagnostico")}
          >
            <option value="">Selecciona</option>
            {GRUPO_DIAGNOSTICO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">
            Antecedentes mórbidos
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ANTECEDENTES_OPTIONS.map((option) => {
              const checked = antecedentes.includes(option);
              return (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                    checked
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-input bg-background",
                  )}
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-[#2F6BFF]"
                    checked={checked}
                    onChange={() => toggleAntecedente(option)}
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </div>
        <Field
          label="Fecha ingreso hospital *"
          error={form.formState.errors.fecha_ingreso_hospital?.message}
        >
          <Input
            type="date"
            className={fieldClass}
            {...form.register("fecha_ingreso_hospital")}
          />
        </Field>
        <Field
          label="Fecha ingreso UCI"
          error={form.formState.errors.fecha_ingreso_uci?.message}
        >
          <Input
            type="date"
            className={fieldClass}
            {...form.register("fecha_ingreso_uci")}
          />
        </Field>
        {editing ? (
          <>
            <Field
              label="Fecha egreso"
              error={form.formState.errors.fecha_egreso?.message}
            >
              <Input
                type="date"
                className={fieldClass}
                {...form.register("fecha_egreso")}
              />
            </Field>
            <Field
              label="Motivo de egreso"
              error={form.formState.errors.motivo_egreso?.message}
            >
              <select
                className={cn(fieldClass, "bg-background")}
                {...form.register("motivo_egreso")}
              >
                <option value="">Sin egreso</option>
                {MOTIVO_EGRESO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : null}
      </section>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
