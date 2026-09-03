import {
  hitoNeedsGsa,
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

export function emptyHitoForm(
  kind: HitoKind = "iot",
  fechaIot?: string | null,
): HitoFormValues {
  const occurred_at =
    kind === "iot" && fechaIot
      ? `${fechaIot}T12:00`
      : toDatetimeLocal();

  return {
    kind,
    occurred_at,
    motivo_tqt: "",
    motivo_otro: "",
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
  const motivo = milestone.motivo ?? "";
  const knownMotivo = (MOTIVO_TQT_OPTIONS as readonly string[]).includes(motivo);

  return {
    kind: milestone.kind as HitoKind,
    occurred_at: toDatetimeLocal(new Date(milestone.occurred_at)),
    motivo_tqt: milestone.kind === "tqt" ? (knownMotivo ? motivo : "Otro") : "",
    motivo_otro:
      milestone.kind === "tqt" && !knownMotivo ? motivo : "",
    weaning_result: milestone.weaning_result ?? "",
    pao2: numberToInput(milestone.pao2),
    paco2: numberToInput(milestone.paco2),
    hco3: numberToInput(milestone.hco3),
    eb: numberToInput(milestone.eb),
    fio2: numberToInput(milestone.fio2),
    lactato: numberToInput(milestone.lactato),
  };
}

export function formValuesToMilestonePayload(
  patientId: string,
  values: HitoFormValues,
) {
  const kind = values.kind;
  const needsGsa = hitoNeedsGsa(kind);
  const pao2 = needsGsa ? toNullableNumber(values.pao2) : null;
  const fio2 = needsGsa ? toNullableNumber(values.fio2) : null;
  const motivo =
    kind === "tqt"
      ? values.motivo_tqt === "Otro"
        ? values.motivo_otro.trim()
        : values.motivo_tqt
      : null;

  return {
    patient_id: patientId,
    occurred_at: datetimeLocalToIso(values.occurred_at),
    kind,
    motivo,
    weaning_result: kind === "weaning" ? values.weaning_result : null,
    pao2,
    paco2: needsGsa ? toNullableNumber(values.paco2) : null,
    hco3: needsGsa ? toNullableNumber(values.hco3) : null,
    eb: needsGsa ? toNullableNumber(values.eb) : null,
    fio2,
    lactato: needsGsa ? toNullableNumber(values.lactato) : null,
    pafi: computePafi(pao2, fio2),
  };
}
