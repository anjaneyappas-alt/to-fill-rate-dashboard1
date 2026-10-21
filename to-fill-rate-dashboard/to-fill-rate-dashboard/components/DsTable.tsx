import type { DsSummary } from "@/lib/types";

export default function DsTable({ rows }: { rows: DsSummary[] }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border-hairline)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gridline)" }}>
              {["DS", "Qty raised", "Qty sent", "Pending", "Fill rate", "Short", "Not picked"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 font-medium ${i === 0 ? "text-left" : "text-right"}`}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ds} style={{ borderBottom: "1px solid var(--gridline)" }}>
                <td className="px-3 py-2" style={{ color: "var(--text-primary)" }}>
                  {r.ds}
                </td>
                <td className="px-3 py-2 text-right tabular" style={{ color: "var(--text-primary)" }}>
                  {r.qtyRaised.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right tabular" style={{ color: "var(--text-primary)" }}>
                  {r.qtySent.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right tabular" style={{ color: "var(--text-primary)" }}>
                  {r.pending.toLocaleString()}
                </td>
                <td
                  className="px-3 py-2 text-right tabular font-medium"
                  style={{
                    color: r.fillRate >= 95 ? "var(--status-good)" : r.fillRate >= 80 ? "var(--text-primary)" : "var(--status-critical)",
                  }}
                >
                  {r.fillRate.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-right tabular" style={{ color: "var(--text-secondary)" }}>
                  {r.shortCount}
                </td>
                <td className="px-3 py-2 text-right tabular" style={{ color: "var(--text-secondary)" }}>
                  {r.notPickedCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
