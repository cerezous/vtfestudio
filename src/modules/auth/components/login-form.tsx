"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { signInAction } from "@/modules/auth/actions";
import { AuthPasswordField } from "@/modules/auth/components/auth-password-field";
import { AuthTextField } from "@/modules/auth/components/auth-text-field";
import { loginSchema, type LoginValues } from "@/modules/auth/schemas";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginValues) {
    setError(null);
    const result = await signInAction(values);

    if (result && "error" in result && result.error) {
      setError(result.error);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-3 text-left sm:space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <AuthTextField
                  autoComplete="username"
                  placeholder="Usuario"
                  variant="box"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <AuthPasswordField
                  autoComplete="current-password"
                  placeholder="RUT, con o sin puntos"
                  variant="box"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <label className="flex items-center gap-2 text-sm text-zinc-500">
          <input
            type="checkbox"
            className="apple-checkbox"
            {...form.register("remember")}
          />
          Recordarme 30 días
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          className="h-12 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
