import type { ComputedResult } from "@/lib/types";
import StatTile from "./StatTile";
import FillRateBarChart, { BarDatum } from "./FillRateBarChart";
import DsTable from "./DsTable";
import SkuTable from "./SkuTable";

export default function Dashboard({ result }: { result: ComputedResult }) {
  const { overall, dsSummaries, lines } = result;

  const barData: BarDatum[] = dsSummaries.map((d) => ({
    label: d.ds,
    value: d.fillRate,
    raised: d.qtyRaised,
    sent: d.qtySent,
    pending: d.pending,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Overall fill rate"
          value={`${overall.fillRate.toFixed(1)}%`}
          sublabel={`${overall.qtySent.toLocaleString()} sent of ${overall.qtyRaised.toLocaleString()} raised`}
          tone={overall.fillRate >= 95 ? "good" : overall.fillRate >= 80 ? "neutral" : "critical"}
        />
        <StatTile label="Qty raised" value={overall.qtyRaised.toLocaleString()} />
        <StatTile label="Qty sent" value={overall.qtySent.toLocaleString()} />
        <StatTile
          label="Qty pending"
          value={overall.pending.toLocaleString()}
          sublabel={`${overall.skuLinesPending} SKU lines not fully sent`}
          tone={overall.pending > 0 ? "warning" : "good"}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Short (stock insufficient)"
          value={overall.shortCount.toLocaleString()}
          tone="critical"
        />
        <StatTile
          label="Not picked (stock available)"
          value={overall.notPickedCount.toLocaleString()}
          tone="warning"
        />
      </div>

      <FillRateBarChart data={barData} />

      <div>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Per-DS breakdown
        </h3>
        <DsTable rows={dsSummaries} />
      </div>

      <SkuTable lines={lines} />
    </div>
  );
}
