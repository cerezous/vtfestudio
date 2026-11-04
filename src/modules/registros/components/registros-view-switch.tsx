"use client";

import { cn } from "@/shared/lib/utils";

export type RegistrosView = "tabla" | "grafico";

export function RegistrosViewSwitch({
  value,
  onChange,
}: {
  value: RegistrosView;
  onChange: (next: RegistrosView) => void;
}) {
  const chartOn = value === "grafico";

  return (
    <div
      role="group"
      aria-label="Vista de registros"
      className="relative grid h-9 w-[11.5rem] grid-cols-2 items-center rounded-full bg-[#767680]/12 p-[3px] dark:bg-white/12"
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-[3px] w-[calc(50%-3px)] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.08)] transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-white/90",
          chartOn ? "left-1/2" : "left-[3px]",
        )}
      />
      {(
        [
          { id: "tabla", label: "Tabla" },
          { id: "grafico", label: "Gráfico" },
        ] as const
      ).map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative z-10 h-full rounded-full px-3 text-[13px] font-semibold tracking-tight transition-colors duration-200",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
