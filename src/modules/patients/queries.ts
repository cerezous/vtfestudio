"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { formatRutInput } from "@/modules/patients/display";
import {
  joinAntecedentes,
  type PatientFormValues,
} from "@/modules/patients/schemas";
import { createClient } from "@/shared/lib/supabase/client";
import type { Patient } from "@/shared/types/database";

export const patientKeys = {
  all: ["patients"] as const,
};

export function formValuesToPayload(values: PatientFormValues) {
  return {
    id_rut: formatRutInput(values.id_rut),
    n_ficha: values.n_ficha,
    nombres: values.nombres,
    apellido1: values.apellido1,
    apellido2: values.apellido2 ?? null,
    sexo: values.sexo || null,
    fecha_nacimiento: values.fecha_nacimiento,
    nacionalidad: values.nacionalidad ?? null,
    diagnostico: values.diagnostico,
    grupo_diagnostico: values.grupo_diagnostico,
    antecedentes_morbidos: joinAntecedentes(values.antecedentes) || null,
    fecha_ingreso_hospital: values.fecha_ingreso_hospital,
    fecha_ingreso_uci: values.fecha_ingreso_uci ?? null,
    fecha_egreso: values.fecha_egreso ?? null,
    motivo_egreso: values.motivo_egreso ?? null,
  };
}

export function usePatients(initialData?: Patient[]) {
  return useQuery({
    queryKey: patientKeys.all,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("fecha_ingreso_hospital", { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
  });
}

export function useUpsertPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string | null;
      values: PatientFormValues;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("upsert_patient", {
        p_id: id ?? null,
        p_payload: formValuesToPayload(values),
      });

      if (error || !data) {
        throw error ?? new Error("No se pudo guardar el paciente.");
      }

      return data;
    },
    onSuccess: (patient, variables) => {
      queryClient.setQueryData<Patient[]>(patientKeys.all, (current) => {
        const list = current ?? [];
        if (variables.id) {
          return list.map((item) => (item.id === patient.id ? patient : item));
        }
        return [patient, ...list];
      });
      toast.success(variables.id ? "Paciente actualizado." : "Paciente creado.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el paciente.",
      );
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_patient", { p_id: id });

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Patient[]>(patientKeys.all, (current) =>
        (current ?? []).filter((item) => item.id !== id),
      );
      toast.success("Paciente eliminado.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el paciente.",
      );
    },
  });
}
