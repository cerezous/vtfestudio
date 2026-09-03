import { z } from "zod";

import {
  LUGAR_IOT_OPTIONS,
  MOTIVO_VMI_OPTIONS,
} from "@/modules/vmi/constants";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional();

const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional();

export const vmiFormSchema = z
  .object({
    motivo_vmi: z.string().min(1, "Selecciona el motivo de la VMI."),
    motivo_otro: optionalText,
    fecha_iot: z.string().trim().min(1, "Indica la fecha de IOT."),
    lugar_iot: optionalText,
    intubacion_dificil: z.boolean(),
    reintubacion: z.boolean(),
    fecha_extubacion: optionalDate,
    observaciones: optionalText,
  })
  .superRefine((values, ctx) => {
    if (!(MOTIVO_VMI_OPTIONS as readonly string[]).includes(values.motivo_vmi)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["motivo_vmi"],
        message: "Selecciona el motivo de la VMI.",
      });
    }

    if (values.motivo_vmi === "Otro" && !values.motivo_otro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["motivo_otro"],
        message: "Describe el motivo de la VMI.",
      });
    }

    if (
      values.lugar_iot &&
      !(LUGAR_IOT_OPTIONS as readonly string[]).includes(values.lugar_iot)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lugar_iot"],
        message: "Selecciona el lugar de IOT.",
      });
    }

    if (values.fecha_extubacion && values.fecha_extubacion < values.fecha_iot) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fecha_extubacion"],
        message: "No puede ser anterior a la IOT.",
      });
    }
  });

export type VmiFormValues = z.infer<typeof vmiFormSchema>;
