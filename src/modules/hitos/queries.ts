"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { formValuesToMilestonePayload } from "@/modules/hitos/model";
import type { HitoFormValues } from "@/modules/hitos/schemas";
import { createClient } from "@/shared/lib/supabase/client";
import type { ClinicalMilestone } from "@/shared/types/database";

export const milestoneKeys = {
  all: ["clinical-milestones"] as const,
  byPatient: (patientId: string) => ["clinical-milestones", patientId] as const,
};

export function useClinicalMilestones(patientId: string) {
  return useQuery({
    queryKey: milestoneKeys.byPatient(patientId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clinical_milestones")
        .select("*")
        .eq("patient_id", patientId)
        .order("occurred_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useUpsertClinicalMilestone(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string | null;
      values: HitoFormValues;
    }) => {
      const payload = formValuesToMilestonePayload(patientId, values);
      if (!payload.occurred_at) {
        throw new Error("Indica la fecha del hito.");
      }

      const supabase = createClient();
      const { data, error } = await supabase.rpc("upsert_clinical_milestone", {
        p_id: id ?? null,
        p_payload: payload,
      });

      if (error || !data) {
        throw error ?? new Error("No se pudo guardar el hito.");
      }

      return data;
    },
    onSuccess: (row, variables) => {
      queryClient.setQueryData<ClinicalMilestone[]>(
        milestoneKeys.byPatient(patientId),
        (current) => {
          const list = current ?? [];
          const next = variables.id
            ? list.map((item) => (item.id === row.id ? row : item))
            : [...list, row];
          return next.sort((a, b) =>
            a.occurred_at < b.occurred_at
              ? -1
              : a.occurred_at > b.occurred_at
                ? 1
                : 0,
          );
        },
      );
      toast.success(variables.id ? "Hito actualizado." : "Hito guardado.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar el hito.",
      );
    },
  });
}

export function useDeleteClinicalMilestone(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_clinical_milestone", {
        p_id: id,
      });

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<ClinicalMilestone[]>(
        milestoneKeys.byPatient(patientId),
        (current) => (current ?? []).filter((item) => item.id !== id),
      );
      toast.success("Hito eliminado.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar el hito.",
      );
    },
  });
}
