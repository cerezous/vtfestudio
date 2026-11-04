import { hitoKindLabel } from "@/modules/hitos/constants";
import { supportLabel } from "@/modules/registros/constants";
import { flowPatternLabel, ventModeLabel } from "@/modules/registros/pb980";
import {
  RECORD_STAT_FIELDS,
  ageRows,
  outcomeRows,
  procedureRows,
  recordsInView,
  sexRows,
  summarizeNumbers,
  type DashboardDateRange,
  type DashboardFact,
  type DashboardFilter,
  type DashboardRecordPoint,
  type NumericSummary,
} from "@/modules/dashboard/stats";

const PROCEDURES = [
  "iot",
  "extubacion",
  "pronacion",
  "supinacion",
  "ecmo",
  "tqt",
  "weaning",
] as const;

export type SheetCell = string | number | null;

export type StatisticsSheet = {
  name: string;
  rows: SheetCell[][];
  headerAt: number;
};

function round2(value: number | null) {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value * 100) / 100;
}

function summaryCells(summary: NumericSummary): SheetCell[] {
  return [
    summary.n,
    round2(summary.mean),
    round2(summary.median),
    round2(summary.sd),
    round2(summary.cv),
  ];
}

function sexLabel(sex: DashboardFact["sex"]) {
  if (sex === "H") return "Hombre";
  if (sex === "M") return "Mujer";
  if (sex === "I") return "Indeterminado";
  return "Sin dato";
}

function sheet(
  name: string,
  range: DashboardDateRange | null,
  filter: DashboardFilter | null,
  generatedAt: Date,
  notes: SheetCell[][],
  header: SheetCell[],
  body: SheetCell[][],
): StatisticsSheet {
  const rows: SheetCell[][] = [
    [name],
    ["Periodo", range ? `${range.from} a ${range.to}` : "Todas las fechas"],
    ["Filtro", filter?.label ?? "Ninguno"],
    ["Generado", generatedAt.toISOString().slice(0, 16).replace("T", " ")],
    ...notes,
    [],
  ];
  const headerAt = rows.length;
  rows.push(header, ...body);
  return { name, rows, headerAt };
}

export function buildStatisticsWorkbook({
  facts,
  records,
  range,
  filter,
  generatedAt,
}: {
  facts: DashboardFact[];
  records: DashboardRecordPoint[];
  range: DashboardDateRange | null;
  filter: DashboardFilter | null;
  generatedAt: Date;
}): StatisticsSheet[] {
  const viewedRecords = recordsInView(records, facts, range);
  const names = new Map(facts.map((fact) => [fact.id, fact.name]));
  const procedures = PROCEDURES.map((id) => ({ id, label: hitoKindLabel(id) }));

  const numericRows: Array<[string, string, number[]]> = [
    ["Cohorte", "Edad (años)", facts.flatMap((fact) => (fact.age == null ? [] : [fact.age]))],
    [
      "Cohorte",
      "Días de VMI",
      facts.flatMap((fact) => (fact.vmiDays == null ? [] : [fact.vmiDays])),
    ],
    [
      "Cohorte",
      "APACHE II",
      facts.flatMap((fact) => (fact.apache == null ? [] : [fact.apache])),
    ],
    [
      "Cohorte",
      "Mortalidad predicha (%)",
      facts.flatMap((fact) =>
        fact.predictedMortality == null ? [] : [fact.predictedMortality],
      ),
    ],
  ];

  for (const procedure of procedures) {
    numericRows.push([
      "Procedimientos",
      `${procedure.label} por paciente`,
      facts.map((fact) => fact.procedures[procedure.id] ?? 0),
    ]);
  }

  for (const field of RECORD_STAT_FIELDS) {
    numericRows.push([
      "Registros",
      field.unit ? `${field.label} (${field.unit})` : field.label,
      viewedRecords.flatMap((record) => {
        const value = record.values[field.id];
        return value == null ? [] : [value];
      }),
    ]);
  }

  const cohort = facts.length;
  const share = (count: number) => (cohort === 0 ? null : round2((count / cohort) * 100));
  const distribution: SheetCell[][] = [];

  for (const row of sexRows(facts)) {
    distribution.push(["Sexo", row.label, row.count, share(row.count)]);
  }
  for (const row of ageRows(facts)) {
    distribution.push(["Edad", row.label, row.count, share(row.count)]);
  }
  for (const row of procedureRows(facts, procedures)) {
    distribution.push(["Procedimientos", row.label, row.count, null]);
  }
  for (const row of outcomeRows(facts)) {
    distribution.push(["Resultados", row.label, row.count, null]);
  }

  const supportCounts = new Map<string, number>();
  for (const record of viewedRecords) {
    const label = supportLabel(record.support);
    supportCounts.set(label, (supportCounts.get(label) ?? 0) + 1);
  }
  const supportTotal = viewedRecords.length;
  for (const [label, count] of [...supportCounts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "es"),
  )) {
    distribution.push([
      "Soporte",
      label,
      count,
      supportTotal === 0 ? null : round2((count / supportTotal) * 100),
    ]);
  }

  const modeCounts = new Map<string, number>();
  for (const record of viewedRecords) {
    const label = ventModeLabel(record.ventMode);
    if (!label) {
      continue;
    }
    modeCounts.set(label, (modeCounts.get(label) ?? 0) + 1);
  }
  for (const [label, count] of [...modeCounts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "es"),
  )) {
    distribution.push([
      "Modo PB980",
      label,
      count,
      supportTotal === 0 ? null : round2((count / supportTotal) * 100),
    ]);
  }

  const cohortRows = facts.map((fact) => [
    fact.name,
    sexLabel(fact.sex),
    fact.age,
    round2(fact.vmiDays),
    fact.apache,
    fact.predictedMortality,
    ...procedures.map((procedure) => fact.procedures[procedure.id] ?? 0),
  ]);

  const recordRows = viewedRecords.map((record) => [
    names.get(record.patientId) ?? record.patientId,
    record.recordedAt,
    supportLabel(record.support),
    ventModeLabel(record.ventMode) || null,
    flowPatternLabel(record.flowPattern) || null,
    ...RECORD_STAT_FIELDS.map((field) => record.values[field.id] ?? null),
  ]);

  return [
    sheet(
      "Estadísticos",
      range,
      filter,
      generatedAt,
      [["CV", "Desviación estándar / |promedio| × 100. DE muestral (n−1)."]],
      ["Sección", "Variable", "n", "Promedio", "Mediana", "DE", "CV (%)"],
      numericRows.map(([section, variable, values]) => [
        section,
        variable,
        ...summaryCells(summarizeNumbers(values)),
      ]),
    ),
    sheet(
      "Distribución",
      range,
      filter,
      generatedAt,
      [],
      ["Sección", "Categoría", "n", "Porcentaje"],
      distribution,
    ),
    sheet(
      "Cohorte",
      range,
      filter,
      generatedAt,
      [],
      [
        "Paciente",
        "Sexo",
        "Edad",
        "Días de VMI",
        "APACHE II",
        "Mortalidad predicha (%)",
        ...procedures.map((procedure) => procedure.label),
      ],
      cohortRows,
    ),
    sheet(
      "Registros",
      range,
      filter,
      generatedAt,
      [],
      [
        "Paciente",
        "Fecha",
        "Soporte",
        "Modo",
        "Patrón",
        ...RECORD_STAT_FIELDS.map((field) =>
          field.unit ? `${field.label} (${field.unit})` : field.label,
        ),
      ],
      recordRows,
    ),
  ];
}

function filename(extension: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `estadistica-${day}.${extension}`;
}

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function csvCell(value: SheetCell) {
  if (value == null) {
    return "";
  }
  const text = String(value);
  if (/[;"\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function downloadStatisticsCsv(sheets: StatisticsSheet[]) {
  const rows = sheets.flatMap((item, index) => [
    ...(index === 0 ? [] : [[null] as SheetCell[]]),
    ...item.rows,
  ]);
  const body = rows.map((row) => row.map(csvCell).join(";")).join("\n");
  downloadBlob(
    filename("csv"),
    new Blob([`\uFEFF${body}`], { type: "text/csv;charset=utf-8" }),
  );
}

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function excelCell(value: SheetCell, style?: string) {
  const styleAttr = style ? ` ss:StyleID="${style}"` : "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell${styleAttr}><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  return `<Cell${styleAttr}><Data ss:Type="String">${xmlEscape(value == null ? "" : String(value))}</Data></Cell>`;
}

function columnXml(rows: SheetCell[][]) {
  const count = rows.reduce((max, row) => Math.max(max, row.length), 1);
  return Array.from({ length: count }, (_, index) => {
    const longest = rows.reduce(
      (max, row) => Math.max(max, String(row[index] ?? "").length),
      10,
    );
    const width = Math.min(280, Math.max(72, (longest + 2) * 7));
    return `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`;
  }).join("");
}

function worksheetXml(item: StatisticsSheet) {
  const width = item.rows.reduce((max, row) => Math.max(max, row.length), 1);
  const table = item.rows
    .map((row, index) => {
      if (row.length === 0) {
        return "<Row/>";
      }
      const style = index === 0 ? "title" : index === item.headerAt ? "header" : undefined;
      return `<Row>${Array.from({ length: width }, (_, cell) => excelCell(row[cell] ?? null, style)).join("")}</Row>`;
    })
    .join("");

  return `<Worksheet ss:Name="${xmlEscape(item.name)}"><Table ss:ExpandedColumnCount="${width}" ss:ExpandedRowCount="${item.rows.length}">${columnXml(item.rows)}${table}</Table></Worksheet>`;
}

export function statisticsWorkbookXml(sheets: StatisticsSheet[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11"/>
    </Style>
    <Style ss:ID="title">
      <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1"/>
    </Style>
    <Style ss:ID="header">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1E3A8A"/>
      <Interior ss:Color="#EEF3FF" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  ${sheets.map(worksheetXml).join("")}
</Workbook>`;
}

export function downloadStatisticsExcel(sheets: StatisticsSheet[]) {
  downloadBlob(
    filename("xls"),
    new Blob([statisticsWorkbookXml(sheets)], { type: "application/vnd.ms-excel" }),
  );
}

function jpegSize(bytes: Uint8Array) {
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
      };
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) {
      break;
    }
    offset += 2 + length;
  }
  throw new Error("No se pudo leer la captura.");
}

function jpegPdf(jpeg: Uint8Array, pageWidth: number, pageHeight: number) {
  const { width, height } = jpegSize(jpeg);
  const pageW = Math.round(pageWidth * 100) / 100;
  const pageH = Math.round(pageHeight * 100) / 100;
  const content = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im Do\nQ`;
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets = [0];
  let cursor = 0;

  const push = (data: Uint8Array) => {
    parts.push(data);
    cursor += data.length;
  };
  const text = (value: string) => push(encoder.encode(value));
  const object = (body: string) => {
    offsets.push(cursor);
    text(body);
  };

  text("%PDF-1.4\n");
  object("1 0 obj\n<< /Type /Catalog /Pages 2 0 R /OpenAction [3 0 R /Fit] >>\nendobj\n");
  object("2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n");
  object(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /XObject << /Im 5 0 R >> >> >>\nendobj\n`,
  );
  object(
    `4 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream\nendobj\n`,
  );
  offsets.push(cursor);
  text(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  push(jpeg);
  text("\nendstream\nendobj\n");

  const xref = cursor;
  let table = "xref\n0 6\n0000000000 65535 f \n";
  for (let index = 1; index <= 5; index += 1) {
    table += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  text(table);
  text(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function downloadStatisticsPdf() {
  const node = document.querySelector<HTMLElement>("[data-app-shell]");
  if (!node) {
    throw new Error("No se encontró la pantalla para exportar.");
  }

  const previousCursor = document.body.style.cursor;
  document.body.style.cursor = "wait";
  document.body.setAttribute("data-capturing", "");
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  try {
    await nextFrame();
    const { domToCanvas } = await import("modern-screenshot");
    const rect = node.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);
    const canvas = await domToCanvas(node, {
      backgroundColor: getComputedStyle(node).backgroundColor,
      scale: Math.min(2, window.devicePixelRatio || 1),
      width,
      height,
      features: { restoreScrollPosition: true },
    });
    const jpeg = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo crear el PDF."))),
        "image/jpeg",
        0.95,
      );
    });
    const bytes = new Uint8Array(await jpeg.arrayBuffer());
    downloadBlob(filename("pdf"), jpegPdf(bytes, (width * 72) / 96, (height * 72) / 96));
  } finally {
    document.body.style.cursor = previousCursor;
    document.body.removeAttribute("data-capturing");
  }
}
