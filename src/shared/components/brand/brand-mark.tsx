import { APP_NAME } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

export function BrandMark({
  className,
  inverted = false,
  nameClassName,
}: {
  className?: string;
  inverted?: boolean;
  nameClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tracking-tight",
          inverted
            ? "bg-white text-[#2F6BFF]"
            : "bg-primary text-primary-foreground",
        )}
      >
        V
      </span>
      <span
        className={cn(
          "text-base font-semibold tracking-tight",
          inverted ? "text-white" : "text-foreground",
          nameClassName,
        )}
      >
        {APP_NAME}
      </span>
    </div>
  );
}
