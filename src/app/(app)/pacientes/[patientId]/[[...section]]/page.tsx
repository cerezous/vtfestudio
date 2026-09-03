import { redirect } from "next/navigation";

import { clinicalChartHref } from "@/modules/clinical-chart/href";
import {
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

  if (!isKnownChartSection(sectionId)) {
    redirect(clinicalChartHref(patientId, DEFAULT_CHART_SECTION));
  }

  return null;
}
