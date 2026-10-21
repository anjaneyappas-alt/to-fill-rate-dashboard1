"use client";

import { useState } from "react";

export interface BarDatum {
  label: string;
  value: number; // 0-100, the fill rate %
  raised: number;
  sent: number;
  pending: number;
}

interface FillRateBarChartProps {
  data: BarDatum[];
}

export default function FillRateBarChart({ data }: FillRateBarChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) return null;

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border-hairline)" }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        Fill rate by DS
      </h3>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => {
          const pct = Math.max(0, Math.min(100, d.value));
          const isHover = hover === i;
          return (
            <div
              key={d.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="text-xs w-32 shrink-0 truncate"
                  style={{ color: "var(--text-secondary)" }}
                  title={d.label}
                >
                  {d.label}
                </div>
                <div
                  className="flex-1 h-4 rounded-full relative overflow-hidden"
                  style={{ background: "var(--gridline)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: "var(--series-1)",
                      minWidth: pct > 0 ? "6px" : "0px",
                    }}
                  />
                </div>
                <div
                  className="text-xs w-14 shrink-0 text-right tabular font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {pct.toFixed(0)}%
                </div>
              </div>
              {isHover && (
                <div
                  className="text-xs mt-1 ml-[8.5rem] tabular"
                  style={{ color: "var(--text-muted)" }}
                >
                  Raised {d.raised.toLocaleString()} · Sent {d.sent.toLocaleString()} · Pending{" "}
                  {d.pending.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
