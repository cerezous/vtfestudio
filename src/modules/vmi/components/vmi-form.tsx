"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  LUGAR_IOT_OPTIONS,
  MOTIVO_VMI_OPTIONS,
} from "@/modules/vmi/constants";
import { vmiFormSchema, type VmiFormValues } from "@/modules/vmi/schemas";
import { Button } from "@/shared/components/ui/button";
import {
  choiceRowClass,
  fieldClass,
  selectClass,
  textareaClass,
} from "@/shared/components/ui/controls";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { VmiEpisode } from "@/shared/types/database";

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function episodeToFormValues(episode?: VmiEpisode | null): VmiFormValues {
  return {
    motivo_vmi: episode?.motivo_vmi ?? "",
    motivo_otro: episode?.motivo_otro ?? "",
    fecha_iot: episode?.fecha_iot ?? "",
    lugar_iot: episode?.lugar_iot ?? "",
    intubacion_dificil: episode?.intubacion_dificil ?? false,
    reintubacion: episode?.reintubacion ?? false,
    fecha_extubacion: episode?.fecha_extubacion ?? "",
    observaciones: episode?.observaciones ?? "",
  };
}

export function VmiForm({
  episode,
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  episode?: VmiEpisode | null;
  pending: boolean;
  submitLabel: string;
  onSubmit: (values: VmiFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<VmiFormValues>({
    resolver: zodResolver(vmiFormSchema),
    defaultValues: episodeToFormValues(episode),
  });

  const motivo = form.watch("motivo_vmi");
  const dificil = form.watch("intubacion_dificil");
  const reintubacion = form.watch("reintubacion");

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <section className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Motivo de la VMI *"
          className="sm:col-span-2"
          error={form.formState.errors.motivo_vmi?.message}
        >
          <select
            className={selectClass}
            {...form.register("motivo_vmi")}
          >
            <option value="">Selecciona</option>
            {MOTIVO_VMI_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        {motivo === "Otro" ? (
          <Field
            label="Especificar motivo *"
            className="sm:col-span-2"
            error={form.formState.errors.motivo_otro?.message}
          >
            <Input className={fieldClass} {...form.register("motivo_otro")} />
          </Field>
        ) : null}
        <Field
          label="Fecha de IOT *"
          error={form.formState.errors.fecha_iot?.message}
        >
          <Input
            type="date"
            className={fieldClass}
            {...form.register("fecha_iot")}
          />
        </Field>
        <Field
          label="Lugar de IOT"
          error={form.formState.errors.lugar_iot?.message}
        >
          <select
            className={selectClass}
            {...form.register("lugar_iot")}
          >
            <option value="">Sin dato</option>
            {LUGAR_IOT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
          <label
            className={choiceRowClass(dificil)}
          >
            <input
              type="checkbox"
              checked={dificil}
              onChange={() =>
                form.setValue("intubacion_dificil", !dificil, {
                  shouldDirty: true,
                })
              }
            />
            Intubación difícil
          </label>
          <label
            className={choiceRowClass(reintubacion)}
          >
            <input
              type="checkbox"
              checked={reintubacion}
              onChange={() =>
                form.setValue("reintubacion", !reintubacion, {
                  shouldDirty: true,
                })
              }
            />
            Reintubación
          </label>
        </div>
        <Field
          label="Fecha de extubación / retiro VMI"
          className="sm:col-span-2"
          error={form.formState.errors.fecha_extubacion?.message}
        >
          <Input
            type="date"
            className={fieldClass}
            {...form.register("fecha_extubacion")}
          />
        </Field>
        <Field
          label="Observaciones"
          className="sm:col-span-2"
          error={form.formState.errors.observaciones?.message}
        >
          <textarea
            rows={3}
            className={textareaClass}
            {...form.register("observaciones")}
          />
        </Field>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
