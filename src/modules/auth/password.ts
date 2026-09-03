const COMPACT_RUT = /^\d{7,8}[0-9K]$/;

export function normalizeLoginPassword(password: string) {
  const compact = password
    .normalize("NFKC")
    .replace(/[\s.\u00B7\u2022\u2219\u30FB\uFF0E]/g, "")
    .replace(/[\p{Pd}\u2212]/gu, "")
    .toUpperCase();

  if (COMPACT_RUT.test(compact)) {
    return compact;
  }

  return password.trim();
}
