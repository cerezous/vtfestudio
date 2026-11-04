import { buildDashboardSnapshot } from "@/modules/dashboard/stats";
import { createClient } from "@/shared/lib/supabase/server";
import type {
  ApacheScore,
  ClinicalMilestone,
  ClinicalRecord,
  Patient,
  VmiEpisode,
} from "@/shared/types/database";

const PATIENT_COLUMNS =
  "id, nombres, apellido1, apellido2, sexo, fecha_nacimiento, diagnostico, grupo_diagnostico, antecedentes_morbidos, fecha_ingreso_hospital, fecha_ingreso_uci, fecha_egreso, fecha_fallecimiento, motivo_egreso, status, updated_at";

const RECORD_COLUMNS =
  "patient_id, recorded_at, support, vent_mode, peep, pmva, driving_pressure, iox, vt, vt_ml_kg_pi, fr, pi, ti, ppeak, pplat, cest, flow_pattern, ps, epap, flujo, fio2, pao2, paco2, hco3, eb, pafi, pcr, lactato, procalcitonina";

const APACHE_COLUMNS = "patient_id, scored_at, score, mortality_pct";

const VMI_COLUMNS =
  "patient_id, fecha_iot, fecha_extubacion, motivo_vmi, reintubacion";

const MILESTONE_COLUMNS = "patient_id, occurred_at, kind, weaning_result";

export async function getDashboardSnapshot() {
  const supabase = await createClient();

  const [patients, records, apacheScores, vmiEpisodes, milestones] =
    await Promise.all([
      supabase
        .from("patients")
        .select(PATIENT_COLUMNS)
        .order("fecha_ingreso_hospital", { ascending: false }),
      supabase
        .from("clinical_records")
        .select(RECORD_COLUMNS)
        .order("recorded_at", { ascending: true }),
      supabase
        .from("apache_scores")
        .select(APACHE_COLUMNS)
        .order("scored_at", { ascending: false }),
      supabase
        .from("vmi_episodes")
        .select(VMI_COLUMNS)
        .order("fecha_iot", { ascending: false }),
      supabase
        .from("clinical_milestones")
        .select(MILESTONE_COLUMNS)
        .order("occurred_at", { ascending: true }),
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
  if (milestones.error) {
    throw new Error("No se pudieron cargar los procedimientos.");
  }

  return buildDashboardSnapshot(
    (patients.data ?? []) as Patient[],
    (records.data ?? []) as ClinicalRecord[],
    (apacheScores.data ?? []) as ApacheScore[],
    (vmiEpisodes.data ?? []) as VmiEpisode[],
    (milestones.data ?? []) as ClinicalMilestone[],
  );
}
