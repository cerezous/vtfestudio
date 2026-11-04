import { z } from "zod";

import {
  SUPPORT_IDS,
  supportNeedsFlujo,
  supportNeedsVmi,
  supportNeedsVmni,
  type SupportId,
} from "@/modules/registros/constants";
import {
  FLOW_PATTERNS,
  modeParams,
  modeUsesFlowPattern,
  parseVentMode,
} from "@/modules/registros/pb980";

export type RecordFormValues = {
  recorded_at: string;
  support: SupportId;
  vent_mode: string;
  peep: string;
  pmva: string;
  driving_pressure: string;
  vt: string;
  fr: string;
  pi: string;
  ti: string;
  ppeak: string;
  pplat: string;
  cest: string;
  flow_pattern: string;
  ps: string;
  epap: string;
  flujo: string;
  fio2: string;
  pao2: string;
  paco2: string;
  hco3: string;
  eb: string;
  pcr: string;
  lactato: string;
  procalcitonina: string;
};

type NumericKey = Exclude<
  keyof RecordFormValues,
  "recorded_at" | "support" | "vent_mode" | "flow_pattern"
>;

type NumberRange = { min: number; max: number; label: string };

const RANGES: Record<NumericKey, NumberRange> = {
  peep: { min: 0, max: 50, label: "PEEP" },
  pmva: { min: 0, max: 50, label: "PmVA" },
  driving_pressure: { min: 0, max: 50, label: "Driving Pressure" },
  vt: { min: 100, max: 1500, label: "Vt" },
  fr: { min: 1, max: 100, label: "FR" },
  pi: { min: 1, max: 90, label: "PI" },
  ti: { min: 0.2, max: 8, label: "Ti" },
  ppeak: { min: 0, max: 120, label: "Ppeak" },
  pplat: { min: 0, max: 50, label: "Pplat" },
  cest: { min: 1, max: 300, label: "Cest" },
  ps: { min: 0, max: 50, label: "PS" },
  epap: { min: 0, max: 40, label: "EPAP" },
  flujo: { min: 0, max: 80, label: "Flujo" },
  fio2: { min: 21, max: 100, label: "FiO₂" },
  pao2: { min: 0, max: 800, label: "PaO₂" },
  paco2: { min: 0, max: 250, label: "PaCO₂" },
  hco3: { min: 0, max: 80, label: "HCO₃" },
  eb: { min: -50, max: 50, label: "EB" },
  pcr: { min: 0, max: 500, label: "PCR" },
  lactato: { min: 0, max: 30, label: "Ác. láctico" },
  procalcitonina: { min: 0, max: 200, label: "Procalcitonina" },
};

export function parseOptionalNumber(value: string) {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function addNumberIssue(
  ctx: z.RefinementCtx,
  key: keyof RecordFormValues,
  message: string,
) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: [key],
    message,
  });
}

function requireNumber(
  ctx: z.RefinementCtx,
  values: RecordFormValues,
  key: NumericKey,
  range: NumberRange = RANGES[key],
) {
  const parsed = parseOptionalNumber(values[key]);
  if (parsed == null) {
    addNumberIssue(ctx, key, `Ingresa ${range.label}.`);
    return;
  }
  if (Number.isNaN(parsed) || parsed < range.min || parsed > range.max) {
    addNumberIssue(
      ctx,
      key,
      `${range.label} debe estar entre ${range.min} y ${range.max}.`,
    );
  }
}

function optionalNumber(
  ctx: z.RefinementCtx,
  values: RecordFormValues,
  key: NumericKey,
  range: NumberRange = RANGES[key],
) {
  const parsed = parseOptionalNumber(values[key]);
  if (parsed == null) {
    return;
  }
  if (Number.isNaN(parsed) || parsed < range.min || parsed > range.max) {
    addNumberIssue(
      ctx,
      key,
      `${range.label} debe estar entre ${range.min} y ${range.max}.`,
    );
  }
}

export const recordFormSchema = z
  .object({
    recorded_at: z.string().trim().min(1, "Indica la fecha."),
    support: z.enum(SUPPORT_IDS),
    vent_mode: z.string(),
    peep: z.string(),
    pmva: z.string(),
    driving_pressure: z.string(),
    vt: z.string(),
    fr: z.string(),
    pi: z.string(),
    ti: z.string(),
    ppeak: z.string(),
    pplat: z.string(),
    cest: z.string(),
    flow_pattern: z.string(),
    ps: z.string(),
    epap: z.string(),
    flujo: z.string(),
    fio2: z.string(),
    pao2: z.string(),
    paco2: z.string(),
    hco3: z.string(),
    eb: z.string(),
    pcr: z.string(),
    lactato: z.string(),
    procalcitonina: z.string(),
  })
  .superRefine((values, ctx) => {
    requireNumber(ctx, values, "fio2");

    if (supportNeedsVmi(values.support)) {
      requireNumber(ctx, values, "peep");
      requireNumber(ctx, values, "pmva");
      requireNumber(ctx, values, "vt");

      const mode = parseVentMode(values.vent_mode);
      if (!mode) {
        addNumberIssue(
          ctx,
          "vent_mode",
          "Selecciona el modo del Puritan Bennett 980.",
        );
      } else {
        if (mode.id === "ac_vc") {
          const pplat = parseOptionalNumber(values.pplat);
          const peep = parseOptionalNumber(values.peep);
          if (
            pplat != null &&
            peep != null &&
            !Number.isNaN(pplat) &&
            !Number.isNaN(peep) &&
            pplat - peep <= 0
          ) {
            addNumberIssue(ctx, "pplat", "Pplat debe ser mayor que la PEEP.");
          }
        } else {
          requireNumber(ctx, values, "driving_pressure");
        }

        for (const item of modeParams(mode.id)) {
          const range = { min: item.min, max: item.max, label: item.label };
          if (item.required) {
            requireNumber(ctx, values, item.id, range);
          } else {
            optionalNumber(ctx, values, item.id, range);
          }
        }

        if (modeUsesFlowPattern(mode.id)) {
          const pattern = values.flow_pattern.trim();
          const allowed = FLOW_PATTERNS.some((item) => item.id === pattern);
          if (pattern && !allowed) {
            addNumberIssue(ctx, "flow_pattern", "Elige cuadrada o rampa.");
          }
        }
      }
    }

    if (supportNeedsVmni(values.support)) {
      requireNumber(ctx, values, "ps");
      requireNumber(ctx, values, "epap");
    }

    if (supportNeedsFlujo(values.support)) {
      requireNumber(ctx, values, "flujo");
    }

    optionalNumber(ctx, values, "pao2");
    optionalNumber(ctx, values, "paco2");
    optionalNumber(ctx, values, "hco3");
    optionalNumber(ctx, values, "eb");
    optionalNumber(ctx, values, "pcr");
    optionalNumber(ctx, values, "lactato");
    optionalNumber(ctx, values, "procalcitonina");
  });
