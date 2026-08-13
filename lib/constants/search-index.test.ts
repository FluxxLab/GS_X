import { describe, it, expect } from "vitest";
import { SEARCH_INDEX, searchRoutes } from "./search-index";

describe("global search index", () => {
  it("has unique hrefs (deduped)", () => {
    const hrefs = SEARCH_INDEX.map((e) => e.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("returns nothing for an empty query", () => {
    expect(searchRoutes("")).toEqual([]);
    expect(searchRoutes("   ")).toEqual([]);
  });

  it("finds a page by name, case-insensitively", () => {
    const results = searchRoutes("invoices");
    expect(results.some((r) => r.href === "/dashboard/finance/invoices")).toBe(true);
  });

  it("ranks a label-prefix match above a group-only match", () => {
    // "sal" prefixes "Salary Grades"; it should surface at the very top.
    const top = searchRoutes("sal")[0];
    expect(top?.label.toLowerCase().startsWith("sal")).toBe(true);
  });

  it("caps the number of results", () => {
    expect(searchRoutes("a", 5).length).toBeLessThanOrEqual(5);
  });
});
