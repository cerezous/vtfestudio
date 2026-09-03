import {
  supportNeedsFlujo,
  supportNeedsVmi,
  supportNeedsVmni,
  type SupportId,
} from "@/modules/registros/constants";
import {
  parseOptionalNumber,
  type RecordFormValues,
} from "@/modules/registros/schemas";
import type { ClinicalRecord } from "@/shared/types/database";

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

export function computePafi(
  pao2: number | null,
  fio2: number | null,
): number | null {
  if (pao2 == null || fio2 == null || fio2 <= 0) {
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
    peep: "",
    pmva: "",
    driving_pressure: "",
    iox: "",
    ps: "",
    epap: "",
    flujo: "",
    fio2: "",
    pao2: "",
    paco2: "",
    hco3: "",
    eb: "",
  };
}

export function recordToFormValues(record: ClinicalRecord): RecordFormValues {
  return {
    recorded_at: toDatetimeLocal(new Date(record.recorded_at)),
    support: record.support as SupportId,
    peep: numberToInput(record.peep),
    pmva: numberToInput(record.pmva),
    driving_pressure: numberToInput(record.driving_pressure),
    iox: numberToInput(record.iox),
    ps: numberToInput(record.ps),
    epap: numberToInput(record.epap),
    flujo: numberToInput(record.flujo),
    fio2: numberToInput(record.fio2),
    pao2: numberToInput(record.pao2),
    paco2: numberToInput(record.paco2),
    hco3: numberToInput(record.hco3),
    eb: numberToInput(record.eb),
  };
}

export function formValuesToPayload(patientId: string, values: RecordFormValues) {
  const support = values.support;
  const fio2 = parseOptionalNumber(values.fio2);
  const pao2 = parseOptionalNumber(values.pao2);

  return {
    patient_id: patientId,
    recorded_at: datetimeLocalToIso(values.recorded_at),
    support,
    peep: supportNeedsVmi(support) ? parseOptionalNumber(values.peep) : null,
    pmva: supportNeedsVmi(support) ? parseOptionalNumber(values.pmva) : null,
    driving_pressure: supportNeedsVmi(support)
      ? parseOptionalNumber(values.driving_pressure)
      : null,
    iox: supportNeedsVmi(support) ? parseOptionalNumber(values.iox) : null,
    ps: supportNeedsVmni(support) ? parseOptionalNumber(values.ps) : null,
    epap: supportNeedsVmni(support) ? parseOptionalNumber(values.epap) : null,
    flujo: supportNeedsFlujo(support) ? parseOptionalNumber(values.flujo) : null,
    fio2,
    pao2,
    paco2: parseOptionalNumber(values.paco2),
    hco3: parseOptionalNumber(values.hco3),
    eb: parseOptionalNumber(values.eb),
    pafi: computePafi(
      Number.isNaN(pao2 as number) ? null : pao2,
      Number.isNaN(fio2 as number) ? null : fio2,
    ),
  };
}

export function cellValue(
  record: ClinicalRecord,
  field: keyof ClinicalRecord | "support",
) {
  if (field === "support") {
    return record.support;
  }
  return record[field];
}
