"use client";

import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { GsaPasteButton } from "@/modules/hitos/components/gsa-paste-button";
import {
  HITO_KIND_OPTIONS,
  MOTIVO_TQT_OPTIONS,
  WEANING_RESULTS,
  hitoNeedsGsa,
  type HitoKind,
} from "@/modules/hitos/constants";
import { parseOptionalNumber, hitoFormSchema, type HitoFormValues } from "@/modules/hitos/schemas";
import { computePafi } from "@/modules/registros/model";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

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

function NumberField({
  label,
  hint,
  error,
  className,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
} & ComponentProps<typeof Input>) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <Input inputMode="decimal" className={fieldClass} {...props} />
    </Field>
  );
}

export function HitosForm({
  defaultValues,
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  defaultValues: HitoFormValues;
  pending: boolean;
  submitLabel: string;
  onSubmit: (values: HitoFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<HitoFormValues>({
    resolver: zodResolver(hitoFormSchema),
    defaultValues,
  });

  const kind = form.watch("kind");
  const motivoTqt = form.watch("motivo_tqt");
  const weaning = form.watch("weaning_result");
  const fio2 = form.watch("fio2");
  const pao2 = form.watch("pao2");
  const showGsa = hitoNeedsGsa(kind);

  const pafi = useMemo(() => {
    return computePafi(parseOptionalNumber(pao2), parseOptionalNumber(fio2));
  }, [fio2, pao2]);

  function selectKind(next: HitoKind) {
    form.setValue("kind", next, { shouldDirty: true, shouldValidate: true });
    if (!hitoNeedsGsa(next)) {
      form.setValue("pao2", "");
      form.setValue("paco2", "");
      form.setValue("hco3", "");
      form.setValue("eb", "");
      form.setValue("fio2", "");
      form.setValue("lactato", "");
    }
    if (next !== "tqt") {
      form.setValue("motivo_tqt", "");
      form.setValue("motivo_otro", "");
    }
    if (next !== "weaning") {
      form.setValue("weaning_result", "");
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Tipo de hito *</p>
        <div className="flex flex-wrap gap-1.5">
          {HITO_KIND_OPTIONS.map((option) => {
            const active = kind === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectKind(option.id)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-input bg-background hover:bg-accent",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {form.formState.errors.kind?.message ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.kind.message}
          </p>
        ) : null}
      </div>

      <Field
        label="Fecha *"
        error={form.formState.errors.occurred_at?.message}
      >
        <Input
          type="datetime-local"
          className={fieldClass}
          {...form.register("occurred_at")}
        />
      </Field>

      {kind === "tqt" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Motivo de la TQT *"
            className="sm:col-span-2"
            error={form.formState.errors.motivo_tqt?.message}
          >
            <select
              className={cn(fieldClass, "bg-background")}
              {...form.register("motivo_tqt")}
            >
              <option value="">Selecciona</option>
              {MOTIVO_TQT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          {motivoTqt === "Otro" ? (
            <Field
              label="Especificar motivo *"
              className="sm:col-span-2"
              error={form.formState.errors.motivo_otro?.message}
            >
              <Input className={fieldClass} {...form.register("motivo_otro")} />
            </Field>
          ) : null}
        </div>
      ) : null}

      {kind === "weaning" ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Resultado de la consolidación *
          </p>
          <div className="flex flex-wrap gap-1.5">
            {WEANING_RESULTS.map((option) => {
              const active = weaning === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    form.setValue("weaning_result", option.id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition",
                    active
                      ? option.id === "exitosa"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-destructive bg-destructive text-white"
                      : "border-input bg-background hover:bg-accent",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {form.formState.errors.weaning_result?.message ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.weaning_result.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {showGsa ? (
        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              GSA de respaldo
            </p>
            <GsaPasteButton form={form} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="PaO₂ * · mmHg"
              error={form.formState.errors.pao2?.message}
              {...form.register("pao2")}
            />
            <NumberField
              label="FiO₂ * · %"
              hint="21 a 100"
              error={form.formState.errors.fio2?.message}
              {...form.register("fio2")}
            />
            <NumberField
              label="PaCO₂ · mmHg"
              error={form.formState.errors.paco2?.message}
              {...form.register("paco2")}
            />
            <NumberField
              label="HCO₃ · mEq/L"
              error={form.formState.errors.hco3?.message}
              {...form.register("hco3")}
            />
            <NumberField
              label="EB · mEq/L"
              error={form.formState.errors.eb?.message}
              {...form.register("eb")}
            />
            <NumberField
              label="Ác. láctico · mmol/L"
              error={form.formState.errors.lactato?.message}
              {...form.register("lactato")}
            />
            <Field label="PaFi" hint="PaO₂ / FiO₂" className="sm:col-span-2">
              <Input
                readOnly
                tabIndex={-1}
                className={cn(fieldClass, "bg-muted/50 font-medium tabular-nums")}
                value={pafi == null ? "Se calcula con PaO₂ y FiO₂" : String(pafi)}
              />
            </Field>
          </div>
        </section>
      ) : null}

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
