import {
  formatRut,
  patientFullName,
} from "@/modules/patients/display";
import type { Patient } from "@/shared/types/database";

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function compactRut(value: string) {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function patientMatchesQuery(patient: Patient, query: string) {
  const needle = fold(query);
  if (!needle) {
    return true;
  }

  const haystack = fold(
    [
      patientFullName(patient),
      patient.id_rut,
      formatRut(patient.id_rut),
      String(patient.n_ficha),
      patient.diagnostico,
      patient.grupo_diagnostico ?? "",
      patient.motivo_egreso ?? "",
      patient.nacionalidad ?? "",
    ].join(" "),
  );

  if (haystack.includes(needle)) {
    return true;
  }

  const rutQuery = compactRut(query);
  return rutQuery.length > 0 && compactRut(patient.id_rut).includes(rutQuery);
}
