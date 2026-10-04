import "server-only";

import { neutralizeCsvFormula } from "@/server/security/csv-safe";

/**
 * Minimal RFC4180-ish CSV parser for trusted admin import pipelines.
 * Does not accept file uploads — only in-memory UTF-8 text with hard limits.
 */

export type ParsedCsv = {
  headers: string[];
  rows: string[][];
};

export function parseCsvText(text: string): ParsedCsv {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    current.push(field);
    field = "";
  };
  const pushRow = () => {
    // Skip completely empty trailing lines
    if (current.length === 1 && current[0] === "" && rows.length > 0) {
      current = [];
      return;
    }
    rows.push(current);
    current = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      pushField();
      continue;
    }
    if (char === "\n") {
      pushField();
      pushRow();
      continue;
    }
    if (char === "\r") {
      continue;
    }
    field += char;
  }

  if (field.length > 0 || current.length > 0) {
    pushField();
    pushRow();
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const [headerRow, ...dataRows] = rows;
  return {
    headers: headerRow.map((h) => h.trim()),
    rows: dataRows,
  };
}

export function rowsToObjects(
  headers: string[],
  rows: string[][],
): Record<string, string>[] {
  return rows.map((row) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < headers.length; i += 1) {
      obj[headers[i]!] = (row[i] ?? "").trim();
    }
    return obj;
  });
}

export function toCsvLine(values: Array<string | number | null | undefined>): string {
  return values
    .map((value) => {
      const raw = neutralizeCsvFormula(value == null ? "" : String(value));
      if (/[",\n\r]/.test(raw)) {
        return `"${raw.replaceAll('"', '""')}"`;
      }
      return raw;
    })
    .join(",");
}
