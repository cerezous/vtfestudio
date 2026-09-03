"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LifeBuoy,
  ScanLine,
  Settings,
  Users,
  Wind,
} from "lucide-react";

import { Separator } from "@/shared/components/ui/separator";
import { ROUTES } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

const ITEMS = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard, disabled: false },
  { href: ROUTES.patients, label: "Pacientes", icon: Users, disabled: false },
  { href: "#", label: "Escaneo", icon: ScanLine, disabled: true },
  { href: "#", label: "Registro VMI", icon: Wind, disabled: true },
];

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="mt-6 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Estudio
        </p>

        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            !item.disabled &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              prefetch={!item.disabled}
              aria-disabled={item.disabled}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                item.disabled &&
                  "pointer-events-none text-muted-foreground opacity-45",
                !item.disabled &&
                  !active &&
                  "text-muted-foreground hover:bg-white/70",
                active && "bg-primary text-primary-foreground shadow-sm",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 pt-6">
        <Separator className="mb-3" />
        <button
          type="button"
          disabled
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground opacity-60"
        >
          <Settings className="size-4" />
          Ajustes
        </button>
        <button
          type="button"
          disabled
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground opacity-60"
        >
          <LifeBuoy className="size-4" />
          Ayuda
        </button>
      </div>
    </>
  );
}
