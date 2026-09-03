import { ROUTES } from "@/shared/lib/constants";

export type SessionClaims = { sub?: string } | null;

export type SessionGateInput = {
  user: SessionClaims;
  pathname: string;
  authUnreachable: boolean;
};

export type SessionGateResult =
  | { kind: "next" }
  | { kind: "redirect"; pathname: string; next?: string };

export function isAuthRoute(pathname: string) {
  return pathname === ROUTES.login;
}

export function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

export function resolveSessionGate({
  user,
  pathname,
  authUnreachable,
}: SessionGateInput): SessionGateResult {
  if (isPublicAsset(pathname)) {
    return { kind: "next" };
  }

  if (authUnreachable) {
    if (isAuthRoute(pathname) || pathname === ROUTES.home) {
      return { kind: "next" };
    }
    return { kind: "redirect", pathname: ROUTES.login, next: pathname };
  }

  if (!user && !isAuthRoute(pathname) && pathname !== ROUTES.home) {
    return { kind: "redirect", pathname: ROUTES.login, next: pathname };
  }

  if (user && (isAuthRoute(pathname) || pathname === ROUTES.home)) {
    return { kind: "redirect", pathname: ROUTES.dashboard };
  }

  return { kind: "next" };
}
