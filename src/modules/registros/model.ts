import {
  supportNeedsFlujo,
  supportNeedsVmi,
  supportNeedsVmni,
  type SupportId,
} from "@/modules/registros/constants";
import {
  modeParams,
  modeUsesFlowPattern,
  parseVentMode,
  type FlowPatternId,
  type VentParamId,
} from "@/modules/registros/pb980";
import {
  parseOptionalNumber,
  type RecordFormValues,
} from "@/modules/registros/schemas";
import type { ClinicalRecord } from "@/shared/types/database";

export { parseOptionalNumber };

export function toDatetimeLocal(value = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function datetimeLocalToIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export function asNumber(value: number | string | null | undefined) {
  if (value == null || value === "") {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatRecordNumber(value: number | string | null | undefined) {
  const parsed = asNumber(value);
  if (parsed == null) {
    return "—";
  }
  if (Number.isInteger(parsed)) {
    return String(parsed);
  }
  return String(Number(parsed.toFixed(2)));
}

/** Driving pressure = Pplat − PEEP. */
export function computeDrivingPressure(
  pplat: number | null,
  peep: number | null,
): number | null {
  if (
    pplat == null ||
    peep == null ||
    !Number.isFinite(pplat) ||
    !Number.isFinite(peep)
  ) {
    return null;
  }
  const value = Math.round((pplat - peep) * 10) / 10;
  if (value <= 0 || value > 50) {
    return null;
  }
  return value;
}

/** Índice de oxigenación = (FiO₂ % × PmVA) / PaO₂. */
export function computeIox(
  fio2: number | null,
  pmva: number | null,
  pao2: number | null,
): number | null {
  if (
    fio2 == null ||
    pmva == null ||
    pao2 == null ||
    !Number.isFinite(fio2) ||
    !Number.isFinite(pmva) ||
    !Number.isFinite(pao2) ||
    fio2 <= 0 ||
    pao2 <= 0
  ) {
    return null;
  }
  const value = Math.round(((fio2 * pmva) / pao2) * 10) / 10;
  if (!Number.isFinite(value) || value < 0 || value > 300) {
    return null;
  }
  return value;
}

export function computePafi(
  pao2: number | null,
  fio2: number | null,
): number | null {
  if (
    pao2 == null ||
    fio2 == null ||
    !Number.isFinite(pao2) ||
    !Number.isFinite(fio2) ||
    fio2 <= 0
  ) {
    return null;
  }
  const fraction = fio2 <= 1 ? fio2 : fio2 / 100;
  if (fraction <= 0) {
    return null;
  }
  return Math.round(pao2 / fraction);
}

function numberToInput(value: number | string | null | undefined) {
  const parsed = asNumber(value);
  return parsed == null ? "" : String(parsed);
}

export function emptyRecordForm(): RecordFormValues {
  return {
    recorded_at: toDatetimeLocal(),
    support: "vmi",
    vent_mode: "",
    peep: "",
    pmva: "",
    driving_pressure: "",
    vt: "",
    fr: "",
    pi: "",
    ti: "",
    ppeak: "",
    pplat: "",
    cest: "",
    flow_pattern: "",
    ps: "",
    epap: "",
    flujo: "",
    fio2: "",
    pao2: "",
    paco2: "",
    hco3: "",
    eb: "",
    pcr: "",
    lactato: "",
    procalcitonina: "",
  };
}

export function recordToFormValues(record: ClinicalRecord): RecordFormValues {
  return {
    recorded_at: toDatetimeLocal(new Date(record.recorded_at)),
    support: record.support as SupportId,
    vent_mode: record.vent_mode ?? "",
    peep: numberToInput(record.peep),
    pmva: numberToInput(record.pmva),
    driving_pressure: numberToInput(record.driving_pressure),
    vt: numberToInput(record.vt),
    fr: numberToInput(record.fr),
    pi: numberToInput(record.pi),
    ti: numberToInput(record.ti),
    ppeak: numberToInput(record.ppeak),
    pplat: numberToInput(record.pplat),
    cest: numberToInput(record.cest),
    flow_pattern: record.flow_pattern ?? "",
    ps: numberToInput(record.ps),
    epap: numberToInput(record.epap),
    flujo: numberToInput(record.flujo),
    fio2: numberToInput(record.fio2),
    pao2: numberToInput(record.pao2),
    paco2: numberToInput(record.paco2),
    hco3: numberToInput(record.hco3),
    eb: numberToInput(record.eb),
    pcr: numberToInput(record.pcr),
    lactato: numberToInput(record.lactato),
    procalcitonina: numberToInput(record.procalcitonina),
  };
}

function toNullableNumber(value: string) {
  const parsed = parseOptionalNumber(value);
  return parsed == null || Number.isNaN(parsed) ? null : parsed;
}

function ventNumber(
  active: ReadonlySet<VentParamId>,
  id: VentParamId,
  value: string,
) {
  return active.has(id) ? toNullableNumber(value) : null;
}

export function formValuesToPayload(patientId: string, values: RecordFormValues) {
  const support = values.support;
  const fio2 = toNullableNumber(values.fio2);
  const pao2 = toNullableNumber(values.pao2);
  const mode = supportNeedsVmi(support) ? parseVentMode(values.vent_mode) : null;
  const active = new Set(mode ? modeParams(mode.id).map((item) => item.id) : []);
  const pattern = values.flow_pattern.trim();
  const flowPattern =
    mode &&
    modeUsesFlowPattern(mode.id) &&
    (pattern === "square" || pattern === "ramp")
      ? (pattern as FlowPatternId)
      : null;

  return {
    patient_id: patientId,
    recorded_at: datetimeLocalToIso(values.recorded_at),
    support,
    vent_mode: mode?.id ?? null,
    peep: supportNeedsVmi(support) ? toNullableNumber(values.peep) : null,
    pmva: supportNeedsVmi(support) ? toNullableNumber(values.pmva) : null,
    driving_pressure:
      supportNeedsVmi(support) && mode?.id !== "ac_vc"
        ? toNullableNumber(values.driving_pressure)
        : null,
    vt: supportNeedsVmi(support) ? toNullableNumber(values.vt) : null,
    fr: ventNumber(active, "fr", values.fr),
    pi: ventNumber(active, "pi", values.pi),
    ti: ventNumber(active, "ti", values.ti),
    ppeak: ventNumber(active, "ppeak", values.ppeak),
    pplat: ventNumber(active, "pplat", values.pplat),
    cest: ventNumber(active, "cest", values.cest),
    flow_pattern: flowPattern,
    ps:
      supportNeedsVmni(support) || active.has("ps")
        ? toNullableNumber(values.ps)
        : null,
    epap: supportNeedsVmni(support) ? toNullableNumber(values.epap) : null,
    flujo: supportNeedsFlujo(support) ? toNullableNumber(values.flujo) : null,
    fio2,
    pao2,
    paco2: toNullableNumber(values.paco2),
    hco3: toNullableNumber(values.hco3),
    eb: toNullableNumber(values.eb),
    pcr: toNullableNumber(values.pcr),
    lactato: toNullableNumber(values.lactato),
    procalcitonina: toNullableNumber(values.procalcitonina),
    pafi: computePafi(pao2, fio2),
  };
}
