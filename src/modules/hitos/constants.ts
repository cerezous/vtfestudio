export const HITO_KINDS = [
  "iot",
  "pronacion",
  "supinacion",
  "ecmo",
  "tqt",
  "extubacion",
  "weaning",
] as const;

export type HitoKind = (typeof HITO_KINDS)[number];

export const HITO_KIND_OPTIONS = [
  { id: "iot", label: "IOT", color: "#2F6BFF" },
  { id: "pronacion", label: "Pronación", color: "#84cc16" },
  { id: "supinacion", label: "Supinación", color: "#0ea5e9" },
  { id: "ecmo", label: "ECMO", color: "#8b5cf6" },
  { id: "tqt", label: "TQT", color: "#f97316" },
  { id: "extubacion", label: "Extubación", color: "#10b981" },
  { id: "weaning", label: "Consolidación de weaning", color: "#db2777" },
] as const;

export const GSA_HITO_KINDS = ["pronacion", "supinacion", "ecmo"] as const;

export const MOTIVO_TQT_OPTIONS = [
  "Destete prolongado",
  "Destete difícil",
  "Protección de vía aérea",
  "Secreciones abundantes",
  "Falla neurológica",
  "Vía aérea difícil",
  "Otro",
] as const;

export const WEANING_RESULTS = [
  { id: "exitosa", label: "Exitosa" },
  { id: "fallo", label: "Fallo" },
] as const;

export type WeaningResult = (typeof WEANING_RESULTS)[number]["id"];

export function hitoNeedsGsa(kind: HitoKind) {
  return (GSA_HITO_KINDS as readonly string[]).includes(kind);
}

export function hitoKindLabel(kind: string) {
  return HITO_KIND_OPTIONS.find((item) => item.id === kind)?.label ?? kind;
}

export function hitoKindColor(kind: string) {
  return HITO_KIND_OPTIONS.find((item) => item.id === kind)?.color ?? "#2F6BFF";
}
