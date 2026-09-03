"use client";

import { usePathname } from "next/navigation";

import { ROUTES } from "@/shared/lib/constants";

const SECTION_LABEL: Record<string, string> = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.patients]: "Pacientes",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const section =
    pathname.startsWith(ROUTES.patients) ? "Pacientes" : SECTION_LABEL[pathname] ?? "Estudio";

  return (
    <div className="hidden text-sm text-muted-foreground md:block">
      Estudio
      <span className="mx-1 text-border">/</span>
      <span className="font-medium text-foreground">{section}</span>
    </div>
  );
}
