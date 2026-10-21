"use client";

import { ChangeEvent, DragEvent, useCallback, useState } from "react";

interface FileDropzoneProps {
  label: string;
  hint: string;
  fileName: string | null;
  rowCount?: number;
  onFile: (file: File) => void;
}

export default function FileDropzone({
  label,
  hint,
  fileName,
  rowCount,
  onFile,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="flex flex-col gap-1 rounded-lg border-2 border-dashed p-5 cursor-pointer transition-colors"
      style={{
        borderColor: isDragging ? "var(--series-1)" : "var(--baseline)",
        background: isDragging ? "rgba(42,120,214,0.06)" : "var(--surface-1)",
      }}
    >
      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {label}
      </span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {hint}
      </span>
      <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleChange} />
      <div className="mt-2 text-sm">
        {fileName ? (
          <span style={{ color: "var(--status-good)" }}>
            ✓ {fileName}
            {typeof rowCount === "number" ? ` — ${rowCount} rows` : ""}
          </span>
        ) : (
          <span style={{ color: "var(--text-secondary)" }}>
            Drop a .csv or .xlsx file here, or click to browse
          </span>
        )}
      </div>
    </label>
  );
}
