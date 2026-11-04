import {
  hitoKindLabel,
  hitoNeedsGsa,
  type HitoKind,
} from "@/modules/hitos/constants";
import { formatDateTime } from "@/modules/patients/display";
import { formatRecordNumber } from "@/modules/registros/model";
import type { ClinicalMilestone } from "@/shared/types/database";

function gasLine(milestone: ClinicalMilestone) {
  const parts = [
    milestone.pao2 == null
      ? null
      : `PaO₂ ${formatRecordNumber(milestone.pao2)} mmHg`,
    milestone.paco2 == null
      ? null
      : `PaCO₂ ${formatRecordNumber(milestone.paco2)} mmHg`,
    milestone.fio2 == null
      ? null
      : `FiO₂ ${formatRecordNumber(milestone.fio2)}%`,
    milestone.pafi == null ? null : `PaFi ${formatRecordNumber(milestone.pafi)}`,
    milestone.hco3 == null
      ? null
      : `HCO₃ ${formatRecordNumber(milestone.hco3)} mEq/L`,
    milestone.eb == null ? null : `EB ${formatRecordNumber(milestone.eb)} mEq/L`,
    milestone.lactato == null
      ? null
      : `Ác. láctico ${formatRecordNumber(milestone.lactato)} mg/dL`,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function milestoneDetailLines(milestone: ClinicalMilestone) {
  const lines: string[] = [];

  if (milestone.kind === "iot") {
    if (milestone.motivo) {
      lines.push(`Motivo: ${milestone.motivo}`);
    }
    if (milestone.lugar_iot) {
      lines.push(`Lugar: ${milestone.lugar_iot}`);
    }
    if (milestone.intubacion_dificil) {
      lines.push("Intubación difícil");
    }
    if (milestone.reintubacion) {
      lines.push("Reintubación");
    }
  } else if (milestone.kind === "tqt") {
    lines.push(milestone.motivo ? `Motivo: ${milestone.motivo}` : "Sin motivo");
  } else if (milestone.kind === "weaning") {
    lines.push(
      milestone.weaning_result === "exitosa"
        ? "Consolidación exitosa"
        : "Fallo de weaning",
    );
  } else if (hitoNeedsGsa(milestone.kind as HitoKind)) {
    const gases = gasLine(milestone);
    if (gases) {
      lines.push(gases);
    }
  }

  return lines;
}

export function milestoneDetailText(milestone: ClinicalMilestone) {
  const lines = milestoneDetailLines(milestone);
  return lines.length > 0 ? lines.join(" · ") : "Fecha registrada";
}

export function describeMilestone(milestone: ClinicalMilestone) {
  const lines = milestoneDetailLines(milestone);
  if (milestone.notes) {
    lines.push(`Observación: ${milestone.notes}`);
  }

  return {
    id: milestone.id,
    title: hitoKindLabel(milestone.kind),
    when: formatDateTime(milestone.occurred_at),
    lines,
  };
}
