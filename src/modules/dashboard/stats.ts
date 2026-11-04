import { exactAge, patientFullName } from "@/modules/patients/display";
import {
  ANTECEDENTES_OPTIONS,
  GRUPO_DIAGNOSTICO_OPTIONS,
  MOTIVO_EGRESO_OPTIONS,
  parseAntecedentes,
} from "@/modules/patients/schemas";
import { SUPPORT_OPTIONS } from "@/modules/registros/constants";
import { asNumber } from "@/modules/registros/model";
import { MOTIVO_VMI_OPTIONS, vmiDays } from "@/modules/vmi/constants";
import type {
  ApacheScore,
  ClinicalMilestone,
  ClinicalRecord,
  Patient,
  VmiEpisode,
} from "@/shared/types/database";

export const CURVE_METRICS = [
  {
    key: "paco2",
    label: "PaCO₂",
    unit: "mmHg",
    color: "#2f6bff",
    axis: "left",
  },
  {
    key: "driving_pressure",
    label: "DP",
    unit: "cmH₂O",
    color: "#7c3aed",
    axis: "left",
  },
  {
    key: "lactato",
    label: "Ac. láctico",
    unit: "mg/dL",
    color: "#dc2626",
    axis: "left",
  },
  {
    key: "iox",
    label: "IOX",
    unit: "",
    color: "#0891b2",
    axis: "left",
  },
  {
    key: "pafi",
    label: "PaFi",
    unit: "",
    color: "#059669",
    axis: "right",
  },
  {
    key: "pcr",
    label: "PCR",
    unit: "mg/L",
    color: "#d97706",
    axis: "right",
  },
] as const;

export type CurveMetricKey = (typeof CURVE_METRICS)[number]["key"];

export type CountShare = {
  id: string;
  label: string;
  count: number;
  share: number;
};

export type CurvePoint = {
  day: number;
  label: string;
  n: number;
} & Record<CurveMetricKey, number | null>;

export type ActivityRow = {
  id: string;
  patientId: string;
  patientName: string;
  event: string;
  date: string;
  diagnostico: string;
  status: Patient["status"];
};

export type GoalRow = {
  id: string;
  label: string;
  current: number;
  target: number;
  hint: string;
};

export type MonthFlow = {
  key: string;
  label: string;
  ingresos: number;
  egresos: number;
  fallecidos: number;
};

export type DashboardSex = "H" | "M" | "I" | "unknown";

export type DashboardFact = {
  id: string;
  name: string;
  stayStart: string | null;
  stayEnd: string | null;
  active: boolean;
  deceased: boolean;
  sex: DashboardSex;
  age: number | null;
  ageBand: string | null;
  apache: number | null;
  predictedMortality: number | null;
  vmiDays: number | null;
  procedures: Record<string, number>;
  successes: number;
  failures: number;
  tqt: number;
};

export type DashboardDateRange = {
  from: string;
  to: string;
};

export const RECORD_STAT_FIELDS = [
  { id: "peep", label: "PEEP", unit: "cmH₂O" },
  { id: "pmva", label: "PmVA", unit: "cmH₂O" },
  { id: "driving_pressure", label: "Driving pressure", unit: "cmH₂O" },
  { id: "iox", label: "IOX", unit: "" },
  { id: "vt", label: "Vt", unit: "mL" },
  { id: "vt_ml_kg_pi", label: "ml/kg/PI", unit: "" },
  { id: "ps", label: "PS", unit: "cmH₂O" },
  { id: "fr", label: "FR", unit: "rpm" },
  { id: "pi", label: "PI", unit: "cmH₂O" },
  { id: "ti", label: "Ti", unit: "s" },
  { id: "ppeak", label: "Ppeak", unit: "cmH₂O" },
  { id: "pplat", label: "Pplat", unit: "cmH₂O" },
  { id: "cest", label: "Cest", unit: "mL/cmH₂O" },
  { id: "epap", label: "EPAP", unit: "cmH₂O" },
  { id: "flujo", label: "Flujo", unit: "L/min" },
  { id: "fio2", label: "FiO₂", unit: "%" },
  { id: "pao2", label: "PaO₂", unit: "mmHg" },
  { id: "paco2", label: "PaCO₂", unit: "mmHg" },
  { id: "hco3", label: "HCO₃", unit: "mEq/L" },
  { id: "eb", label: "EB", unit: "mEq/L" },
  { id: "pafi", label: "PaFi", unit: "" },
  { id: "pcr", label: "PCR", unit: "mg/L" },
  { id: "lactato", label: "Ác. láctico", unit: "mg/dL" },
  { id: "procalcitonina", label: "Procalcitonina", unit: "ng/mL" },
] as const;

export type RecordStatField = (typeof RECORD_STAT_FIELDS)[number]["id"];

export type DashboardRecordPoint = {
  patientId: string;
  recordedAt: string;
  support: string;
  ventMode: string | null;
  flowPattern: string | null;
  values: Partial<Record<RecordStatField, number>>;
};

export type DashboardFilterDimension = "sex" | "age" | "procedure" | "outcome";

export type DashboardFilter = {
  dimension: DashboardFilterDimension;
  key: string;
  label: string;
};

export type DashboardBar = {
  key: string;
  label: string;
  count: number;
};

export type CohortSummary = {
  patients: number;
  active: number;
  deceased: number;
  avgVmiDays: number | null;
  vmiCount: number;
  avgApache: number | null;
  apacheCount: number;
  observedMortality: number | null;
  predictedMortality: number | null;
  avgAge: number | null;
  medianAge: number | null;
  ageCount: number;
};

export type DistributionSummary = {
  n: number;
  mean: number;
  median: number;
  sd: number | null;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

export type DashboardSnapshot = {
  generatedAt: string;
  facts: DashboardFact[];
  records: DashboardRecordPoint[];
  totals: {
    patients: number;
    hospitalized: number;
    discharged: number;
    deceased: number;
    records: number;
    avgAge: number | null;
    avgStayDays: number | null;
    observedMortality: number | null;
    predictedMortality: number | null;
    avgApache: number | null;
    apacheCount: number;
    avgVmiDays: number | null;
    vmiActive: number;
    vmiTotal: number;
    reintubationRate: number | null;
  };
  latestAverages: Record<CurveMetricKey, number | null>;
  curves: CurvePoint[];
  diagnosticGroups: CountShare[];
  dischargeReasons: CountShare[];
  sex: CountShare[];
  ageBands: CountShare[];
  comorbidities: CountShare[];
  support: CountShare[];
  vmiMotivos: CountShare[];
  goals: GoalRow[];
  statusMix: CountShare[];
  monthlyFlow: MonthFlow[];
  recent: ActivityRow[];
};

const MS_DAY = 86_400_000;

const AGE_BANDS: { id: string; label: string; match: (years: number) => boolean }[] =
  [
    { id: "<=44", label: "≤ 44 años", match: (y) => y <= 44 },
    { id: "45-54", label: "45–54 años", match: (y) => y >= 45 && y <= 54 },
    { id: "55-64", label: "55–64 años", match: (y) => y >= 55 && y <= 64 },
    { id: "65-74", label: "65–74 años", match: (y) => y >= 65 && y <= 74 },
    { id: ">=75", label: "≥ 75 años", match: (y) => y >= 75 },
  ];

export function formatMetric(value: number | null | undefined, digits = 1) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(digits, 1),
  }).format(value);
}

export function formatPct(value: number | null | undefined, digits = 1) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return `${formatMetric(value, digits)}%`;
}

export function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function mean(values: Array<number | null | undefined>) {
  const xs = values
    .map((value) => asNumber(value))
    .filter((value): value is number => value != null);

  if (xs.length === 0) {
    return null;
  }

  return round(xs.reduce((sum, value) => sum + value, 0) / xs.length);
}

function shareList(
  items: { id: string; label: string; count: number }[],
  total: number,
): CountShare[] {
  return items
    .map((item) => ({
      ...item,
      share: total > 0 ? round((item.count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function latestByPatient<T extends { patient_id: string }>(
  rows: T[],
  dateOf: (row: T) => string,
) {
  const latest = new Map<string, T>();

  for (const row of rows) {
    const current = latest.get(row.patient_id);
    if (!current || dateOf(row) > dateOf(current)) {
      latest.set(row.patient_id, row);
    }
  }

  return latest;
}

function originFor(patient: Patient) {
  const raw = patient.fecha_ingreso_uci ?? patient.fecha_ingreso_hospital;
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return startOfDay(date);
}

function recordDay(recordedAt: string, origin: Date) {
  const recorded = startOfDay(new Date(recordedAt));
  if (Number.isNaN(recorded.getTime())) {
    return null;
  }

  const diff = Math.floor((recorded.getTime() - origin.getTime()) / MS_DAY);
  return Math.max(1, diff + 1);
}

function stayDays(patient: Patient, now: Date) {
  const startRaw = patient.fecha_ingreso_uci ?? patient.fecha_ingreso_hospital;
  const start = new Date(`${startRaw}T00:00:00`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const endRaw = patient.fecha_egreso ?? patient.fecha_fallecimiento;
  const end = endRaw ? new Date(`${endRaw}T00:00:00`) : now;
  if (Number.isNaN(end.getTime()) || end < start) {
    return null;
  }

  return Math.floor((startOfDay(end).getTime() - startOfDay(start).getTime()) / MS_DAY);
}

function buildMonthlyFlow(patients: Patient[], now: Date): MonthFlow[] {
  const months: MonthFlow[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: new Intl.DateTimeFormat("es-CL", { month: "short" })
        .format(date)
        .replace(".", ""),
      ingresos: 0,
      egresos: 0,
      fallecidos: 0,
    });
  }

  const byKey = new Map(months.map((month) => [month.key, month]));

  for (const patient of patients) {
    const ingreso = (patient.fecha_ingreso_uci ?? patient.fecha_ingreso_hospital).slice(
      0,
      7,
    );
    const ingresoBucket = byKey.get(ingreso);
    if (ingresoBucket) {
      ingresoBucket.ingresos += 1;
    }

    if (patient.status === "deceased") {
      const deathKey = (
        patient.fecha_fallecimiento ??
        patient.fecha_egreso ??
        ""
      ).slice(0, 7);
      const deathBucket = byKey.get(deathKey);
      if (deathBucket) {
        deathBucket.fallecidos += 1;
      }
      continue;
    }

    if (patient.fecha_egreso) {
      const egresoBucket = byKey.get(patient.fecha_egreso.slice(0, 7));
      if (egresoBucket) {
        egresoBucket.egresos += 1;
      }
    }
  }

  return months;
}

function emptyAverages(): Record<CurveMetricKey, number | null> {
  return {
    paco2: null,
    driving_pressure: null,
    pcr: null,
    lactato: null,
    pafi: null,
    iox: null,
  };
}

function metricFromRecord(record: ClinicalRecord, key: CurveMetricKey) {
  return asNumber(record[key]);
}

function buildCurves(
  patients: Patient[],
  records: ClinicalRecord[],
): CurvePoint[] {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]));
  const byPatientDay = new Map<
    string,
    { day: number; values: Record<CurveMetricKey, number[]> }
  >();

  for (const record of records) {
    const patient = patientById.get(record.patient_id);
    if (!patient) {
      continue;
    }

    const origin = originFor(patient);
    if (!origin) {
      continue;
    }

    const day = recordDay(record.recorded_at, origin);
    if (day == null) {
      continue;
    }

    const key = `${record.patient_id}:${day}`;
    const bucket =
      byPatientDay.get(key) ??
      ({
        day,
        values: {
          paco2: [],
          driving_pressure: [],
          pcr: [],
          lactato: [],
          pafi: [],
          iox: [],
        },
      } satisfies { day: number; values: Record<CurveMetricKey, number[]> });

    for (const metric of CURVE_METRICS) {
      const value = metricFromRecord(record, metric.key);
      if (value != null) {
        bucket.values[metric.key].push(value);
      }
    }

    byPatientDay.set(key, bucket);
  }

  const byDay = new Map<
    number,
    { n: Set<string>; values: Record<CurveMetricKey, number[]> }
  >();

  for (const [key, bucket] of byPatientDay) {
    const patientId = key.split(":")[0] ?? key;
    const dayBucket =
      byDay.get(bucket.day) ??
      ({
        n: new Set<string>(),
        values: {
          paco2: [],
          driving_pressure: [],
          pcr: [],
          lactato: [],
          pafi: [],
          iox: [],
        },
      } satisfies {
        n: Set<string>;
        values: Record<CurveMetricKey, number[]>;
      });

    dayBucket.n.add(patientId);
    for (const metric of CURVE_METRICS) {
      const patientMean = mean(bucket.values[metric.key]);
      if (patientMean != null) {
        dayBucket.values[metric.key].push(patientMean);
      }
    }
    byDay.set(bucket.day, dayBucket);
  }

  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, bucket]) => ({
      day,
      label: `Día ${day}`,
      n: bucket.n.size,
      paco2: mean(bucket.values.paco2),
      driving_pressure: mean(bucket.values.driving_pressure),
      pcr: mean(bucket.values.pcr),
      lactato: mean(bucket.values.lactato),
      pafi: mean(bucket.values.pafi),
      iox: mean(bucket.values.iox),
    }));
}

function latestAverages(recordsByPatient: Map<string, ClinicalRecord>) {
  const result = emptyAverages();
  const latest = [...recordsByPatient.values()];

  for (const metric of CURVE_METRICS) {
    result[metric.key] = mean(latest.map((record) => metricFromRecord(record, metric.key)));
  }

  return result;
}

function groupByPatient<T extends { patient_id: string }>(rows: T[]) {
  const grouped = new Map<string, T[]>();

  for (const row of rows) {
    const current = grouped.get(row.patient_id) ?? [];
    current.push(row);
    grouped.set(row.patient_id, current);
  }

  return grouped;
}

function patientSex(value: string | null): DashboardSex {
  if (value === "H" || value === "M" || value === "I") {
    return value;
  }

  return "unknown";
}

function elapsedDays(start: string, end: string | null, now: Date) {
  const from = new Date(start.includes("T") ? start : `${start}T00:00:00`);
  if (Number.isNaN(from.getTime())) {
    return null;
  }

  const to = end
    ? new Date(end.includes("T") ? end : `${end}T00:00:00`)
    : now;
  if (Number.isNaN(to.getTime()) || to < from) {
    return null;
  }

  return Math.floor((to.getTime() - from.getTime()) / MS_DAY);
}

function milestoneVmiDays(milestones: ClinicalMilestone[], now: Date) {
  const events = milestones
    .filter((item) => item.kind === "iot" || item.kind === "extubacion")
    .sort((left, right) =>
      left.occurred_at < right.occurred_at
        ? -1
        : left.occurred_at > right.occurred_at
          ? 1
          : 0,
    );

  if (!events.some((item) => item.kind === "iot")) {
    return null;
  }

  let total = 0;
  let open: string | null = null;
  let counted = false;

  for (const event of events) {
    if (event.kind === "iot" && !open) {
      open = event.occurred_at;
    }
    if (event.kind === "extubacion" && open) {
      const days = elapsedDays(open, event.occurred_at, now);
      if (days != null) {
        total += days;
        counted = true;
      }
      open = null;
    }
  }

  if (open) {
    const days = elapsedDays(open, null, now);
    if (days != null) {
      total += days;
      counted = true;
    }
  }

  return counted ? total : null;
}

function buildFacts(
  patients: Patient[],
  apacheScores: ApacheScore[],
  vmiEpisodes: VmiEpisode[],
  milestones: ClinicalMilestone[],
  now: Date,
): DashboardFact[] {
  const latestApache = latestByPatient(apacheScores, (row) => row.scored_at);
  const episodesByPatient = groupByPatient(vmiEpisodes);
  const milestonesByPatient = groupByPatient(milestones);

  return patients.map((patient) => {
    const age = exactAge(patient.fecha_nacimiento, now)?.years ?? null;
    const ageBand =
      age == null ? null : (AGE_BANDS.find((band) => band.match(age))?.id ?? null);
    const apache = latestApache.get(patient.id);
    const episodeDays = (episodesByPatient.get(patient.id) ?? [])
      .map((episode) => vmiDays(episode.fecha_iot, episode.fecha_extubacion))
      .filter((value): value is number => value != null);
    const patientMilestones = milestonesByPatient.get(patient.id) ?? [];
    const procedures: Record<string, number> = {};
    let successes = 0;
    let failures = 0;
    let tqt = 0;

    for (const milestone of patientMilestones) {
      procedures[milestone.kind] = (procedures[milestone.kind] ?? 0) + 1;
      if (milestone.kind === "tqt") {
        tqt += 1;
      }
      if (milestone.kind === "weaning" && milestone.weaning_result === "exitosa") {
        successes += 1;
      }
      if (milestone.kind === "weaning" && milestone.weaning_result === "fallo") {
        failures += 1;
      }
    }

    return {
      id: patient.id,
      name: patientFullName(patient),
      stayStart: (patient.fecha_ingreso_uci ?? patient.fecha_ingreso_hospital)?.slice(0, 10) ?? null,
      stayEnd: (patient.fecha_egreso ?? patient.fecha_fallecimiento)?.slice(0, 10) ?? null,
      active: patient.status === "hospitalized",
      deceased: patient.status === "deceased",
      sex: patientSex(patient.sexo),
      age,
      ageBand,
      apache: apache ? asNumber(apache.score) : null,
      predictedMortality: apache ? asNumber(apache.mortality_pct) : null,
      vmiDays:
        milestoneVmiDays(patientMilestones, now) ??
        (episodeDays.length
          ? episodeDays.reduce((sum, value) => sum + value, 0)
          : null),
      procedures,
      successes,
      failures,
      tqt,
    };
  });
}

export function buildDashboardSnapshot(
  patients: Patient[],
  records: ClinicalRecord[],
  apacheScores: ApacheScore[],
  vmiEpisodes: VmiEpisode[],
  milestones: ClinicalMilestone[] = [],
  now = new Date(),
): DashboardSnapshot {
  const hospitalized = patients.filter((patient) => patient.status === "hospitalized");
  const discharged = patients.filter((patient) => patient.status === "not_hospitalized");
  const deceased = patients.filter((patient) => patient.status === "deceased");
  const completed = discharged.length + deceased.length;

  const ages = patients
    .map((patient) => exactAge(patient.fecha_nacimiento, now)?.years)
    .filter((value): value is number => value != null);

  const latestApache = latestByPatient(apacheScores, (row) => row.scored_at);
  const latestRecords = latestByPatient(records, (row) => row.recorded_at);
  const latestVmi = latestByPatient(vmiEpisodes, (row) => row.fecha_iot);

  const apacheRows = [...latestApache.values()];
  const avgApache = mean(apacheRows.map((row) => row.score));
  const predictedMortality = mean(apacheRows.map((row) => asNumber(row.mortality_pct)));
  const observedMortality =
    patients.length === 0 ? null : round((deceased.length / patients.length) * 100);

  const vmiRows = [...latestVmi.values()];
  const vmiActive = vmiRows.filter((row) => !row.fecha_extubacion).length;
  const vmiDayValues = vmiRows
    .map((row) => vmiDays(row.fecha_iot, row.fecha_extubacion))
    .filter((value): value is number => value != null);
  const reintubated = vmiRows.filter((row) => row.reintubacion).length;

  const groupCounts = new Map<string, number>();
  for (const option of GRUPO_DIAGNOSTICO_OPTIONS) {
    groupCounts.set(option, 0);
  }
  for (const patient of patients) {
    bump(groupCounts, patient.grupo_diagnostico || "Sin clasificar");
  }

  const reasonCounts = new Map<string, number>();
  for (const option of MOTIVO_EGRESO_OPTIONS) {
    reasonCounts.set(option, 0);
  }
  const egresos = patients.filter((patient) => patient.motivo_egreso || patient.fecha_egreso);
  for (const patient of egresos) {
    bump(reasonCounts, patient.motivo_egreso || "Sin motivo");
  }

  const sexCounts = new Map<string, number>([
    ["H", 0],
    ["M", 0],
    ["I", 0],
  ]);
  for (const patient of patients) {
    if (patient.sexo) {
      bump(sexCounts, patient.sexo);
    }
  }

  const ageCounts = new Map<string, number>();
  for (const band of AGE_BANDS) {
    ageCounts.set(band.id, 0);
  }
  for (const years of ages) {
    const band = AGE_BANDS.find((item) => item.match(years));
    if (band) {
      bump(ageCounts, band.id);
    }
  }

  const comorbidityCounts = new Map<string, number>();
  for (const option of ANTECEDENTES_OPTIONS) {
    comorbidityCounts.set(option, 0);
  }
  for (const patient of patients) {
    for (const item of parseAntecedentes(patient.antecedentes_morbidos)) {
      bump(comorbidityCounts, item);
    }
  }

  const supportCounts = new Map<string, number>();
  for (const option of SUPPORT_OPTIONS) {
    supportCounts.set(option.id, 0);
  }
  for (const record of latestRecords.values()) {
    bump(supportCounts, record.support);
  }

  const motivoCounts = new Map<string, number>();
  for (const option of MOTIVO_VMI_OPTIONS) {
    motivoCounts.set(option, 0);
  }
  for (const episode of vmiRows) {
    bump(motivoCounts, episode.motivo_vmi);
  }

  const withApache = latestApache.size;
  const withRecords = latestRecords.size;
  const withVmi = latestVmi.size;

  const recent: ActivityRow[] = patients
    .flatMap((patient) => {
      const name = patientFullName(patient);
      const rows: ActivityRow[] = [];

      if (patient.fecha_ingreso_hospital) {
        rows.push({
          id: `${patient.id}-hosp`,
          patientId: patient.id,
          patientName: name,
          event: "Ingreso hospital",
          date: patient.fecha_ingreso_hospital,
          diagnostico: patient.diagnostico,
          status: patient.status,
        });
      }

      if (patient.fecha_ingreso_uci) {
        rows.push({
          id: `${patient.id}-uci`,
          patientId: patient.id,
          patientName: name,
          event: "Ingreso UCI",
          date: patient.fecha_ingreso_uci,
          diagnostico: patient.diagnostico,
          status: patient.status,
        });
      }

      if (patient.fecha_egreso) {
        rows.push({
          id: `${patient.id}-egreso`,
          patientId: patient.id,
          patientName: name,
          event: patient.motivo_egreso
            ? `Egreso · ${patient.motivo_egreso}`
            : "Egreso",
          date: patient.fecha_egreso,
          diagnostico: patient.diagnostico,
          status: patient.status,
        });
      }

      if (patient.fecha_fallecimiento || patient.status === "deceased") {
        rows.push({
          id: `${patient.id}-fallece`,
          patientId: patient.id,
          patientName: name,
          event: "Fallecimiento",
          date: patient.fecha_fallecimiento ?? patient.fecha_egreso ?? patient.updated_at.slice(0, 10),
          diagnostico: patient.diagnostico,
          status: patient.status,
        });
      }

      return rows;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 8);

  return {
    generatedAt: now.toISOString(),
    facts: buildFacts(patients, apacheScores, vmiEpisodes, milestones, now),
    records: records.map((record) => {
      const values: DashboardRecordPoint["values"] = {};
      for (const field of RECORD_STAT_FIELDS) {
        const parsed = asNumber(record[field.id]);
        if (parsed != null) {
          values[field.id] = parsed;
        }
      }
      return {
        patientId: record.patient_id,
        recordedAt: record.recorded_at.slice(0, 10),
        support: record.support,
        ventMode: record.vent_mode,
        flowPattern: record.flow_pattern,
        values,
      };
    }),
    totals: {
      patients: patients.length,
      hospitalized: hospitalized.length,
      discharged: discharged.length,
      deceased: deceased.length,
      records: records.length,
      avgAge: ages.length ? round(ages.reduce((sum, value) => sum + value, 0) / ages.length) : null,
      avgStayDays: mean(patients.map((patient) => stayDays(patient, now))),
      observedMortality,
      predictedMortality,
      avgApache,
      apacheCount: apacheRows.length,
      avgVmiDays: vmiDayValues.length ? round(mean(vmiDayValues) ?? 0) : null,
      vmiActive,
      vmiTotal: vmiRows.length,
      reintubationRate:
        vmiRows.length === 0 ? null : round((reintubated / vmiRows.length) * 100),
    },
    latestAverages: latestAverages(latestRecords),
    curves: buildCurves(patients, records),
    diagnosticGroups: shareList(
      [...groupCounts.entries()].map(([label, count]) => ({
        id: label,
        label,
        count,
      })),
      patients.length,
    ),
    dischargeReasons: shareList(
      [...reasonCounts.entries()].map(([label, count]) => ({
        id: label,
        label,
        count,
      })),
      egresos.length,
    ),
    sex: shareList(
      [
        { id: "H", label: "Hombres", count: sexCounts.get("H") ?? 0 },
        { id: "M", label: "Mujeres", count: sexCounts.get("M") ?? 0 },
        { id: "I", label: "Indeterminado", count: sexCounts.get("I") ?? 0 },
      ].filter((item) => item.count > 0 || patients.length === 0),
      patients.length,
    ),
    ageBands: AGE_BANDS.map((band) => {
      const count = ageCounts.get(band.id) ?? 0;
      return {
        id: band.id,
        label: band.label,
        count,
        share: ages.length > 0 ? round((count / ages.length) * 100) : 0,
      };
    }),
    comorbidities: shareList(
      [...comorbidityCounts.entries()].map(([label, count]) => ({
        id: label,
        label,
        count,
      })),
      patients.length,
    ),
    support: shareList(
      SUPPORT_OPTIONS.map((option) => ({
        id: option.id,
        label: option.label,
        count: supportCounts.get(option.id) ?? 0,
      })),
      latestRecords.size,
    ),
    vmiMotivos: shareList(
      MOTIVO_VMI_OPTIONS.map((label) => ({
        id: label,
        label,
        count: motivoCounts.get(label) ?? 0,
      })),
      vmiRows.length,
    ),
    goals: [
      {
        id: "apache",
        label: "APACHE II completo",
        current: withApache,
        target: Math.max(patients.length, 1),
        hint: `${withApache} de ${patients.length} fichas`,
      },
      {
        id: "records",
        label: "Con registro ventilatorio",
        current: withRecords,
        target: Math.max(patients.length, 1),
        hint: `${withRecords} de ${patients.length} fichas`,
      },
      {
        id: "vmi",
        label: "Con episodio VMI",
        current: withVmi,
        target: Math.max(patients.length, 1),
        hint: `${withVmi} de ${patients.length} fichas`,
      },
      {
        id: "occupancy",
        label: "Aún hospitalizados",
        current: hospitalized.length,
        target: Math.max(patients.length, 1),
        hint:
          completed > 0
            ? `${formatPct(observedMortality)} de mortalidad cruda`
            : "Sin egresos cerrados",
      },
    ],
    statusMix: shareList(
      [
        { id: "hospitalized", label: "Hospitalizados", count: hospitalized.length },
        { id: "not_hospitalized", label: "Egresados", count: discharged.length },
        { id: "deceased", label: "Fallecidos", count: deceased.length },
      ],
      patients.length,
    ),
    monthlyFlow: buildMonthlyFlow(patients, now),
    recent,
  };
}

const SEX_ROWS: { key: DashboardSex; label: string }[] = [
  { key: "H", label: "Hombres" },
  { key: "M", label: "Mujeres" },
  { key: "I", label: "Indeterminado" },
];

const OUTCOME_ROWS = [
  { key: "exito", label: "Éxitos" },
  { key: "fracaso", label: "Fracasos" },
  { key: "tqt", label: "TQT" },
] as const;

function numbers(values: Array<number | null>) {
  return values.filter((value): value is number => value != null);
}

function quantile(sorted: number[], percentile: number) {
  if (sorted.length === 1) {
    return sorted[0] ?? 0;
  }

  const position = (sorted.length - 1) * percentile;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const low = sorted[lower] ?? 0;
  const high = sorted[upper] ?? low;
  if (lower === upper) {
    return low;
  }

  return low + (high - low) * (position - lower);
}

export function factMatches(fact: DashboardFact, filter: DashboardFilter) {
  switch (filter.dimension) {
    case "sex":
      return fact.sex === filter.key;
    case "age":
      return fact.ageBand === filter.key;
    case "procedure":
      return (fact.procedures[filter.key] ?? 0) > 0;
    case "outcome":
      if (filter.key === "exito") {
        return fact.successes > 0;
      }
      if (filter.key === "fracaso") {
        return fact.failures > 0;
      }
      return fact.tqt > 0;
  }
}

export function filterFacts(
  facts: DashboardFact[],
  filter: DashboardFilter | null,
  except?: DashboardFilterDimension,
) {
  if (!filter || filter.dimension === except) {
    return facts;
  }

  return facts.filter((fact) => factMatches(fact, filter));
}

export function summarizeCohort(facts: DashboardFact[]): CohortSummary {
  const ages = numbers(facts.map((fact) => fact.age));
  const vmi = numbers(facts.map((fact) => fact.vmiDays));
  const apache = numbers(facts.map((fact) => fact.apache));
  const predicted = numbers(facts.map((fact) => fact.predictedMortality));
  const deceased = facts.filter((fact) => fact.deceased).length;

  return {
    patients: facts.length,
    active: facts.filter((fact) => fact.active).length,
    deceased,
    avgVmiDays: vmi.length
      ? round(vmi.reduce((sum, value) => sum + value, 0) / vmi.length)
      : null,
    vmiCount: vmi.length,
    avgApache: apache.length
      ? round(apache.reduce((sum, value) => sum + value, 0) / apache.length)
      : null,
    apacheCount: apache.length,
    observedMortality:
      facts.length === 0 ? null : round((deceased / facts.length) * 100),
    predictedMortality: predicted.length
      ? round(predicted.reduce((sum, value) => sum + value, 0) / predicted.length)
      : null,
    avgAge: ages.length
      ? round(ages.reduce((sum, value) => sum + value, 0) / ages.length)
      : null,
    medianAge: ages.length ? round(quantile([...ages].sort((a, b) => a - b), 0.5)) : null,
    ageCount: ages.length,
  };
}

export function describeDistribution(values: number[]): DistributionSummary | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const sd =
    sorted.length < 2
      ? null
      : Math.sqrt(
          sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
            (sorted.length - 1),
        );

  return {
    n: sorted.length,
    mean,
    median: quantile(sorted, 0.5),
    sd,
    p25: quantile(sorted, 0.25),
    p50: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
    p90: quantile(sorted, 0.9),
  };
}

export function sexRows(facts: DashboardFact[]): DashboardBar[] {
  const rows = SEX_ROWS.map((row) => ({
    ...row,
    count: facts.filter((fact) => fact.sex === row.key).length,
  }));
  const unknown = facts.filter((fact) => fact.sex === "unknown").length;
  if (unknown > 0) {
    rows.push({ key: "unknown", label: "Sin dato", count: unknown });
  }
  return rows;
}

export function ageRows(facts: DashboardFact[]): DashboardBar[] {
  return AGE_BANDS.map((band) => ({
    key: band.id,
    label: band.label,
    count: facts.filter((fact) => fact.ageBand === band.id).length,
  }));
}

export function procedureRows(
  facts: DashboardFact[],
  procedures: ReadonlyArray<{ id: string; label: string }>,
): DashboardBar[] {
  return procedures.map((procedure) => ({
    key: procedure.id,
    label: procedure.label,
    count: facts.reduce(
      (sum, fact) => sum + (fact.procedures[procedure.id] ?? 0),
      0,
    ),
  }));
}

export function outcomeRows(facts: DashboardFact[]): DashboardBar[] {
  return OUTCOME_ROWS.map((row) => ({
    key: row.key,
    label: row.label,
    count: facts.reduce((sum, fact) => {
      if (row.key === "exito") {
        return sum + fact.successes;
      }
      if (row.key === "fracaso") {
        return sum + fact.failures;
      }
      return sum + fact.tqt;
    }, 0),
  }));
}

export function vmiDayValues(facts: DashboardFact[]) {
  return numbers(facts.map((fact) => fact.vmiDays));
}

export type NumericSummary = {
  n: number;
  mean: number | null;
  median: number | null;
  sd: number | null;
  cv: number | null;
};

export function summarizeNumbers(values: number[]): NumericSummary {
  const distribution = describeDistribution(values);
  if (!distribution) {
    return { n: 0, mean: null, median: null, sd: null, cv: null };
  }

  const cv =
    distribution.sd == null || distribution.mean === 0
      ? null
      : (distribution.sd / Math.abs(distribution.mean)) * 100;

  return {
    n: distribution.n,
    mean: distribution.mean,
    median: distribution.median,
    sd: distribution.sd,
    cv,
  };
}

export function factsInRange(facts: DashboardFact[], range: DashboardDateRange | null) {
  if (!range) {
    return facts;
  }

  return facts.filter((fact) => {
    if (!fact.stayStart) {
      return false;
    }
    if (fact.stayStart > range.to) {
      return false;
    }
    if (fact.stayEnd && fact.stayEnd < range.from) {
      return false;
    }
    return true;
  });
}

export function recordsInView(
  records: DashboardRecordPoint[],
  facts: DashboardFact[],
  range: DashboardDateRange | null,
) {
  const ids = new Set(facts.map((fact) => fact.id));
  return records.filter((record) => {
    if (!ids.has(record.patientId)) {
      return false;
    }
    if (!range) {
      return true;
    }
    return record.recordedAt >= range.from && record.recordedAt <= range.to;
  });
}
