"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { AuthTextField } from "@/modules/auth/components/auth-text-field";
import { cn } from "@/shared/lib/utils";

export function AuthPasswordField({
  className,
  ...props
}: Omit<ComponentProps<typeof AuthTextField>, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <AuthTextField
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-2 flex items-center rounded-full px-2 text-[rgb(60_60_67/0.45)] transition-transform duration-100 ease-out hover:text-foreground active:scale-95"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
