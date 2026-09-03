import type { ComponentProps, ReactNode } from "react";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

export function AuthTextField({
  trailing,
  variant = "pill",
  className,
  ...props
}: ComponentProps<typeof Input> & {
  trailing?: ReactNode;
  variant?: "pill" | "box";
}) {
  return (
    <div className="relative">
      <Input
        className={cn(
          "h-12 px-5 text-sm shadow-none placeholder:text-zinc-400 focus-visible:ring-zinc-200",
          variant === "pill" &&
            "rounded-full border-transparent bg-zinc-100 focus-visible:border-zinc-300",
          variant === "box" &&
            "rounded-xl border-zinc-200 bg-white focus-visible:border-[#2F6BFF]",
          trailing && "pr-12",
          className,
        )}
        {...props}
      />
      {trailing ? (
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}
