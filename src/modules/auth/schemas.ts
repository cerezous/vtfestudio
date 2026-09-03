import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Ingresa tu usuario.")
    .max(32, "Usuario demasiado largo.")
    .regex(/^[a-z][a-z0-9._-]*$/, "El usuario no es válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  remember: z.boolean().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
