import type { StockField, ToField } from "./types";

// Common header names seen in Zoho Inventory exports (Transfer Order list /
// Transfer Order details, and Stock Summary / Item reports), used to
// auto-suggest a mapping. The user can always override in the UI, since
// exact export column names vary by Zoho org configuration.
export const TO_FIELD_ALIASES: Record<ToField, string[]> = {
  toId: ["transfer order", "transfer order id", "transfer order number", "to number", "to id", "to no"],
  date: ["date", "transfer date", "created date", "to date", "order date"],
  ds: [
    "destination warehouse",
    "to warehouse",
    "receiving warehouse",
    "destination",
    "ds",
    "dark store",
    "distributor",
    "store",
    "ship to",
  ],
  sourceWarehouse: [
    "source warehouse",
    "from warehouse",
    "sending warehouse",
    "origin warehouse",
    "warehouse",
  ],
  sku: ["sku", "item sku", "item code", "product code", "cf.sku"],
  itemName: ["item name", "item", "product name", "description"],
  qtyRaised: [
    "quantity ordered",
    "quantity requested",
    "qty raised",
    "quantity",
    "transfer quantity",
    "qty",
    "ordered quantity",
  ],
  qtySent: [
    "quantity transferred",
    "quantity shipped",
    "quantity sent",
    "qty sent",
    "qty transferred",
    "shipped quantity",
    "dispatched quantity",
  ],
  status: ["status", "transfer status", "to status"],
};

export const STOCK_FIELD_ALIASES: Record<StockField, string[]> = {
  sku: ["sku", "item sku", "item code", "product code", "cf.sku"],
  itemName: ["item name", "item", "product name", "description"],
  warehouse: ["warehouse name", "warehouse", "location"],
  qtyOnHand: [
    "stock on hand",
    "available stock",
    "quantity available",
    "quantity on hand",
    "available for sale",
    "current stock",
    "stock in hand",
    "qty on hand",
  ],
};

function normalize(h: string): string {
  return h.trim().toLowerCase().replace(/[_.]/g, " ").replace(/\s+/g, " ");
}

/** Best-effort auto mapping: for each logical field, pick the header whose
 * normalized text matches an alias exactly, or contains/was-contained-by one. */
export function guessMapping<F extends string>(
  headers: string[],
  aliases: Record<F, string[]>
): Partial<Record<F, string>> {
  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: normalize(h) }));
  const result: Partial<Record<F, string>> = {};

  (Object.keys(aliases) as F[]).forEach((field) => {
    const candidates = aliases[field];
    // 1) exact match
    let found = normalizedHeaders.find((h) => candidates.includes(h.norm));
    // 2) contains match
    if (!found) {
      found = normalizedHeaders.find((h) =>
        candidates.some((c) => h.norm.includes(c) || c.includes(h.norm))
      );
    }
    if (found) result[field] = found.raw;
  });

  return result;
}
