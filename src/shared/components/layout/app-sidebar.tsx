import Image from "next/image";

import { BrandMark } from "@/shared/components/brand/brand-mark";
import { AppSidebarNav } from "@/shared/components/layout/app-sidebar-nav";

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 overflow-hidden border-r lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/login-portada-sidebar.webp"
          alt=""
          fill
          sizes="256px"
          quality={50}
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-white/70" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-4 py-5">
        <BrandMark />
        <div className="mt-6 rounded-2xl bg-white/80 px-3 py-3 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Programa
          </p>
          <p className="mt-1 text-sm font-semibold leading-5">
            Vinko Tomicic
          </p>
          <p className="text-xs text-muted-foreground">VMI · estudio</p>
        </div>
        <AppSidebarNav />
      </div>
    </aside>
  );
}
