"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { ApachePanel } from "@/modules/apache/components/apache-panel";
import { ClinicalChartHeader } from "@/modules/clinical-chart/components/clinical-chart-header";
import { ClinicalChartNav } from "@/modules/clinical-chart/components/clinical-chart-nav";
import { PersonalDataPanel } from "@/modules/clinical-chart/components/panels/personal-data-panel";
import {
  chartSectionFromPathname,
  clinicalChartHref,
} from "@/modules/clinical-chart/href";
import {
  DEFAULT_CHART_SECTION,
  findChartSection,
  type ChartSection,
} from "@/modules/clinical-chart/sections";
import { EpicrisisPanel } from "@/modules/epicrisis/components/epicrisis-panel";
import { RegistrosPanel } from "@/modules/registros/components/registros-panel";
import { cn } from "@/shared/lib/utils";
import type { Patient } from "@/shared/types/database";

function ChartCanvas({
  patient,
  section,
}: {
  patient: Patient;
  section: ChartSection;
}) {
  if (section.id === "datos-personales") {
    return <PersonalDataPanel patient={patient} />;
  }

  if (section.id === "apache-ii") {
    return <ApachePanel patient={patient} />;
  }

  if (section.id === "registros") {
    return <RegistrosPanel patient={patient} />;
  }

  if (section.id === "epicrisis") {
    return <EpicrisisPanel patient={patient} />;
  }

  return null;
}

export function ClinicalChart({ patient }: { patient: Patient }) {
  const pathname = usePathname();
  const pathSection = chartSectionFromPathname(pathname, patient.id);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const sectionId = pendingSection ?? pathSection;
  const section =
    findChartSection(sectionId) ?? findChartSection(DEFAULT_CHART_SECTION)!;

  function goToSection(nextId: string) {
    if (nextId === sectionId) {
      return;
    }

    setPendingSection(nextId);
    window.history.replaceState(
      window.history.state,
      "",
      clinicalChartHref(patient.id, nextId),
    );
  }

  return (
    <div className="space-y-5 lg:pr-20">
      <div className="shrink-0">
        <ClinicalChartHeader patient={patient} />
      </div>
      <ClinicalChartNav
        patientId={patient.id}
        sectionId={section.id}
        onNavigate={goToSection}
      />
      <section
        className={cn(
          section.id === "epicrisis" ||
          section.id === "datos-personales" ||
          section.id === "registros"
            ? "bg-transparent p-0"
            : "rounded-[1.6rem] border bg-muted/20 p-3 lg:p-4",
        )}
      >
        {section.id === "apache-ii" ||
        section.id === "registros" ||
        section.id === "epicrisis" ? null : (
          <h2 className="mb-4 text-xl font-semibold">
            {section.label}
          </h2>
        )}
        <ChartCanvas patient={patient} section={section} />
      </section>
    </div>
  );
}
