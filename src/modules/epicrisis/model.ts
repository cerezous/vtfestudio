import { describeMilestone } from "@/modules/hitos/display";
import { formatKg } from "@/modules/patients/anthropometry";
import {
  formatDate,
  formatExactAge,
  formatRut,
  patientFullName,
  sexoLabel,
} from "@/modules/patients/display";
import {
  descriptiveStats,
  formatStatParagraph,
} from "@/modules/epicrisis/stats";
import type {
  ApacheScore,
  ClinicalMilestone,
  ClinicalRecord,
  Patient,
} from "@/shared/types/database";

const DAY_MS = 86_400_000;

export type EpicrisisMetric = {
  id: string;
  label: string;
  paragraph: string;
};

export type EpicrisisDocumentModel = {
  title: string;
  generatedLabel: string;
  patientName: string;
  identity: Array<{ label: string; value: string }>;
  hospitalization: Array<{ label: string; value: string }>;
  vmiSummary: Array<{ label: string; value: string }>;
  milestones: Array<{
    id: string;
    title: string;
    when: string;
    lines: string[];
  }>;
  metrics: EpicrisisMetric[];
  recordCount: number;
};

function statusLabel(status: Patient["status"]) {
  if (status === "hospitalized") {
    return "Hospitalizado";
  }
  if (status === "deceased") {
    return "Fallecido";
  }
  return "Egresado";
}

function daysBetween(start: string | null, end: string | null) {
  if (!start) {
    return null;
  }

  const from = new Date(start.includes("T") ? start : `${start}T00:00:00`);
  if (Number.isNaN(from.getTime())) {
    return null;
  }

  const to = end
    ? new Date(end.includes("T") ? end : `${end}T00:00:00`)
    : new Date();
  if (Number.isNaN(to.getTime()) || to < from) {
    return null;
  }

  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

function formatDays(days: number | null, ongoing: boolean) {
  if (days == null) {
    return "—";
  }

  const label = `${days} ${days === 1 ? "día" : "días"}`;
  return ongoing ? `${label} · en curso` : label;
}

function latestApache(scores: ApacheScore[]) {
  return [...scores].sort((a, b) =>
    a.scored_at < b.scored_at ? 1 : a.scored_at > b.scored_at ? -1 : 0,
  )[0];
}

function formatPct(value: number) {
  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 1,
  }).format(value);
}

export function buildEpicrisisDocument(input: {
  patient: Patient;
  records: ClinicalRecord[];
  milestones: ClinicalMilestone[];
  apacheScores: ApacheScore[];
  generatedAt?: Date;
}): EpicrisisDocumentModel {
  const generatedAt = input.generatedAt ?? new Date();
  const milestones = [...input.milestones].sort((a, b) =>
    a.occurred_at < b.occurred_at
      ? -1
      : a.occurred_at > b.occurred_at
        ? 1
        : 0,
  );
  const records = [...input.records].sort((a, b) =>
    a.recorded_at < b.recorded_at
      ? -1
      : a.recorded_at > b.recorded_at
        ? 1
        : 0,
  );

  const iot = milestones.find((item) => item.kind === "iot");
  const extubacion = [...milestones]
    .reverse()
    .find((item) => item.kind === "extubacion");
  const tqt = milestones.find((item) => item.kind === "tqt");
  const weaning = [...milestones]
    .reverse()
    .find((item) => item.kind === "weaning");
  const pronaciones = milestones.filter((item) => item.kind === "pronacion");
  const ecmo = milestones.filter((item) => item.kind === "ecmo");
  const apache = latestApache(input.apacheScores);

  const hospitalStay = daysBetween(
    input.patient.fecha_ingreso_hospital,
    input.patient.fecha_egreso,
  );
  const uciStay = daysBetween(
    input.patient.fecha_ingreso_uci,
    input.patient.fecha_egreso,
  );
  const vmiDays = daysBetween(
    iot?.occurred_at ?? null,
    extubacion?.occurred_at ?? null,
  );

  const metrics: EpicrisisMetric[] = [
    {
      id: "pafi",
      label: "PaFi",
      paragraph: formatStatParagraph(
        "PaFi",
        descriptiveStats(
          records.map((record) => record.pafi),
          0,
        ),
        0,
      ),
    },
    {
      id: "iox",
      label: "IOX",
      paragraph: formatStatParagraph(
        "IOX",
        descriptiveStats(
          records.map((record) => record.iox),
          1,
        ),
        1,
      ),
    },
    {
      id: "peep",
      label: "PEEP",
      paragraph: formatStatParagraph(
        "PEEP",
        descriptiveStats(
          records.map((record) => record.peep),
          1,
        ),
        1,
        "cmH₂O",
      ),
    },
    {
      id: "cest",
      label: "Cest",
      paragraph: formatStatParagraph(
        "Cest",
        descriptiveStats(
          records.map((record) => record.cest),
          1,
        ),
        1,
        "mL/cmH₂O",
      ),
    },
    {
      id: "driving_pressure",
      label: "Driving Pressure",
      paragraph: formatStatParagraph(
        "Driving Pressure",
        descriptiveStats(
          records.map((record) => record.driving_pressure),
          1,
        ),
        1,
        "cmH₂O",
      ),
    },
    {
      id: "pcr",
      label: "PCR",
      paragraph: formatStatParagraph(
        "PCR",
        descriptiveStats(
          records.map((record) => record.pcr),
          1,
        ),
        1,
        "mg/L",
      ),
    },
    {
      id: "lactato",
      label: "Ácido láctico",
      paragraph: formatStatParagraph(
        "Ácido láctico",
        descriptiveStats(
          records.map((record) => record.lactato),
          2,
        ),
        2,
        "mg/dL",
      ),
    },
    {
      id: "procalcitonina",
      label: "Procalcitonina",
      paragraph: formatStatParagraph(
        "Procalcitonina",
        descriptiveStats(
          records.map((record) => record.procalcitonina),
          2,
        ),
        2,
        "ng/mL",
      ),
    },
  ];

  return {
    title: "Epicrisis de ventilación mecánica",
    generatedLabel: new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(generatedAt),
    patientName: patientFullName(input.patient),
    identity: [
      { label: "Nombre", value: patientFullName(input.patient) },
      { label: "RUT", value: formatRut(input.patient.id_rut) },
      { label: "N° ficha", value: String(input.patient.n_ficha) },
      { label: "Sexo", value: sexoLabel(input.patient.sexo) },
      {
        label: "Fecha de nacimiento",
        value: formatDate(input.patient.fecha_nacimiento),
      },
      {
        label: "Edad exacta",
        value: formatExactAge(input.patient.fecha_nacimiento),
      },
      {
        label: "Nacionalidad",
        value: input.patient.nacionalidad ?? "—",
      },
      {
        label: "Talla",
        value:
          input.patient.talla == null ? "—" : `${input.patient.talla} cm`,
      },
      {
        label: "Peso ideal",
        value: formatKg(input.patient.peso_ideal),
      },
    ],
    hospitalization: [
      {
        label: "Estado",
        value: statusLabel(input.patient.status),
      },
      {
        label: "Diagnóstico principal",
        value: input.patient.diagnostico,
      },
      {
        label: "Grupo diagnóstico",
        value: input.patient.grupo_diagnostico ?? "—",
      },
      {
        label: "Antecedentes mórbidos",
        value: input.patient.antecedentes_morbidos ?? "—",
      },
      {
        label: "Ingreso hospital",
        value: formatDate(input.patient.fecha_ingreso_hospital),
      },
      {
        label: "Ingreso UCI",
        value: formatDate(input.patient.fecha_ingreso_uci),
      },
      {
        label: "Egreso",
        value: formatDate(input.patient.fecha_egreso),
      },
      {
        label: "Motivo de egreso",
        value: input.patient.motivo_egreso ?? "—",
      },
      {
        label: "Estadía hospitalaria",
        value: formatDays(hospitalStay, !input.patient.fecha_egreso),
      },
      {
        label: "Estadía UCI",
        value: input.patient.fecha_ingreso_uci
          ? formatDays(uciStay, !input.patient.fecha_egreso)
          : "—",
      },
      {
        label: "APACHE II",
        value: apache
          ? `${apache.score} puntos · mortalidad predicha ${formatPct(apache.mortality_pct)}% (${formatDate(apache.scored_at.slice(0, 10))})`
          : "Sin registro",
      },
    ],
    vmiSummary: [
      {
        label: "Días de VMI",
        value: iot
          ? formatDays(vmiDays, !extubacion)
          : "Sin IOT registrada",
      },
      {
        label: "IOT",
        value: iot
          ? [
              iot.motivo,
              iot.lugar_iot,
              iot.intubacion_dificil ? "difícil" : null,
              iot.reintubacion ? "reintubación" : null,
            ]
              .filter(Boolean)
              .join(" · ") || formatDate(iot.occurred_at.slice(0, 10))
          : "—",
      },
      {
        label: "Pronación",
        value:
          pronaciones.length === 0
            ? "No"
            : `${pronaciones.length} ${pronaciones.length === 1 ? "episodio" : "episodios"}`,
      },
      {
        label: "ECMO",
        value:
          ecmo.length === 0
            ? "No"
            : `${ecmo.length} ${ecmo.length === 1 ? "episodio" : "episodios"}`,
      },
      {
        label: "TQT",
        value: tqt ? tqt.motivo ?? "Sí" : "No",
      },
      {
        label: "Extubación",
        value: extubacion
          ? formatDate(extubacion.occurred_at.slice(0, 10))
          : "Pendiente",
      },
      {
        label: "Weaning",
        value: weaning
          ? weaning.weaning_result === "exitosa"
            ? "Exitosa"
            : "Fallo"
          : "Sin consolidación registrada",
      },
    ],
    milestones: milestones.map(describeMilestone),
    metrics,
    recordCount: records.length,
  };
}
