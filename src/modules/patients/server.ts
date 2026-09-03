import { createClient } from "@/shared/lib/supabase/server";

export async function getPatients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("fecha_ingreso_hospital", { ascending: false });

  if (error) {
    throw new Error("No se pudo cargar el registro de pacientes.");
  }

  return data ?? [];
}

export async function getPatient(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}
