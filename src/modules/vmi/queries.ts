"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { VmiFormValues } from "@/modules/vmi/schemas";
import { createClient } from "@/shared/lib/supabase/client";
import type { VmiEpisode } from "@/shared/types/database";

export const vmiKeys = {
  all: ["vmi"] as const,
  byPatient: (patientId: string) => ["vmi", patientId] as const,
};

export function vmiFormToPayload(patientId: string, values: VmiFormValues) {
  return {
    patient_id: patientId,
    motivo_vmi: values.motivo_vmi,
    motivo_otro: values.motivo_vmi === "Otro" ? (values.motivo_otro ?? null) : null,
    fecha_iot: values.fecha_iot,
    lugar_iot: values.lugar_iot ?? null,
    via_aerea: "TOT",
    intubacion_dificil: values.intubacion_dificil,
    reintubacion: values.reintubacion,
    fecha_extubacion: values.fecha_extubacion ?? null,
    observaciones: values.observaciones ?? null,
  };
}

export function useVmiEpisodes(patientId: string) {
  return useQuery({
    queryKey: vmiKeys.byPatient(patientId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("vmi_episodes")
        .select("*")
        .eq("patient_id", patientId)
        .order("fecha_iot", { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useUpsertVmiEpisode(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string | null;
      values: VmiFormValues;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("upsert_vmi_episode", {
        p_id: id ?? null,
        p_payload: vmiFormToPayload(patientId, values),
      });

      if (error || !data) {
        throw error ?? new Error("No se pudo guardar los datos de VMI.");
      }

      return data;
    },
    onSuccess: (row, variables) => {
      queryClient.setQueryData<VmiEpisode[]>(
        vmiKeys.byPatient(patientId),
        (current) => {
          const list = current ?? [];
          if (variables.id) {
            return list
              .map((item) => (item.id === row.id ? row : item))
              .sort((a, b) => (a.fecha_iot < b.fecha_iot ? 1 : -1));
          }
          return [row, ...list];
        },
      );
      toast.success(
        variables.id ? "Datos de VMI actualizados." : "Datos de VMI guardados.",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar los datos de VMI.",
      );
    },
  });
}

export function useDeleteVmiEpisode(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_vmi_episode", { p_id: id });

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<VmiEpisode[]>(
        vmiKeys.byPatient(patientId),
        (current) => (current ?? []).filter((item) => item.id !== id),
      );
      toast.success("Registro de VMI eliminado.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el registro de VMI.",
      );
    },
  });
}
