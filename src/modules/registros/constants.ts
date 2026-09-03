export const MAX_CLINICAL_RECORDS = 30;

export const SUPPORT_IDS = [
  "vmi",
  "vmni",
  "cnaf",
  "venturi",
  "reservorio",
  "naricera",
  "ambiental",
] as const;

export type SupportId = (typeof SUPPORT_IDS)[number];

export const SUPPORT_OPTIONS: { id: SupportId; label: string }[] = [
  { id: "vmi", label: "VMI" },
  { id: "vmni", label: "VMNI" },
  { id: "cnaf", label: "CNAF" },
  { id: "venturi", label: "M. Venturi" },
  { id: "reservorio", label: "M. Reservorio" },
  { id: "naricera", label: "Naricera" },
  { id: "ambiental", label: "Ambiental" },
];

export type RecordFieldId =
  | "support"
  | "peep"
  | "pmva"
  | "driving_pressure"
  | "iox"
  | "ps"
  | "epap"
  | "flujo"
  | "fio2"
  | "pao2"
  | "paco2"
  | "hco3"
  | "eb"
  | "pafi"
  | "pcr"
  | "lactato"
  | "procalcitonina";

export type RecordRow = {
  id: RecordFieldId;
  label: string;
  unit?: string;
};

export const VENTILATORY_ROWS: RecordRow[] = [
  { id: "support", label: "Soporte" },
  { id: "peep", label: "PEEP", unit: "cmH₂O" },
  { id: "pmva", label: "PmVA", unit: "cmH₂O" },
  { id: "driving_pressure", label: "Driving Pressure", unit: "cmH₂O" },
  { id: "iox", label: "IOX" },
  { id: "ps", label: "PS", unit: "cmH₂O" },
  { id: "epap", label: "EPAP", unit: "cmH₂O" },
  { id: "flujo", label: "Flujo", unit: "L/min" },
  { id: "fio2", label: "FiO₂", unit: "%" },
];

export const EXAM_ROWS: RecordRow[] = [
  { id: "pao2", label: "PaO₂", unit: "mmHg" },
  { id: "paco2", label: "PaCO₂", unit: "mmHg" },
  { id: "hco3", label: "HCO₃", unit: "mEq/L" },
  { id: "eb", label: "EB", unit: "mEq/L" },
  { id: "pafi", label: "PaFi" },
  { id: "pcr", label: "PCR", unit: "mg/L" },
  { id: "lactato", label: "Ác. láctico", unit: "mmol/L" },
  { id: "procalcitonina", label: "Procalcitonina", unit: "ng/mL" },
];

export const TABLE_ROWS: { title: string; rows: RecordRow[] }[] = [
  { title: "Ventilatorio", rows: VENTILATORY_ROWS },
  { title: "Exámenes", rows: EXAM_ROWS },
];

export function supportLabel(id: string) {
  return SUPPORT_OPTIONS.find((item) => item.id === id)?.label ?? id;
}

export function supportNeedsVmi(support: SupportId) {
  return support === "vmi";
}

export function supportNeedsVmni(support: SupportId) {
  return support === "vmni";
}

export function supportNeedsFlujo(support: SupportId) {
  return (
    support === "cnaf" ||
    support === "venturi" ||
    support === "reservorio" ||
    support === "naricera"
  );
}
