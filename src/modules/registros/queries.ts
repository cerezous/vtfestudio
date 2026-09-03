"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { formValuesToPayload } from "@/modules/registros/model";
import type { RecordFormValues } from "@/modules/registros/schemas";
import { createClient } from "@/shared/lib/supabase/client";
import type { ClinicalRecord } from "@/shared/types/database";

export const clinicalRecordKeys = {
  all: ["clinical-records"] as const,
  byPatient: (patientId: string) => ["clinical-records", patientId] as const,
};

export function useClinicalRecords(patientId: string) {
  return useQuery({
    queryKey: clinicalRecordKeys.byPatient(patientId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clinical_records")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useUpsertClinicalRecord(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string | null;
      values: RecordFormValues;
    }) => {
      const payload = formValuesToPayload(patientId, values);
      if (!payload.recorded_at) {
        throw new Error("Indica la fecha del registro.");
      }

      const supabase = createClient();
      const { data, error } = await supabase.rpc("upsert_clinical_record", {
        p_id: id ?? null,
        p_payload: payload,
      });

      if (error || !data) {
        throw error ?? new Error("No se pudo guardar el registro.");
      }

      return data;
    },
    onSuccess: (row, variables) => {
      queryClient.setQueryData<ClinicalRecord[]>(
        clinicalRecordKeys.byPatient(patientId),
        (current) => {
          const list = current ?? [];
          const next = variables.id
            ? list.map((item) => (item.id === row.id ? row : item))
            : [...list, row];
          return next.sort((a, b) =>
            a.recorded_at < b.recorded_at
              ? -1
              : a.recorded_at > b.recorded_at
                ? 1
                : 0,
          );
        },
      );
      toast.success(
        variables.id ? "Registro actualizado." : "Registro guardado.",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el registro.",
      );
    },
  });
}

export function useDeleteClinicalRecord(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_clinical_record", {
        p_id: id,
      });

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<ClinicalRecord[]>(
        clinicalRecordKeys.byPatient(patientId),
        (current) => (current ?? []).filter((item) => item.id !== id),
      );
      toast.success("Registro eliminado.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el registro.",
      );
    },
  });
}
