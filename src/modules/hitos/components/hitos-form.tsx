"use client";

import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { GsaPasteButton } from "@/modules/hitos/components/gsa-paste-button";
import {
  HITO_KIND_OPTIONS,
  LUGAR_IOT_OPTIONS,
  MOTIVO_IOT_OPTIONS,
  MOTIVO_TQT_OPTIONS,
  WEANING_RESULTS,
  hitoNeedsGsa,
  type HitoKind,
} from "@/modules/hitos/constants";
import { parseOptionalNumber, hitoFormSchema, type HitoFormValues } from "@/modules/hitos/schemas";
import { computePafi } from "@/modules/registros/model";
import { Button } from "@/shared/components/ui/button";
import {
  chipBase,
  chipClass,
  choiceRowClass,
  computedFieldClass,
  fieldClass,
  selectClass,
  textareaClass,
} from "@/shared/components/ui/controls";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

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
      <Label>{label}</Label>
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
  allowedKinds,
  onSubmit,
  onCancel,
}: {
  defaultValues: HitoFormValues;
  pending: boolean;
  submitLabel: string;
  allowedKinds?: readonly HitoKind[];
  onSubmit: (values: HitoFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<HitoFormValues>({
    resolver: zodResolver(hitoFormSchema),
    defaultValues,
  });

  const kind = form.watch("kind");
  const motivoIot = form.watch("motivo_iot");
  const motivoTqt = form.watch("motivo_tqt");
  const weaning = form.watch("weaning_result");
  const dificil = form.watch("intubacion_dificil");
  const reintubacion = form.watch("reintubacion");
  const fio2 = form.watch("fio2");
  const pao2 = form.watch("pao2");
  const showGsa = hitoNeedsGsa(kind);
  const kindOptions = allowedKinds
    ? HITO_KIND_OPTIONS.filter((option) => allowedKinds.includes(option.id))
    : HITO_KIND_OPTIONS;

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
    if (next !== "iot") {
      form.setValue("motivo_iot", "");
      form.setValue("lugar_iot", "");
      form.setValue("intubacion_dificil", false);
      form.setValue("reintubacion", false);
    }
    if (next !== "iot" && next !== "tqt") {
      form.setValue("motivo_otro", "");
    }
    if (next !== "tqt") {
      form.setValue("motivo_tqt", "");
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
        <Label>Tipo de hito *</Label>
        <div className="flex flex-wrap gap-1.5">
          {kindOptions.map((option) => {
            const active = kind === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectKind(option.id)}
                  className={chipClass(active)}
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
        label={kind === "iot" ? "Fecha de IOT *" : "Fecha *"}
        error={form.formState.errors.occurred_at?.message}
      >
        <Input
          type="datetime-local"
          className={fieldClass}
          {...form.register("occurred_at")}
        />
      </Field>

      {kind === "iot" ? (
        <section className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Motivo de la IOT *"
            className="sm:col-span-2"
            error={form.formState.errors.motivo_iot?.message}
          >
            <select
              className={selectClass}
              {...form.register("motivo_iot")}
            >
              <option value="">Selecciona</option>
              {MOTIVO_IOT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          {motivoIot === "Otro" ? (
            <Field
              label="Especificar motivo *"
              className="sm:col-span-2"
              error={form.formState.errors.motivo_otro?.message}
            >
              <Input className={fieldClass} {...form.register("motivo_otro")} />
            </Field>
          ) : null}
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
        </section>
      ) : null}

      {kind === "tqt" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Motivo de la TQT *"
            className="sm:col-span-2"
            error={form.formState.errors.motivo_tqt?.message}
          >
            <select
              className={selectClass}
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
            Resultado *
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
                    chipBase,
                    "rounded-full",
                    active
                      ? option.id === "exitosa"
                        ? "bg-emerald-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28)]"
                        : "bg-destructive text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]"
                      : "bg-[rgb(120_120_128/0.12)] text-foreground hover:bg-[rgb(120_120_128/0.18)]",
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
              GSA
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
              label="Ác. láctico · mg/dL"
              hint="0 a 30"
              error={form.formState.errors.lactato?.message}
              {...form.register("lactato")}
            />
            <Field label="PaFi" hint="PaO₂ / FiO₂" className="sm:col-span-2">
              <Input
                readOnly
                tabIndex={-1}
                className={computedFieldClass}
                value={pafi == null ? "PaO₂ / FiO₂" : String(pafi)}
              />
            </Field>
          </div>
        </section>
      ) : null}

      <Field
        label="Observación"
        hint="Nota del hito"
        error={form.formState.errors.notes?.message}
      >
        <textarea
          rows={3}
          className={textareaClass}
          placeholder="Nota clínica"
          {...form.register("notes")}
        />
      </Field>

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
