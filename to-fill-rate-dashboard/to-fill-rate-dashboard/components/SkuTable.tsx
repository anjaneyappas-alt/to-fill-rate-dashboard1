"use client";

import { useMemo, useState } from "react";
import type { ComputedLine, RcaTag } from "@/lib/types";
import { downloadCsv } from "@/lib/csv";

const RCA_TONE: Record<RcaTag, string> = {
  Sent: "var(--status-good)",
  Short: "var(--status-critical)",
  "Not Picked": "var(--status-warning)",
  "Unknown (no stock data)": "var(--text-muted)",
};

export default function SkuTable({ lines }: { lines: ComputedLine[] }) {
  const [dsFilter, setDsFilter] = useState<string>("__all__");
  const [rcaFilter, setRcaFilter] = useState<string>("__pending__");
  const [search, setSearch] = useState("");

  const dsOptions = useMemo(() => {
    const set = new Set(lines.map((l) => l.ds));
    return Array.from(set).sort();
  }, [lines]);

  const filtered = useMemo(() => {
    return lines.filter((l) => {
      if (dsFilter !== "__all__" && l.ds !== dsFilter) return false;
      if (rcaFilter === "__pending__" && l.pending === 0) return false;
      if (rcaFilter !== "__all__" && rcaFilter !== "__pending__" && l.rca !== rcaFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!l.sku.toLowerCase().includes(q) && !l.itemName.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [lines, dsFilter, rcaFilter, search]);

  const handleExport = () => {
    downloadCsv(
      "to-fill-rate-sku-detail.csv",
      filtered.map((l) => ({
        "TO ID": l.toId,
        Date: l.date,
        DS: l.ds,
        "Source warehouse": l.sourceWarehouse,
        SKU: l.sku,
        "Item name": l.itemName,
        "Qty raised": l.qtyRaised,
        "Qty sent": l.qtySent,
        Pending: l.pending,
        "Stock at source": l.stockAtSource ?? "",
        RCA: l.rca,
        Status: l.status,
      }))
    );
  };

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border-hairline)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          SKU detail
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={dsFilter}
            onChange={(e) => setDsFilter(e.target.value)}
            className="text-xs rounded border px-2 py-1"
            style={{ borderColor: "var(--baseline)", background: "var(--page-plane)", color: "var(--text-primary)" }}
          >
            <option value="__all__">All DS</option>
            {dsOptions.map((ds) => (
              <option key={ds} value={ds}>
                {ds}
              </option>
            ))}
          </select>
          <select
            value={rcaFilter}
            onChange={(e) => setRcaFilter(e.target.value)}
            className="text-xs rounded border px-2 py-1"
            style={{ borderColor: "var(--baseline)", background: "var(--page-plane)", color: "var(--text-primary)" }}
          >
            <option value="__pending__">Not fully sent</option>
            <option value="__all__">All lines</option>
            <option value="Short">Short only</option>
            <option value="Not Picked">Not picked only</option>
            <option value="Unknown (no stock data)">Unknown only</option>
          </select>
          <input
            type="text"
            placeholder="Search SKU or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs rounded border px-2 py-1"
            style={{ borderColor: "var(--baseline)", background: "var(--page-plane)", color: "var(--text-primary)" }}
          />
          <button
            onClick={handleExport}
            className="text-xs rounded px-3 py-1 font-medium"
            style={{ background: "var(--series-1)", color: "#fff" }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0" style={{ background: "var(--surface-1)" }}>
            <tr style={{ borderBottom: "1px solid var(--gridline)" }}>
              {["SKU", "Item", "DS", "Raised", "Sent", "Pending", "Stock@Src", "RCA"].map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-2 font-medium whitespace-nowrap ${i < 3 ? "text-left" : "text-right"}`}
                  style={{ color: "var(--text-secondary)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, idx) => (
              <tr key={`${l.toId}-${l.sku}-${idx}`} style={{ borderBottom: "1px solid var(--gridline)" }}>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                  {l.sku}
                </td>
                <td className="px-3 py-2 max-w-[14rem] truncate" style={{ color: "var(--text-secondary)" }} title={l.itemName}>
                  {l.itemName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                  {l.ds}
                </td>
                <td className="px-3 py-2 text-right tabular" style={{ color: "var(--text-primary)" }}>
                  {l.qtyRaised.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right tabular" style={{ color: "var(--text-primary)" }}>
                  {l.qtySent.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right tabular font-medium" style={{ color: "var(--text-primary)" }}>
                  {l.pending.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right tabular" style={{ color: "var(--text-secondary)" }}>
                  {l.stockAtSource === null ? "—" : l.stockAtSource.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap font-medium" style={{ color: RCA_TONE[l.rca] }}>
                  {l.rca}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  No rows match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
