// Raw parsed spreadsheet row: column header -> cell value (string/number/undefined)
export type RawRow = Record<string, string | number | undefined>;

export interface ParsedFile {
  fileName: string;
  headers: string[];
  rows: RawRow[];
}

// Logical fields we need out of the Transfer Order export.
export type ToField =
  | "toId"
  | "date"
  | "ds"
  | "sourceWarehouse"
  | "sku"
  | "itemName"
  | "qtyRaised"
  | "qtySent"
  | "status";

// Logical fields we need out of the Stock export.
export type StockField = "sku" | "itemName" | "warehouse" | "qtyOnHand";

export type ToMapping = Partial<Record<ToField, string>>; // field -> source header
export type StockMapping = Partial<Record<StockField, string>>;

export interface ToLine {
  toId: string;
  date: string;
  ds: string;
  sourceWarehouse: string;
  sku: string;
  itemName: string;
  qtyRaised: number;
  qtySent: number;
  status: string;
}

export type RcaTag = "Sent" | "Short" | "Not Picked" | "Unknown (no stock data)";

export interface ComputedLine extends ToLine {
  pending: number;
  rca: RcaTag;
  stockAtSource: number | null;
}

export interface DsSummary {
  ds: string;
  qtyRaised: number;
  qtySent: number;
  pending: number;
  fillRate: number; // 0-100
  skuCountPending: number;
  shortCount: number;
  notPickedCount: number;
}

export interface SkuSummary {
  sku: string;
  itemName: string;
  ds: string;
  qtyRaised: number;
  qtySent: number;
  pending: number;
  rca: RcaTag;
  stockAtSource: number | null;
}

export interface ComputedResult {
  lines: ComputedLine[];
  dsSummaries: DsSummary[];
  overall: {
    qtyRaised: number;
    qtySent: number;
    pending: number;
    fillRate: number;
    skuLinesPending: number;
    shortCount: number;
    notPickedCount: number;
  };
}
