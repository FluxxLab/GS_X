type CsvCell = string | number | null | undefined;

/**
 * Builds a CSV from headers + rows and triggers a browser download.
 * Client-only (uses Blob / DOM). RFC-4180 quoting + a UTF-8 BOM so Excel
 * renders ₦ and other non-ASCII correctly.
 */
export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]): void {
  const esc = (v: CsvCell): string => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
