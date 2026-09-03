import type { Patient } from "@/shared/types/database";

export function patientFullName(
  patient: Pick<Patient, "nombres" | "apellido1" | "apellido2">,
) {
  return [patient.nombres, patient.apellido1, patient.apellido2]
    .filter(Boolean)
    .join(" ");
}

export function sexoLabel(value: string | null | undefined) {
  if (value === "H") {
    return "Hombre";
  }

  if (value === "M") {
    return "Mujer";
  }

  if (value === "I") {
    return "Indeterminado";
  }

  return "—";
}

export function formatRutInput(value: string) {
  const compact = value.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);

  if (compact.length === 0) {
    return "";
  }

  if (compact.length === 1) {
    return compact;
  }

  const body = compact.slice(0, -1);
  const dv = compact.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}

export function formatRut(value: string) {
  return formatRutInput(value) || value;
}

export function exactAge(value: string | null, at = new Date()) {
  if (!value) {
    return null;
  }

  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime()) || birth > at) {
    return null;
  }

  let years = at.getFullYear() - birth.getFullYear();
  let months = at.getMonth() - birth.getMonth();
  let days = at.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(at.getFullYear(), at.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export function formatExactAge(value: string | null) {
  const age = exactAge(value);
  if (!age) {
    return "—";
  }

  const parts = [
    `${age.years} ${age.years === 1 ? "año" : "años"}`,
    `${age.months} ${age.months === 1 ? "mes" : "meses"}`,
    `${age.days} ${age.days === 1 ? "día" : "días"}`,
  ];

  return parts.join(", ");
}

export function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
