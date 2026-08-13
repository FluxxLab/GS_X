import type { UserRole } from "@/lib/types/user";
import { Building2, Home, Car, UsersRound, Laptop } from "lucide-react";

export type DropdownKey =
  "hr" | "finance" | "operations" | "workspace" | "settings";

export interface NavSubItem {
  label: string;
  href: string;
}
export interface NavLink {
  label: string;
  href: string;
  subItems?: NavSubItem[];
}
export interface TopNavLink {
  label: string;
  href: string;
  hasDropdown?: DropdownKey;
}

export const hrDropdownLinks: NavLink[] = [
  { label: "Overview", href: "/dashboard/hr/analytics" },
  // ── Grouped nav: the HR bar was 12 items wide, which overflowed the strip.
  // Related pages are clustered under workflow groups (People / Attendance &
  // Leave / Hiring / …). Labels feed the role filters below — keep in sync.
  {
    label: "People",
    href: "/dashboard/employees",
    subItems: [
      { label: "Directory", href: "/dashboard/employees" },
      { label: "Org Chart", href: "/dashboard/employees/org-chart" },
      { label: "Promotions", href: "/dashboard/employees/promotions" },
      { label: "Benefits", href: "/dashboard/hr/benefits" },
      { label: "Appraisals", href: "/dashboard/hr/appraisals" },
      { label: "Awards", href: "/dashboard/hr/recognition" },
      { label: "Transfers", href: "/dashboard/hr/transfers" },
      { label: "Separations", href: "/dashboard/hr/separations" },
    ],
  },
  {
    label: "Attendance & Leave",
    href: "/dashboard/attendance",
    subItems: [
      { label: "Overview", href: "/dashboard/attendance" },
      { label: "Daily Log", href: "/dashboard/attendance/daily-log" },
      { label: "Timesheet", href: "/dashboard/attendance/timesheet" },
      { label: "My Leaves", href: "/dashboard/attendance/leave-requests" },
      {
        label: "Leave Management",
        href: "/dashboard/attendance/leave-management",
      },
      { label: "Timesheet Approvals", href: "/dashboard/hr/timesheets" },
      { label: "Remote Work", href: "/dashboard/attendance/remote-work" },
    ],
  },
  {
    label: "Hiring",
    href: "/dashboard/recruitment",
    subItems: [
      { label: "Overview", href: "/dashboard/recruitment" },
      { label: "Job Postings", href: "/dashboard/recruitment/jobs" },
      { label: "Candidates", href: "/dashboard/recruitment/candidates" },
      { label: "Interviews", href: "/dashboard/recruitment/interviews" },
      { label: "Offers", href: "/dashboard/recruitment/offers" },
      { label: "Onboarding", href: "/dashboard/onboarding" },
    ],
  },
  {
    label: "Payroll",
    href: "/dashboard/payroll",
    subItems: [
      { label: "Overview", href: "/dashboard/payroll" },
      { label: "Processing", href: "/dashboard/payroll/processing" },
      { label: "Reports", href: "/dashboard/payroll/reports" },
      { label: "Adjustments", href: "/dashboard/payroll/adjustments" },
      { label: "Staff Loans", href: "/dashboard/payroll/loans" },
      { label: "Salary Structure", href: "/dashboard/payroll/salary-structure" },
    ],
  },
  {
    label: "Contracts",
    href: "/dashboard/contracts",
    subItems: [
      { label: "Overview", href: "/dashboard/contracts" },
      { label: "All Contracts", href: "/dashboard/contracts/all" },
      { label: "Probation Reviews", href: "/dashboard/contracts/probations" },
    ],
  },
  {
    label: "Conduct & Policies",
    href: "/dashboard/hr/policies",
    subItems: [
      { label: "All Policies", href: "/dashboard/hr/policies" },
      { label: "Policy Exceptions", href: "/dashboard/hr/policies/exceptions" },
      { label: "Disciplinary", href: "/dashboard/hr/disciplinary" },
      { label: "Grievances", href: "/dashboard/hr/grievances" },
    ],
  },
  {
    label: "Settings",
    href: "/dashboard/settings/hr",
    subItems: [
      { label: "HR Configuration", href: "/dashboard/settings/hr" },
      { label: "Departments", href: "/dashboard/settings/departments" },
      { label: "Salary Grades", href: "/dashboard/settings/salary-grades" },
    ],
  },
  // "Assets" was dropped here: it was a duplicate shortcut into Operations,
  // which has the full Assets group of its own.
];

export const financeDropdownLinks: NavLink[] = [
  { label: "Overview", href: "/dashboard/finance" },
  {
    label: "Accounting",
    href: "/dashboard/finance/chart-of-accounts",
    subItems: [
      {
        label: "Chart of Accounts",
        href: "/dashboard/finance/chart-of-accounts",
      },
      { label: "General Ledger", href: "/dashboard/finance/ledger" },
      { label: "Cost Centers", href: "/dashboard/finance/cost-centers" },
      { label: "GL Reconciliation", href: "/dashboard/finance/reconciliation" },
      { label: "Fiscal Periods", href: "/dashboard/finance/fiscal-periods" },
      { label: "Deferrals & Prepayments", href: "/dashboard/finance/amortization" },
      { label: "Loans", href: "/dashboard/finance/loans" },
      { label: "Year-End Close", href: "/dashboard/finance/year-end" },
      {
        label: "Bank Reconciliation",
        href: "/dashboard/finance/bank-reconciliation",
      },
    ],
  },
  {
    label: "Transactions",
    href: "/dashboard/finance/invoices",
    subItems: [
      { label: "Customers", href: "/dashboard/finance/customers" },
      { label: "Invoices", href: "/dashboard/finance/invoices" },
      { label: "Recurring Invoices", href: "/dashboard/finance/recurring-invoices" },
      { label: "Credit Notes", href: "/dashboard/finance/credit-notes" },
      { label: "Receivables", href: "/dashboard/finance/receivables" },
      { label: "Expenses", href: "/dashboard/finance/expenses" },
      { label: "Petty Cash", href: "/dashboard/finance/petty-cash" },
      { label: "Payments", href: "/dashboard/finance/payments" },
      { label: "Online Payments", href: "/dashboard/finance/online-payments" },
      { label: "Credits & Refunds", href: "/dashboard/finance/credits" },
      {
        label: "Payment Vouchers",
        href: "/dashboard/finance/payment-vouchers",
      },
      { label: "Debit Notes", href: "/dashboard/finance/debit-notes" },
    ],
  },
  { label: "Budgets", href: "/dashboard/finance/budgets" },
  {
    label: "Assets & Tax",
    href: "/dashboard/finance/fixed-assets",
    subItems: [
      { label: "Fixed Assets", href: "/dashboard/finance/fixed-assets" },
      { label: "Filings", href: "/dashboard/finance/tax-filing" },
      { label: "Tax Schedules", href: "/dashboard/finance/tax-schedules" },
    ],
  },
  {
    label: "Reports",
    href: "/dashboard/finance/reports",
    subItems: [
      {
        label: "Profit & Loss",
        href: "/dashboard/finance/reports/profit-loss",
      },
      {
        label: "Balance Sheet",
        href: "/dashboard/finance/reports/balance-sheet",
      },
      {
        label: "Trial Balance",
        href: "/dashboard/finance/reports/trial-balance",
      },
      { label: "Cash Flow", href: "/dashboard/finance/reports/cash-flow" },
      {
        label: "Cash-Flow Forecast",
        href: "/dashboard/finance/reports/cash-flow-forecast",
      },
      {
        label: "Segment P&L",
        href: "/dashboard/finance/reports/segment-pnl",
      },
      {
        label: "Aged Receivables",
        href: "/dashboard/finance/reports/aged-receivables",
      },
      {
        label: "Customer Statement",
        href: "/dashboard/finance/reports/customer-statement",
      },
      {
        label: "Bad-Debt Provision",
        href: "/dashboard/finance/reports/bad-debt-provision",
      },
      {
        label: "Aged Payables",
        href: "/dashboard/finance/reports/aged-payables",
      },
      {
        label: "Vendor Statement",
        href: "/dashboard/finance/reports/vendor-statement",
      },
      {
        label: "Tax Summaries",
        href: "/dashboard/finance/reports/tax-summaries",
      },
    ],
  },
  { label: "Settings", href: "/dashboard/finance/settings" },
];

// Grouped into a few logical categories (rendered as nested dropdowns, like the
// Operations menu) so the workspace bar stays compact instead of one long row.
export const workspaceDropdownLinks: NavLink[] = [
  { label: "Overview", href: "/dashboard/my-workspace" },
  { label: "My Profile", href: "/dashboard/my-profile" },
  { label: "My Mail", href: "/dashboard/my-mail" },
  { label: "My Meetings", href: "/dashboard/my-meetings" },
  {
    label: "Approvals & Tasks",
    href: "#",
    subItems: [
      { label: "My Approvals", href: "/dashboard/my-approvals" },
      { label: "HR Approvals", href: "/dashboard/hr/approvals" },
      { label: "Tasks", href: "/dashboard/performance" },
      { label: "My Travel", href: "/dashboard/my-travel" },
      { label: "My Attendance", href: "/dashboard/my-attendance" },
      { label: "My Timesheets", href: "/dashboard/my-timesheets" },
      { label: "My Leaves", href: "/dashboard/attendance/leave-requests" },
      { label: "My Remote Work", href: "/dashboard/attendance/remote-work" },
      { label: "My Payslips", href: "/dashboard/my-payslips" },
      { label: "My Loans", href: "/dashboard/my-loans" },
      { label: "My Benefits", href: "/dashboard/my-benefits" },
      { label: "My Policies", href: "/dashboard/my-policies" },
      { label: "Recognition Wall", href: "/dashboard/recognition-wall" },
      { label: "My Appraisals", href: "/dashboard/my-appraisals" },
      { label: "My Grievances", href: "/dashboard/my-grievances" },
      { label: "Reports", href: "/dashboard/reports" },
      { label: "Overtime", href: "/dashboard/attendance/overtime" },
    ],
  },
  {
    label: "Finance",
    href: "#",
    subItems: [
      { label: "My Budget", href: "/dashboard/my-budget" },
      { label: "My Expenses", href: "/dashboard/my-expenses" },
      { label: "My Requisitions", href: "/dashboard/my-requisitions" },
      { label: "Payment Requests", href: "/dashboard/my-payment-requests" },
      { label: "Petty Cash", href: "/dashboard/my-petty-cash" },
      { label: "My Sales Reports", href: "/dashboard/my-sales-reports" },
    ],
  },
  {
    label: "Assets",
    href: "#",
    subItems: [
      { label: "My Assets", href: "/dashboard/my-assets" },
      { label: "My Vehicle", href: "/dashboard/my-vehicle" },
      { label: "My Trips", href: "/dashboard/my-trips" },
      { label: "My Work Orders", href: "/dashboard/my-work-orders" },
    ],
  },
  {
    label: "Onboarding & Exit",
    href: "#",
    subItems: [
      { label: "My Onboarding", href: "/dashboard/my-onboarding" },
      { label: "My Exit", href: "/dashboard/my-exit" },
    ],
  },
];

export const operationsDropdownLinks: NavLink[] = [
  { label: "Overview", href: "/dashboard/operations" },
  { label: "Stores", href: "/dashboard/operations/stores" },
  {
    label: "Assets",
    href: "/dashboard/operations/assets",
    subItems: [
      { label: "Asset Register", href: "/dashboard/operations/assets" },
      {
        label: "Assignments",
        href: "/dashboard/operations/assets/assignments",
      },
      {
        label: "Asset Requests",
        href: "/dashboard/operations/assets/requests",
      },
      {
        label: "Asset Approvals",
        href: "/dashboard/operations/assets/approvals",
      },
      {
        label: "Incident Reports",
        href: "/dashboard/operations/assets/incidents",
      },
    ],
  },
  {
    label: "Logistics",
    href: "/dashboard/operations/fleet",
    subItems: [
      { label: "Fleet", href: "/dashboard/operations/fleet" },
      { label: "Fuel Log", href: "/dashboard/operations/fleet/fuel-log" },
      { label: "Trips", href: "/dashboard/operations/fleet/trips" },
    ],
  },
  {
    label: "Maintenance",
    href: "/dashboard/operations/maintenance",
    subItems: [
      { label: "Work Orders", href: "/dashboard/operations/maintenance" },
      {
        label: "PM Schedules",
        href: "/dashboard/operations/maintenance/schedules",
      },
    ],
  },
  {
    label: "Production",
    href: "/dashboard/operations/production",
    subItems: [
      { label: "Production Reports", href: "/dashboard/operations/production" },
      {
        label: "Inventory",
        href: "/dashboard/operations/production/inventory",
      },
      {
        label: "Inventory Valuation",
        href: "/dashboard/operations/production/inventory/valuation",
      },
      {
        label: "Quality Control",
        href: "/dashboard/operations/production/quality",
      },
    ],
  },
  {
    label: "Sales",
    href: "/dashboard/operations/sales",
    subItems: [
      { label: "Daily Reports", href: "/dashboard/operations/sales" },
      // Orders placed on the public storefront.
      { label: "Storefront Orders", href: "/dashboard/sales/orders" },
    ],
  },
  { label: "Travel Requests", href: "/dashboard/travel-requests" },
  {
    label: "Procurement",
    href: "/dashboard/operations/procurement/requisitions",
    subItems: [
      {
        label: "Requisitions",
        href: "/dashboard/operations/procurement/requisitions",
      },
      { label: "Vendors", href: "/dashboard/finance/vendors" },
      { label: "RFQ", href: "/dashboard/operations/procurement/rfq" },
      { label: "Purchase Orders", href: "/dashboard/finance/purchase-orders" },
      { label: "GRN", href: "/dashboard/finance/grn" },
      {
        label: "Contracts",
        href: "/dashboard/operations/procurement/contracts",
      },
    ],
  },
  { label: "Projects", href: "/dashboard/operations/projects" },
  {
    label: "Admin",
    href: "/dashboard/finance/petty-cash",
    subItems: [{ label: "Petty Cash", href: "/dashboard/finance/petty-cash" }],
  },
];

// Grouped into a few logical categories (rendered as nested dropdowns, like the
// Operations menu) so the settings bar stays compact instead of one long row
// that overflows off-screen.
export const settingsDropdownLinks: NavLink[] = [
  { label: "Overview", href: "/dashboard/settings" },
  // The public website's blog. Filed under Settings because this dropdown is
  // already admin-gated; a "Content" top nav could come later as it grows
  // (pages, media), which would need a new DropdownKey and its own role filter.
  {
    label: "Blog",
    href: "/dashboard/content/blog",
    subItems: [
      { label: "Posts", href: "/dashboard/content/blog" },
      { label: "Comments", href: "/dashboard/content/blog/comments" },
    ],
  },
  {
    label: "Team",
    // Group landing = its first child; /dashboard/team never existed.
    href: "/dashboard/users",
    subItems: [
      { label: "All Users", href: "/dashboard/users" },
      { label: "Roles", href: "/dashboard/users/roles" },
      { label: "Permissions", href: "/dashboard/settings/permissions" },
      { label: "Audit Logs", href: "/dashboard/users/audit-logs" },
      {label: "Team", href:"/dashboard/content/team"},
      { label: "Testimonials", href: "/dashboard/content/testimonials"},

    ],
  },
  {
    label: "Organization",
    href: "/dashboard/settings/departments",
    subItems: [
      { label: "Departments", href: "/dashboard/settings/departments" },
      {
        // Creation is a modal on the departments page (no /create route);
        // ?new=1 tells the page to open it on arrival.
        label: "New Department",
        href: "/dashboard/settings/departments?new=1",
      },
      { label: "Projects", href: "/dashboard/operations/projects" },
    ],
  },
  {
    label: "HR & Payroll",
    href: "/dashboard/settings/hr",
    subItems: [
      { label: "HR Configuration", href: "/dashboard/settings/hr" },
      { label: "Salary Grades", href: "/dashboard/settings/salary-grades" },
      { label: "Leave Policies", href: "/dashboard/settings/leave-policies" },
      { label: "Benefit Plans", href: "/dashboard/settings/benefit-plans" },
      { label: "Travel Per-Diem", href: "/dashboard/settings/travel-per-diem" },
      { label: "Approval Levels", href: "/dashboard/settings/approvals" },
    ],
  },
  {
    label: "System",
    href: "/dashboard/settings/general",
    subItems: [
      { label: "General", href: "/dashboard/settings/general" },
      { label: "Security", href: "/dashboard/settings/security" },
      { label: "Notifications", href: "/dashboard/settings/notifications" },
      { label: "Integrations", href: "/dashboard/settings/integrations" },
      { label: "Lookups", href: "/dashboard/settings/lookups" },
      { label: "Audit Log", href: "/dashboard/settings/audit-log" },
      { label: "Backup & Data", href: "/dashboard/settings/backup" },
    ],
  },
];

export const topNavLinks: TopNavLink[] = [
  { label: "Dashboard", href: "/dashboard/home" },
  { label: "HR & Payroll", href: "#", hasDropdown: "hr" },
  { label: "Finance", href: "#", hasDropdown: "finance" },
  { label: "Operations", href: "#", hasDropdown: "operations" },
  { label: "My Workspace", href: "#", hasDropdown: "workspace" },
  { label: "Settings", href: "#", hasDropdown: "settings" },
];

// Lucide components rather than emoji: emoji render inconsistently across
// platforms and clash with the app's icon language. Consumers render <m.icon/>.
export const WORK_MODES = [
  { value: "office", label: "Office", icon: Building2 },
  { value: "work_from_home", label: "Work from Home", icon: Home },
  { value: "field_work", label: "Field Work", icon: Car },
  { value: "client_visit", label: "Client Visit", icon: UsersRound },
  { value: "remote", label: "Remote", icon: Laptop },
];

// ─── Role-based menu visibility ──────────────────────────────────────────────
// Roles that can see admin-level menus
export const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "managing_director",
  "hr_manager",
  "finance_controller",
];
// Roles allowed to see the company-wide financial overview (revenue / profit /
// cash / receivables) on the home dashboard. Executives only: the finance
// controller works inside the Finance module but does not get the company
// P&L splash on landing.
export const EXECUTIVE_ROLES: UserRole[] = [
  "super_admin",
  "managing_director",
];
export const MANAGER_ROLES: UserRole[] = [
  ...ADMIN_ROLES,
  "operations_manager",
  "warehouse_manager",
  "department_head",
];

// HR dropdown items that require elevated access
// "Hiring" covers what used to be the separate Recruitment + Onboarding items.
const HR_ADMIN_ITEMS = [
  "Hiring",
  "Contracts",
  "Settings",
];
const HR_MANAGER_ITEMS = ["Leave Management", "Daily Log", "Timesheet Approvals"];
const PAYROLL_ADMIN_ITEMS = ["Processing"];

// Top nav items that require admin access
const ADMIN_TOP_NAV = ["Finance", "Settings"];

// Top nav items only visible to HR manager and super admin
const HR_TOP_NAV = ["HR & Payroll"];

export function filterHrLinks(links: NavLink[], role: UserRole): NavLink[] {
  const isAdmin = ADMIN_ROLES.includes(role);
  const isManager = MANAGER_ROLES.includes(role);

  return links
    .filter((link) => {
      // Admin-only sections
      if (HR_ADMIN_ITEMS.includes(link.label) && !isAdmin) return false;
      return true;
    })
    .map((link) => {
      if (!link.subItems) return link;

      const filteredSubs = link.subItems.filter((sub) => {
        // Manager-only sub items under Attendance
        if (HR_MANAGER_ITEMS.includes(sub.label) && !isManager) return false;
        // Payroll admin items
        if (PAYROLL_ADMIN_ITEMS.includes(sub.label) && !isAdmin) return false;
        return true;
      });

      return {
        ...link,
        subItems: filteredSubs.length > 0 ? filteredSubs : undefined,
      };
    });
}

export function filterTopNav(
  links: TopNavLink[],
  role: UserRole,
): TopNavLink[] {
  const isAdmin = ADMIN_ROLES.includes(role);
  const isHrOrSuper = role === "super_admin" || role === "hr_manager";
  return links.filter((link) => {
    if (ADMIN_TOP_NAV.includes(link.label) && !isAdmin) return false;
    if (HR_TOP_NAV.includes(link.label) && !isHrOrSuper) return false;
    return true;
  });
}

/** The sub-nav link set for the currently-open dropdown (HR is role-filtered). */
export function dropdownLinksFor(key: DropdownKey, role: UserRole): NavLink[] {
  switch (key) {
    case "hr":
      return filterHrLinks(hrDropdownLinks, role);
    case "finance":
      return financeDropdownLinks;
    case "operations":
      return operationsDropdownLinks;
    case "workspace":
      return workspaceDropdownLinks;
    case "settings":
      return settingsDropdownLinks;
  }
}
