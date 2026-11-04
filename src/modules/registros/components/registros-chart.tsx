"use client";

import { useId, useMemo, useState, type Key } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { asNumber, formatRecordNumber } from "@/modules/registros/model";
import { cn } from "@/shared/lib/utils";
import type { ClinicalRecord } from "@/shared/types/database";

const SERIES = [
  { id: "pafi", label: "PaFi", color: "#c8f542", unit: "", darkText: true },
  { id: "vt_ml_kg_pi", label: "ml/kg/PI", color: "#38bdf8", unit: "", darkText: false },
  { id: "pao2", label: "PaO₂", color: "#5b8cff", unit: "mmHg", darkText: false },
  { id: "paco2", label: "PaCO₂", color: "#c4b5fd", unit: "mmHg", darkText: false },
  { id: "fio2", label: "FiO₂", color: "#fb923c", unit: "%", darkText: false },
  { id: "pcr", label: "PCR", color: "#f87171", unit: "mg/L", darkText: false },
  { id: "lactato", label: "Ác. láctico", color: "#fbbf24", unit: "mg/dL", darkText: false },
  { id: "procalcitonina", label: "PCT", color: "#f472b6", unit: "ng/mL", darkText: false },
] as const;

type SeriesId = (typeof SERIES)[number]["id"];
type Serie = (typeof SERIES)[number];

function formatAxisDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTooltipDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ChartTooltip({
  active,
  payload,
  label,
  serie,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string | null }>;
  label?: string;
  serie: Serie;
}) {
  if (!active || !payload?.length || payload[0]?.value == null) {
    return null;
  }

  const value = Number(payload[0].value);
  if (!Number.isFinite(value)) {
    return null;
  }

  return (
    <div className="min-w-40 rounded-2xl border border-black/8 bg-white px-3.5 py-2.5 shadow-[0_12px_40px_rgba(15,18,28,0.12)]">
      <p className="text-[11px] text-muted-foreground">
        {label ? formatTooltipDate(label) : ""}
      </p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {serie.label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
        {formatRecordNumber(value)}
        {serie.unit ? (
          <span className="ml-1 text-xs font-medium text-muted-foreground">
            {serie.unit}
          </span>
        ) : null}
      </p>
    </div>
  );
}

function GlowDot({
  cx,
  cy,
  color,
}: {
  cx?: number;
  cy?: number;
  color: string;
}) {
  if (cx == null || cy == null) {
    return <g />;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.22} />
      <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.35} />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="#ffffff"
        strokeWidth={2}
      />
    </g>
  );
}

export function RegistrosChart({ records }: { records: ClinicalRecord[] }) {
  const gradientId = useId().replace(/:/g, "");
  const [activeId, setActiveId] = useState<SeriesId>("pafi");
  const serie = SERIES.find((item) => item.id === activeId) ?? SERIES[0];

  const data = useMemo(() => {
    return records.map((record) => {
      const point: Record<string, string | number | null> = {
        recorded_at: record.recorded_at,
      };
      for (const item of SERIES) {
        point[item.id] = asNumber(record[item.id]);
      }
      return point;
    });
  }, [records]);

  const stats = useMemo(() => {
    const points = data
      .map((point) => ({
        recorded_at: String(point.recorded_at),
        value: asNumber(point[serie.id]),
      }))
      .filter(
        (point): point is { recorded_at: string; value: number } =>
          point.value != null,
      );
    const latest = points.at(-1) ?? null;
    const previous = points.at(-2) ?? null;
    const delta =
      latest && previous ? latest.value - previous.value : null;
    const deltaPct =
      delta != null && previous && previous.value !== 0
        ? (delta / Math.abs(previous.value)) * 100
        : null;

    return { points, latest, previous, delta, deltaPct };
  }, [data, serie.id]);

  if (records.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center rounded-[1.6rem] bg-[rgb(120_120_128/0.08)] px-6 text-center text-sm text-muted-foreground">
        Sin registros para el gráfico.
      </div>
    );
  }

  const fillId = `registros-fill-${gradientId}`;

  return (
    <div className="relative overflow-hidden rounded-[1.7rem] border bg-white p-5 text-foreground shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full opacity-20 blur-3xl"
        style={{ background: serie.color }}
      />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Evolución
            </p>
            <div className="mt-1 flex flex-wrap items-end gap-3">
              <p className="text-4xl font-semibold tracking-tight tabular-nums">
                {stats.latest ? formatRecordNumber(stats.latest.value) : "—"}
              </p>
              {stats.delta != null ? (
                <span
                  className={cn(
                    "mb-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                    stats.delta > 0
                      ? "bg-[#c8f542] text-[#15203a]"
                      : stats.delta < 0
                        ? "bg-[#fb7185]/20 text-[#fb7185]"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {stats.delta > 0 ? "+" : ""}
                  {stats.deltaPct != null
                    ? `${stats.deltaPct.toFixed(1)}%`
                    : formatRecordNumber(stats.delta)}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {serie.label}
              {serie.unit ? ` · ${serie.unit}` : ""}
              {stats.latest
                ? ` · ${formatAxisDate(stats.latest.recorded_at)}`
                : " · sin valores en esta serie"}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SERIES.map((item) => {
              const on = item.id === serie.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition",
                    on
                      ? "shadow-[0_0_18px_rgba(200,245,66,0.18)]"
                      : "bg-black/5 text-foreground/70 hover:bg-black/8 hover:text-foreground",
                  )}
                  style={
                    on
                      ? {
                          backgroundColor: item.color,
                          color: item.darkText ? "#15203a" : "#0b0d12",
                        }
                      : undefined
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-[26rem] w-full">
          {stats.points.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Esta serie no tiene valores en los registros actuales.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 18, right: 12, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={serie.color} stopOpacity={0.42} />
                    <stop offset="55%" stopColor={serie.color} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={serie.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(15,18,28,0.08)"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="recorded_at"
                  tickFormatter={formatAxisDate}
                  tick={{ fill: "rgba(32,36,48,0.55)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "rgba(32,36,48,0.55)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(value: number) => formatRecordNumber(value)}
                />
                <Tooltip
                  cursor={{
                    stroke: "rgba(15,18,28,0.22)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={<ChartTooltip serie={serie} />}
                />
                <Area
                  type="monotone"
                  dataKey={serie.id}
                  name={serie.label}
                  stroke={serie.color}
                  strokeWidth={3.2}
                  fill={`url(#${fillId})`}
                  fillOpacity={1}
                  connectNulls
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                  dot={(props) => {
                    const { key, cx, cy, index, payload } = props as typeof props & {
                      key?: Key;
                      payload?: Record<string, string | number | null>;
                    };
                    const recordedAt = String(payload?.recorded_at ?? "");
                    const dotKey = key ?? `dot-${serie.id}-${index}-${recordedAt}`;
                    if (
                      stats.latest == null ||
                      recordedAt !== stats.latest.recorded_at ||
                      asNumber(payload?.[serie.id]) == null
                    ) {
                      return <g key={dotKey} />;
                    }
                    return (
                      <GlowDot
                        key={dotKey}
                        cx={cx}
                        cy={cy}
                        color={serie.color}
                      />
                    );
                  }}
                  activeDot={(props) => {
                    const { key, cx, cy, index } = props as typeof props & {
                      key?: Key;
                    };
                    return (
                      <GlowDot
                        key={key ?? `active-dot-${serie.id}-${index}`}
                        cx={cx}
                        cy={cy}
                        color={serie.color}
                      />
                    );
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
