import {
  hitoNeedsGsa,
  MOTIVO_IOT_OPTIONS,
  MOTIVO_TQT_OPTIONS,
  type HitoKind,
} from "@/modules/hitos/constants";
import {
  parseOptionalNumber,
  type HitoFormValues,
} from "@/modules/hitos/schemas";
import {
  computePafi,
  datetimeLocalToIso,
  toDatetimeLocal,
} from "@/modules/registros/model";
import type { ClinicalMilestone } from "@/shared/types/database";

export { parseOptionalNumber };

function numberToInput(value: number | string | null | undefined) {
  if (value == null || value === "") {
    return "";
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? String(parsed) : "";
}

function toNullableNumber(value: string) {
  const parsed = parseOptionalNumber(value);
  return parsed == null || Number.isNaN(parsed) ? null : parsed;
}

function splitMotivo(
  kind: "iot" | "tqt",
  motivo: string | null,
): { option: string; otro: string } {
  const value = motivo ?? "";
  const options = kind === "iot" ? MOTIVO_IOT_OPTIONS : MOTIVO_TQT_OPTIONS;
  if ((options as readonly string[]).includes(value)) {
    return { option: value, otro: "" };
  }
  if (!value) {
    return { option: "", otro: "" };
  }
  return { option: "Otro", otro: value };
}

export function emptyHitoForm(kind: HitoKind = "iot"): HitoFormValues {
  return {
    kind,
    occurred_at: toDatetimeLocal(),
    motivo_iot: "",
    motivo_tqt: "",
    motivo_otro: "",
    lugar_iot: "",
    intubacion_dificil: false,
    reintubacion: false,
    notes: "",
    weaning_result: "",
    pao2: "",
    paco2: "",
    hco3: "",
    eb: "",
    fio2: "",
    lactato: "",
  };
}

export function milestoneToFormValues(
  milestone: ClinicalMilestone,
): HitoFormValues {
  const iotMotivo =
    milestone.kind === "iot" ? splitMotivo("iot", milestone.motivo) : null;
  const tqtMotivo =
    milestone.kind === "tqt" ? splitMotivo("tqt", milestone.motivo) : null;

  return {
    kind: milestone.kind as HitoKind,
    occurred_at: toDatetimeLocal(new Date(milestone.occurred_at)),
    motivo_iot: iotMotivo?.option ?? "",
    motivo_tqt: tqtMotivo?.option ?? "",
    motivo_otro: iotMotivo?.otro || tqtMotivo?.otro || "",
    lugar_iot: milestone.lugar_iot ?? "",
    intubacion_dificil: Boolean(milestone.intubacion_dificil),
    reintubacion: Boolean(milestone.reintubacion),
    notes: milestone.notes ?? "",
    weaning_result: milestone.weaning_result ?? "",
    pao2: numberToInput(milestone.pao2),
    paco2: numberToInput(milestone.paco2),
    hco3: numberToInput(milestone.hco3),
    eb: numberToInput(milestone.eb),
    fio2: numberToInput(milestone.fio2),
    lactato: numberToInput(milestone.lactato),
  };
}

function motivoFromForm(values: HitoFormValues) {
  if (values.kind === "iot") {
    return values.motivo_iot === "Otro"
      ? values.motivo_otro.trim()
      : values.motivo_iot;
  }
  if (values.kind === "tqt") {
    return values.motivo_tqt === "Otro"
      ? values.motivo_otro.trim()
      : values.motivo_tqt;
  }
  return null;
}

export function formValuesToMilestonePayload(
  patientId: string,
  values: HitoFormValues,
) {
  const kind = values.kind;
  const needsGsa = hitoNeedsGsa(kind);
  const pao2 = needsGsa ? toNullableNumber(values.pao2) : null;
  const fio2 = needsGsa ? toNullableNumber(values.fio2) : null;
  const isIot = kind === "iot";

  return {
    patient_id: patientId,
    occurred_at: datetimeLocalToIso(values.occurred_at),
    kind,
    motivo: motivoFromForm(values),
    weaning_result: kind === "weaning" ? values.weaning_result : null,
    lugar_iot: isIot ? values.lugar_iot || null : null,
    intubacion_dificil: isIot ? values.intubacion_dificil : false,
    reintubacion: isIot ? values.reintubacion : false,
    notes: values.notes.trim() || null,
    pao2,
    paco2: needsGsa ? toNullableNumber(values.paco2) : null,
    hco3: needsGsa ? toNullableNumber(values.hco3) : null,
    eb: needsGsa ? toNullableNumber(values.eb) : null,
    fio2,
    lactato: needsGsa ? toNullableNumber(values.lactato) : null,
    pafi: computePafi(pao2, fio2),
  };
}
