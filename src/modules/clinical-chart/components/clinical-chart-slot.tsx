import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

const LAYOUT_CLASS = {
  stack: "grid gap-4",
  "grid-2": "grid gap-4 md:grid-cols-2",
  "grid-3": "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
} as const;

export function ClinicalChartGrid({
  layout,
  children,
}: {
  layout: keyof typeof LAYOUT_CLASS;
  children: ReactNode;
}) {
  return <div className={LAYOUT_CLASS[layout]}>{children}</div>;
}

export function ClinicalChartSlot({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "dash-surface flex min-h-44 flex-col rounded-[1.6rem] p-5",
        className,
      )}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 min-h-24 flex-1">{children}</div>
    </section>
  );
}

export function ChartFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-caption font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
