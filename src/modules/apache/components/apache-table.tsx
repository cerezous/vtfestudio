"use client";

import { Pencil, Trash2 } from "lucide-react";

import { formatDateTime } from "@/modules/patients/display";
import { Button } from "@/shared/components/ui/button";
import type { ApacheScore } from "@/shared/types/database";

export function ApacheTable({
  records,
  onEdit,
  onDelete,
}: {
  records: ApacheScore[];
  onEdit: (record: ApacheScore) => void;
  onDelete: (record: ApacheScore) => void;
}) {
  if (records.length === 0) {
    return (
      <div className="grid min-h-40 place-items-center rounded-[1.4rem] border border-dashed bg-muted/40 px-6 text-center text-sm text-muted-foreground">
        Aún no hay APACHE II. Crea el primero con el botón de arriba.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[1.6rem] border bg-card shadow-sm">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Puntaje</th>
            <th className="px-4 py-3 font-medium">Mortalidad</th>
            <th className="px-4 py-3 font-medium">APS</th>
            <th className="px-4 py-3 font-medium">GCS</th>
            <th className="px-4 py-3 font-medium">Edad</th>
            <th className="px-4 py-3 font-medium">Crónica</th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
              onClick={() => onEdit(record)}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDateTime(record.scored_at)}
              </td>
              <td className="px-4 py-3 font-semibold tabular-nums">
                {record.score}
              </td>
              <td className="px-4 py-3 font-medium tabular-nums text-primary">
                {Number(record.mortality_pct).toFixed(1)}%
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {record.aps_points}
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {record.gcs_points}
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {record.age_points}
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {record.chronic_points}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(record);
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
                      onDelete(record);
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
