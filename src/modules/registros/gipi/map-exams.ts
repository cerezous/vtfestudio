import {
  normalizarNombreClave,
  parseGipiDate,
  parseGipiNumber,
  parsearGipiDesdeTextoPegado,
  type GipiLabFilaRaw,
} from "@/modules/registros/gipi/parse-core";
import type { RecordFormValues } from "@/modules/registros/schemas";

function toDatetimeLocal(value: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export type GipiPasteKind = "gsa" | "lab";

export type GipiMappedPatch = {
  values: Partial<RecordFormValues>;
  labels: string[];
};

function isGsaName(nombre: string) {
  const k = normalizarNombreClave(nombre);
  if (!k) {
    return false;
  }
  if (
    k === "po2" ||
    k === "pao2" ||
    k === "pco2" ||
    k === "paco2" ||
    k === "hco3" ||
    k === "eb" ||
    k === "ebecf" ||
    k === "fio2" ||
    k === "pmva" ||
    k === "iox"
  ) {
    return true;
  }
  if (k.includes("acido") && k.includes("lactico")) {
    return true;
  }
  if (k === "lactato" || k === "lactate") {
    return true;
  }
  return false;
}

function isLabName(nombre: string) {
  const k = normalizarNombreClave(nombre);
  if (!k) {
    return false;
  }
  if (k === "pcr" || (k.includes("proteina") && k.includes("reactiva"))) {
    return true;
  }
  if (k.includes("acido") && k.includes("lactico")) {
    return true;
  }
  if (k === "lactato") {
    return true;
  }
  if (k.includes("procalcitonin") || k === "pct") {
    return true;
  }
  return false;
}

function canonicalGsaKey(nombre: string) {
  const k = normalizarNombreClave(nombre);
  if (k === "po2" || k === "pao2") {
    return "pao2";
  }
  if (k === "pco2" || k === "paco2") {
    return "paco2";
  }
  if (k === "hco3") {
    return "hco3";
  }
  if (k === "eb" || k === "ebecf") {
    return k === "eb" ? "eb" : "ebecf";
  }
  if (k === "fio2") {
    return "fio2";
  }
  if (k === "pmva") {
    return "pmva";
  }
  if (k === "iox") {
    return "iox";
  }
  if (k.includes("lactico") || k === "lactato" || k === "lactate") {
    return "lactato";
  }
  return null;
}

function canonicalLabKey(nombre: string) {
  const k = normalizarNombreClave(nombre);
  if (k === "pcr" || (k.includes("proteina") && k.includes("reactiva"))) {
    return "pcr";
  }
  if (k.includes("lactico") || k === "lactato") {
    return "lactato";
  }
  if (k.includes("procalcitonin") || k === "pct") {
    return "procalcitonina";
  }
  return null;
}

function normalizeFio2(value: number) {
  if (value > 0 && value <= 1) {
    return Math.round(value * 1000) / 10;
  }
  return value;
}

function numberToInput(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(Number(value.toFixed(2)));
}

function pickLatestSample(filas: GipiLabFilaRaw[]) {
  const byDate = new Map<string, GipiLabFilaRaw[]>();
  for (const fila of filas) {
    const key = fila.fechaValidacion.trim();
    const list = byDate.get(key) ?? [];
    list.push(fila);
    byDate.set(key, list);
  }

  let best: GipiLabFilaRaw[] = [];
  let bestTs = -1;
  for (const [fecha, list] of byDate) {
    const ts = parseGipiDate(fecha)?.getTime() ?? 0;
    if (ts >= bestTs) {
      bestTs = ts;
      best = list;
    }
  }
  return best;
}

type NumericFormField = Exclude<keyof RecordFormValues, "recorded_at" | "support">;

function applyNumeric(
  patch: Partial<RecordFormValues>,
  labels: string[],
  field: NumericFormField,
  label: string,
  raw: string,
  transform?: (n: number) => number,
) {
  const parsed = parseGipiNumber(raw);
  if (parsed == null) {
    return;
  }
  const value = transform ? transform(parsed) : parsed;
  patch[field] = numberToInput(value);
  labels.push(label);
}

export function mapGipiPaste(
  texto: string,
  kind: GipiPasteKind,
): GipiMappedPatch | null {
  const raw = parsearGipiDesdeTextoPegado(texto);
  const filtered = raw.filter((fila) =>
    kind === "gsa" ? isGsaName(fila.nombre) : isLabName(fila.nombre),
  );
  if (filtered.length === 0) {
    return null;
  }

  const sample = pickLatestSample(filtered);
  const values: Partial<RecordFormValues> = {};
  const labels: string[] = [];
  const fecha = parseGipiDate(sample[0]?.fechaValidacion ?? "");
  if (fecha) {
    values.recorded_at = toDatetimeLocal(fecha);
  }

  if (kind === "gsa") {
    const keyed = new Map<string, GipiLabFilaRaw>();
    for (const fila of sample) {
      const key = canonicalGsaKey(fila.nombre);
      if (!key) {
        continue;
      }
      if (key === "ebecf" && keyed.has("eb")) {
        continue;
      }
      if (!keyed.has(key) || key === "eb") {
        keyed.set(key, fila);
      }
    }

    const pao2 = keyed.get("pao2");
    const paco2 = keyed.get("paco2");
    const hco3 = keyed.get("hco3");
    const eb = keyed.get("eb") ?? keyed.get("ebecf");
    const fio2 = keyed.get("fio2");
    const pmva = keyed.get("pmva");
    const lactato = keyed.get("lactato");

    if (pao2) applyNumeric(values, labels, "pao2", "PaO₂", pao2.resultado);
    if (paco2) applyNumeric(values, labels, "paco2", "PaCO₂", paco2.resultado);
    if (hco3) applyNumeric(values, labels, "hco3", "HCO₃", hco3.resultado);
    if (eb) applyNumeric(values, labels, "eb", "EB", eb.resultado);
    if (fio2) {
      applyNumeric(values, labels, "fio2", "FiO₂", fio2.resultado, normalizeFio2);
    }
    if (pmva) applyNumeric(values, labels, "pmva", "PmVA", pmva.resultado);
    if (lactato) {
      applyNumeric(values, labels, "lactato", "Ác. láctico", lactato.resultado);
    }
  } else {
    for (const fila of sample) {
      const key = canonicalLabKey(fila.nombre);
      if (key === "pcr") {
        applyNumeric(values, labels, "pcr", "PCR", fila.resultado);
      }
      if (key === "lactato") {
        applyNumeric(values, labels, "lactato", "Ác. láctico", fila.resultado);
      }
      if (key === "procalcitonina") {
        applyNumeric(
          values,
          labels,
          "procalcitonina",
          "Procalcitonina",
          fila.resultado,
        );
      }
    }
  }

  if (labels.length === 0 && !values.recorded_at) {
    return null;
  }

  return { values, labels };
}

export async function readClipboardGipiText() {
  if (typeof navigator === "undefined") {
    return "";
  }

  if (typeof navigator.clipboard?.read === "function") {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("text/html")) {
          const html = await (await item.getType("text/html")).text();
          if (html.trim()) {
            return html;
          }
        }
        if (item.types.includes("text/plain")) {
          const plain = await (await item.getType("text/plain")).text();
          if (plain.trim()) {
            return plain;
          }
        }
      }
    } catch {
      /* readText */
    }
  }

  try {
    return (await navigator.clipboard.readText()) ?? "";
  } catch {
    return "";
  }
}
