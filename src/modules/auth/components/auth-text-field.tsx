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
          "h-12 rounded-[12px] border-transparent bg-[rgb(120_120_128/0.12)] px-4 text-[17px] shadow-none placeholder:text-[rgb(60_60_67/0.45)] hover:bg-[rgb(120_120_128/0.16)] focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/25",
          variant === "pill" && "rounded-full",
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
