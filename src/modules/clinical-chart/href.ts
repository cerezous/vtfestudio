import { DEFAULT_CHART_SECTION, CHART_SECTION_ALIASES } from "@/modules/clinical-chart/sections";
import { ROUTES } from "@/shared/lib/constants";

export function patientChartPath(patientId: string) {
  return `${ROUTES.patients}/${patientId}`;
}

export function clinicalChartHref(
  patientId: string,
  sectionId = DEFAULT_CHART_SECTION,
) {
  const base = patientChartPath(patientId);

  if (sectionId === DEFAULT_CHART_SECTION) {
    return base;
  }

  return `${base}/${sectionId}`;
}

export function chartSectionFromPathname(pathname: string, patientId: string) {
  const base = patientChartPath(patientId);

  if (pathname === base || pathname === `${base}/`) {
    return DEFAULT_CHART_SECTION;
  }

  if (!pathname.startsWith(`${base}/`)) {
    return DEFAULT_CHART_SECTION;
  }

  const section = pathname.slice(base.length + 1);
  return CHART_SECTION_ALIASES[section] ?? section;
}
