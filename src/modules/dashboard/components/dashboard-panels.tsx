import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  delta,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  delta?: { text: string; tone: "up" | "down" | "neutral" };
  icon: ReactNode;
}) {
  const DeltaIcon =
    delta?.tone === "up"
      ? ArrowUpRight
      : delta?.tone === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <article className="dash-surface rounded-[1.75rem] p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="grid size-10 place-items-center rounded-2xl bg-[#eef3ff] text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold",
              delta.tone === "up" && "bg-rose-50 text-rose-700",
              delta.tone === "down" && "bg-emerald-50 text-emerald-700",
              delta.tone === "neutral" && "bg-muted text-muted-foreground",
            )}
          >
            <DeltaIcon className="size-3.5" />
            {delta.text}
          </span>
        ) : null}
        <span className="text-muted-foreground">{hint}</span>
      </div>
    </article>
  );
}
