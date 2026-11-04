import { asNumber } from "@/modules/registros/model";

export type DescriptiveStats = {
  n: number;
  median: number | null;
  min: number | null;
  max: number | null;
  sd: number | null;
};

function compact(values: Array<number | null | undefined>) {
  return values
    .map((value) => asNumber(value))
    .filter((value): value is number => value != null)
    .sort((a, b) => a - b);
}

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function quantile(sorted: number[], q: number) {
  if (sorted.length === 0) {
    return null;
  }

  if (sorted.length === 1) {
    return sorted[0];
  }

  const index = (sorted.length - 1) * q;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function descriptiveStats(
  values: Array<number | null | undefined>,
  digits = 1,
): DescriptiveStats {
  const xs = compact(values);

  if (xs.length === 0) {
    return {
      n: 0,
      median: null,
      min: null,
      max: null,
      sd: null,
    };
  }

  const n = xs.length;
  const mean = xs.reduce((sum, value) => sum + value, 0) / n;
  const median = quantile(xs, 0.5);

  let sd: number | null = null;
  if (n >= 2) {
    const variance =
      xs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1);
    sd = Math.sqrt(variance);
  }

  return {
    n,
    median: median == null ? null : roundTo(median, digits),
    min: roundTo(xs[0], digits),
    max: roundTo(xs[n - 1], digits),
    sd: sd == null ? null : roundTo(sd, digits),
  };
}

export function formatStatNumber(value: number | null, digits = 1) {
  if (value == null) {
    return "—";
  }

  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(digits, 2),
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatStatParagraph(
  label: string,
  stats: DescriptiveStats,
  digits: number,
  unit?: string,
) {
  const heading = unit ? `${label} (${unit})` : label;

  if (stats.n === 0) {
    return `No hay mediciones de ${heading} en los registros.`;
  }

  const parts = [`mediana ${formatStatNumber(stats.median, digits)}`];

  if (stats.sd != null) {
    parts.push(`DE ${formatStatNumber(stats.sd, digits)}`);
  }

  const range =
    stats.min != null && stats.max != null
      ? ` (${formatStatNumber(stats.min, digits)}–${formatStatNumber(stats.max, digits)})`
      : "";

  return `${heading}: ${parts.join(", ")}${range}. n = ${stats.n}.`;
}
