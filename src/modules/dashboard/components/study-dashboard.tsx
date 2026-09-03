"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  CalendarDays,
  Download,
  HeartPulse,
  Timer,
  Users,
} from "lucide-react";

import { KpiCard } from "@/modules/dashboard/components/dashboard-panels";
import {
  formatMetric,
  formatPct,
  type DashboardSnapshot,
} from "@/modules/dashboard/stats";
import { Button } from "@/shared/components/ui/button";
import type { Profile } from "@/shared/types/database";

const DashboardVisuals = dynamic(
  () =>
    import("@/modules/dashboard/components/dashboard-charts").then(
      (mod) => mod.DashboardVisuals,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-[1.6rem] bg-muted/40"
          />
        ))}
      </div>
    ),
  },
);

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[;"\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function exportSnapshot(snapshot: DashboardSnapshot) {
  const lines: Array<Array<string | number | null | undefined>> = [
    ["Indicador", "Valor"],
    ["Pacientes", snapshot.totals.patients],
    ["Hospitalizados", snapshot.totals.hospitalized],
    ["Egresados", snapshot.totals.discharged],
    ["Fallecidos", snapshot.totals.deceased],
    ["Edad promedio", snapshot.totals.avgAge],
    ["Estadía promedio (días)", snapshot.totals.avgStayDays],
    ["Mortalidad observada (%)", snapshot.totals.observedMortality],
    ["Mortalidad predicha APACHE (%)", snapshot.totals.predictedMortality],
    ["APACHE II promedio", snapshot.totals.avgApache],
    ["Días VMI promedio", snapshot.totals.avgVmiDays],
    ["Reintubación (%)", snapshot.totals.reintubationRate],
    [],
    ["Grupo diagnóstico", "n", "%"],
    ...snapshot.diagnosticGroups.map((item) => [
      item.label,
      item.count,
      item.share,
    ]),
    [],
    ["Motivo de egreso", "n", "%"],
    ...snapshot.dischargeReasons.map((item) => [
      item.label,
      item.count,
      item.share,
    ]),
    [],
    ["Mes", "Ingresos", "Altas", "Fallecidos"],
    ...snapshot.monthlyFlow.map((item) => [
      item.label,
      item.ingresos,
      item.egresos,
      item.fallecidos,
    ]),
    [],
    ["Día", "n", "PaCO2", "DP", "PCR", "Lactato", "PaFi", "IOX"],
    ...snapshot.curves.map((point) => [
      point.day,
      point.n,
      point.paco2,
      point.driving_pressure,
      point.pcr,
      point.lactato,
      point.pafi,
      point.iox,
    ]),
  ];

  const csv = lines
    .map((row) => row.map((cell) => csvCell(cell)).join(";"))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dashboard-vmi-${snapshot.generatedAt.slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function mortalityDelta(snapshot: DashboardSnapshot) {
  const observed = snapshot.totals.observedMortality;
  const predicted = snapshot.totals.predictedMortality;
  if (observed == null || predicted == null) {
    return undefined;
  }

  const diff = Math.round((observed - predicted) * 10) / 10;
  if (diff === 0) {
    return { text: "Igual a APACHE", tone: "neutral" as const };
  }

  return {
    text: `${diff > 0 ? "+" : ""}${formatMetric(diff)} pp vs APACHE`,
    tone: diff > 0 ? ("up" as const) : ("down" as const),
  };
}

export function StudyDashboard({
  profile,
  snapshot,
}: {
  profile: Profile;
  snapshot: DashboardSnapshot;
}) {
  const firstName = profile.full_name.split(" ")[0] ?? profile.full_name;
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(snapshot.generatedAt)),
    [snapshot.generatedAt],
  );

  const occupancy =
    snapshot.totals.patients > 0
      ? (snapshot.totals.hospitalized / snapshot.totals.patients) * 100
      : 0;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Panel del estudio</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Bienvenido de nuevo, {firstName}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Resumen epidemiológico de la cohorte VMI: demografía, grupos
            diagnósticos, motivos de egreso y curvas promedio de gases e índices.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm text-muted-foreground shadow-[0_8px_24px_-16px_rgba(21,32,58,0.35)]">
            <CalendarDays className="size-4" />
            <span className="capitalize">{today}</span>
          </div>
          <Button
            type="button"
            className="rounded-full"
            onClick={() => exportSnapshot(snapshot)}
          >
            <Download className="size-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pacientes"
          value={formatMetric(snapshot.totals.patients, 0)}
          hint={`${snapshot.totals.hospitalized} hospitalizados`}
          delta={{
            text: `${formatPct(occupancy, 0)} en cama`,
            tone: "neutral",
          }}
          icon={<Users className="size-5" />}
        />
        <KpiCard
          label="Edad promedio"
          value={
            snapshot.totals.avgAge == null
              ? "—"
              : `${formatMetric(snapshot.totals.avgAge, 0)} años`
          }
          hint={
            snapshot.totals.avgStayDays == null
              ? "Sin estadía calculable"
              : `${formatMetric(snapshot.totals.avgStayDays, 0)} días de estadía`
          }
          icon={<Timer className="size-5" />}
        />
        <KpiCard
          label="Mortalidad"
          value={formatPct(snapshot.totals.observedMortality, 1)}
          hint={`${snapshot.totals.deceased} fallecidos · ${snapshot.totals.discharged} egresos vivos`}
          delta={mortalityDelta(snapshot)}
          icon={<HeartPulse className="size-5" />}
        />
        <KpiCard
          label="APACHE II"
          value={formatMetric(snapshot.totals.avgApache, 1)}
          hint={
            snapshot.totals.predictedMortality == null
              ? `${snapshot.totals.apacheCount} puntajes`
              : `${formatPct(snapshot.totals.predictedMortality)} mortalidad predicha`
          }
          icon={<Activity className="size-5" />}
        />
      </div>

      <DashboardVisuals snapshot={snapshot} />
    </div>
  );
}
