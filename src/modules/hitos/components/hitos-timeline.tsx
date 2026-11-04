"use client";

import { Pencil, Trash2 } from "lucide-react";

import { hitoKindColor, hitoKindLabel } from "@/modules/hitos/constants";
import { milestoneDetailText } from "@/modules/hitos/display";
import { formatDateTime } from "@/modules/patients/display";
import { Button } from "@/shared/components/ui/button";
import type { ClinicalMilestone } from "@/shared/types/database";

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
      <div className="grid min-h-48 place-items-center rounded-[1.6rem] bg-[rgb(120_120_128/0.08)] px-6 text-center text-sm text-muted-foreground">
        Sin hitos. Empieza por la IOT.
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
              className="dash-surface flex cursor-pointer items-start justify-between gap-3 rounded-[1.3rem] px-4 py-3 transition hover:bg-muted/40"
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
                  {milestoneDetailText(milestone)}
                </p>
                {milestone.notes ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                    {milestone.notes}
                  </p>
                ) : null}
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
