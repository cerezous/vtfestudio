import { cache } from "react";

import { createClient } from "@/shared/lib/supabase/server";
import type {
  ApacheScore,
  ClinicalMilestone,
  ClinicalRecord,
  Patient,
} from "@/shared/types/database";

export type EpicrisisPayload = {
  patient: Patient;
  records: ClinicalRecord[];
  milestones: ClinicalMilestone[];
  apacheScores: ApacheScore[];
};

export const getEpicrisisPayload = cache(async (
  patientId: string,
): Promise<EpicrisisPayload | null> => {
  const supabase = await createClient();

  const [patientResult, recordsResult, milestonesResult, apacheResult] =
    await Promise.all([
      supabase.from("patients").select("*").eq("id", patientId).maybeSingle(),
      supabase
        .from("clinical_records")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: true }),
      supabase
        .from("clinical_milestones")
        .select("*")
        .eq("patient_id", patientId)
        .order("occurred_at", { ascending: true }),
      supabase
        .from("apache_scores")
        .select("*")
        .eq("patient_id", patientId)
        .order("scored_at", { ascending: false }),
    ]);

  if (patientResult.error || !patientResult.data) {
    return null;
  }

  if (recordsResult.error || milestonesResult.error || apacheResult.error) {
    throw new Error("No se pudo armar la epicrisis.");
  }

  return {
    patient: patientResult.data,
    records: recordsResult.data ?? [],
    milestones: milestonesResult.data ?? [],
    apacheScores: apacheResult.data ?? [],
  };
});
