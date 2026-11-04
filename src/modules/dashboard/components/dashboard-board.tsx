"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, HeartPulse, Timer, Users, type LucideIcon } from "lucide-react";

import { DashboardToolbar } from "@/modules/dashboard/components/dashboard-toolbar";
import { GaussianBell } from "@/modules/dashboard/components/gaussian-bell";
import { hitoKindColor } from "@/modules/hitos/constants";
import {
  ageRows,
  describeDistribution,
  factsInRange,
  filterFacts,
  formatMetric,
  formatPct,
  outcomeRows,
  procedureRows,
  sexRows,
  summarizeCohort,
  vmiDayValues,
  type CohortSummary,
  type DashboardBar,
  type DashboardDateRange,
  type DashboardFilter,
  type DashboardFilterDimension,
  type DashboardSnapshot,
} from "@/modules/dashboard/stats";
import { cn } from "@/shared/lib/utils";

const PROCEDURES = [
  { id: "iot", label: "Intubación" },
  { id: "extubacion", label: "Extubación" },
  { id: "pronacion", label: "Pronación" },
  { id: "supinacion", label: "Supinación" },
  { id: "ecmo", label: "ECMO" },
  { id: "tqt", label: "TQT" },
  { id: "weaning", label: "Weaning" },
] as const;

const SEX_COLORS: Record<string, string> = {
  H: "#2F6BFF",
  M: "#B33A46",
  I: "#7A5AF8",
  unknown: "#A1A1AA",
};

const OUTCOME_COLORS: Record<string, string> = {
  exito: "#10b981",
  fracaso: "#dc2626",
  tqt: "#f97316",
};

const AGE_COLOR = "#B33A46";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function Panel({
  title,
  hint,
  action,
  children,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "@container dash-surface flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[1.6rem] px-[clamp(0.7rem,2.2cqw,1rem)] py-[clamp(0.55rem,1.6cqw,0.85rem)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 @max-[18rem]:flex-col">
        <div className="min-w-0">
          <h2 className="dash-title">{title}</h2>
          {hint ? (
            <p className="dash-hint text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="dash-body grid h-full min-h-28 place-items-center px-3 text-center text-muted-foreground">
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  capsule,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  capsule?: { text: string; tone: "good" | "neutral"; title?: string };
  icon: LucideIcon;
}) {
  return (
    <article className="@container dash-surface flex h-full min-h-16 min-w-0 flex-col justify-center overflow-hidden rounded-[1.6rem] px-[clamp(0.65rem,6cqw,1rem)] py-[clamp(0.4rem,4cqw,0.75rem)]">
      <p className="dash-metric-label flex min-w-0 items-center gap-[0.4em] text-foreground uppercase">
        <Icon className="size-[1.05em] shrink-0 text-primary" />
        <span className="truncate">{label}</span>
      </p>
      <div className="mt-[0.35em] flex min-w-0 flex-wrap items-baseline gap-x-[0.45em] gap-y-0.5">
        <p className="dash-metric-value min-w-0">{value}</p>
        {capsule ? (
          <span
            title={capsule.title}
            className={cn(
              "dash-metric-meta shrink-0 rounded-full px-[0.55em] py-[0.12em] font-medium",
              capsule.tone === "good" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
              capsule.tone === "neutral" && "bg-primary/10 text-primary",
            )}
          >
            {capsule.text}
          </span>
        ) : null}
        {hint ? (
          <p className="dash-metric-meta line-clamp-2 min-w-[45%] flex-1 text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ChartTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string;
    value?: number;
    payload?: { label?: string };
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0];
  return (
    <div className="rounded-2xl bg-background/95 px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <p className="dash-hint text-muted-foreground">
        {row?.payload?.label ?? row?.name}
      </p>
      <p className="dash-body mt-0.5 font-semibold tabular-nums">{row?.value ?? 0}</p>
    </div>
  );
}

function SexChart({
  rows,
  selectedKey,
  onSelect,
}: {
  rows: DashboardBar[];
  selectedKey: string | null;
  onSelect: (row: DashboardBar) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const data = rows
    .filter((row) => row.count > 0)
    .map((row) => ({ ...row, name: row.label }));
  const total = data.reduce((sum, row) => sum + row.count, 0);

  if (total === 0) {
    return <EmptyState>Sin dato de sexo.</EmptyState>;
  }

  return (
    <div className="flex h-full min-h-44 min-w-0 flex-1 flex-col gap-3 @min-[26rem]:flex-row @min-[26rem]:items-center">
      <div className="relative mx-auto h-44 w-full max-w-56 min-w-0 flex-1 @min-[26rem]:mx-0 @min-[26rem]:h-52 @min-[26rem]:max-w-[58%] xl:h-auto xl:max-w-none xl:min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius="62%"
              outerRadius="86%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={!reduced}
              animationDuration={500}
            >
              {data.map((row) => (
                <Cell
                  key={row.key}
                  fill={SEX_COLORS[row.key] ?? "#94a3b8"}
                  opacity={!selectedKey || selectedKey === row.key ? 1 : 0.18}
                  className="cursor-pointer outline-none"
                  onClick={() => onSelect(row)}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="dash-figure">{total}</p>
            <p className="dash-hint text-muted-foreground">Pacientes</p>
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 shrink-0 space-y-1 @min-[26rem]:max-w-[42%]">
        {rows.map((row) => (
          <li key={row.key}>
            <button
              type="button"
              className="dash-body flex w-full items-center justify-between gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
              style={{ opacity: selectedKey && selectedKey !== row.key ? 0.32 : 1 }}
              aria-pressed={selectedKey === row.key}
              disabled={row.count === 0}
              onClick={() => onSelect(row)}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: SEX_COLORS[row.key] ?? "#94a3b8" }}
                />
                <span className="truncate">{row.label}</span>
              </span>
              <span className="tabular-nums">{row.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AgeChart({
  rows,
  selectedKey,
  onSelect,
}: {
  rows: DashboardBar[];
  selectedKey: string | null;
  onSelect: (row: DashboardBar) => void;
}) {
  const max = Math.max(...rows.map((row) => row.count), 0);
  if (max === 0) {
    return <EmptyState>Sin fechas de nacimiento.</EmptyState>;
  }

  return (
    <div className="flex h-full min-h-44 flex-1 items-end gap-0.5 sm:gap-1">
      {rows.map((row) => {
        const height = row.count === 0 ? 0 : Math.max(8, (row.count / max) * 100);
        const muted = Boolean(selectedKey && selectedKey !== row.key);
        return (
          <button
            key={row.key}
            type="button"
            className="group flex h-full min-w-0 flex-1 flex-col items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
            aria-label={`${row.label}: ${row.count}`}
            aria-pressed={selectedKey === row.key}
            disabled={row.count === 0}
            onClick={() => onSelect(row)}
          >
            <span
              className="dash-body font-medium tabular-nums"
              style={{ opacity: muted ? 0.32 : 1 }}
            >
              {row.count}
            </span>
            <span className="relative w-full flex-1">
              <span className="absolute bottom-0 left-1/2 h-full w-[58%] max-w-10 -translate-x-1/2">
                <span
                  className="absolute inset-x-0 bottom-0 origin-bottom rounded-full transition-[height,transform,opacity] duration-500 ease-out group-hover:scale-x-110 motion-reduce:transition-none"
                  style={{
                    height: `${height}%`,
                    background: AGE_COLOR,
                    opacity: muted ? 0.18 : 1,
                    transform: selectedKey === row.key ? "scaleX(1.12)" : undefined,
                  }}
                />
              </span>
            </span>
            <span className="dash-hint w-full truncate text-center text-muted-foreground">
              {row.label.replace(" años", "")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ProcedureChart({
  rows,
  selectedKey,
  onSelect,
}: {
  rows: DashboardBar[];
  selectedKey: string | null;
  onSelect: (row: DashboardBar) => void;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) {
    return <EmptyState>Sin procedimientos registrados.</EmptyState>;
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col justify-between gap-1 overflow-y-auto">
      {rows.map((row) => {
        const muted = Boolean(selectedKey && selectedKey !== row.key);
        return (
          <button
            key={row.key}
            type="button"
            className="group block w-full rounded-lg px-1 py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] disabled:cursor-default motion-reduce:transition-none"
            aria-label={`${row.label}: ${row.count}`}
            aria-pressed={selectedKey === row.key}
            disabled={row.count === 0}
            onClick={() => onSelect(row)}
          >
            <span className="dash-body flex items-baseline justify-between gap-2">
              <span className="truncate" style={{ opacity: muted ? 0.4 : 1 }}>
                {row.label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{row.count}</span>
            </span>
            <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full origin-left rounded-full transition-[width,opacity,transform] duration-500 ease-out group-hover:scale-y-125 motion-reduce:transition-none"
                style={{
                  width: row.count === 0 ? "0%" : `${Math.max(6, (row.count / max) * 100)}%`,
                  background: hitoKindColor(row.key),
                  opacity: muted ? 0.18 : 1,
                }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function OutcomeChart({
  rows,
  selectedKey,
  onSelect,
}: {
  rows: DashboardBar[];
  selectedKey: string | null;
  onSelect: (row: DashboardBar) => void;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) {
    return <EmptyState>Sin weaning ni traqueostomías.</EmptyState>;
  }

  return (
    <div className="grid h-full min-h-28 flex-1 grid-cols-3 gap-2 @max-[18rem]:grid-cols-1">
      {rows.map((row) => {
        const muted = Boolean(selectedKey && selectedKey !== row.key);
        return (
          <button
            key={row.key}
            type="button"
            className="flex h-full min-w-0 flex-col rounded-2xl px-2 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-default motion-reduce:transition-none"
            aria-pressed={selectedKey === row.key}
            disabled={row.count === 0}
            onClick={() => onSelect(row)}
          >
            <span className="dash-body flex min-w-0 items-center gap-[0.4em] text-muted-foreground">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: OUTCOME_COLORS[row.key] ?? "#94a3b8" }}
              />
              <span className="truncate">{row.label}</span>
            </span>
            <span
              className="dash-figure mt-[0.35em]"
              style={{ opacity: muted ? 0.32 : 1 }}
            >
              {row.count}
            </span>
            <span className="mt-auto block h-2 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full transition-[width,opacity] duration-500 ease-out"
                style={{
                  width: row.count === 0 ? "0%" : `${Math.max(8, (row.count / max) * 100)}%`,
                  background: OUTCOME_COLORS[row.key] ?? "#94a3b8",
                  opacity: muted ? 0.18 : 1,
                }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function years(value: number | null) {
  return value == null ? "—" : `${formatMetric(value, 1)} años`;
}

function AgeSummary({ summary }: { summary: CohortSummary }) {
  return (
    <div className="dash-hint shrink-0 text-right leading-tight @max-[18rem]:text-left">
      <p>
        <span className="text-muted-foreground">Promedio </span>
        <span className="font-semibold tabular-nums">{years(summary.avgAge)}</span>
      </p>
      <p>
        <span className="text-muted-foreground">Mediana </span>
        <span className="font-semibold tabular-nums">{years(summary.medianAge)}</span>
      </p>
    </div>
  );
}

export function DashboardBoard({ snapshot }: { snapshot: DashboardSnapshot }) {
  const [filter, setFilter] = useState<DashboardFilter | null>(null);
  const [dateRange, setDateRange] = useState<DashboardDateRange | null>(null);
  const datedFacts = useMemo(
    () => factsInRange(snapshot.facts, dateRange),
    [snapshot.facts, dateRange],
  );
  const visibleFacts = useMemo(
    () => filterFacts(datedFacts, filter),
    [datedFacts, filter],
  );

  function toggle(next: DashboardFilter) {
    setFilter((current) =>
      current?.dimension === next.dimension && current.key === next.key ? null : next,
    );
  }

  const summary = useMemo(
    () => summarizeCohort(filterFacts(datedFacts, filter)),
    [datedFacts, filter],
  );
  const sexes = useMemo(
    () => sexRows(filterFacts(datedFacts, filter, "sex")),
    [datedFacts, filter],
  );
  const ageFacts = useMemo(
    () => filterFacts(datedFacts, filter, "age"),
    [datedFacts, filter],
  );
  const ages = useMemo(() => ageRows(ageFacts), [ageFacts]);
  const ageSummary = useMemo(() => summarizeCohort(ageFacts), [ageFacts]);
  const procedures = useMemo(
    () => procedureRows(filterFacts(datedFacts, filter, "procedure"), PROCEDURES),
    [datedFacts, filter],
  );
  const outcomes = useMemo(
    () => outcomeRows(filterFacts(datedFacts, filter, "outcome")),
    [datedFacts, filter],
  );
  const vmiValues = useMemo(
    () => vmiDayValues(filterFacts(datedFacts, filter)),
    [datedFacts, filter],
  );
  const distribution = useMemo(() => describeDistribution(vmiValues), [vmiValues]);
  const weaningAttempts =
    (outcomes.find((row) => row.key === "exito")?.count ?? 0) +
    (outcomes.find((row) => row.key === "fracaso")?.count ?? 0);
  const weaningSuccess =
    weaningAttempts === 0
      ? null
      : ((outcomes.find((row) => row.key === "exito")?.count ?? 0) / weaningAttempts) *
        100;

  const mortalityIsPredicted = summary.predictedMortality != null;
  const selected = (dimension: DashboardFilterDimension) =>
    filter?.dimension === dimension ? filter.key : null;

  return (
    <div
      data-estadistica
      className="flex min-w-0 flex-col gap-2 xl:min-h-[40rem] xl:flex-1"
    >
      <DashboardToolbar
        range={dateRange}
        onRangeChange={setDateRange}
        facts={visibleFacts}
        records={snapshot.records}
        filter={filter}
        onClearFilter={filter ? () => setFilter(null) : undefined}
      />

      <div
        data-estadistica-board
        className="grid min-h-0 flex-1 grid-cols-1 gap-2 md:grid-cols-6 xl:grid-cols-12 xl:grid-rows-[auto_minmax(0,1.4fr)_minmax(0,1fr)]"
      >
        <div className="grid h-full min-h-0 grid-cols-2 gap-2 sm:grid-cols-4 md:col-span-6 xl:col-span-12">
          <Metric
            label="Pacientes"
            icon={Users}
            value={formatMetric(summary.patients, 0)}
            capsule={{
              text: `${formatMetric(summary.active, 0)} activos`,
              tone: "good",
              title: "Hospitalizados",
            }}
          />
          <Metric
            label="Días en VMI"
            icon={Timer}
            value={summary.avgVmiDays == null ? "—" : `${formatMetric(summary.avgVmiDays, 1)} d`}
            hint={
              summary.vmiCount === 0
                ? "Sin episodios"
                : `promedio · ${formatMetric(summary.vmiCount, 0)} pacientes`
            }
          />
          <Metric
            label="APACHE II"
            icon={Activity}
            value={formatMetric(summary.avgApache, 1)}
            hint={
              summary.apacheCount === 0
                ? "Sin puntajes"
                : `promedio · ${formatMetric(summary.apacheCount, 0)} puntajes`
            }
          />
          <Metric
            label="Mortalidad"
            icon={HeartPulse}
            value={formatPct(
              mortalityIsPredicted ? summary.predictedMortality : summary.observedMortality,
            )}
            hint={
              mortalityIsPredicted
                ? `predicha · obs. ${formatPct(summary.observedMortality)}`
                : `${formatMetric(summary.deceased, 0)} fallecidos`
            }
          />
        </div>

        <Panel
          title="Sexo"
          className="min-h-72 md:col-span-3 md:col-start-1 md:row-start-2 xl:col-span-3 xl:col-start-1 xl:row-start-2 xl:min-h-0"
        >
          <SexChart
            rows={sexes}
            selectedKey={selected("sex")}
            onSelect={(row) =>
              toggle({ dimension: "sex", key: row.key, label: row.label })
            }
          />
        </Panel>

        <Panel
          title="Días de VMI"
          hint={
            distribution
              ? `${formatMetric(distribution.n, 0)} pacientes · incluye VMI en curso`
              : "Incluye VMI en curso"
          }
          className="min-h-80 md:col-span-6 xl:col-span-6 xl:col-start-4 xl:row-start-2 xl:min-h-0"
        >
          <GaussianBell values={vmiValues} />
        </Panel>

        <Panel
          title="Rangos etarios"
          action={<AgeSummary summary={ageSummary} />}
          className="min-h-72 md:col-span-3 md:col-start-4 md:row-start-2 xl:col-span-3 xl:col-start-10 xl:row-start-2 xl:min-h-0"
        >
          <AgeChart
            rows={ages}
            selectedKey={selected("age")}
            onSelect={(row) =>
              toggle({ dimension: "age", key: row.key, label: row.label })
            }
          />
        </Panel>

        <Panel
          title="Procedimientos"
          hint="IOT, extubación y otros hitos"
          className="min-h-64 md:col-span-3 xl:col-span-6 xl:min-h-0"
        >
          <ProcedureChart
            rows={procedures}
            selectedKey={selected("procedure")}
            onSelect={(row) =>
              toggle({ dimension: "procedure", key: row.key, label: row.label })
            }
          />
        </Panel>

        <Panel
          title="Éxitos, fracasos y TQT"
          hint={
            weaningSuccess == null
              ? "Weaning y TQT"
              : `Éxito del weaning ${formatPct(weaningSuccess)}`
          }
          className="min-h-48 md:col-span-3 xl:col-span-6 xl:min-h-0"
        >
          <OutcomeChart
            rows={outcomes}
            selectedKey={selected("outcome")}
            onSelect={(row) =>
              toggle({ dimension: "outcome", key: row.key, label: row.label })
            }
          />
        </Panel>
      </div>
    </div>
  );
}
