const EMAIL_RE = /\S+@\S+\.\S+/g;

function redact(value: string) {
  return value.replace(EMAIL_RE, "[redacted]");
}

export function logError(scope: string, error: unknown) {
  const raw = error instanceof Error ? error.message : "error";
  console.error(`[${scope}]`, redact(raw));
}
