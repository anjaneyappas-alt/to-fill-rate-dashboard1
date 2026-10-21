"use client";

import { useMemo, useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import ColumnMapper, { FieldSpec } from "@/components/ColumnMapper";
import Dashboard from "@/components/Dashboard";
import { parseSpreadsheetFile } from "@/lib/parseFile";
import { guessMapping, STOCK_FIELD_ALIASES, TO_FIELD_ALIASES } from "@/lib/columnGuess";
import { buildStockIndex, buildToLines, computeResult } from "@/lib/compute";
import type { ParsedFile, StockField, StockMapping, ToField, ToMapping } from "@/lib/types";

const STOCK_FIELDS: FieldSpec[] = [
  { key: "sku", label: "SKU / Item code", required: true },
  { key: "itemName", label: "Item name" },
  {
    key: "warehouse",
    label: "Warehouse",
    hint: "Lets us match stock to the TO's source warehouse. Without it, stock is matched by SKU across all warehouses.",
  },
  { key: "qtyOnHand", label: "Stock on hand / Available qty", required: true },
];

const TO_FIELDS: FieldSpec[] = [
  { key: "toId", label: "Transfer order ID" },
  { key: "date", label: "Date" },
  { key: "ds", label: "Destination (DS / distributor)", required: true },
  {
    key: "sourceWarehouse",
    label: "Source warehouse",
    hint: "The warehouse the TO ships from — used to check stock availability there.",
  },
  { key: "sku", label: "SKU / Item code", required: true },
  { key: "itemName", label: "Item name" },
  { key: "qtyRaised", label: "Qty raised / ordered", required: true },
  {
    key: "qtySent",
    label: "Qty sent / transferred",
    hint: "If your export has no shipped-quantity column, map Status instead below.",
  },
  {
    key: "status",
    label: "Status",
    hint: "Used as a fallback: if the status text contains sent/transferred/dispatched/shipped, qty sent = qty raised.",
  },
];

export default function Home() {
  const [stockFile, setStockFile] = useState<ParsedFile | null>(null);
  const [toFile, setToFile] = useState<ParsedFile | null>(null);
  const [stockMapping, setStockMapping] = useState<StockMapping>({});
  const [toMapping, setToMapping] = useState<ToMapping>({});
  const [error, setError] = useState<string | null>(null);

  const handleStockFile = async (file: File) => {
    try {
      setError(null);
      const parsed = await parseSpreadsheetFile(file);
      setStockFile(parsed);
      setStockMapping(guessMapping<StockField>(parsed.headers, STOCK_FIELD_ALIASES));
    } catch (e) {
      setError(`Could not read ${file.name}. Make sure it's a valid .csv or .xlsx export.`);
    }
  };

  const handleToFile = async (file: File) => {
    try {
      setError(null);
      const parsed = await parseSpreadsheetFile(file);
      setToFile(parsed);
      setToMapping(guessMapping<ToField>(parsed.headers, TO_FIELD_ALIASES));
    } catch (e) {
      setError(`Could not read ${file.name}. Make sure it's a valid .csv or .xlsx export.`);
    }
  };

  const stockReady = !!stockMapping.sku && !!stockMapping.qtyOnHand;
  const toReady = !!toMapping.ds && !!toMapping.sku && !!toMapping.qtyRaised;
  const sentUnmapped = !toMapping.qtySent && !toMapping.status;

  const result = useMemo(() => {
    if (!stockFile || !toFile || !stockReady || !toReady) return null;
    const stockIndex = buildStockIndex(stockFile, stockMapping);
    const toLines = buildToLines(toFile, toMapping);
    return computeResult(toLines, stockIndex);
  }, [stockFile, toFile, stockMapping, toMapping, stockReady, toReady]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          TO fill-rate dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Upload your Zoho Inventory stock export and transfer-order export. Everything is parsed
          and computed in your browser only — no file ever leaves this page.
        </p>
      </div>

      {error && (
        <div
          className="text-sm rounded-lg px-3 py-2"
          style={{ background: "rgba(208,59,59,0.08)", color: "var(--status-critical)" }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <FileDropzone
            label="1. Current stock export"
            hint="Zoho Inventory → Reports → Stock Summary (or Items export)"
            fileName={stockFile?.fileName ?? null}
            rowCount={stockFile?.rows.length}
            onFile={handleStockFile}
          />
          {stockFile && (
            <ColumnMapper
              title="Stock file"
              headers={stockFile.headers}
              fields={STOCK_FIELDS}
              mapping={stockMapping}
              onChange={(field, header) =>
                setStockMapping((m) => ({ ...m, [field]: header }))
              }
            />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <FileDropzone
            label="2. Transfer order export"
            hint="Zoho Inventory → Transfer Orders → export list / details"
            fileName={toFile?.fileName ?? null}
            rowCount={toFile?.rows.length}
            onFile={handleToFile}
          />
          {toFile && (
            <ColumnMapper
              title="Transfer order file"
              headers={toFile.headers}
              fields={TO_FIELDS}
              mapping={toMapping}
              onChange={(field, header) => setToMapping((m) => ({ ...m, [field]: header }))}
            />
          )}
          {toFile && sentUnmapped && (
            <div
              className="text-xs rounded-lg px-3 py-2"
              style={{ background: "rgba(250,178,25,0.12)", color: "var(--text-primary)" }}
            >
              No &quot;qty sent&quot; or &quot;status&quot; column mapped yet — until one is set,
              every line will show as 0% sent.
            </div>
          )}
        </div>
      </div>

      {result ? (
        <Dashboard result={result} />
      ) : (
        (stockFile || toFile) && (
          <div
            className="text-sm rounded-lg px-3 py-3"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-hairline)", color: "var(--text-secondary)" }}
          >
            Map the required fields (marked *) in both files above to generate the dashboard.
          </div>
        )
      )}
    </main>
  );
}
