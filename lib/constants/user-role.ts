/**
 * Static data + types for the Roles & Permissions page. Promoted from the page
 * so the container stays thin. Values are byte-for-byte from the original page.
 */

export interface RoleSummary {
  name: string;
  users: number;
  description: string;
  color: string;
}

export type PermMap = Record<string, Record<string, boolean>>;

export const roles: RoleSummary[] = [
  {
    name: "Super Admin",
    users: 2,
    description: "Full system access with all permissions",
    color: "#EF4444",
  },
  {
    name: "HR Manager",
    users: 4,
    description: "Manage HR module, recruitment, and employee data",
    color: "#081340",
  },
  {
    name: "Finance Officer",
    users: 3,
    description: "Access finance module, invoices, and payments",
    color: "#059669",
  },
  {
    name: "Inventory Officer",
    users: 5,
    description: "Manage stock, warehouses, and requisitions",
    color: "#F59E0B",
  },
  {
    name: "Operations Manager",
    users: 3,
    description: "Monitor production, tasks, and logistics",
    color: "#7C3AED",
  },
  {
    name: "Employee",
    users: 231,
    description: "Basic access to personal profile and leave",
    color: "#70768E",
  },
];

export const modules = [
  "HR",
  "Finance",
  "Operations",
  "Inventory",
  "Projects",
  "User Management",
  "Settings",
  "Reports",
];

export const permissionTypes = ["View", "Create", "Edit", "Delete", "Approve"];

const allTrue: PermMap = modules.reduce((acc, mod) => {
  acc[mod] = permissionTypes.reduce((p, t) => ({ ...p, [t]: true }), {});
  return acc;
}, {} as PermMap);

function makePerms(config: Record<string, string | boolean>): PermMap {
  const result: PermMap = {};
  for (const mod of modules) {
    const val = config[mod];
    if (val === "all") {
      result[mod] = permissionTypes.reduce(
        (p, t) => ({ ...p, [t]: true }),
        {}
      );
    } else if (val === "none" || val === undefined) {
      result[mod] = permissionTypes.reduce(
        (p, t) => ({ ...p, [t]: false }),
        {}
      );
    } else if (typeof val === "string") {
      const allowed = val.split(",").map((s) => s.trim().toLowerCase());
      result[mod] = permissionTypes.reduce(
        (p, t) => ({ ...p, [t]: allowed.includes(t.toLowerCase()) }),
        {}
      );
    }
  }
  return result;
}

/** Builds an all-false permission map (used to seed the create-role form). */
export function emptyPermMap(): PermMap {
  return modules.reduce((acc, mod) => {
    acc[mod] = permissionTypes.reduce((p, t) => ({ ...p, [t]: false }), {});
    return acc;
  }, {} as PermMap);
}

export const permissionsData: Record<string, PermMap> = {
  "Super Admin": allTrue,
  "HR Manager": makePerms({
    HR: "all",
    Finance: "view",
    Operations: "view",
    Inventory: "view",
    Projects: "view,create",
    "User Management": "none",
    Settings: "view",
    Reports: "view,create",
  }),
  "Finance Officer": makePerms({
    HR: "view",
    Finance: "all",
    Operations: "view",
    Inventory: "view",
    Projects: "view",
    "User Management": "none",
    Settings: "view",
    Reports: "all",
  }),
  "Inventory Officer": makePerms({
    HR: "none",
    Finance: "view",
    Operations: "view",
    Inventory: "all",
    Projects: "view",
    "User Management": "none",
    Settings: "none",
    Reports: "view,create",
  }),
  "Operations Manager": makePerms({
    HR: "view",
    Finance: "view",
    Operations: "all",
    Inventory: "view,create,edit",
    Projects: "all",
    "User Management": "none",
    Settings: "view",
    Reports: "view,create",
  }),
  Employee: makePerms({
    HR: "view",
    Finance: "view",
    Operations: "none",
    Inventory: "none",
    Projects: "view",
    "User Management": "none",
    Settings: "view",
    Reports: "none",
  }),
};
