import { z } from "zod";

import {
  SUPPORT_IDS,
  supportNeedsFlujo,
  supportNeedsVmi,
  supportNeedsVmni,
  type SupportId,
} from "@/modules/registros/constants";

export type RecordFormValues = {
  recorded_at: string;
  support: SupportId;
  peep: string;
  pmva: string;
  driving_pressure: string;
  iox: string;
  ps: string;
  epap: string;
  flujo: string;
  fio2: string;
  pao2: string;
  paco2: string;
  hco3: string;
  eb: string;
};

const RANGES: Record<
  Exclude<keyof RecordFormValues, "recorded_at" | "support">,
  { min: number; max: number; label: string }
> = {
  peep: { min: 0, max: 50, label: "PEEP" },
  pmva: { min: 0, max: 50, label: "PmVA" },
  driving_pressure: { min: 0, max: 50, label: "Driving Pressure" },
  iox: { min: 0, max: 100, label: "IOX" },
  ps: { min: 0, max: 50, label: "PS" },
  epap: { min: 0, max: 40, label: "EPAP" },
  flujo: { min: 0, max: 80, label: "Flujo" },
  fio2: { min: 21, max: 100, label: "FiO₂" },
  pao2: { min: 0, max: 800, label: "PaO₂" },
  paco2: { min: 0, max: 250, label: "PaCO₂" },
  hco3: { min: 0, max: 80, label: "HCO₃" },
  eb: { min: -50, max: 50, label: "EB" },
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
  key: Exclude<keyof RecordFormValues, "recorded_at" | "support">,
) {
  const range = RANGES[key];
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
  key: Exclude<keyof RecordFormValues, "recorded_at" | "support">,
) {
  const range = RANGES[key];
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
    support: z.enum(SUPPORT_IDS as [SupportId, ...SupportId[]]),
    peep: z.string(),
    pmva: z.string(),
    driving_pressure: z.string(),
    iox: z.string(),
    ps: z.string(),
    epap: z.string(),
    flujo: z.string(),
    fio2: z.string(),
    pao2: z.string(),
    paco2: z.string(),
    hco3: z.string(),
    eb: z.string(),
  })
  .superRefine((values, ctx) => {
    requireNumber(ctx, values, "fio2");

    if (supportNeedsVmi(values.support)) {
      requireNumber(ctx, values, "peep");
      requireNumber(ctx, values, "pmva");
      requireNumber(ctx, values, "driving_pressure");
      requireNumber(ctx, values, "iox");
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
  });
