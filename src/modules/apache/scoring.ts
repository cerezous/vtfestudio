export const APS_POINT_HEADERS = [4, 3, 2, 1, 0, 1, 2, 3, 4] as const;

export type ApsCell = {
  id: string;
  label: string;
  points: number;
} | null;

export type ApsParameter = {
  id: string;
  label: string;
  hint?: string;
  cells: ApsCell[];
};

function cell(paramId: string, label: string, points: number): ApsCell {
  return { id: `${paramId}:${label}`, label, points };
}

export const APS_PARAMETERS: ApsParameter[] = [
  {
    id: "temp",
    label: "Temperatura rectal (°C)",
    cells: [
      cell("temp", ">40.9", 4),
      cell("temp", "39–40.9", 3),
      null,
      cell("temp", "38.5–38.9", 1),
      cell("temp", "36–38.4", 0),
      cell("temp", "34–35.9", 1),
      cell("temp", "32–33.9", 2),
      cell("temp", "30–31.9", 3),
      cell("temp", "<30", 4),
    ],
  },
  {
    id: "map",
    label: "Pres. art. media (mmHg)",
    cells: [
      cell("map", ">159", 4),
      cell("map", "130–159", 3),
      cell("map", "110–129", 2),
      null,
      cell("map", "70–109", 0),
      null,
      cell("map", "50–69", 2),
      null,
      cell("map", "<50", 4),
    ],
  },
  {
    id: "hr",
    label: "Frec. cardiaca (lpm)",
    cells: [
      cell("hr", ">179", 4),
      cell("hr", "140–179", 3),
      cell("hr", "110–129", 2),
      null,
      cell("hr", "70–109", 0),
      null,
      cell("hr", "55–69", 2),
      cell("hr", "40–54", 3),
      cell("hr", "<40", 4),
    ],
  },
  {
    id: "rr",
    label: "Frec. respiratoria (rpm)",
    cells: [
      cell("rr", ">49", 4),
      cell("rr", "35–49", 3),
      null,
      cell("rr", "25–34", 1),
      cell("rr", "12–24", 0),
      cell("rr", "10–11", 1),
      cell("rr", "6–9", 2),
      null,
      cell("rr", "<6", 4),
    ],
  },
  {
    id: "aado2",
    label: "Oxigenación · FiO₂ ≥ 0.5 (AaDO₂)",
    hint: "Usar si FiO₂ ≥ 0.5",
    cells: [
      cell("aado2", "≥500", 4),
      cell("aado2", "350–499", 3),
      cell("aado2", "200–349", 2),
      null,
      cell("aado2", "<200", 0),
      null,
      null,
      null,
      null,
    ],
  },
  {
    id: "pao2",
    label: "Oxigenación · FiO₂ < 0.5 (PaO₂)",
    hint: "Usar si FiO₂ < 0.5",
    cells: [
      null,
      null,
      null,
      null,
      cell("pao2", ">70", 0),
      cell("pao2", "61–70", 1),
      null,
      cell("pao2", "55–60", 3),
      cell("pao2", "<55", 4),
    ],
  },
  {
    id: "ph",
    label: "pH arterial",
    cells: [
      cell("ph", "≥7.70", 4),
      cell("ph", "7.60–7.69", 3),
      null,
      cell("ph", "7.50–7.59", 1),
      cell("ph", "7.33–7.49", 0),
      null,
      cell("ph", "7.25–7.32", 2),
      cell("ph", "7.15–7.24", 3),
      cell("ph", "<7.15", 4),
    ],
  },
  {
    id: "na",
    label: "Na plasmático (mmol/L)",
    cells: [
      cell("na", ">179", 4),
      cell("na", "160–179", 3),
      cell("na", "155–159", 2),
      cell("na", "150–154", 1),
      cell("na", "130–149", 0),
      null,
      cell("na", "120–129", 2),
      cell("na", "111–119", 3),
      cell("na", "<111", 4),
    ],
  },
  {
    id: "k",
    label: "K plasmático (mmol/L)",
    cells: [
      cell("k", ">6.9", 4),
      cell("k", "6.0–6.9", 3),
      null,
      cell("k", "5.5–5.9", 1),
      cell("k", "3.5–5.4", 0),
      cell("k", "3.0–3.4", 1),
      cell("k", "2.5–2.9", 2),
      null,
      cell("k", "<2.5", 4),
    ],
  },
  {
    id: "creatinine",
    label: "Creatinina (mg/dL)",
    hint: "Si hay IRA, el puntaje se duplica",
    cells: [
      cell("creatinine", ">3.4", 4),
      cell("creatinine", "2.0–3.4", 3),
      cell("creatinine", "1.5–1.9", 2),
      null,
      cell("creatinine", "0.6–1.4", 0),
      null,
      cell("creatinine", "<0.6", 2),
      null,
      null,
    ],
  },
  {
    id: "hct",
    label: "Hematocrito (%)",
    cells: [
      cell("hct", ">59.9", 4),
      null,
      cell("hct", "50–59.9", 2),
      cell("hct", "46–49.9", 1),
      cell("hct", "30–45.9", 0),
      null,
      cell("hct", "20–29.9", 2),
      null,
      cell("hct", "<20", 4),
    ],
  },
  {
    id: "wbc",
    label: "Leucocitos (×1000)",
    cells: [
      cell("wbc", ">39.9", 4),
      null,
      cell("wbc", "20–39.9", 2),
      cell("wbc", "15–19.9", 1),
      cell("wbc", "3–14.9", 0),
      null,
      cell("wbc", "1–2.9", 2),
      null,
      cell("wbc", "<1", 4),
    ],
  },
];

export const GCS_VALUES = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3] as const;

export const AGE_BANDS = [
  { id: "<=44", label: "≤ 44 años", points: 0 },
  { id: "45-54", label: "45–54 años", points: 2 },
  { id: "55-64", label: "55–64 años", points: 3 },
  { id: "65-74", label: "65–74 años", points: 5 },
  { id: ">=75", label: "≥ 75 años", points: 6 },
] as const;

export type AgeBandId = (typeof AGE_BANDS)[number]["id"];

export const CHRONIC_OPTIONS = [
  { id: "none", label: "Sin enfermedad crónica", points: 0 },
  { id: "elective", label: "Preoperatorio programado", points: 2 },
  { id: "urgent_medical", label: "Preoperatorio urgente o médico", points: 5 },
] as const;

export type ChronicId = (typeof CHRONIC_OPTIONS)[number]["id"];

export type ApacheFormState = {
  scoredAt: string;
  selections: Record<string, string>;
  fio2Ge50: boolean;
  ira: boolean;
  gcs: number | null;
  ageBand: AgeBandId | null;
  chronic: ChronicId;
};

const REQUIRED_APS_IDS = [
  "temp",
  "map",
  "hr",
  "rr",
  "ph",
  "na",
  "k",
  "creatinine",
  "hct",
  "wbc",
] as const;

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

export function ageBandFromYears(years: number): AgeBandId {
  if (years <= 44) {
    return "<=44";
  }
  if (years <= 54) {
    return "45-54";
  }
  if (years <= 64) {
    return "55-64";
  }
  if (years <= 74) {
    return "65-74";
  }
  return ">=75";
}

function findCell(paramId: string, cellId: string | undefined) {
  if (!cellId) {
    return null;
  }
  const param = APS_PARAMETERS.find((item) => item.id === paramId);
  return param?.cells.find((item) => item?.id === cellId) ?? null;
}

export function gcsPoints(gcs: number | null) {
  if (gcs == null || gcs < 3 || gcs > 15) {
    return null;
  }
  return 15 - gcs;
}

export function computeApache(state: ApacheFormState) {
  let aps = 0;
  const missing: string[] = [];

  for (const id of REQUIRED_APS_IDS) {
    const selected = findCell(id, state.selections[id]);
    if (!selected) {
      missing.push(id);
      continue;
    }
    const doubled = id === "creatinine" && state.ira;
    aps += doubled ? selected.points * 2 : selected.points;
  }

  const oxygenId = state.fio2Ge50 ? "aado2" : "pao2";
  const oxygen = findCell(oxygenId, state.selections[oxygenId]);
  if (!oxygen) {
    missing.push(oxygenId);
  } else {
    aps += oxygen.points;
  }

  const gcs = gcsPoints(state.gcs);
  if (gcs == null) {
    missing.push("gcs");
  }

  const age = AGE_BANDS.find((item) => item.id === state.ageBand);
  if (!age) {
    missing.push("age");
  }

  const chronic =
    CHRONIC_OPTIONS.find((item) => item.id === state.chronic) ??
    CHRONIC_OPTIONS[0];

  const apsPoints = aps;
  const gcsValue = gcs ?? 0;
  const agePoints = age?.points ?? 0;
  const chronicPoints = chronic.points;
  const score = apsPoints + gcsValue + agePoints + chronicPoints;
  const mortalityPct = mortalityFromScore(score);

  return {
    complete: missing.length === 0,
    missing,
    apsPoints,
    gcsPoints: gcsValue,
    agePoints,
    chronicPoints,
    score,
    mortalityPct,
  };
}

export function mortalityFromScore(score: number) {
  const logit = -3.517 + 0.146 * score;
  const risk = Math.exp(logit) / (1 + Math.exp(logit));
  return Math.round(risk * 1000) / 10;
}

export function emptyApacheState(ageBand: AgeBandId | null = null): ApacheFormState {
  return {
    scoredAt: toDatetimeLocal(),
    selections: {},
    fio2Ge50: false,
    ira: false,
    gcs: null,
    ageBand,
    chronic: "none",
  };
}

export function stateFromPayload(
  payload: unknown,
  scoredAtIso: string | null,
  fallbackAge: AgeBandId | null,
): ApacheFormState {
  const data =
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const selections =
    data.selections && typeof data.selections === "object"
      ? (data.selections as Record<string, string>)
      : {};
  const gcs = typeof data.gcs === "number" ? data.gcs : null;
  const ageBand = AGE_BANDS.some((item) => item.id === data.ageBand)
    ? (data.ageBand as AgeBandId)
    : fallbackAge;
  const chronic = CHRONIC_OPTIONS.some((item) => item.id === data.chronic)
    ? (data.chronic as ChronicId)
    : "none";

  return {
    scoredAt: scoredAtIso
      ? toDatetimeLocal(new Date(scoredAtIso))
      : toDatetimeLocal(),
    selections,
    fio2Ge50: Boolean(data.fio2Ge50),
    ira: Boolean(data.ira),
    gcs,
    ageBand,
    chronic,
  };
}
