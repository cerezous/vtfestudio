"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CURVE_METRICS,
  formatMetric,
  type CurveMetricKey,
  type CurvePoint,
  type DashboardSnapshot,
} from "@/modules/dashboard/stats";
import { cn } from "@/shared/lib/utils";

type TooltipRow = {
  dataKey?: string | number;
  value?: unknown;
  payload?: CurvePoint;
  color?: string;
};

function CurveTooltip({
  label,
  payload,
}: {
  label?: string | number;
  payload?: ReadonlyArray<TooltipRow>;
}) {
  if (!payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  const seen = new Set<string>();
  const rows = payload.filter((item) => {
    const key = String(item.dataKey ?? "");
    if (typeof item.value !== "number" || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="min-w-44 rounded-[1.2rem] bg-white/95 px-3.5 py-3 shadow-[0_22px_50px_-20px_rgba(21,32,58,0.45)] backdrop-blur-md">
      <p className="text-xs font-semibold">{label}</p>
      <p className="mb-2.5 text-[11px] text-muted-foreground">
        Promedio de {point?.n ?? 0} {point?.n === 1 ? "paciente" : "pacientes"}
      </p>
      <div className="space-y-1.5">
        {rows.map((item) => {
          const metric = CURVE_METRICS.find((entry) => entry.key === item.dataKey);
          if (!metric) {
            return null;
          }

          return (
            <div
              key={metric.key}
              className="flex items-center justify-between gap-8 text-xs"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: metric.color }}
                />
                {metric.label}
              </span>
              <span className="tabular-nums font-semibold">
                {formatMetric(
                  typeof item.value === "number" ? item.value : null,
                )}
                {metric.unit ? (
                  <span className="ml-1 font-normal text-muted-foreground">
                    {metric.unit}
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CohortCurves({ snapshot }: { snapshot: DashboardSnapshot }) {
  const [hidden, setHidden] = useState<Set<CurveMetricKey>>(new Set());
  const [focus, setFocus] = useState<CurveMetricKey>("paco2");

  const visible = CURVE_METRICS.filter((metric) => !hidden.has(metric.key));
  const focused =
    visible.find((metric) => metric.key === focus) ?? visible[0] ?? CURVE_METRICS[0];
  const leftVisible = visible.some((metric) => metric.axis === "left");
  const rightVisible = visible.some((metric) => metric.axis === "right");

  const hasData = snapshot.curves.some((point) =>
    CURVE_METRICS.some((metric) => point[metric.key] != null),
  );

  const chartData = useMemo(
    () =>
      snapshot.curves.map((point) => ({
        ...point,
        ...Object.fromEntries(
          CURVE_METRICS.map((metric) => [
            metric.key,
            hidden.has(metric.key) ? null : point[metric.key],
          ]),
        ),
      })),
    [hidden, snapshot.curves],
  );

  function selectMetric(key: CurveMetricKey) {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
        setFocus(key);
        return next;
      }

      if (key === focus) {
        next.add(key);
        const remaining = CURVE_METRICS.find(
          (metric) => metric.key !== key && !next.has(metric.key),
        );
        if (remaining) {
          setFocus(remaining.key);
        }
      } else {
        setFocus(key);
      }

      return next;
    });
  }

  return (
    <section className="dash-surface flex h-full min-h-[30rem] flex-col rounded-[1.75rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Curvas de cohorte
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Evolución promedio alineada al ingreso UCI
          </p>
        </div>
        <p className="rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-muted-foreground">
          {snapshot.totals.records} registros
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {CURVE_METRICS.map((metric) => {
          const active = !hidden.has(metric.key);
          const isFocus = focused.key === metric.key && active;
          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => selectMetric(metric.key)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-all",
                !active && "bg-muted/70 text-muted-foreground",
                active && !isFocus && "bg-white text-foreground shadow-sm",
                isFocus && "text-white shadow-md",
              )}
              style={
                isFocus
                  ? { background: metric.color }
                  : undefined
              }
            >
              {metric.label}
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  isFocus ? "text-white/80" : "text-muted-foreground",
                )}
              >
                {formatMetric(snapshot.latestAverages[metric.key])}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 h-[24rem]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 10, left: 0, bottom: 4 }}
            >
              <defs>
                {CURVE_METRICS.map((metric) => (
                  <linearGradient
                    key={metric.key}
                    id={`cohort-fill-${metric.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={metric.color} stopOpacity={0.38} />
                    <stop offset="55%" stopColor={metric.color} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                ))}
                <filter
                  id="cohort-glow"
                  x="-40%"
                  y="-40%"
                  width="180%"
                  height="180%"
                >
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                stroke="rgba(100,116,139,0.12)"
                vertical={false}
                strokeDasharray="0"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              {leftVisible ? (
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
              ) : null}
              {rightVisible ? (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
              ) : null}
              <Tooltip
                cursor={{
                  stroke: focused.color,
                  strokeWidth: 1.5,
                  strokeDasharray: "4 6",
                }}
                content={({ label, payload }) => (
                  <CurveTooltip label={label} payload={payload} />
                )}
              />
              {visible.map((metric) =>
                metric.key === focused.key ? (
                  <Area
                    key={`area-${metric.key}`}
                    yAxisId={metric.axis}
                    type="natural"
                    dataKey={metric.key}
                    fill={`url(#cohort-fill-${metric.key})`}
                    stroke="none"
                    connectNulls
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                ) : null,
              )}
              {visible.map((metric) =>
                metric.key === focused.key ? (
                  <Line
                    key={`glow-${metric.key}`}
                    yAxisId={metric.axis}
                    type="natural"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={10}
                    strokeOpacity={0.18}
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    connectNulls
                    isAnimationActive={false}
                  />
                ) : null,
              )}
              {visible.map((metric) => {
                const isFocus = metric.key === focused.key;
                return (
                  <Line
                    key={metric.key}
                    yAxisId={metric.axis}
                    type="natural"
                    dataKey={metric.key}
                    name={metric.label}
                    stroke={metric.color}
                    strokeWidth={isFocus ? 3.2 : 1.8}
                    strokeOpacity={isFocus ? 1 : 0.45}
                    dot={false}
                    activeDot={{
                      r: isFocus ? 7 : 4,
                      stroke: "#fff",
                      strokeWidth: 3,
                      fill: metric.color,
                    }}
                    connectNulls
                    style={isFocus ? { filter: "url(#cohort-glow)" } : undefined}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full min-h-64 place-items-center rounded-[1.4rem] bg-muted/40 px-6 text-center text-sm text-muted-foreground">
            Aún no hay PaCO₂, DP, PCR, lactato, PaFi ni IOX para graficar.
            Se promedian por día de evolución cuando existan registros.
          </div>
        )}
      </div>
    </section>
  );
}
