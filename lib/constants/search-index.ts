import {
  hrDropdownLinks,
  financeDropdownLinks,
  operationsDropdownLinks,
  workspaceDropdownLinks,
  settingsDropdownLinks,
  type NavLink,
} from "@/lib/constants/nav";

/** One navigable destination in the global search index. */
export interface SearchEntry {
  /** The leaf page name shown as the primary label. */
  label: string;
  href: string;
  /** Top-level area, e.g. "Finance" — shown as breadcrumb context. */
  group: string;
  /** Parent section when the page lives under a sub-menu, e.g. "Accounting". */
  parent?: string;
}

/** Flatten a dropdown's links (and their sub-items) into search entries. */
function flatten(group: string, links: NavLink[]): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const link of links) {
    const subs = link.subItems ?? [];
    const subHrefs = new Set(subs.map((s) => s.href));
    // Category links often just point at their first child (e.g. "Transactions"
    // → the Invoices page). Skip the parent when a child owns the same href, so
    // the more specific child label wins instead of being deduped away.
    if (link.href && link.href !== "#" && !subHrefs.has(link.href)) {
      out.push({ label: link.label, href: link.href, group });
    }
    for (const sub of subs) {
      if (sub.href && sub.href !== "#") {
        out.push({
          label: sub.label,
          href: sub.href,
          group,
          parent: link.label,
        });
      }
    }
  }
  return out;
}

/**
 * The full set of navigable destinations, de-duplicated by href (the first,
 * most specific occurrence wins). This is the corpus the global search filters.
 */
export const SEARCH_INDEX: SearchEntry[] = (() => {
  const all: SearchEntry[] = [
    { label: "Dashboard", href: "/dashboard/home", group: "General" },
    ...flatten("HR & Payroll", hrDropdownLinks),
    ...flatten("Finance", financeDropdownLinks),
    ...flatten("Operations", operationsDropdownLinks),
    ...flatten("My Workspace", workspaceDropdownLinks),
    ...flatten("Settings", settingsDropdownLinks),
  ];
  const seen = new Set<string>();
  return all.filter((e) => {
    if (seen.has(e.href)) return false;
    seen.add(e.href);
    return true;
  });
})();

/**
 * Rank matches for a query: exact label wins, then label-prefix, then a word in
 * the label starting with the query, then any substring (label/parent/group).
 * Returns `-1` for a non-match so the caller can drop it.
 */
export function scoreEntry(entry: SearchEntry, q: string): number {
  const label = entry.label.toLowerCase();
  const parent = entry.parent?.toLowerCase() ?? "";
  const group = entry.group.toLowerCase();

  if (label === q) return 0;
  if (label.startsWith(q)) return 1;
  if (label.split(/[\s/&-]+/).some((w) => w.startsWith(q))) return 2;
  if (label.includes(q)) return 3;
  if (parent.includes(q)) return 4;
  if (group.includes(q)) return 5;
  return -1;
}

/** Top matches for a query, ranked and capped. */
export function searchRoutes(query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.map((entry) => ({ entry, score: scoreEntry(entry, q) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => a.score - b.score || a.entry.label.length - b.entry.label.length)
    .slice(0, limit)
    .map((r) => r.entry);
}
