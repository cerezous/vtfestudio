export function computePesoIdeal(
  tallaCm: number | null,
  sexo: string | null | undefined,
): number | null {
  if (
    tallaCm == null ||
    !Number.isFinite(tallaCm) ||
    tallaCm < 100 ||
    tallaCm > 230
  ) {
    return null;
  }
  if (sexo !== "H" && sexo !== "M") {
    return null;
  }

  const base = sexo === "H" ? 50 : 45.5;
  return Math.round((base + 0.91 * (tallaCm - 152.4)) * 10) / 10;
}

export function computeVtMlKgPi(
  vtMl: number | null,
  pesoIdealKg: number | null,
): number | null {
  if (
    vtMl == null ||
    pesoIdealKg == null ||
    !Number.isFinite(vtMl) ||
    !Number.isFinite(pesoIdealKg) ||
    pesoIdealKg <= 0
  ) {
    return null;
  }

  return Math.round((vtMl / pesoIdealKg) * 10) / 10;
}

export function formatKg(value: number | null) {
  if (value == null) {
    return "—";
  }
  return `${value} kg`;
}
