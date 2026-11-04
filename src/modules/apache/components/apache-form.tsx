"use client";

import { Button } from "@/shared/components/ui/button";
import {
  chipClass,
  choiceRowClass,
  fieldClass,
} from "@/shared/components/ui/controls";
import { cn } from "@/shared/lib/utils";
import {
  AGE_BANDS,
  APS_PARAMETERS,
  APS_POINT_HEADERS,
  CHRONIC_OPTIONS,
  GCS_VALUES,
  computeApache,
  gcsPoints,
  type AgeBandId,
  type ApacheFormState,
  type ChronicId,
} from "@/modules/apache/scoring";

function CheckCard({
  checked,
  label,
  hint,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint?: string;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(choiceRowClass(checked), "items-start")}
    >
      <input
        type="checkbox"
        className="mt-0.5"
        checked={checked}
        onChange={onChange}
      />
      <span>
        <span className="font-medium">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function ApacheForm({
  state,
  onChange,
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  state: ApacheFormState;
  onChange: (next: ApacheFormState) => void;
  pending: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const result = computeApache(state);

  function selectCell(paramId: string, cellId: string) {
    onChange({
      ...state,
      selections: { ...state.selections, [paramId]: cellId },
    });
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-[13px] font-medium tracking-[-0.006em] text-[rgb(60_60_67/0.62)] dark:text-white/60">
              Fecha del APACHE II *
            </p>
            <input
              type="datetime-local"
              className={fieldClass}
              value={state.scoredAt}
              onChange={(event) =>
                onChange({ ...state, scoredAt: event.target.value })
              }
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <CheckCard
            checked={state.fio2Ge50}
            label="FiO₂ ≥ 0.5"
            hint="FiO₂ ≥ 50 %: AaDO₂. Si no, PaO₂."
            onChange={() => onChange({ ...state, fio2Ge50: !state.fio2Ge50 })}
          />
          <CheckCard
            checked={state.ira}
            label="IRA / falla renal aguda"
            hint="Duplica el puntaje de creatinina."
            onChange={() => onChange({ ...state, ira: !state.ira })}
          />
        </div>

        <div className="overflow-x-auto rounded-[1.4rem] border bg-card shadow-sm">
          <table className="w-full min-w-[52rem] border-collapse text-center text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-left font-medium">
                  Parámetro APS
                </th>
                {APS_POINT_HEADERS.map((points, index) => (
                  <th
                    key={`${points}-${index}`}
                    className={cn(
                      "w-[4.6rem] px-1 py-2",
                      points === 0 && "bg-primary/10 text-primary",
                    )}
                  >
                    +{points}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {APS_PARAMETERS.map((param) => {
                const oxygenInactive =
                  (param.id === "aado2" && !state.fio2Ge50) ||
                  (param.id === "pao2" && state.fio2Ge50);
                const selectedId = state.selections[param.id];
                const selected = param.cells.find((item) => item?.id === selectedId);
                const shownPoints =
                  param.id === "creatinine" && state.ira && selected
                    ? selected.points * 2
                    : selected?.points;

                return (
                  <tr
                    key={param.id}
                    className={cn(
                      "border-b last:border-0",
                      oxygenInactive && "opacity-40",
                    )}
                  >
                    <th className="sticky left-0 z-10 bg-card px-3 py-1.5 text-left font-medium text-foreground">
                      <div>{param.label}</div>
                      {shownPoints != null ? (
                        <div className="text-[11px] font-normal text-primary">
                          {shownPoints} pts
                          {param.id === "creatinine" && state.ira
                            ? " · IRA ×2"
                            : ""}
                        </div>
                      ) : null}
                    </th>
                    {param.cells.map((cell, index) => {
                      if (!cell) {
                        return (
                          <td
                            key={`${param.id}-empty-${index}`}
                            className="px-1 py-1 text-muted-foreground/50"
                          >
                            —
                          </td>
                        );
                      }

                      const active = selectedId === cell.id;

                      return (
                        <td key={cell.id} className="px-1 py-1">
                          <button
                            type="button"
                            disabled={oxygenInactive}
                            onClick={() => selectCell(param.id, cell.id)}
                            className={cn(
                              "apple-chip h-11 w-full rounded-[10px] px-1 text-[11px] leading-tight font-medium tracking-[-0.006em] transition-[transform,background-color,color,box-shadow] duration-100 ease-out active:scale-[0.97] disabled:opacity-40",
                              active
                                ? "bg-primary font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28)]"
                                : "bg-[rgb(120_120_128/0.12)] text-foreground hover:bg-[rgb(120_120_128/0.18)]",
                            )}
                          >
                            {cell.label}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Glasgow · 15 − GCS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {GCS_VALUES.map((value) => {
              const active = state.gcs === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ ...state, gcs: value })}
                  className={cn(chipClass(active, true), "min-w-11")}
                >
                  {value}
                  <span
                    className={cn(
                      "mt-0.5 block text-[10px] font-normal",
                      active ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {15 - value} pts
                  </span>
                </button>
              );
            })}
          </div>
          {state.gcs != null ? (
            <p className="text-xs text-muted-foreground">
              15 − {state.gcs} = {gcsPoints(state.gcs)} puntos
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Edad
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {AGE_BANDS.map((band) => {
              const active = state.ageBand === band.id;
              return (
                <button
                  key={band.id}
                  type="button"
                  onClick={() =>
                    onChange({ ...state, ageBand: band.id as AgeBandId })
                  }
                  className={cn(chipClass(active, true), "w-full")}
                >
                  {band.label}
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px] font-normal",
                      active ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {band.points} pts
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Enfermedad crónica
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {CHRONIC_OPTIONS.map((option) => (
              <CheckCard
                key={option.id}
                checked={state.chronic === option.id}
                label={option.label}
                hint={`${option.points} puntos`}
                onChange={() =>
                  onChange({ ...state, chronic: option.id as ChronicId })
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending || !result.complete}>
            {submitLabel}
          </Button>
        </div>
    </form>
  );
}

function ScoreChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className={cn("min-w-0", accent && "text-primary")}>
      <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums leading-tight">{value}</p>
    </div>
  );
}

export function ApacheScoreSummary({ state }: { state: ApacheFormState }) {
  const result = computeApache(state);

  return (
    <aside className="shrink-0 rounded-xl border bg-muted/40 px-3 py-1.5">
      <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        Puntaje
      </p>
      <div className="flex items-end gap-3">
        <ScoreChip label="A" value={result.apsPoints} />
        <ScoreChip label="B" value={result.gcsPoints} />
        <ScoreChip label="C" value={result.agePoints} />
        <ScoreChip label="D" value={result.chronicPoints} />
        <div className="h-7 w-px bg-border" />
        <ScoreChip label="Total" value={result.score} accent />
        <ScoreChip
          label="Mort."
          value={`${result.mortalityPct.toFixed(1)}%`}
          accent
        />
      </div>
    </aside>
  );
}
