/** Brand colors per department code, preserved byte-for-byte from the original page. */
export const DEPT_COLORS: Record<string, string> = {
  HR: "#081340",
  FIN: "#059669",
  OPS: "#7C3AED",
  INV: "#F59E0B",
  IT: "#EF4444",
  ADM: "#70768E",
};

/** Resolves a department code to its brand color, falling back to the primary navy. */
export function getDeptColor(code: string): string {
  return DEPT_COLORS[code] || "#081340";
}

/** Formats an ISO date string as e.g. "Jun 2026" (preserved from the original page). */
export function formatDeptDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/** Column headers for the departments table (preserved order). */
export const DEPARTMENT_COLUMNS = [
  "S/N",
  "Department",
  "Head",
  "Employees",
  "Active",
  "Open Positions",
  "Status",
  "Created",
  "",
];
