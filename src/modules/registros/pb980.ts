/**
 * Modos invasivos del Puritan Bennett 980 usados en VMI.
 * La misma lista de ids vive en private.upsert_clinical_record.
 */

export const PB980_MODE_IDS = ["ac_vc", "ac_pc", "simv", "espontaneo"] as const;

export type Pb980ModeId = (typeof PB980_MODE_IDS)[number];

export const FLOW_PATTERNS = [
  { id: "square", label: "Cuadrada" },
  { id: "ramp", label: "Rampa" },
] as const;

export type FlowPatternId = (typeof FLOW_PATTERNS)[number]["id"];

export const VENT_PARAM_IDS = [
  "fr",
  "pi",
  "ti",
  "ppeak",
  "pplat",
  "cest",
  "ps",
] as const;

export type VentParamId = (typeof VENT_PARAM_IDS)[number];

export type VentParamSpec = {
  id: VentParamId;
  label: string;
  unit: string;
  min: number;
  max: number;
  required: boolean;
  hint: string;
};

type Pb980Mode = {
  id: Pb980ModeId;
  label: string;
  summary: string;
  setsVt: boolean;
  flowPattern: boolean;
};

function rangeHint(min: number, max: number) {
  const text = (value: number) => String(value).replace(".", ",");
  return `${text(min)} a ${text(max)}`;
}

function param(
  id: VentParamId,
  label: string,
  unit: string,
  min: number,
  max: number,
  required: boolean,
): VentParamSpec {
  const range = rangeHint(min, max);
  return {
    id,
    label,
    unit,
    min,
    max,
    required,
    hint: required ? range : `Opcional · ${range}`,
  };
}

export const PB980_MODES: readonly Pb980Mode[] = [
  {
    id: "ac_vc",
    label: "AC/VC",
    summary: "Asistido/controlado por volumen.",
    setsVt: true,
    flowPattern: true,
  },
  {
    id: "ac_pc",
    label: "AC/PC",
    summary: "Asistido/controlado por presión.",
    setsVt: false,
    flowPattern: false,
  },
  {
    id: "simv",
    label: "SIMV",
    summary: "SIMV por volumen, espontáneas con presión de soporte.",
    setsVt: true,
    flowPattern: true,
  },
  {
    id: "espontaneo",
    label: "Espontáneo",
    summary: "Espontáneo con presión de soporte.",
    setsVt: false,
    flowPattern: false,
  },
];

const MODE_BY_ID = new Map(PB980_MODES.map((mode) => [mode.id, mode]));

const PARAMS: Record<Pb980ModeId, VentParamSpec[]> = {
  ac_vc: [
    param("fr", "FR", "rpm", 1, 100, true),
    param("ppeak", "Ppeak", "cmH₂O", 0, 120, true),
    param("pplat", "Pplat", "cmH₂O", 0, 50, true),
    param("cest", "Cest", "mL/cmH₂O", 1, 300, true),
  ],
  ac_pc: [
    param("fr", "FR", "rpm", 1, 100, true),
    param("pi", "PI", "cmH₂O", 1, 90, true),
    param("ti", "Ti", "s", 0.2, 8, true),
  ],
  simv: [
    param("fr", "FR", "rpm", 1, 100, true),
    param("ppeak", "Ppeak", "cmH₂O", 0, 120, true),
    param("ps", "PS", "cmH₂O", 0, 50, true),
  ],
  espontaneo: [param("ps", "PS", "cmH₂O", 0, 50, true)],
};

export function parseVentMode(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  return MODE_BY_ID.get(value as Pb980ModeId) ?? null;
}

export function ventModeLabel(value: string | null | undefined) {
  const mode = parseVentMode(value);
  if (mode) {
    return mode.label;
  }
  return value?.trim() ?? "";
}

export function flowPatternLabel(value: string | null | undefined) {
  return FLOW_PATTERNS.find((item) => item.id === value)?.label ?? "";
}

export function modeParams(id: Pb980ModeId) {
  return PARAMS[id];
}

export function modeUsesFlowPattern(id: Pb980ModeId) {
  return MODE_BY_ID.get(id)?.flowPattern ?? false;
}

export function modeSetsVt(mode: Pb980Mode) {
  return mode.setsVt;
}
