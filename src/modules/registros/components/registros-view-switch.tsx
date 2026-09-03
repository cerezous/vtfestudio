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
  return (
    <div className="inline-flex rounded-xl border bg-background p-0.5">
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
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-[0.7rem] px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
