import * as XLSX from "xlsx";
import type { ParsedFile, RawRow } from "./types";

/**
 * Parses a CSV or XLSX File (from a browser <input type="file">) into rows
 * keyed by header name. Works entirely client-side - nothing is uploaded
 * to a server, which keeps this deployable on Vercel with zero backend
 * config and keeps the data in the user's browser only.
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const json: RawRow[] = XLSX.utils.sheet_to_json(sheet, {
    defval: undefined,
    raw: true,
  });

  const headerSet = new Set<string>();
  for (const row of json) {
    Object.keys(row).forEach((k) => headerSet.add(k));
  }

  return {
    fileName: file.name,
    headers: Array.from(headerSet),
    rows: json,
  };
}
