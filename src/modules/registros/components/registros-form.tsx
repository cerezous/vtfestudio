"use client";

import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  SUPPORT_OPTIONS,
  supportNeedsFlujo,
  supportNeedsVmi,
  supportNeedsVmni,
  type SupportId,
} from "@/modules/registros/constants";
import { GipiPasteButtons } from "@/modules/registros/components/gipi-paste-buttons";
import { computePafi, parseOptionalNumber } from "@/modules/registros/model";
import {
  recordFormSchema,
  type RecordFormValues,
} from "@/modules/registros/schemas";
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
      <Input
        inputMode="decimal"
        className={fieldClass}
        {...props}
      />
    </Field>
  );
}

export function RegistrosForm({
  defaultValues,
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  defaultValues: RecordFormValues;
  pending: boolean;
  submitLabel: string;
  onSubmit: (values: RecordFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues,
  });

  const support = form.watch("support");
  const fio2 = form.watch("fio2");
  const pao2 = form.watch("pao2");
  const showVmi = supportNeedsVmi(support);
  const showVmni = supportNeedsVmni(support);
  const showFlujo = supportNeedsFlujo(support);

  const pafi = useMemo(() => {
    return computePafi(parseOptionalNumber(pao2), parseOptionalNumber(fio2));
  }, [fio2, pao2]);

  function selectSupport(next: SupportId) {
    form.setValue("support", next, { shouldDirty: true, shouldValidate: true });
    if (next === "ambiental" && !form.getValues("fio2").trim()) {
      form.setValue("fio2", "21", { shouldDirty: true, shouldValidate: true });
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Fecha *"
          error={form.formState.errors.recorded_at?.message}
        >
          <Input
            type="datetime-local"
            className={fieldClass}
            {...form.register("recorded_at")}
          />
        </Field>
      </div>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sección ventilatoria
        </p>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Soporte *</p>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORT_OPTIONS.map((option) => {
              const active = support === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectSupport(option.id)}
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
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {showVmi ? (
            <>
              <NumberField
                label="PEEP * · cmH₂O"
                error={form.formState.errors.peep?.message}
                {...form.register("peep")}
              />
              <NumberField
                label="PmVA * · cmH₂O"
                error={form.formState.errors.pmva?.message}
                {...form.register("pmva")}
              />
              <NumberField
                label="Driving Pressure * · cmH₂O"
                error={form.formState.errors.driving_pressure?.message}
                {...form.register("driving_pressure")}
              />
              <NumberField
                label="IOX *"
                error={form.formState.errors.iox?.message}
                {...form.register("iox")}
              />
            </>
          ) : null}
          {showVmni ? (
            <>
              <NumberField
                label="PS * · cmH₂O"
                error={form.formState.errors.ps?.message}
                {...form.register("ps")}
              />
              <NumberField
                label="EPAP * · cmH₂O"
                error={form.formState.errors.epap?.message}
                {...form.register("epap")}
              />
            </>
          ) : null}
          {showFlujo ? (
            <NumberField
              label="Flujo * · L/min"
              error={form.formState.errors.flujo?.message}
              {...form.register("flujo")}
            />
          ) : null}
          <NumberField
            label="FiO₂ * · %"
            hint="21 a 100"
            error={form.formState.errors.fio2?.message}
            {...form.register("fio2")}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sección exámenes
          </p>
          <GipiPasteButtons form={form} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField
            label="PaO₂ · mmHg"
            error={form.formState.errors.pao2?.message}
            {...form.register("pao2")}
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
            label="PCR · mg/L"
            error={form.formState.errors.pcr?.message}
            {...form.register("pcr")}
          />
          <NumberField
            label="Ác. láctico · mmol/L"
            error={form.formState.errors.lactato?.message}
            {...form.register("lactato")}
          />
          <NumberField
            label="Procalcitonina · ng/mL"
            error={form.formState.errors.procalcitonina?.message}
            {...form.register("procalcitonina")}
          />
          <Field label="PaFi" hint="PaO₂ / FiO₂">
            <Input
              readOnly
              tabIndex={-1}
              className={cn(fieldClass, "bg-muted/50 font-medium tabular-nums")}
              value={pafi == null ? "Se calcula con PaO₂ y FiO₂" : String(pafi)}
            />
          </Field>
        </div>
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
