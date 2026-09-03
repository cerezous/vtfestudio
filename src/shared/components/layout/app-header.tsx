"use client";

import { Menu } from "lucide-react";

import { BrandMark } from "@/shared/components/brand/brand-mark";
import { AppBreadcrumb } from "@/shared/components/layout/app-breadcrumb";
import { AppSidebarNav } from "@/shared/components/layout/app-sidebar-nav";
import { UserMenu } from "@/shared/components/layout/user-menu";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import type { Profile } from "@/shared/types/database";

export function AppHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-card px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0" showCloseButton>
            <SheetHeader className="sr-only">
              <SheetTitle>Navegación</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col px-4 py-5">
              <BrandMark />
              <AppSidebarNav />
            </div>
          </SheetContent>
        </Sheet>
        <AppBreadcrumb />
      </div>

      <UserMenu
        fullName={profile.full_name}
        email={profile.email}
        role={profile.role}
      />
    </header>
  );
}
