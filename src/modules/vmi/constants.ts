export const MOTIVO_VMI_OPTIONS = [
  "Insuficiencia respiratoria hipoxémica",
  "Insuficiencia respiratoria hipercápnica",
  "Insuficiencia respiratoria mixta",
  "Shock",
  "Coma / protección de vía aérea",
  "Postoperatorio",
  "Paro cardiorrespiratorio",
  "Otro",
] as const;

export const LUGAR_IOT_OPTIONS = [
  "UCI",
  "Urgencia",
  "Pabellón",
  "Sala",
  "Prehospitalario",
  "Otro centro",
] as const;

export function vmiDays(fechaIot: string, fechaExtubacion: string | null) {
  const start = new Date(`${fechaIot}T00:00:00`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = fechaExtubacion
    ? new Date(`${fechaExtubacion}T00:00:00`)
    : new Date();
  if (Number.isNaN(end.getTime()) || end < start) {
    return null;
  }

  return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

export function formatVmiDays(fechaIot: string, fechaExtubacion: string | null) {
  const days = vmiDays(fechaIot, fechaExtubacion);
  if (days == null) {
    return "—";
  }

  const label = `${days} ${days === 1 ? "día" : "días"}`;
  return fechaExtubacion ? label : `${label} · en curso`;
}
