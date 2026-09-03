"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  computeApache,
  datetimeLocalToIso,
  type ApacheFormState,
} from "@/modules/apache/scoring";
import { createClient } from "@/shared/lib/supabase/client";
import type { ApacheScore } from "@/shared/types/database";

export const apacheKeys = {
  all: ["apache"] as const,
  byPatient: (patientId: string) => ["apache", patientId] as const,
};

export function apacheStateToPayload(patientId: string, state: ApacheFormState) {
  const result = computeApache(state);
  const scoredAt = datetimeLocalToIso(state.scoredAt);

  return {
    patient_id: patientId,
    scored_at: scoredAt,
    score: result.score,
    mortality_pct: result.mortalityPct,
    aps_points: result.apsPoints,
    gcs_points: result.gcsPoints,
    age_points: result.agePoints,
    chronic_points: result.chronicPoints,
    payload: {
      selections: state.selections,
      fio2Ge50: state.fio2Ge50,
      ira: state.ira,
      gcs: state.gcs,
      ageBand: state.ageBand,
      chronic: state.chronic,
    },
  };
}

export function useApacheScores(patientId: string) {
  return useQuery({
    queryKey: apacheKeys.byPatient(patientId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("apache_scores")
        .select("*")
        .eq("patient_id", patientId)
        .order("scored_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useUpsertApacheScore(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      state,
    }: {
      id?: string | null;
      state: ApacheFormState;
    }) => {
      const payload = apacheStateToPayload(patientId, state);
      if (!payload.scored_at) {
        throw new Error("Indica la fecha del APACHE II.");
      }

      const result = computeApache(state);
      if (!result.complete) {
        throw new Error("Completa todos los parámetros de la tabla.");
      }

      const supabase = createClient();
      const { data, error } = await supabase.rpc("upsert_apache_score", {
        p_id: id ?? null,
        p_payload: payload,
      });

      if (error || !data) {
        throw error ?? new Error("No se pudo guardar el APACHE II.");
      }

      return data;
    },
    onSuccess: (row, variables) => {
      queryClient.setQueryData<ApacheScore[]>(
        apacheKeys.byPatient(patientId),
        (current) => {
          const list = current ?? [];
          if (variables.id) {
            return list
              .map((item) => (item.id === row.id ? row : item))
              .sort((a, b) => (a.scored_at < b.scored_at ? 1 : -1));
          }
          return [row, ...list];
        },
      );
      toast.success(
        variables.id ? "APACHE II actualizado." : "APACHE II guardado.",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el APACHE II.",
      );
    },
  });
}

export function useDeleteApacheScore(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_apache_score", { p_id: id });

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<ApacheScore[]>(
        apacheKeys.byPatient(patientId),
        (current) => (current ?? []).filter((item) => item.id !== id),
      );
      toast.success("APACHE II eliminado.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el APACHE II.",
      );
    },
  });
}
