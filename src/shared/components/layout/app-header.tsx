"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Users } from "lucide-react";

import { BrandMark } from "@/shared/components/brand/brand-mark";
import { UserMenu } from "@/shared/components/layout/user-menu";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";
import type { Profile } from "@/shared/types/database";

const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: "Estadística", icon: LayoutDashboard },
  { href: ROUTES.patients, label: "Pacientes", icon: Users },
];

export function AppHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-card px-4 md:gap-6 md:px-6">
      <Link href={ROUTES.dashboard} className="shrink-0 rounded-xl">
        <BrandMark nameClassName="max-sm:sr-only" />
      </Link>

      <nav className="flex min-w-0 items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.97]",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="max-md:sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled
          className="text-muted-foreground"
        >
          <Settings className="size-4" />
          <span className="max-sm:sr-only">Ajustes</span>
        </Button>
        <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
        <UserMenu
          fullName={profile.full_name}
          email={profile.email}
          role={profile.role}
        />
      </div>
    </header>
  );
}
