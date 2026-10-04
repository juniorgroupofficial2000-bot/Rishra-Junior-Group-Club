import "server-only";

import { parseCsvText, rowsToObjects, toCsvLine } from "@/server/csv/parse-csv";
import type { AdminMemberRecord } from "@/server/repositories/contracts/admin-member-repository";
import {
  CSV_IMPORT_LIMITS,
  MEMBER_CSV_HEADERS,
  memberCsvRowSchema,
  type MemberCsvRow,
} from "@/server/validation/csv-member";

export type MemberCsvImportError = {
  row: number;
  message: string;
};

export type MemberCsvImportResult = {
  validRows: MemberCsvRow[];
  errors: MemberCsvImportError[];
};

/**
 * Parse and validate a CSV text payload for member import.
 * Rejects oversized payloads and enforces allow-listed headers only.
 * This is intentionally not a public file-upload endpoint.
 */
export function parseMemberCsvImport(csvText: string): MemberCsvImportResult {
  const bytes = Buffer.byteLength(csvText, "utf8");
  if (bytes > CSV_IMPORT_LIMITS.maxBytes) {
    return {
      validRows: [],
      errors: [
        {
          row: 0,
          message: `CSV exceeds maximum size of ${CSV_IMPORT_LIMITS.maxBytes} bytes.`,
        },
      ],
    };
  }

  const parsed = parseCsvText(csvText);
  if (parsed.headers.length === 0) {
    return {
      validRows: [],
      errors: [{ row: 0, message: "CSV is empty or missing a header row." }],
    };
  }

  const missing = MEMBER_CSV_HEADERS.filter(
    (header) => !parsed.headers.includes(header),
  );
  if (missing.length > 0) {
    return {
      validRows: [],
      errors: [
        {
          row: 0,
          message: `Missing required columns: ${missing.join(", ")}.`,
        },
      ],
    };
  }

  const unknown = parsed.headers.filter(
    (header) =>
      !(MEMBER_CSV_HEADERS as readonly string[]).includes(header) &&
      header.length > 0,
  );
  if (unknown.length > 0) {
    return {
      validRows: [],
      errors: [
        {
          row: 0,
          message: `Unknown columns are not allowed: ${unknown.join(", ")}.`,
        },
      ],
    };
  }

  if (parsed.rows.length > CSV_IMPORT_LIMITS.maxRows) {
    return {
      validRows: [],
      errors: [
        {
          row: 0,
          message: `CSV exceeds maximum of ${CSV_IMPORT_LIMITS.maxRows} data rows.`,
        },
      ],
    };
  }

  const objects = rowsToObjects(parsed.headers, parsed.rows);
  const validRows: MemberCsvRow[] = [];
  const errors: MemberCsvImportError[] = [];

  objects.forEach((object, index) => {
    const result = memberCsvRowSchema.safeParse(object);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || "row"}: ${issue.message}`)
        .join("; ");
      errors.push({ row: index + 2, message });
      return;
    }
    validRows.push(result.data);
  });

  return { validRows, errors };
}

export function exportMembersToCsv(members: AdminMemberRecord[]): string {
  const header = toCsvLine([...MEMBER_CSV_HEADERS]);
  const lines = members.map((member) =>
    toCsvLine([
      member.membershipNumber,
      member.firstName,
      member.lastName,
      member.displayName,
      member.email,
      member.phone ?? "",
      member.status,
      member.joinedOn ? member.joinedOn.toISOString().slice(0, 10) : "",
      member.city ?? "",
      member.state ?? "",
    ]),
  );
  return [header, ...lines].join("\n") + "\n";
}
