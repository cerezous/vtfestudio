import { redirect } from "next/navigation";

import { clinicalChartHref } from "@/modules/clinical-chart/href";
import {
  CHART_SECTION_ALIASES,
  DEFAULT_CHART_SECTION,
  chartSectionFromPath,
  isKnownChartSection,
} from "@/modules/clinical-chart/sections";

export default async function PatientChartPage({
  params,
}: {
  params: Promise<{ patientId: string; section?: string[] }>;
}) {
  const { patientId, section: sectionSegments } = await params;
  const sectionId = chartSectionFromPath(sectionSegments);
  const aliased = CHART_SECTION_ALIASES[sectionId];

  if (aliased) {
    redirect(clinicalChartHref(patientId, aliased));
  }

  if (!isKnownChartSection(sectionId)) {
    redirect(clinicalChartHref(patientId, DEFAULT_CHART_SECTION));
  }

  return null;
}
