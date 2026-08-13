import type { TourStep } from "./TourProvider";
import {
  type DropdownKey,
  type NavLink,
  hrDropdownLinks,
  financeDropdownLinks,
  operationsDropdownLinks,
  workspaceDropdownLinks,
  settingsDropdownLinks,
} from "@/lib/constants/nav";

/**
 * The introductory tour of the staff app. It walks the top navigation and, for
 * each menu, OPENS the dropdown so its mini-tabs (the sub-pages) are revealed
 * and spotlighted. Targets are `data-tour="…"` markers on the real elements, so
 * the tour survives layout changes as long as the markers stay put.
 *
 * Step copy is DERIVED from the nav constants rather than hand-written, so the
 * tips always list exactly the groups the menu actually shows and can never go
 * stale when the nav is reorganised.
 */

/** Fire a window event the NavBar listens for, to open (or close) a dropdown. */
const openMenu = (key: DropdownKey | null) => () =>
  window.dispatchEvent(new CustomEvent("tour:open-menu", { detail: key }));

/** "A, B, C and D" from the menu's own top-level group labels. */
const groupList = (links: NavLink[]): string => {
  const labels = links.map((l) => l.label);
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
};

export const DASHBOARD_TOUR: TourStep[] = [
  {
    target: '[data-tour="nav-dashboard"]',
    title: "Welcome to Maizube ERP",
    body: "This quick tour opens each menu and shows the pages inside it, tab by tab. You can replay it anytime from the ? button.",
    onEnter: openMenu(null),
  },
  {
    target: '[data-tour="submenu"]',
    title: "HR & Payroll",
    body: `Everything people-related lives here: ${groupList(hrDropdownLinks)}.`,
    onEnter: openMenu("hr"),
  },
  {
    target: '[data-tour="submenu"]',
    title: "Finance",
    body: `The money side of the business: ${groupList(financeDropdownLinks)}.`,
    onEnter: openMenu("finance"),
  },
  {
    target: '[data-tour="submenu"]',
    title: "Operations",
    body: `Day-to-day running of the company: ${groupList(operationsDropdownLinks)}.`,
    onEnter: openMenu("operations"),
  },
  {
    target: '[data-tour="submenu"]',
    title: "My Workspace",
    body: `Your personal space: ${groupList(workspaceDropdownLinks)}.`,
    onEnter: openMenu("workspace"),
  },
  {
    target: '[data-tour="submenu"]',
    title: "Settings",
    body: `System configuration: ${groupList(settingsDropdownLinks)}.`,
    onEnter: openMenu("settings"),
  },
  {
    target: '[data-tour="search"]',
    title: "Jump to any page",
    body: "Search is the fastest way around. Start typing a page name and press enter.",
    onEnter: openMenu(null),
  },
  {
    target: '[data-tour="notifications"]',
    title: "Notifications",
    body: "Approvals and alerts that need you show up here, with a count when there's something new.",
  },
  {
    target: '[data-tour="account"]',
    title: "Your account",
    body: "Switch your work mode, open your profile, or sign out from the avatar menu.",
  },
  {
    target: '[data-tour="dashboard-overview"]',
    title: "Your dashboard",
    body: "Headline numbers and live charts for the whole company. Hover any chart for the detail. That's it, you're ready to go.",
    onEnter: openMenu(null),
  },
];

/** Per-user localStorage key so the tour auto-runs only once. Bump the version to re-show it. */
export const DASHBOARD_TOUR_SEEN_KEY = "maizube_tour_dashboard_v3";
