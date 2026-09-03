import { z } from "zod";

import { formatRutInput } from "@/modules/patients/display";

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

export const ANTECEDENTES_OPTIONS = [
  "HTA",
  "DM",
  "ERC",
  "Inmunosuprimido",
  "OH (+)",
  "Tabaco (+)",
] as const;

export const MOTIVO_EGRESO_OPTIONS = [
  "Alta a sala",
  "Alta a intermedio",
  "Traslado a otro centro",
  "Fallecido",
  "Otro",
] as const;

export const GRUPO_DIAGNOSTICO_OPTIONS = [
  "Neurológico",
  "Metabolico",
  "Traumatologico",
  "Gastroenterología",
  "Cardiologico",
  "Ginecologico",
] as const;

export const patientFormSchema = z
  .object({
    id_rut: z
      .string()
      .trim()
      .min(3, "Ingresa el RUT.")
      .transform((value) => formatRutInput(value)),
    n_ficha: z.coerce.number().int().positive("La ficha debe ser un número."),
    nombres: z.string().trim().min(1, "Ingresa los nombres."),
    apellido1: z.string().trim().min(1, "Ingresa el primer apellido."),
    apellido2: optionalText,
    sexo: z.enum(["H", "M", "I", ""]),
    fecha_nacimiento: z
      .string()
      .trim()
      .min(1, "Ingresa la fecha de nacimiento."),
    nacionalidad: optionalText,
    diagnostico: z.string().trim().min(1, "Ingresa el diagnóstico principal."),
    grupo_diagnostico: z
      .string()
      .min(1, "Selecciona el grupo diagnóstico.")
      .refine(
        (value) =>
          (GRUPO_DIAGNOSTICO_OPTIONS as readonly string[]).includes(value),
        "Selecciona el grupo diagnóstico.",
      ),
    antecedentes: z.array(z.string()),
    fecha_ingreso_hospital: z
      .string()
      .trim()
      .min(1, "Ingresa la fecha de ingreso hospitalario."),
    fecha_ingreso_uci: optionalDate,
    fecha_egreso: optionalDate,
    motivo_egreso: optionalText,
  })
  .superRefine((values, ctx) => {
    if (
      values.fecha_ingreso_uci &&
      values.fecha_ingreso_uci < values.fecha_ingreso_hospital
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fecha_ingreso_uci"],
        message: "No puede ser anterior al ingreso hospitalario.",
      });
    }

    const floor = values.fecha_ingreso_uci ?? values.fecha_ingreso_hospital;
    if (values.fecha_egreso && values.fecha_egreso < floor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fecha_egreso"],
        message: "No puede ser anterior al ingreso.",
      });
    }

    if (values.fecha_egreso && !values.motivo_egreso) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["motivo_egreso"],
        message: "Indica el motivo de egreso.",
      });
    }

    if (values.motivo_egreso && !values.fecha_egreso) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fecha_egreso"],
        message: "Indica la fecha de egreso.",
      });
    }
  });

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export function parseAntecedentes(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinAntecedentes(values: string[]) {
  const selected = new Set(values);
  return ANTECEDENTES_OPTIONS.filter((option) => selected.has(option)).join(
    ", ",
  );
}
