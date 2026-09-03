"use client";

import { Pencil, Trash2 } from "lucide-react";

import {
  MAX_CLINICAL_RECORDS,
  TABLE_ROWS,
  supportLabel,
  type RecordFieldId,
} from "@/modules/registros/constants";
import { asNumber, formatRecordNumber } from "@/modules/registros/model";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ClinicalRecord } from "@/shared/types/database";

function formatHeaderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { day: value, time: "" };
  }

  return {
    day: new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
    }).format(date),
    time: new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function fieldValue(record: ClinicalRecord, field: RecordFieldId) {
  if (field === "support") {
    return supportLabel(record.support);
  }
  return formatRecordNumber(record[field]);
}

export function RegistrosTable({
  records,
  onEdit,
  onDelete,
  onCreate,
}: {
  records: ClinicalRecord[];
  onEdit: (record: ClinicalRecord) => void;
  onDelete: (record: ClinicalRecord) => void;
  onCreate: () => void;
}) {
  const slots: Array<ClinicalRecord | null> = Array.from(
    { length: MAX_CLINICAL_RECORDS },
    (_, index) => records[index] ?? null,
  );

  return (
    <div className="overflow-x-auto rounded-[1.6rem] border bg-card shadow-sm">
      <table className="w-max min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="sticky left-0 z-20 min-w-44 bg-muted/40 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fecha
            </th>
            {slots.map((record, index) => {
              const header = record ? formatHeaderDate(record.recorded_at) : null;
              return (
                <th
                  key={record?.id ?? `empty-${index}`}
                  className={cn(
                    "min-w-[6.4rem] border-l px-1.5 py-2 text-center align-bottom font-medium",
                    record
                      ? "cursor-pointer hover:bg-accent/70"
                      : "text-muted-foreground/50",
                  )}
                  onClick={() => {
                    if (record) {
                      onEdit(record);
                      return;
                    }
                    onCreate();
                  }}
                >
                  {record && header ? (
                    <div className="space-y-1">
                      <div className="text-[11px] leading-tight text-foreground">
                        <div className="capitalize">{header.day}</div>
                        <div className="tabular-nums text-muted-foreground">
                          {header.time}
                        </div>
                      </div>
                      <div className="flex justify-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Editar registro"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(record);
                          }}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Eliminar registro"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(record);
                          }}
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs">—</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((group) => (
            <GroupRows
              key={group.title}
              title={group.title}
              rows={group.rows}
              slots={slots}
              onEdit={onEdit}
              onCreate={onCreate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupRows({
  title,
  rows,
  slots,
  onEdit,
  onCreate,
}: {
  title: string;
  rows: { id: RecordFieldId; label: string; unit?: string }[];
  slots: Array<ClinicalRecord | null>;
  onEdit: (record: ClinicalRecord) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <tr className="border-b bg-muted/30">
        <th
          colSpan={MAX_CLINICAL_RECORDS + 1}
          className="sticky left-0 px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {title}
        </th>
      </tr>
      {rows.map((row) => (
        <tr key={row.id} className="border-b last:border-0">
          <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-medium whitespace-nowrap">
            {row.label}
            {row.unit ? (
              <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                {row.unit}
              </span>
            ) : null}
          </th>
          {slots.map((record, index) => (
            <td
              key={record?.id ?? `${row.id}-empty-${index}`}
              className={cn(
                "border-l px-1.5 py-2 text-center tabular-nums",
                record
                  ? "cursor-pointer hover:bg-muted/50"
                  : "text-muted-foreground/40",
              )}
              onClick={() => {
                if (record) {
                  onEdit(record);
                  return;
                }
                onCreate();
              }}
            >
              {record ? (
                row.id === "pafi" && asNumber(record.pafi) != null ? (
                  <span className="font-medium text-primary">
                    {fieldValue(record, row.id)}
                  </span>
                ) : (
                  fieldValue(record, row.id)
                )
              ) : (
                "—"
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
