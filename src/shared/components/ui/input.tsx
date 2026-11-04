import * as React from "react"

import { fieldClass } from "@/shared/components/ui/controls"
import { cn } from "@/shared/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldClass,
        "selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        "read-only:cursor-default read-only:bg-transparent read-only:font-semibold read-only:shadow-[inset_0_0_0_1px_rgb(60_60_67/0.14)] read-only:hover:bg-transparent read-only:focus-visible:border-transparent read-only:focus-visible:bg-transparent read-only:focus-visible:ring-0",
        className
      )}
      {...props}
    />
  )
}

export { Input }
