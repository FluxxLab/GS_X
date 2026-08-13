import { downloadCsv } from "./csv";

export type ExportFormat = "csv" | "excel" | "pdf";
type Cell = string | number | null | undefined;

// jspdf (via fflate) and xlsx are heavy, browser-only libs that break the SSR
// bundle if imported at module top-level. They run only inside click handlers,
// so we dynamically import them at call time (client-only).

/** Excel (.xlsx) download from headers + rows. */
export async function downloadXlsx(filename: string, sheetName: string, headers: string[], rows: Cell[][]): Promise<void> {
  const XLSX = await import("xlsx");
  const aoa = [headers, ...rows.map((r) => r.map((c) => (c == null ? "" : c)))];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || "Sheet1");
  XLSX.writeFile(wb, filename);
}

// jsPDF's built-in fonts (Helvetica) have no glyph for the Naira sign (₦,
// U+20A6), so it renders as a tofu box in exported PDFs. Substitute "NGN " so
// amounts stay readable. (On-screen and Excel/CSV render ₦ fine — PDF only.)
const pdfSafe = (v: unknown): string => (v == null ? "" : String(v)).replace(/₦ ?/g, "NGN ");

/** PDF download — a titled landscape table via jspdf-autotable (brand-navy header). */
export async function downloadPdf(filename: string, title: string, headers: string[], rows: Cell[][]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  doc.setFontSize(14);
  doc.text(pdfSafe(title), 40, 36);
  autoTable(doc, {
    head: [headers.map(pdfSafe)],
    body: rows.map((r) => r.map(pdfSafe)),
    startY: 52,
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [27, 58, 92], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 40, right: 40 },
  });
  doc.save(filename);
}

/**
 * One entry point for table exports. `baseName` is the file stem (no extension);
 * the right extension is appended per format. Async because Excel/PDF lazy-load
 * their libraries — callers may fire-and-forget or await.
 */
export async function exportTable(
  format: ExportFormat,
  opts: { baseName: string; title: string; headers: string[]; rows: Cell[][] },
): Promise<void> {
  const { baseName, title, headers, rows } = opts;
  if (format === "csv") downloadCsv(`${baseName}.csv`, headers, rows);
  else if (format === "excel") await downloadXlsx(`${baseName}.xlsx`, title, headers, rows);
  else await downloadPdf(`${baseName}.pdf`, title, headers, rows);
}
