"use client";

import { AuthPortadaPanel } from "@/modules/auth/components/auth-portada-panel";
import {
  AuthCard,
  AuthFormColumn,
  AuthFrame,
} from "@/modules/auth/components/auth-split-shell";
import { LoginForm } from "@/modules/auth/components/login-form";
import { BrandMark } from "@/shared/components/brand/brand-mark";

export function LoginScreen() {
  return (
    <AuthFrame>
      <AuthCard>
        <AuthPortadaPanel />
        <AuthFormColumn>
          <BrandMark className="mb-5 lg:mb-8" />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Usuario <span className="font-medium text-zinc-700">mcerezo</span>.
            La clave es tu RUT; puedes pegarlo con puntos y guión.
          </p>
          <div className="mt-5 lg:mt-8">
            <LoginForm />
          </div>
        </AuthFormColumn>
      </AuthCard>
    </AuthFrame>
  );
}
