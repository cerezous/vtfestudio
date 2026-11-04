export type ChartSection = {
  id: string;
  label: string;
  kind: "canvas";
  ready: true;
};

export type ChartGroup = {
  id: string;
  label: string;
  items: ChartSection[];
};

export const DEFAULT_CHART_SECTION = "datos-personales";

export const CHART_GROUPS: ChartGroup[] = [
  {
    id: "paciente",
    label: "Paciente",
    items: [
      {
        id: "datos-personales",
        label: "Datos del paciente",
        kind: "canvas",
        ready: true,
      },
    ],
  },
  {
    id: "estudio",
    label: "Estudio",
    items: [
      {
        id: "apache-ii",
        label: "APACHE II",
        kind: "canvas",
        ready: true,
      },
      {
        id: "registros",
        label: "Registros",
        kind: "canvas",
        ready: true,
      },
      {
        id: "epicrisis",
        label: "Epicrisis",
        kind: "canvas",
        ready: true,
      },
    ],
  },
];

export function flattenChartSections(groups = CHART_GROUPS): ChartSection[] {
  return groups.flatMap((group) => group.items);
}

export function visibleChartGroups(groups = CHART_GROUPS): ChartGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.ready),
    }))
    .filter((group) => group.items.length > 0);
}

export function findChartSection(sectionId: string) {
  return (
    flattenChartSections().find((section) => section.id === sectionId) ?? null
  );
}

export function chartSectionFromPath(segments?: string[]) {
  if (!segments?.length) {
    return DEFAULT_CHART_SECTION;
  }

  return segments.join("/");
}

export function isKnownChartSection(sectionId: string) {
  return flattenChartSections().some((section) => section.id === sectionId);
}

export const CHART_SECTION_ALIASES: Record<string, string> = {
  "datos-vmi": "registros",
  hitos: "registros",
  "datos-hospitalizacion": "datos-personales",
};
