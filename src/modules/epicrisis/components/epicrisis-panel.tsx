"use client";

import { useApacheScores } from "@/modules/apache/queries";
import { EpicrisisDocument } from "@/modules/epicrisis/components/epicrisis-document";
import { buildEpicrisisDocument } from "@/modules/epicrisis/model";
import { useClinicalMilestones } from "@/modules/hitos/queries";
import { useClinicalRecords } from "@/modules/registros/queries";
import type { Patient } from "@/shared/types/database";

export function EpicrisisPanel({ patient }: { patient: Patient }) {
  const recordsQuery = useClinicalRecords(patient.id);
  const milestonesQuery = useClinicalMilestones(patient.id);
  const apacheQuery = useApacheScores(patient.id);

  if (recordsQuery.error || milestonesQuery.error || apacheQuery.error) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No se armó la epicrisis.
      </p>
    );
  }

  if (
    recordsQuery.isLoading ||
    milestonesQuery.isLoading ||
    apacheQuery.isLoading
  ) {
    return (
      <div className="mx-auto h-[720px] max-w-[210mm] animate-pulse rounded-[1.4rem] bg-white" />
    );
  }

  const model = buildEpicrisisDocument({
    patient,
    records: recordsQuery.data ?? [],
    milestones: milestonesQuery.data ?? [],
    apacheScores: apacheQuery.data ?? [],
  });

  return (
    <EpicrisisDocument
      model={model}
      patientId={patient.id}
      variant="chart"
    />
  );
}
