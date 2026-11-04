export const APP_NAME = "Estudio VMI";
export const APP_TAGLINE =
  "Estudio de pacientes en ventilación mecánica invasiva.";

export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  patients: "/pacientes",
  printEpicrisis: "/imprimir/pacientes",
  callback: "/auth/callback",
} as const;

export const PUBLIC_ROUTES = [ROUTES.login, ROUTES.callback] as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administración",
  investigator: "Investigador",
  coordinator: "Coordinación",
  staff: "Staff clínico",
};
