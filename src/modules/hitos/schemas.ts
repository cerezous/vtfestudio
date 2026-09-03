import { z } from "zod";

import {
  HITO_KINDS,
  MOTIVO_TQT_OPTIONS,
  WEANING_RESULTS,
  hitoNeedsGsa,
  type HitoKind,
} from "@/modules/hitos/constants";

export type HitoFormValues = {
  kind: HitoKind;
  occurred_at: string;
  motivo_tqt: string;
  motivo_otro: string;
  weaning_result: string;
  pao2: string;
  paco2: string;
  hco3: string;
  eb: string;
  fio2: string;
  lactato: string;
};

const GSA_RANGES = {
  pao2: { min: 0, max: 800, label: "PaO₂" },
  paco2: { min: 0, max: 250, label: "PaCO₂" },
  hco3: { min: 0, max: 80, label: "HCO₃" },
  eb: { min: -50, max: 50, label: "EB" },
  fio2: { min: 21, max: 100, label: "FiO₂" },
  lactato: { min: 0, max: 30, label: "Lactato" },
} as const;

export function parseOptionalNumber(value: string) {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function addIssue(
  ctx: z.RefinementCtx,
  key: keyof HitoFormValues,
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
  values: HitoFormValues,
  key: keyof typeof GSA_RANGES,
) {
  const range = GSA_RANGES[key];
  const parsed = parseOptionalNumber(values[key]);
  if (parsed == null) {
    addIssue(ctx, key, `Ingresa ${range.label}.`);
    return;
  }
  if (Number.isNaN(parsed) || parsed < range.min || parsed > range.max) {
    addIssue(
      ctx,
      key,
      `${range.label} debe estar entre ${range.min} y ${range.max}.`,
    );
  }
}

function optionalNumber(
  ctx: z.RefinementCtx,
  values: HitoFormValues,
  key: keyof typeof GSA_RANGES,
) {
  const range = GSA_RANGES[key];
  const parsed = parseOptionalNumber(values[key]);
  if (parsed == null) {
    return;
  }
  if (Number.isNaN(parsed) || parsed < range.min || parsed > range.max) {
    addIssue(
      ctx,
      key,
      `${range.label} debe estar entre ${range.min} y ${range.max}.`,
    );
  }
}

export const hitoFormSchema = z
  .object({
    kind: z.enum(HITO_KINDS),
    occurred_at: z.string().trim().min(1, "Indica la fecha del hito."),
    motivo_tqt: z.string(),
    motivo_otro: z.string(),
    weaning_result: z.string(),
    pao2: z.string(),
    paco2: z.string(),
    hco3: z.string(),
    eb: z.string(),
    fio2: z.string(),
    lactato: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.kind === "tqt") {
      if (!(MOTIVO_TQT_OPTIONS as readonly string[]).includes(values.motivo_tqt)) {
        addIssue(ctx, "motivo_tqt", "Selecciona el motivo de la TQT.");
      } else if (values.motivo_tqt === "Otro" && !values.motivo_otro.trim()) {
        addIssue(ctx, "motivo_otro", "Describe el motivo de la TQT.");
      }
    }

    if (values.kind === "weaning") {
      if (
        !WEANING_RESULTS.some((item) => item.id === values.weaning_result)
      ) {
        addIssue(
          ctx,
          "weaning_result",
          "Marca si el weaning fue exitoso o falló.",
        );
      }
    }

    if (hitoNeedsGsa(values.kind)) {
      requireNumber(ctx, values, "pao2");
      requireNumber(ctx, values, "fio2");
      optionalNumber(ctx, values, "paco2");
      optionalNumber(ctx, values, "hco3");
      optionalNumber(ctx, values, "eb");
      optionalNumber(ctx, values, "lactato");
    }
  });
