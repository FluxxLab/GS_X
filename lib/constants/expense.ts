import { Zap, Wrench, Truck, Building2, ShoppingCart, Receipt, type Fuel } from "lucide-react";
import type { ExpenseStatus, ExpenseCategory } from "@/lib/types/finance";

export type DisplayStatus = "Approved" | "HOD Approved" | "Pending" | "Rejected" | "Draft";
export type DisplayCategory = "Fuel & Energy" | "Maintenance" | "Transport" | "Utilities" | "Office Supplies" | "Rent" | "Other";

export const ITEMS_PER_PAGE = 20;

export const STATUS_DISPLAY: Record<ExpenseStatus, DisplayStatus> = {
  APPROVED: "Approved",
  HOD_APPROVED: "HOD Approved",
  PENDING: "Pending",
  REJECTED: "Rejected",
  DRAFT: "Draft",
};

export const CATEGORY_DISPLAY: Record<ExpenseCategory, DisplayCategory> = {
  FUEL_ENERGY: "Fuel & Energy",
  MAINTENANCE: "Maintenance",
  TRANSPORT: "Transport",
  UTILITIES: "Utilities",
  OFFICE_SUPPLIES: "Office Supplies",
  RENT: "Rent",
  OTHER: "Other",
};

export const CATEGORY_TO_API: Record<DisplayCategory, ExpenseCategory> = {
  "Fuel & Energy": "FUEL_ENERGY",
  "Maintenance": "MAINTENANCE",
  "Transport": "TRANSPORT",
  "Utilities": "UTILITIES",
  "Office Supplies": "OFFICE_SUPPLIES",
  "Rent": "RENT",
  "Other": "OTHER",
};

export const STATUS_TO_API: Record<string, ExpenseStatus> = {
  Approved: "APPROVED",
  "HOD Approved": "HOD_APPROVED",
  Pending: "PENDING",
  Rejected: "REJECTED",
  Draft: "DRAFT",
};

export const STATUS_BADGE: Record<DisplayStatus, { bg: string; dot: string; color: string }> = {
  Approved:       { bg: "#D1FAE5", dot: "#10B981", color: "#065F46" },
  "HOD Approved": { bg: "#DBEAFE", dot: "#3B82F6", color: "#1E40AF" },
  Pending:        { bg: "#FEF3C7", dot: "#F59E0B", color: "#92400E" },
  Rejected:       { bg: "#FEE2E2", dot: "#EF4444", color: "#991B1B" },
  Draft:          { bg: "#F4F6FB", dot: "#8B93AD", color: "#70768E" },
};

export const CATEGORY_ICON: Record<DisplayCategory, { icon: typeof Fuel; color: string; bg: string }> = {
  "Fuel & Energy":   { icon: Zap, color: "#D97706", bg: "rgba(217,119,6,0.08)" },
  "Maintenance":     { icon: Wrench, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  "Transport":       { icon: Truck, color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  "Utilities":       { icon: Zap, color: "#0EA5E9", bg: "rgba(14,165,233,0.08)" },
  "Office Supplies": { icon: ShoppingCart, color: "#059669", bg: "rgba(5,150,105,0.08)" },
  "Rent":            { icon: Building2, color: "#70768E", bg: "rgba(112, 118, 142,0.08)" },
  "Other":           { icon: Receipt, color: "#8B93AD", bg: "rgba(139, 147, 173,0.08)" },
};

export const DISPLAY_CATEGORIES: DisplayCategory[] = ["Fuel & Energy", "Maintenance", "Transport", "Utilities", "Office Supplies", "Rent", "Other"];
export const STATUS_FILTERS = ["All", "HOD Approved", "Approved", "Rejected"];

export function getInitials(name: string): string {
  return name.split(/\s+/).map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();
}

export function formatExpenseDate(d: string): string {
  const dateStr = d.includes("T") ? d : d + "T00:00:00";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
