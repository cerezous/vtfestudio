import { cn } from "@/shared/lib/utils";

/** Campo relleno al estilo iOS: sin borde en reposo, anillo azul al foco. */
export const fieldClass =
  "apple-field h-11 w-full min-w-0 rounded-[10px] border border-transparent bg-[rgb(120_120_128/0.12)] px-3.5 text-[17px] tracking-[-0.012em] text-foreground shadow-none outline-none transition-[background-color,box-shadow,border-color] duration-150 ease-out placeholder:text-[rgb(60_60_67/0.45)] hover:bg-[rgb(120_120_128/0.16)] focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10 dark:placeholder:text-white/40 dark:hover:bg-white/14 dark:focus-visible:bg-card";

export const selectClass = cn(fieldClass, "apple-select cursor-pointer pr-10");

export const textareaClass =
  "apple-field min-h-24 w-full resize-y rounded-[10px] border border-transparent bg-[rgb(120_120_128/0.12)] px-3.5 py-3 text-[17px] leading-snug tracking-[-0.012em] text-foreground shadow-none outline-none transition-[background-color,box-shadow,border-color] duration-150 ease-out placeholder:text-[rgb(60_60_67/0.45)] hover:bg-[rgb(120_120_128/0.16)] focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/25 disabled:opacity-40 dark:bg-white/10 dark:placeholder:text-white/40 dark:hover:bg-white/14 dark:focus-visible:bg-card";

/** Valor calculado: se lee como dato, no como campo editable. */
export const computedFieldClass = cn(
  fieldClass,
  "cursor-default bg-transparent font-semibold tabular-nums shadow-[inset_0_0_0_1px_rgb(60_60_67/0.14)] hover:bg-transparent focus-visible:border-transparent focus-visible:bg-transparent focus-visible:ring-0 dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)]",
);

export const chipBase =
  "apple-chip inline-flex items-center justify-center px-3.5 py-2 text-[15px] font-semibold tracking-[-0.014em] transition-[transform,background-color,color,box-shadow] duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

export function chipClass(active: boolean, tile = false) {
  return cn(
    chipBase,
    tile ? "rounded-[12px]" : "rounded-full",
    active
      ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.28)]"
      : "bg-[rgb(120_120_128/0.12)] text-foreground hover:bg-[rgb(120_120_128/0.18)] dark:bg-white/10 dark:hover:bg-white/16",
  );
}

export function choiceRowClass(active: boolean) {
  return cn(
    "apple-choice flex cursor-pointer items-center gap-2.5 rounded-[12px] px-3.5 py-2.5 text-[15px] tracking-[-0.011em] transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.98]",
    active
      ? "bg-primary/10 text-primary"
      : "bg-[rgb(120_120_128/0.08)] text-foreground hover:bg-[rgb(120_120_128/0.12)] dark:bg-white/10 dark:hover:bg-white/14",
  );
}
