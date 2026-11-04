"use client";

import { useState } from "react";
import { CalendarRange, Download } from "lucide-react";
import { toast } from "sonner";

import {
  buildStatisticsWorkbook,
  downloadStatisticsCsv,
  downloadStatisticsExcel,
  downloadStatisticsPdf,
} from "@/modules/dashboard/export-sheet";
import type {
  DashboardDateRange,
  DashboardFact,
  DashboardFilter,
  DashboardRecordPoint,
} from "@/modules/dashboard/stats";
import { Button } from "@/shared/components/ui/button";
import { fieldClass } from "@/shared/components/ui/controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Label } from "@/shared/components/ui/label";

function formatRange(range: DashboardDateRange) {
  const format = new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);
  return `${format.format(from)} – ${format.format(to)}`;
}

export function DashboardToolbar({
  range,
  onRangeChange,
  facts,
  records,
  filter,
  onClearFilter,
}: {
  range: DashboardDateRange | null;
  onRangeChange: (range: DashboardDateRange | null) => void;
  facts: DashboardFact[];
  records: DashboardRecordPoint[];
  filter: DashboardFilter | null;
  onClearFilter?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [from, setFrom] = useState(range?.from ?? "");
  const [to, setTo] = useState(range?.to ?? "");
  const invalid = Boolean(from && to && from > to);

  function openDates() {
    setFrom(range?.from ?? "");
    setTo(range?.to ?? "");
    setOpen(true);
  }

  function apply() {
    if (!from || !to || from > to) {
      return;
    }
    onRangeChange({ from, to });
    setOpen(false);
  }

  function workbook() {
    return buildStatisticsWorkbook({
      facts,
      records,
      range,
      filter,
      generatedAt: new Date(),
    });
  }

  async function exportPdf() {
    if (savingPdf) {
      return;
    }
    setSavingPdf(true);
    try {
      await downloadStatisticsPdf();
    } catch {
      toast.error("No se pudo crear el PDF.");
    } finally {
      setSavingPdf(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Estadística</h1>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {filter
              ? filter.label
              : range
                ? "Cohorte dentro del periodo."
                : "Elige una barra para filtrar."}
          </p>
          {onClearFilter ? (
            <button
              type="button"
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[13px] font-medium text-primary transition-transform active:scale-[0.97]"
              onClick={onClearFilter}
            >
              Quitar selección
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={openDates}>
          <CalendarRange className="size-3.5" />
          {range ? formatRange(range) : "Fechas"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Download className="size-3.5" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuItem disabled={savingPdf} onSelect={() => void exportPdf()}>
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => downloadStatisticsExcel(workbook())}>
              Excel (.xls)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => downloadStatisticsCsv(workbook())}>
              CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrar por fechas</DialogTitle>
            <DialogDescription>
              Pacientes con estadía en el periodo. Los registros, solo si caen entre las fechas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="estadistica-desde">Desde</Label>
              <input
                id="estadistica-desde"
                type="date"
                className={fieldClass}
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="estadistica-hasta">Hasta</Label>
              <input
                id="estadistica-hasta"
                type="date"
                className={fieldClass}
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>
          {invalid ? (
            <p className="text-[13px] font-medium text-destructive">
              La fecha inicial es posterior a la final.
            </p>
          ) : null}
          <DialogFooter>
            {range ? (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto"
                onClick={() => {
                  onRangeChange(null);
                  setOpen(false);
                }}
              >
                Quitar
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!from || !to || invalid} onClick={apply}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
