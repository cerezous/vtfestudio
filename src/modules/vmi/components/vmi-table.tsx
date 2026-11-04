"use client";

import { Pencil, Trash2 } from "lucide-react";

import { formatDate } from "@/modules/patients/display";
import { formatVmiDays } from "@/modules/vmi/constants";
import { Button } from "@/shared/components/ui/button";
import type { VmiEpisode } from "@/shared/types/database";

export function VmiTable({
  episodes,
  onEdit,
  onDelete,
}: {
  episodes: VmiEpisode[];
  onEdit: (episode: VmiEpisode) => void;
  onDelete: (episode: VmiEpisode) => void;
}) {
  if (episodes.length === 0) {
    return (
      <div className="grid min-h-40 place-items-center rounded-[1.4rem] border border-dashed bg-muted/40 px-6 text-center text-sm text-muted-foreground">
        Sin datos de VMI. Regístralos arriba.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[1.6rem] border bg-card shadow-sm">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha IOT</th>
            <th className="px-4 py-3 font-medium">Motivo</th>
            <th className="px-4 py-3 font-medium">Lugar</th>
            <th className="px-4 py-3 font-medium">Extubación</th>
            <th className="px-4 py-3 font-medium">Días VMI</th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {episodes.map((episode) => (
            <tr
              key={episode.id}
              className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
              onClick={() => onEdit(episode)}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(episode.fecha_iot)}
              </td>
              <td className="max-w-[16rem] px-4 py-3">
                <div className="truncate">
                  {episode.motivo_vmi === "Otro"
                    ? episode.motivo_otro || "Otro"
                    : episode.motivo_vmi}
                </div>
                {episode.reintubacion || episode.intubacion_dificil ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {[
                      episode.intubacion_dificil ? "IOT difícil" : null,
                      episode.reintubacion ? "Reintubación" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {episode.lugar_iot ?? "—"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(episode.fecha_extubacion)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatVmiDays(episode.fecha_iot, episode.fecha_extubacion)}
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
                      onEdit(episode);
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
                      onDelete(episode);
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
