"use client";

export interface FieldSpec {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
}

interface ColumnMapperProps {
  title: string;
  headers: string[];
  fields: FieldSpec[];
  mapping: Record<string, string | undefined>;
  onChange: (field: string, header: string | undefined) => void;
}

export default function ColumnMapper({
  title,
  headers,
  fields,
  mapping,
  onChange,
}: ColumnMapperProps) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border-hairline)" }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        {title} — confirm which column is which
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((f) => {
          const value = mapping[f.key] ?? "";
          const missing = f.required && !value;
          return (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {f.label}
                {f.required ? " *" : ""}
              </label>
              <select
                className="text-sm rounded border px-2 py-1.5"
                style={{
                  borderColor: missing ? "var(--status-critical)" : "var(--baseline)",
                  background: "var(--page-plane)",
                  color: "var(--text-primary)",
                }}
                value={value}
                onChange={(e) => onChange(f.key, e.target.value || undefined)}
              >
                <option value="">— not in this file —</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              {f.hint && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {f.hint}
                </span>
              )}
              {missing && (
                <span className="text-xs" style={{ color: "var(--status-critical)" }}>
                  Required to compute results
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
