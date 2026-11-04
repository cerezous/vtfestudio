import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[12px] text-[15px] font-semibold tracking-[-0.014em] whitespace-nowrap select-none outline-none transition-[transform,background-color,filter,box-shadow] duration-100 ease-out active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-40 disabled:active:scale-100 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.28)] hover:brightness-105 active:brightness-95",
        destructive:
          "bg-destructive text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22)] hover:brightness-105 active:brightness-95 focus-visible:ring-destructive/30",
        outline:
          "bg-[rgb(120_120_128/0.12)] text-foreground hover:bg-[rgb(120_120_128/0.18)] dark:bg-white/10 dark:hover:bg-white/16",
        secondary:
          "bg-[rgb(120_120_128/0.12)] text-secondary-foreground hover:bg-[rgb(120_120_128/0.18)] dark:bg-white/10 dark:hover:bg-white/16",
        ghost:
          "hover:bg-[rgb(120_120_128/0.12)] active:bg-[rgb(120_120_128/0.18)] dark:hover:bg-white/10",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 gap-1 rounded-[8px] px-2 text-[12px] tracking-[-0.006em] has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[10px] px-3 text-[13px] tracking-[-0.008em] has-[>svg]:px-2.5",
        lg: "h-12 rounded-[14px] px-6 text-[17px] has-[>svg]:px-4",
        icon: "size-11 rounded-full",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
