import { ClinicalChartSlot } from "@/modules/clinical-chart/components/clinical-chart-slot";

export function ComingSoonPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <ClinicalChartSlot title={title}>
      <p className="text-sm text-muted-foreground">{description}</p>
    </ClinicalChartSlot>
  );
}
