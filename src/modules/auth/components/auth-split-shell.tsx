import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main
      data-auth-screen
      className="flex h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#1e3a8a_0%,#0f172a_100%)] p-3 sm:p-5 lg:p-8"
    >
      {children}
    </main>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grid max-h-full w-full max-w-[860px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(8,20,60,0.35)] sm:rounded-[40px] lg:h-[min(640px,calc(100dvh-4rem))] lg:grid-cols-2 lg:rounded-[48px]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AuthFormColumn({
  children,
  align = "start",
}: {
  children: ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col justify-center overflow-y-auto px-5 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10",
        align === "center" ? "items-center text-center" : "items-stretch text-left",
      )}
    >
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
