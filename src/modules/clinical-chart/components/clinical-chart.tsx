"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ApachePanel } from "@/modules/apache/components/apache-panel";
import { ClinicalChartHeader } from "@/modules/clinical-chart/components/clinical-chart-header";
import { ClinicalChartNav } from "@/modules/clinical-chart/components/clinical-chart-nav";
import { VmiPanel } from "@/modules/vmi/components/vmi-panel";
import { ComingSoonPanel } from "@/modules/clinical-chart/components/panels/coming-soon-panel";
import { HospitalizationDataPanel } from "@/modules/clinical-chart/components/panels/hospitalization-data-panel";
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
import { HitosPanel } from "@/modules/hitos/components/hitos-panel";
import { RegistrosPanel } from "@/modules/registros/components/registros-panel";
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

  if (section.id === "datos-hospitalizacion") {
    return <HospitalizationDataPanel patient={patient} />;
  }

  if (section.id === "apache-ii") {
    return <ApachePanel patient={patient} />;
  }

  if (section.id === "datos-vmi") {
    return <VmiPanel patient={patient} />;
  }

  if (section.id === "registros") {
    return <RegistrosPanel patient={patient} />;
  }

  if (section.id === "hitos") {
    return <HitosPanel patient={patient} />;
  }

  return (
    <ComingSoonPanel
      title="Epicrisis"
      description="La epicrisis del episodio se redactará aquí."
    />
  );
}

export function ClinicalChart({ patient }: { patient: Patient }) {
  const pathname = usePathname();
  const router = useRouter();
  const pathSection = chartSectionFromPathname(pathname, patient.id);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const sectionId = pendingSection ?? pathSection;
  const section =
    findChartSection(sectionId) ?? findChartSection(DEFAULT_CHART_SECTION)!;

  useEffect(() => {
    if (pendingSection && pathSection === pendingSection) {
      setPendingSection(null);
    }
  }, [pathSection, pendingSection]);

  function goToSection(nextId: string) {
    if (nextId === sectionId) {
      return;
    }

    setPendingSection(nextId);
    startTransition(() => {
      router.replace(clinicalChartHref(patient.id, nextId), { scroll: false });
    });
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
      <section className="rounded-[1.6rem] border bg-muted/20 p-3 lg:p-4">
        {section.id === "apache-ii" ||
        section.id === "registros" ||
        section.id === "hitos" ||
        section.id === "datos-vmi" ? null : (
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            {section.label}
          </h2>
        )}
        <ChartCanvas patient={patient} section={section} />
      </section>
    </div>
  );
}
