interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "good" | "warning" | "serious" | "critical";
}

const toneColor: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "var(--text-primary)",
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  serious: "var(--status-serious)",
  critical: "var(--status-critical)",
};

export default function StatTile({ label, value, sublabel, tone = "neutral" }: StatTileProps) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-1"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border-hairline)" }}
    >
      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        className="text-2xl font-semibold tabular"
        style={{ color: toneColor[tone] }}
      >
        {value}
      </span>
      {sublabel && (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}
