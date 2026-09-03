"use client";

import { Pencil, Trash2 } from "lucide-react";

import {
  hitoKindColor,
  hitoKindLabel,
  hitoNeedsGsa,
  type HitoKind,
} from "@/modules/hitos/constants";
import { formatRecordNumber } from "@/modules/registros/model";
import { formatDateTime } from "@/modules/patients/display";
import { Button } from "@/shared/components/ui/button";
import type { ClinicalMilestone } from "@/shared/types/database";

function detailText(milestone: ClinicalMilestone) {
  if (milestone.kind === "tqt") {
    return milestone.motivo ?? "Sin motivo";
  }
  if (milestone.kind === "weaning") {
    return milestone.weaning_result === "exitosa" ? "Exitosa" : "Fallo";
  }
  if (hitoNeedsGsa(milestone.kind as HitoKind)) {
    const pafi =
      milestone.pafi == null ? null : formatRecordNumber(milestone.pafi);
    const pao2 =
      milestone.pao2 == null ? null : formatRecordNumber(milestone.pao2);
    const fio2 =
      milestone.fio2 == null ? null : formatRecordNumber(milestone.fio2);
    return [
      pafi ? `PaFi ${pafi}` : null,
      pao2 ? `PaO₂ ${pao2}` : null,
      fio2 ? `FiO₂ ${fio2}%` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return "Fecha registrada";
}

export function HitosTimeline({
  milestones,
  onEdit,
  onDelete,
}: {
  milestones: ClinicalMilestone[];
  onEdit: (milestone: ClinicalMilestone) => void;
  onDelete: (milestone: ClinicalMilestone) => void;
}) {
  if (milestones.length === 0) {
    return (
      <div className="grid min-h-48 place-items-center rounded-[1.6rem] border border-dashed bg-muted/40 px-6 text-center text-sm text-muted-foreground">
        Aún no hay hitos. Comienza registrando la IOT.
      </div>
    );
  }

  return (
    <ol className="relative space-y-3 border-l-2 border-primary/20 pl-5">
      {milestones.map((milestone) => {
        const color = hitoKindColor(milestone.kind);
        const weaningFail = milestone.kind === "weaning" && milestone.weaning_result === "fallo";
        return (
          <li key={milestone.id} className="relative">
            <span
              aria-hidden
              className="absolute -left-[1.55rem] top-5 size-3.5 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: weaningFail ? "#dc2626" : color }}
            />
            <div
              className="flex cursor-pointer items-start justify-between gap-3 rounded-[1.3rem] border bg-card px-4 py-3 shadow-sm transition hover:bg-muted/40"
              onClick={() => onEdit(milestone)}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight">
                  {hitoKindLabel(milestone.kind)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(milestone.occurred_at)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {detailText(milestone)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Editar"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(milestone);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Eliminar"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(milestone);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
