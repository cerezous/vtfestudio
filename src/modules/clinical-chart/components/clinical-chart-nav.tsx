"use client";

import { useState } from "react";
import Link from "next/link";
import type { ComponentType, MouseEvent } from "react";
import {
  Activity,
  ClipboardList,
  FileText,
  Flag,
  HeartPulse,
  NotebookPen,
  UserRound,
  Wind,
} from "lucide-react";

import { clinicalChartHref } from "@/modules/clinical-chart/href";
import { visibleChartGroups } from "@/modules/clinical-chart/sections";
import { cn } from "@/shared/lib/utils";

const SECTION_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "datos-personales": UserRound,
  "datos-hospitalizacion": ClipboardList,
  "apache-ii": Activity,
  "datos-vmi": Wind,
  registros: HeartPulse,
  hitos: Flag,
  epicrisis: NotebookPen,
};

function isModifiedClick(event: MouseEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function SectionLink({
  patientId,
  sectionId,
  label,
  active,
  minimized,
  onNavigate,
}: {
  patientId: string;
  sectionId: string;
  label: string;
  active: boolean;
  minimized: boolean;
  onNavigate: (sectionId: string) => void;
}) {
  const Icon = SECTION_ICONS[sectionId] ?? FileText;

  return (
    <Link
      href={clinicalChartHref(patientId, sectionId)}
      prefetch
      scroll={false}
      title={minimized ? label : undefined}
      aria-label={label}
      onClick={(event) => {
        if (isModifiedClick(event)) {
          return;
        }

        event.preventDefault();
        onNavigate(sectionId);
      }}
      className={cn(
        "flex items-center rounded-xl text-sm font-medium transition-colors",
        minimized ? "size-10 justify-center" : "gap-2 px-2.5 py-2",
        active
          ? "bg-white text-primary shadow-sm"
          : "text-white/80 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate transition-opacity duration-150",
          minimized ? "sr-only" : "opacity-100",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function ClinicalChartNav({
  patientId,
  sectionId,
  onNavigate,
}: {
  patientId: string;
  sectionId: string;
  onNavigate: (sectionId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function collapse() {
    setExpanded(false);
  }

  return (
    <>
      <nav className="-mx-4 bg-primary px-2 py-2 text-white md:-mx-6 lg:hidden">
        <div className="flex items-center justify-end gap-1 overflow-x-auto">
          {visibleChartGroups().flatMap((group) =>
            group.items.map((item) => (
              <SectionLink
                key={item.id}
                patientId={patientId}
                sectionId={item.id}
                label={item.label}
                active={item.id === sectionId}
                minimized
                onNavigate={onNavigate}
              />
            )),
          )}
        </div>
      </nav>

      <nav
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={collapse}
        onFocusCapture={() => setExpanded(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            collapse();
          }
        }}
        className={cn(
          "fixed right-0 top-20 bottom-4 z-30 hidden flex-col overflow-hidden rounded-l-[1.6rem] bg-primary p-2 text-white shadow-lg lg:flex",
          "transition-[width] duration-200 ease-out",
          expanded ? "w-60" : "w-16",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden transition-[gap] duration-200",
            expanded ? "gap-3" : "gap-1",
          )}
        >
          {visibleChartGroups().map((group) => (
            <div key={group.id}>
              <p
                className={cn(
                  "overflow-hidden text-[11px] font-medium uppercase tracking-wider text-white/60 transition-[max-height,opacity,padding] duration-150",
                  expanded
                    ? "max-h-8 px-2.5 pb-2 opacity-100"
                    : "max-h-0 px-0 pb-0 opacity-0",
                )}
              >
                {group.label}
              </p>
              <div className={cn("space-y-1", !expanded && "flex flex-col items-center")}>
                {group.items.map((item) => (
                  <SectionLink
                    key={item.id}
                    patientId={patientId}
                    sectionId={item.id}
                    label={item.label}
                    active={item.id === sectionId}
                    minimized={!expanded}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
