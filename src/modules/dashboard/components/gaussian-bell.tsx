"use client";

import { useId, useState, type PointerEvent } from "react";

import {
  describeDistribution,
  formatMetric,
  type DistributionSummary,
} from "@/modules/dashboard/stats";
import { cn } from "@/shared/lib/utils";

const MARKERS = [
  { key: "p25", label: "P25", color: "#93c5fd" },
  { key: "p50", label: "P50", color: "#2f6bff" },
  { key: "p75", label: "P75", color: "#1e3a8a" },
  { key: "p90", label: "P90", color: "#7c3aed" },
] as const;

type MarkerKey = (typeof MARKERS)[number]["key"];

function normalPdf(value: number, mean: number, sd: number) {
  const z = (value - mean) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

function Stat({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="min-w-0 text-center" title={title}>
      <p className="dash-hint tracking-[0.04em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="dash-body mt-0.5 font-semibold tracking-[-0.02em] tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function GaussianBell({ values }: { values: number[] }) {
  const summary = describeDistribution(values);
  const sd = summary?.sd ?? null;
  const canDraw = summary != null && sd != null && sd >= 0.05;
  const [probe, setProbe] = useState<number | null>(null);
  const [focus, setFocus] = useState<MarkerKey | null>(null);
  const windowSpan =
    summary && sd != null ? Math.max((summary.p90 - summary.p25) * 0.18, sd * 0.35, 0.5) : 1;
  const nearby =
    probe == null
      ? 0
      : values.filter((value) => Math.abs(value - probe) <= windowSpan).length;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-3 gap-1">
        <Stat label="Promedio" value={summary ? formatMetric(summary.mean, 1) : "—"} />
        <Stat label="Mediana" value={summary ? formatMetric(summary.median, 1) : "—"} />
        <Stat
          label="DE"
          title="Desviación estándar"
          value={summary?.sd == null ? "—" : formatMetric(summary.sd, 1)}
        />
      </div>
      {canDraw && summary && sd != null ? (
        <BellCurve
          summary={summary}
          sd={sd}
          values={values}
          probe={probe}
          focus={focus}
          onProbe={setProbe}
        />
      ) : (
        <div className="dash-body grid min-h-0 flex-1 place-items-center px-3 text-center text-muted-foreground">
          {summary == null
            ? "Sin días de VMI."
            : "Hacen falta al menos dos duraciones."}
        </div>
      )}
      <p className="dash-hint mt-1 min-h-[1.3em] px-1 text-center text-balance text-muted-foreground">
        {probe == null
          ? "Recorre la curva para ver un día."
          : `${formatMetric(probe, 1)} días · ${nearby} ${nearby === 1 ? "paciente cerca" : "pacientes cerca"}`}
      </p>
      <ul className="mt-1 grid grid-cols-4 gap-1 @max-[22rem]:grid-cols-2">
        {MARKERS.map((marker) => {
          const active = focus === marker.key;
          return (
            <li key={marker.key} className="min-w-0">
              <button
                type="button"
                className={cn(
                  "w-full rounded-xl px-1 py-1 text-center transition-[transform,background] duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
                  active && "bg-primary/10",
                )}
                aria-pressed={active}
                onClick={() => {
                  const next = active ? null : marker.key;
                  setFocus(next);
                  setProbe(next ? summary?.[marker.key] ?? null : null);
                }}
                onPointerEnter={() => {
                  if (summary) {
                    setProbe(summary[marker.key]);
                  }
                }}
              >
                <span className="dash-hint flex items-center justify-center gap-1 text-muted-foreground">
                  <span
                    className="size-[0.45em] rounded-full"
                    style={{ background: marker.color }}
                  />
                  {marker.label}
                </span>
                <span className="dash-body font-semibold tabular-nums">
                  {summary ? formatMetric(summary[marker.key], 1) : "—"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BellCurve({
  summary,
  sd,
  values,
  probe,
  focus,
  onProbe,
}: {
  summary: DistributionSummary;
  sd: number;
  values: number[];
  probe: number | null;
  focus: MarkerKey | null;
  onProbe: (value: number | null) => void;
}) {
  const clipId = useId().replace(/:/g, "");
  const width = 320;
  const height = 168;
  const padX = 18;
  const padTop = 22;
  const padBottom = 16;
  const spread = sd * 3.2;
  const min = Math.max(0, Math.min(summary.p25, summary.mean - spread));
  let max = Math.max(summary.p90, summary.mean + spread);
  if (max - min < 1) {
    max = min + 1;
  }

  const peak = normalPdf(summary.mean, summary.mean, sd);
  const plotBottom = height - padBottom;

  function xOf(value: number) {
    return padX + ((value - min) / (max - min)) * (width - padX * 2);
  }

  function yOf(density: number) {
    const plotHeight = plotBottom - padTop;
    return padTop + plotHeight - (density / peak) * plotHeight;
  }

  function dayFromPointer(event: PointerEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) {
      return null;
    }
    const local = point.matrixTransform(matrix.inverse());
    const ratio = (local.x - padX) / (width - padX * 2);
    if (ratio < -0.02 || ratio > 1.02) {
      return null;
    }
    return Math.min(max, Math.max(min, min + ratio * (max - min)));
  }

  const steps = 80;
  const curve = Array.from({ length: steps + 1 }, (_, index) => {
    const value = min + ((max - min) * index) / steps;
    return { x: xOf(value), y: yOf(normalPdf(value, summary.mean, sd)) };
  });
  const line = curve
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L ${curve.at(-1)?.x ?? 0} ${plotBottom} L ${curve[0]?.x ?? 0} ${plotBottom} Z`;
  const markers = MARKERS.map((marker, index) => ({
    ...marker,
    value: summary[marker.key],
    x: xOf(summary[marker.key]),
    delay: 0.15 + index * 0.08,
  }));
  const focusX = focus ? xOf(summary[focus]) : null;
  const probeX = probe == null ? null : xOf(probe);
  const probeY = probe == null ? null : yOf(normalPdf(probe, summary.mean, sd));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-1 min-h-40 w-full flex-1 touch-none"
      role="img"
      aria-label={`Campana de días de VMI. Promedio ${formatMetric(summary.mean, 1)}, mediana ${formatMetric(summary.median, 1)}, desviación estándar ${formatMetric(sd, 1)}.`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onProbe(dayFromPointer(event));
      }}
      onPointerMove={(event) => {
        if (
          event.pointerType === "mouse" ||
          event.currentTarget.hasPointerCapture(event.pointerId)
        ) {
          onProbe(dayFromPointer(event));
        }
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          onProbe(focus ? summary[focus] : null);
        }
      }}
    >
      <clipPath id={clipId}>
        <rect
          x={padX}
          y={0}
          width={Math.max(0, (probeX ?? focusX ?? padX) - padX)}
          height={height}
        />
      </clipPath>
      <path d={area} fill="#2f6bff" className="dash-bell-area" />
      <path d={area} fill="#2f6bff" opacity={0.22} clipPath={`url(#${clipId})`} />
      <path
        d={line}
        pathLength={1}
        fill="none"
        stroke="#2f6bff"
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="dash-bell-line"
      />
      <line
        x1={padX}
        x2={width - padX}
        y1={plotBottom}
        y2={plotBottom}
        stroke="currentColor"
        opacity={0.15}
      />
      {values.map((value, index) => {
        const clamped = Math.min(max, Math.max(min, value));
        const near = probe != null && Math.abs(value - probe) <= Math.max((max - min) * 0.045, 0.4);
        return (
          <circle
            key={`${value}-${index}`}
            cx={xOf(clamped)}
            cy={plotBottom}
            r={near ? 4.2 : 2.3}
            fill="#2f6bff"
            opacity={probe == null || near ? 0.55 : 0.18}
          />
        );
      })}
      {markers.map((marker) => {
        const emphasized = focus === marker.key || (probe != null && Math.abs(probe - marker.value) < (max - min) * 0.03);
        return (
          <g key={marker.key} className="dash-bell-marker" style={{ animationDelay: `${marker.delay}s` }}>
            <line
              x1={marker.x}
              x2={marker.x}
              y1={yOf(normalPdf(marker.value, summary.mean, sd))}
              y2={plotBottom}
              stroke={marker.color}
              strokeWidth={emphasized ? 2.4 : 1.4}
              strokeDasharray="3 3"
              opacity={focus && focus !== marker.key ? 0.35 : 1}
            />
            <circle
              cx={marker.x}
              cy={yOf(normalPdf(marker.value, summary.mean, sd))}
              r={emphasized ? 5 : 3.2}
              fill={marker.color}
            />
          </g>
        );
      })}
      {probeX != null && probeY != null && probe != null ? (
        <g>
          <line
            x1={probeX}
            x2={probeX}
            y1={padTop}
            y2={plotBottom}
            stroke="#2f6bff"
            strokeOpacity={0.35}
          />
          <circle cx={probeX} cy={probeY} r={6.5} fill="#ffffff" stroke="#2f6bff" strokeWidth={2.2} />
          <text
            x={Math.min(width - padX, Math.max(padX, probeX))}
            y={12}
            textAnchor="middle"
            fill="currentColor"
            fontSize={11}
            fontWeight={600}
          >
            {formatMetric(probe, 1)} d
          </text>
        </g>
      ) : null}
    </svg>
  );
}
