"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CohortCurves } from "@/modules/dashboard/components/cohort-curves";
import {
  formatMetric,
  formatPct,
  type CountShare,
  type DashboardSnapshot,
  type GoalRow,
  type MonthFlow,
} from "@/modules/dashboard/stats";

export const CHART_COLORS = [
  "#2f6bff",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#6366f1",
  "#0f766e",
];

const STATUS_COLORS: Record<string, string> = {
  hospitalized: "#2f6bff",
  not_hospitalized: "#059669",
  deceased: "#dc2626",
};

const SEX_COLORS: Record<string, string> = {
  H: "#2f6bff",
  M: "#7c3aed",
  I: "#64748b",
};

const GOAL_SHORT: Record<string, string> = {
  apache: "APACHE",
  records: "Registros",
  vmi: "VMI",
  occupancy: "En cama",
};

function colorFor(item: CountShare, index: number, colors?: Record<string, string>) {
  return colors?.[item.id] ?? CHART_COLORS[index % CHART_COLORS.length];
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="dash-surface flex h-full min-h-[22rem] flex-col rounded-[1.75rem] p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid h-full min-h-52 place-items-center rounded-[1.4rem] bg-muted/40 px-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartTip({
  label,
  payload,
}: {
  label?: string | number;
  payload?: ReadonlyArray<{
    name?: string | number;
    value?: unknown;
    color?: string;
  }>;
}) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[1.2rem] bg-white/95 px-3.5 py-2.5 text-xs shadow-[0_22px_50px_-20px_rgba(21,32,58,0.45)] backdrop-blur-md">
      {label != null && label !== "" ? (
        <p className="mb-1.5 font-semibold">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={String(item.name)} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2">
              <span
                className="size-1.5 rounded-full"
                style={{ background: item.color }}
              />
              {item.name}
            </span>
            <span className="tabular-nums font-medium">
              {typeof item.value === "number"
                ? Number.isInteger(item.value)
                  ? formatMetric(item.value, 0)
                  : formatMetric(item.value, 1)
                : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutCard({
  title,
  subtitle,
  items,
  empty,
  colors,
  centerHint = "casos",
}: {
  title: string;
  subtitle: string;
  items: CountShare[];
  empty: string;
  colors?: Record<string, string>;
  centerHint?: string;
}) {
  const data = items.filter((item) => item.count > 0);
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartCard title={title} subtitle={subtitle}>
      {total === 0 ? (
        <EmptyChart message={empty} />
      ) : (
        <div className="flex h-full min-h-52 flex-col">
          <div className="relative min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={data.length > 1 ? 3 : 0}
                  stroke="none"
                >
                  {data.map((item, index) => (
                    <Cell key={item.id} fill={colorFor(item, index, colors)} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => (
                    <ChartTip
                      payload={payload?.map((item) => ({
                        name: String(item.name ?? ""),
                        value: item.value,
                        color: item.color,
                      }))}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-2xl font-semibold tabular-nums">{total}</p>
                <p className="text-[11px] text-muted-foreground">{centerHint}</p>
              </div>
            </div>
          </div>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {data.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: colorFor(item, index, colors) }}
                />
                <span className="text-foreground">{item.label}</span>
                <span className="tabular-nums">{formatPct(item.share, 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}

function HorizontalBarCard({
  title,
  subtitle,
  items,
  empty,
}: {
  title: string;
  subtitle: string;
  items: CountShare[];
  empty: string;
}) {
  const data = items.filter((item) => item.count > 0).slice().reverse();

  return (
    <ChartCard title={title} subtitle={subtitle}>
      {data.length === 0 ? (
        <EmptyChart message={empty} />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
          >
            <CartesianGrid stroke="#eef1f6" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={118}
              tick={{ fill: "#334155", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(47,107,255,0.06)" }}
              content={({ payload, label }) => (
                <ChartTip label={label} payload={payload} />
              )}
            />
            <Bar dataKey="count" name="Pacientes" radius={[0, 8, 8, 0]} barSize={16}>
              {data.map((item, index) => (
                <Cell key={item.id} fill={colorFor(item, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function ColumnCard({
  title,
  subtitle,
  items,
  empty,
}: {
  title: string;
  subtitle: string;
  items: CountShare[];
  empty: string;
}) {
  const hasData = items.some((item) => item.count > 0);

  return (
    <ChartCard title={title} subtitle={subtitle}>
      {!hasData ? (
        <EmptyChart message={empty} />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#eef1f6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "rgba(47,107,255,0.06)" }}
              content={({ payload, label }) => (
                <ChartTip label={label} payload={payload} />
              )}
            />
            <Bar dataKey="count" name="Pacientes" radius={[8, 8, 0, 0]} barSize={28}>
              {items.map((item, index) => (
                <Cell key={item.id} fill={colorFor(item, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function FlowCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: MonthFlow[];
}) {
  const hasData = items.some(
    (item) => item.ingresos + item.egresos + item.fallecidos > 0,
  );

  return (
    <ChartCard title={title} subtitle={subtitle}>
      {!hasData ? (
        <EmptyChart message="Cuando haya ingresos y egresos, aquí verás el flujo mensual." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#eef1f6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "rgba(47,107,255,0.06)" }}
              content={({ payload, label }) => (
                <ChartTip label={label} payload={payload} />
              )}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Bar
              dataKey="ingresos"
              name="Ingresos"
              fill="#2f6bff"
              radius={[6, 6, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="egresos"
              name="Altas"
              fill="#059669"
              radius={[6, 6, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="fallecidos"
              name="Fallecidos"
              fill="#dc2626"
              radius={[6, 6, 0, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function CoverageCard({ items }: { items: GoalRow[] }) {
  const data = items.map((item) => ({
    name: GOAL_SHORT[item.id] ?? item.label,
    Completas: item.current,
    Cohorte: item.target,
  }));

  return (
    <ChartCard
      title="Cobertura del estudio"
      subtitle="Fichas completas frente al tamaño de la cohorte"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eef1f6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(47,107,255,0.06)" }}
            content={({ payload, label }) => (
              <ChartTip label={label} payload={payload} />
            )}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            dataKey="Completas"
            fill="#2f6bff"
            radius={[8, 8, 0, 0]}
            barSize={18}
          />
          <Bar
            dataKey="Cohorte"
            fill="#c5d4ff"
            radius={[8, 8, 0, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function MortalityCard({ snapshot }: { snapshot: DashboardSnapshot }) {
  const observed = snapshot.totals.observedMortality;
  const predicted = snapshot.totals.predictedMortality;
  const hasData = observed != null || predicted != null;

  return (
    <ChartCard
      title="Mortalidad"
      subtitle="Observada vs predicha por APACHE II"
    >
      {!hasData ? (
        <EmptyChart message="Falta APACHE o desenlace para comparar mortalidades." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              {
                name: "Mortalidad",
                Observada: observed ?? 0,
                Predicha: predicted ?? 0,
              },
            ]}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#eef1f6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={32}
              unit="%"
            />
            <Tooltip
              cursor={{ fill: "rgba(47,107,255,0.06)" }}
              content={({ payload, label }) => (
                <ChartTip label={label} payload={payload} />
              )}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Bar
              dataKey="Observada"
              fill="#dc2626"
              radius={[8, 8, 0, 0]}
              barSize={28}
            />
            <Bar
              dataKey="Predicha"
              fill="#2f6bff"
              radius={[8, 8, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function DashboardVisuals({ snapshot }: { snapshot: DashboardSnapshot }) {
  const vmiItems =
    snapshot.totals.vmiTotal > 0 ? snapshot.vmiMotivos : snapshot.support;
  const vmiTitle =
    snapshot.totals.vmiTotal > 0 ? "Motivo de VMI" : "Soporte actual";
  const vmiSubtitle =
    snapshot.totals.vmiTotal === 0
      ? "Último soporte registrado por paciente"
      : `${snapshot.totals.vmiActive} en curso · ${formatPct(snapshot.totals.reintubationRate)} reintubación`;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <DonutCard
          title="Grupos diagnósticos"
          subtitle="Composición de la cohorte"
          items={snapshot.diagnosticGroups}
          empty="Aún no hay grupos diagnósticos para graficar."
          centerHint="pacientes"
        />
        <CohortCurves snapshot={snapshot} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <DonutCard
          title="Estado actual"
          subtitle="Hospitalizados, altas y fallecidos"
          items={snapshot.statusMix}
          empty="Sin pacientes en el censo."
          colors={STATUS_COLORS}
          centerHint="fichas"
        />
        <DonutCard
          title="Motivos de egreso"
          subtitle="Desenlace al alta de UCI"
          items={snapshot.dischargeReasons}
          empty="Todavía no hay egresos cerrados."
          centerHint="egresos"
        />
        <FlowCard
          title="Flujo de la cohorte"
          subtitle="Ingresos, altas y fallecidos · últimos 6 meses"
          items={snapshot.monthlyFlow}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        <DonutCard
          title="Sexo"
          subtitle="Composición demográfica"
          items={snapshot.sex}
          empty="Sin dato de sexo."
          colors={SEX_COLORS}
          centerHint="pacientes"
        />
        <ColumnCard
          title="Edad"
          subtitle="Tramos de la cohorte"
          items={snapshot.ageBands}
          empty="Sin fechas de nacimiento."
        />
        <HorizontalBarCard
          title="Antecedentes"
          subtitle="Comorbilidades registradas"
          items={snapshot.comorbidities}
          empty="Sin antecedentes morbosos."
        />
        <HorizontalBarCard
          title={vmiTitle}
          subtitle={vmiSubtitle}
          items={vmiItems}
          empty="Cuando existan episodios VMI o soportes, aparecerán aquí."
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CoverageCard items={snapshot.goals} />
        <MortalityCard snapshot={snapshot} />
      </div>
    </div>
  );
}
