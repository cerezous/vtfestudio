/**
 * Parseo GIPI (Nombre, Resultado, Fecha de validación, Flag, Unidad, Intervalo).
 * TSV o HTML <table>, igual que en Gestión-HRA.
 */

export type GipiFlag = "alto" | "bajo" | null;

export type GipiLabFilaRaw = {
  nombre: string;
  resultado: string;
  fechaValidacion: string;
  flag: GipiFlag;
  intervaloReferencia: string | null;
  unidad: string | null;
};

type IndicesColumnasGipi = {
  nombre: number;
  resultado: number;
  fecha: number;
  flag: number | null;
  unidad: number | null;
  intervalo: number | null;
};

export function normalizarNombreClave(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function interpretarFlagGipi(texto: string): GipiFlag {
  const t = texto.trim();
  if (!t) {
    return null;
  }
  if (/↑|▲|\u2191/.test(t)) {
    return "alto";
  }
  if (/↓|▼|\u2193/.test(t)) {
    return "bajo";
  }
  return null;
}

function detectarIndicesEncabezado(celdas: string[]): IndicesColumnasGipi | null {
  const lower = celdas.map((c) => c.trim().toLowerCase());
  const nombre = lower.findIndex((c) => c === "nombre");
  const resultado = lower.findIndex((c) => c.includes("resultado"));
  const fecha = lower.findIndex(
    (c) => c.includes("fecha") && (c.includes("valid") || c.includes("validaci")),
  );
  if (nombre < 0 || resultado < 0 || fecha < 0) {
    return null;
  }

  const flag = lower.findIndex((c) => c === "flag");
  const unidad = lower.findIndex((c) => c === "unidad");
  let intervalo = lower.findIndex(
    (c) =>
      (c.includes("intervalo") && c.includes("referencia")) ||
      c.includes("intervalo de referencia"),
  );
  if (intervalo < 0) {
    intervalo = lower.findIndex(
      (c) =>
        c.includes("referencia") &&
        !c.includes("resultado") &&
        !c.includes("fecha"),
    );
  }

  return {
    nombre,
    resultado,
    fecha,
    flag: flag >= 0 ? flag : null,
    unidad: unidad >= 0 ? unidad : null,
    intervalo: intervalo >= 0 ? intervalo : null,
  };
}

function inferIndicesPorCantidadCeldas(cells: string[]): IndicesColumnasGipi | null {
  const n = cells.length;
  const primera = cells[0]?.trim() ?? "";
  const iconoAlInicio = primera === "" || primera.length <= 1;
  const offset = iconoAlInicio && n >= 7 ? 1 : 0;
  if (n >= offset + 6) {
    return {
      nombre: offset + 0,
      resultado: offset + 1,
      fecha: offset + 2,
      flag: offset + 3,
      unidad: offset + 4,
      intervalo: offset + 5,
    };
  }
  if (n >= 4) {
    return {
      nombre: n >= 5 ? 1 : 0,
      resultado: n >= 5 ? 2 : 1,
      fecha: n >= 5 ? 3 : 2,
      flag: null,
      unidad: null,
      intervalo: null,
    };
  }
  return null;
}

function leerCeldaOpt(cells: string[], i: number | null) {
  if (i == null || i < 0 || i >= cells.length) {
    return "";
  }
  return cells[i]?.trim() ?? "";
}

function parsearLineaDatosGipi(
  cells: string[],
  indices: IndicesColumnasGipi | null,
): GipiLabFilaRaw | null {
  const idx = indices ?? inferIndicesPorCantidadCeldas(cells);
  if (!idx) {
    return null;
  }

  const nombre = leerCeldaOpt(cells, idx.nombre);
  const resultado = leerCeldaOpt(cells, idx.resultado);
  const fechaValidacion = leerCeldaOpt(cells, idx.fecha);
  if (!nombre || !fechaValidacion) {
    return null;
  }

  const flagTxt = leerCeldaOpt(cells, idx.flag);
  let flag = interpretarFlagGipi(flagTxt);
  if (!flag && flagTxt) {
    const raw = flagTxt.toLowerCase();
    if (raw.includes("alto") || raw.includes("high")) {
      flag = "alto";
    } else if (raw.includes("bajo") || raw.includes("low")) {
      flag = "bajo";
    }
  }

  return {
    nombre,
    resultado,
    fechaValidacion,
    flag,
    intervaloReferencia: leerCeldaOpt(cells, idx.intervalo) || null,
    unidad: leerCeldaOpt(cells, idx.unidad) || null,
  };
}

export function parsearGipiDesdeTsv(texto: string) {
  const lineas = texto.split(/\r?\n/).map((l) => l.trimEnd());
  let indices: IndicesColumnasGipi | null = null;
  const filas: GipiLabFilaRaw[] = [];

  for (const linea of lineas) {
    if (!linea.trim()) {
      continue;
    }
    const parts = linea.split("\t");
    if (!indices && parts.some((p) => p.toLowerCase().trim().includes("nombre"))) {
      indices = detectarIndicesEncabezado(parts.map((p) => p.trim()));
      continue;
    }
    const fila = parsearLineaDatosGipi(
      parts.map((p) => p.trim()),
      indices,
    );
    if (fila) {
      filas.push(fila);
    }
  }
  return filas;
}

export function parsearGipiDesdeHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const trs = [...doc.querySelectorAll("tr")];
  let indices: IndicesColumnasGipi | null = null;
  const filas: GipiLabFilaRaw[] = [];

  for (const tr of trs) {
    const celdas = [...tr.querySelectorAll("th,td")].map(
      (c) => c.textContent?.replace(/\s+/g, " ").trim() ?? "",
    );
    if (celdas.length === 0) {
      continue;
    }
    if (!indices && celdas.some((c) => c.toLowerCase() === "nombre")) {
      indices = detectarIndicesEncabezado(celdas);
      continue;
    }
    const fila = parsearLineaDatosGipi(celdas, indices);
    if (fila) {
      filas.push(fila);
    }
  }
  return filas;
}

export function parsearGipiDesdeTextoPegado(texto: string) {
  const t = texto.trim();
  if (!t) {
    return [];
  }
  if (t.startsWith("<") || t.includes("<table") || t.includes("<tr")) {
    return parsearGipiDesdeHtml(t);
  }
  return parsearGipiDesdeTsv(t);
}

export function parseGipiDate(value: string) {
  const t = value.trim();
  const m = t.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/,
  );
  if (m) {
    return new Date(
      Number(m[3]),
      Number(m[2]) - 1,
      Number(m[1]),
      Number(m[4] ?? 0),
      Number(m[5] ?? 0),
    );
  }
  const iso = new Date(t);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

export function parseGipiNumber(raw: string) {
  const match = raw.trim().replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}
