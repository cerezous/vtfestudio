"use client";

import type { ReactNode } from "react";
import { Printer } from "lucide-react";

import { epicrisisPrintHref } from "@/modules/epicrisis/href";
import type { EpicrisisDocumentModel } from "@/modules/epicrisis/model";
import { APP_NAME, APP_TAGLINE } from "@/shared/lib/constants";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

function FactGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-[15px] leading-snug text-foreground">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="break-inside-avoid">
      <h3 className="mb-3 border-b border-foreground/15 pb-1 text-[13px] font-semibold uppercase tracking-[0.16em] text-foreground">
        {number}. {title}
      </h3>
      {children}
    </section>
  );
}

export function EpicrisisDocument({
  model,
  patientId,
  variant,
}: {
  model: EpicrisisDocumentModel;
  patientId: string;
  variant: "chart" | "print";
}) {
  function handlePrint() {
    if (variant === "print") {
      window.print();
      return;
    }

    window.open(epicrisisPrintHref(patientId), "_blank", "noopener,noreferrer");
  }

  return (
    <article
      data-epicrisis-document
      className={cn(
        "relative mx-auto w-full max-w-[210mm] bg-white text-zinc-900",
        variant === "chart"
          ? "rounded-[1.4rem] border border-zinc-200 px-8 py-8 shadow-[0_18px_44px_-24px_rgb(21_32_58_/_0.28)] sm:px-12 sm:py-10"
          : "min-h-svh px-10 py-10 sm:px-16 sm:py-12",
      )}
    >
      <header className="relative mb-8 border-b-2 border-[#2F6BFF] pb-5">
        <div className="pr-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2F6BFF]">
            {APP_NAME}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {model.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
          <p className="mt-3 text-sm">
            <span className="font-medium">{model.patientName}</span>
            <span className="text-muted-foreground">
              {" "}
              · Emitido el {model.generatedLabel}
            </span>
          </p>
        </div>
        <div className="absolute right-0 top-0 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handlePrint}
          >
            <Printer className="size-3.5" />
            Imprimir
          </Button>
        </div>
      </header>

      <div className="space-y-8 text-[15px] leading-relaxed">
        <Section number="I" title="Datos del paciente">
          <FactGrid items={model.identity} />
        </Section>

        <Section number="II" title="Datos de hospitalización">
          <FactGrid items={model.hospitalization} />
        </Section>

        <Section number="III" title="Ventilación mecánica">
          <FactGrid items={model.vmiSummary} />

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Hitos del episodio
            </p>
            {model.milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin hitos de VMI.
              </p>
            ) : (
              <ol className="space-y-3">
                {model.milestones.map((milestone, index) => (
                  <li
                    key={milestone.id}
                    className="break-inside-avoid border-l-2 border-[#2F6BFF]/30 pl-3"
                  >
                    <p className="font-semibold tracking-tight">
                      {String(index + 1).padStart(2, "0")}. {milestone.title}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {milestone.when}
                      </span>
                    </p>
                    {milestone.lines.length > 0 ? (
                      <ul className="mt-1 space-y-0.5 text-sm text-zinc-700">
                        {milestone.lines.map((line, lineIndex) => (
                          <li key={`${milestone.id}-${lineIndex}`}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Section>

        <Section number="IV" title="Parámetros de seguimiento">
          <p className="mb-3 text-sm text-muted-foreground">
            Resumen de los {model.recordCount}{" "}
            {model.recordCount === 1 ? "registro" : "registros"} clínicos del
            episodio. Se informan mediana, desviación estándar y n; el
            paréntesis indica el rango mínimo–máximo.
          </p>
          <div className="space-y-3">
            {model.metrics.map((metric) => (
              <p key={metric.id} className="text-[15px] leading-relaxed">
                {metric.paragraph}
              </p>
            ))}
          </div>
        </Section>
      </div>

      <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-muted-foreground">
        Documento generado por {APP_NAME}. No reemplaza la epicrisis
        institucional; resume el episodio de ventilación mecánica del estudio.
      </footer>
    </article>
  );
}
