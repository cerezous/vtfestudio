"use client";

import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { computeVtMlKgPi } from "@/modules/patients/anthropometry";
import {
  SUPPORT_OPTIONS,
  supportNeedsFlujo,
  supportNeedsVmi,
  supportNeedsVmni,
  type SupportId,
} from "@/modules/registros/constants";
import { GipiPasteButtons } from "@/modules/registros/components/gipi-paste-buttons";
import {
  asNumber,
  computeDrivingPressure,
  computeIox,
  computePafi,
  parseOptionalNumber,
} from "@/modules/registros/model";
import {
  FLOW_PATTERNS,
  PB980_MODES,
  VENT_PARAM_IDS,
  modeParams,
  modeSetsVt,
  modeUsesFlowPattern,
  parseVentMode,
  type FlowPatternId,
  type Pb980ModeId,
} from "@/modules/registros/pb980";
import {
  recordFormSchema,
  type RecordFormValues,
} from "@/modules/registros/schemas";
import { Button } from "@/shared/components/ui/button";
import {
  chipClass,
  computedFieldClass,
  fieldClass,
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
  hasAirwayHito = true,
  pesoIdeal = null,
  onSubmit,
  onCancel,
}: {
  defaultValues: RecordFormValues;
  pending: boolean;
  submitLabel: string;
  hasAirwayHito?: boolean;
  pesoIdeal?: number | string | null;
  onSubmit: (values: RecordFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues,
  });

  const support = form.watch("support");
  const ventMode = form.watch("vent_mode");
  const flowPattern = form.watch("flow_pattern");
  const fio2 = form.watch("fio2");
  const pao2 = form.watch("pao2");
  const peep = form.watch("peep");
  const pplat = form.watch("pplat");
  const pmva = form.watch("pmva");
  const vt = form.watch("vt");
  const showVmi = supportNeedsVmi(support);
  const showVmni = supportNeedsVmni(support);
  const showFlujo = supportNeedsFlujo(support);
  const mode = showVmi ? parseVentMode(ventMode) : null;
  const modeFields = mode ? modeParams(mode.id) : [];
  const setsVt = mode ? modeSetsVt(mode) : false;

  const pafi = useMemo(() => {
    return computePafi(parseOptionalNumber(pao2), parseOptionalNumber(fio2));
  }, [fio2, pao2]);

  const drivingPressure = useMemo(() => {
    return computeDrivingPressure(
      parseOptionalNumber(pplat),
      parseOptionalNumber(peep),
    );
  }, [peep, pplat]);

  const iox = useMemo(() => {
    return computeIox(
      parseOptionalNumber(fio2),
      parseOptionalNumber(pmva),
      parseOptionalNumber(pao2),
    );
  }, [fio2, pao2, pmva]);

  const pesoIdealKg = asNumber(pesoIdeal);
  const vtMlKgPi = useMemo(() => {
    return computeVtMlKgPi(parseOptionalNumber(vt), pesoIdealKg);
  }, [pesoIdealKg, vt]);

  function selectSupport(next: SupportId) {
    form.setValue("support", next, { shouldDirty: true, shouldValidate: true });
    if (next === "ambiental" && !form.getValues("fio2").trim()) {
      form.setValue("fio2", "21", { shouldDirty: true, shouldValidate: true });
    }
  }

  function selectVentMode(next: Pb980ModeId) {
    form.setValue("vent_mode", next, { shouldDirty: true, shouldValidate: true });
    const active = new Set(modeParams(next).map((item) => item.id));
    for (const id of VENT_PARAM_IDS) {
      if (!active.has(id)) {
        form.clearErrors(id);
      }
    }
    if (!modeUsesFlowPattern(next)) {
      form.clearErrors("flow_pattern");
    }
  }

  function selectFlowPattern(next: FlowPatternId) {
    form.setValue("flow_pattern", flowPattern === next ? "" : next, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
          Ventilación
        </p>
        <div className="space-y-2">
          <Label>Soporte *</Label>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORT_OPTIONS.map((option) => {
              const active = support === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectSupport(option.id)}
                  className={chipClass(active)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {showVmi && !hasAirwayHito ? (
            <p className="text-xs text-amber-700">
              VMI exige IOT o TQT. Al guardar se pedirá el hito.
            </p>
          ) : null}
        </div>

        {showVmi ? (
          <div className="space-y-3 rounded-[16px] bg-[rgb(120_120_128/0.08)] p-3 dark:bg-white/[0.06]">
            <div className="space-y-2">
              <Label>Modo Puritan Bennett 980 *</Label>
              <div className="flex flex-wrap gap-1.5">
                {PB980_MODES.map((option) => {
                  const active = mode?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectVentMode(option.id)}
                      className={chipClass(active)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.vent_mode?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.vent_mode.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {mode
                    ? mode.summary
                    : "Elige AC/VC, AC/PC, SIMV o espontáneo."}
                </p>
              )}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {showVmi && mode ? (
            <>
              <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:col-span-2">
                Programados
              </p>
              <NumberField
                label="PEEP * · cmH₂O"
                error={form.formState.errors.peep?.message}
                {...form.register("peep")}
              />
              {modeFields.map((item) => (
                <NumberField
                  key={item.id}
                  label={
                    item.required
                      ? `${item.label} * · ${item.unit}`
                      : `${item.label} · ${item.unit}`
                  }
                  hint={item.hint}
                  error={form.formState.errors[item.id]?.message}
                  {...form.register(item.id)}
                />
              ))}
              {modeUsesFlowPattern(mode.id) ? (
                <Field
                  label="Patrón de flujo"
                  hint="Opcional. Toca de nuevo para quitarlo."
                  className="sm:col-span-2"
                  error={form.formState.errors.flow_pattern?.message}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {FLOW_PATTERNS.map((option) => {
                      const active = flowPattern === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => selectFlowPattern(option.id)}
                          className={chipClass(active)}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              ) : null}
              {setsVt ? (
                <>
                  <NumberField
                    label="Vt * · mL"
                    hint="100 a 1500"
                    error={form.formState.errors.vt?.message}
                    {...form.register("vt")}
                  />
                  <Field
                    label="ml/kg/PI"
                    hint={
                      pesoIdealKg != null
                        ? `Vt / peso ideal (${pesoIdealKg} kg)`
                        : "Falta talla y sexo en la ficha"
                    }
                  >
                    <Input
                      readOnly
                      tabIndex={-1}
                      className={computedFieldClass}
                      value={
                        vtMlKgPi == null
                          ? pesoIdealKg == null
                            ? "Sin peso ideal"
                            : "Según el Vt"
                          : String(vtMlKgPi)
                      }
                    />
                  </Field>
                </>
              ) : null}
              <NumberField
                label="FiO₂ * · %"
                hint="21 a 100"
                error={form.formState.errors.fio2?.message}
                {...form.register("fio2")}
              />
              <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:col-span-2">
                Medidos
              </p>
              {setsVt ? null : (
                <>
                  <NumberField
                    label="Vt exhalado * · mL"
                    hint="100 a 1500"
                    error={form.formState.errors.vt?.message}
                    {...form.register("vt")}
                  />
                  <Field
                    label="ml/kg/PI"
                    hint={
                      pesoIdealKg != null
                        ? `Vt / peso ideal (${pesoIdealKg} kg)`
                        : "Falta talla y sexo en la ficha"
                    }
                  >
                    <Input
                      readOnly
                      tabIndex={-1}
                      className={computedFieldClass}
                      value={
                        vtMlKgPi == null
                          ? pesoIdealKg == null
                            ? "Sin peso ideal"
                            : "Según el Vt"
                          : String(vtMlKgPi)
                      }
                    />
                  </Field>
                </>
              )}
              <NumberField
                label="PmVA * · cmH₂O"
                error={form.formState.errors.pmva?.message}
                {...form.register("pmva")}
              />
              {mode.id === "ac_vc" ? (
                <Field label="Driving Pressure" hint="Pplat − PEEP">
                  <Input
                    readOnly
                    tabIndex={-1}
                    className={computedFieldClass}
                    value={
                      drivingPressure == null ? "Pplat − PEEP" : String(drivingPressure)
                    }
                  />
                </Field>
              ) : (
                <NumberField
                  label="Driving Pressure * · cmH₂O"
                  error={form.formState.errors.driving_pressure?.message}
                  {...form.register("driving_pressure")}
                />
              )}
              <Field label="IOX" hint="FiO₂ × PmVA / PaO₂">
                <Input
                  readOnly
                  tabIndex={-1}
                  className={computedFieldClass}
                  value={iox == null ? "FiO₂ × PmVA / PaO₂" : String(iox)}
                />
              </Field>
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
          {showVmi && mode ? null : (
            <NumberField
              label="FiO₂ * · %"
              hint="21 a 100"
              error={form.formState.errors.fio2?.message}
              {...form.register("fio2")}
            />
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Exámenes
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
            label="Ác. láctico · mg/dL"
            hint="0 a 30"
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
              className={computedFieldClass}
              value={pafi == null ? "PaO₂ / FiO₂" : String(pafi)}
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
