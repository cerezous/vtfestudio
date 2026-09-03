import { buildDashboardSnapshot } from "@/modules/dashboard/stats";
import { createClient } from "@/shared/lib/supabase/server";

export async function getDashboardSnapshot() {
  const supabase = await createClient();

  const [patients, records, apacheScores, vmiEpisodes] = await Promise.all([
    supabase
      .from("patients")
      .select("*")
      .order("fecha_ingreso_hospital", { ascending: false }),
    supabase
      .from("clinical_records")
      .select("*")
      .order("recorded_at", { ascending: true }),
    supabase
      .from("apache_scores")
      .select("*")
      .order("scored_at", { ascending: false }),
    supabase
      .from("vmi_episodes")
      .select("*")
      .order("fecha_iot", { ascending: false }),
  ]);

  if (patients.error) {
    throw new Error("No se pudo cargar el censo de pacientes.");
  }
  if (records.error) {
    throw new Error("No se pudieron cargar los registros clínicos.");
  }
  if (apacheScores.error) {
    throw new Error("No se pudieron cargar los puntajes APACHE.");
  }
  if (vmiEpisodes.error) {
    throw new Error("No se pudieron cargar los episodios de VMI.");
  }

  return buildDashboardSnapshot(
    patients.data ?? [],
    records.data ?? [],
    apacheScores.data ?? [],
    vmiEpisodes.data ?? [],
  );
}
