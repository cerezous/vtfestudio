export function mapAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login")) {
    return "Usuario o contraseña incorrectos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Tu cuenta aún no está habilitada. Pide acceso a administración.";
  }

  if (
    normalized.includes("fetch") ||
    normalized.includes("bad gateway") ||
    normalized.includes("timeout") ||
    normalized.includes("network")
  ) {
    return "Auth no responde. Espera un momento e intenta de nuevo.";
  }

  if (normalized.includes("password")) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }

  return "No se pudo completar la autenticación. Intenta de nuevo.";
}
