import type {
  ComputedLine,
  ComputedResult,
  DsSummary,
  ParsedFile,
  RawRow,
  RcaTag,
  StockMapping,
  ToLine,
  ToMapping,
} from "./types";

function toNumber(v: string | number | undefined): number {
  if (v === undefined || v === null || v === "") return 0;
  if (typeof v === "number") return v;
  const cleaned = v.toString().replace(/,/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function toText(v: string | number | undefined): string {
  if (v === undefined || v === null) return "";
  return v.toString().trim();
}

const SENT_STATUS_KEYWORDS = [
  "transferred",
  "sent",
  "dispatched",
  "shipped",
  "closed",
  "completed",
  "delivered",
  "received",
];

/** Build normalized TO line items from the raw parsed file + the user's column mapping. */
export function buildToLines(file: ParsedFile, mapping: ToMapping): ToLine[] {
  const get = (row: RawRow, header?: string) => (header ? row[header] : undefined);

  return file.rows
    .map((row): ToLine | null => {
      const sku = toText(get(row, mapping.sku));
      if (!sku) return null; // skip blank/footer rows with no SKU

      const qtyRaised = toNumber(get(row, mapping.qtyRaised));
      const status = toText(get(row, mapping.status));

      let qtySent: number;
      if (mapping.qtySent) {
        qtySent = toNumber(get(row, mapping.qtySent));
      } else if (mapping.status) {
        const isSent = SENT_STATUS_KEYWORDS.some((k) =>
          status.toLowerCase().includes(k)
        );
        qtySent = isSent ? qtyRaised : 0;
      } else {
        qtySent = 0;
      }

      return {
        toId: toText(get(row, mapping.toId)),
        date: toText(get(row, mapping.date)),
        ds: toText(get(row, mapping.ds)) || "(Unspecified DS)",
        sourceWarehouse: toText(get(row, mapping.sourceWarehouse)),
        sku,
        itemName: toText(get(row, mapping.itemName)) || sku,
        qtyRaised,
        qtySent,
        status,
      };
    })
    .filter((l): l is ToLine => l !== null);
}

export interface StockIndex {
  // key: `${sku}` or `${sku}__${warehouse}` (lowercased) -> qty on hand
  bySku: Map<string, number>;
  bySkuWarehouse: Map<string, number>;
  hasWarehouseData: boolean;
}

export function buildStockIndex(file: ParsedFile, mapping: StockMapping): StockIndex {
  const bySku = new Map<string, number>();
  const bySkuWarehouse = new Map<string, number>();
  let hasWarehouseData = false;

  const get = (row: RawRow, header?: string) => (header ? row[header] : undefined);

  for (const row of file.rows) {
    const sku = toText(get(row, mapping.sku)).toLowerCase();
    if (!sku) continue;
    const qty = toNumber(get(row, mapping.qtyOnHand));
    const warehouse = toText(get(row, mapping.warehouse)).toLowerCase();

    bySku.set(sku, (bySku.get(sku) ?? 0) + qty);
    if (warehouse) {
      hasWarehouseData = true;
      const key = `${sku}__${warehouse}`;
      bySkuWarehouse.set(key, (bySkuWarehouse.get(key) ?? 0) + qty);
    }
  }

  return { bySku, bySkuWarehouse, hasWarehouseData };
}

function lookupStock(
  index: StockIndex,
  sku: string,
  sourceWarehouse: string
): number | null {
  const skuKey = sku.toLowerCase();
  const whKey = sourceWarehouse.toLowerCase();
  if (whKey && index.hasWarehouseData) {
    const key = `${skuKey}__${whKey}`;
    if (index.bySkuWarehouse.has(key)) return index.bySkuWarehouse.get(key)!;
  }
  if (index.bySku.has(skuKey)) return index.bySku.get(skuKey)!;
  return null;
}

export function computeResult(toLines: ToLine[], stockIndex: StockIndex): ComputedResult {
  const lines: ComputedLine[] = toLines.map((line) => {
    const pending = Math.max(0, line.qtyRaised - line.qtySent);
    const stockAtSource = lookupStock(stockIndex, line.sku, line.sourceWarehouse);

    let rca: RcaTag;
    if (pending === 0) {
      rca = "Sent";
    } else if (stockAtSource === null) {
      rca = "Unknown (no stock data)";
    } else if (stockAtSource >= pending) {
      rca = "Not Picked";
    } else {
      rca = "Short";
    }

    return { ...line, pending, rca, stockAtSource };
  });

  const dsMap = new Map<string, DsSummary>();
  for (const l of lines) {
    const existing = dsMap.get(l.ds) ?? {
      ds: l.ds,
      qtyRaised: 0,
      qtySent: 0,
      pending: 0,
      fillRate: 0,
      skuCountPending: 0,
      shortCount: 0,
      notPickedCount: 0,
    };
    existing.qtyRaised += l.qtyRaised;
    existing.qtySent += l.qtySent;
    existing.pending += l.pending;
    if (l.pending > 0) existing.skuCountPending += 1;
    if (l.rca === "Short") existing.shortCount += 1;
    if (l.rca === "Not Picked") existing.notPickedCount += 1;
    dsMap.set(l.ds, existing);
  }

  const dsSummaries = Array.from(dsMap.values())
    .map((d) => ({
      ...d,
      fillRate: d.qtyRaised > 0 ? (d.qtySent / d.qtyRaised) * 100 : 0,
    }))
    .sort((a, b) => b.qtyRaised - a.qtyRaised);

  const overall = lines.reduce(
    (acc, l) => {
      acc.qtyRaised += l.qtyRaised;
      acc.qtySent += l.qtySent;
      acc.pending += l.pending;
      if (l.pending > 0) acc.skuLinesPending += 1;
      if (l.rca === "Short") acc.shortCount += 1;
      if (l.rca === "Not Picked") acc.notPickedCount += 1;
      return acc;
    },
    {
      qtyRaised: 0,
      qtySent: 0,
      pending: 0,
      fillRate: 0,
      skuLinesPending: 0,
      shortCount: 0,
      notPickedCount: 0,
    }
  );
  overall.fillRate = overall.qtyRaised > 0 ? (overall.qtySent / overall.qtyRaised) * 100 : 0;

  return { lines, dsSummaries, overall };
}
