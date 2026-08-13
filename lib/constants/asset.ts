import type { AssetCategory } from "@/lib/types/finance";

/**
 * Single source of truth for the fixed-asset categories. The `value` is the
 * backend `AssetCategory` enum (what gets stored / filtered on); the `label` is
 * the human display text. Use this everywhere a category dropdown, tab, or badge
 * is rendered so the frontend can't drift from the enum or from itself.
 */
export const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: "VEHICLE", label: "Vehicle" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "IT_EQUIPMENT", label: "IT Equipment" },
  { value: "PIPELINE", label: "Pipeline" },
  { value: "BUILDING", label: "Building" },
  { value: "SOFTWARE", label: "Software" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "LAND", label: "Land" },
  { value: "TREATMENT_PLANT", label: "Treatment Plant" },
  { value: "OTHER", label: "Other" },
];

const LABELS: Record<string, string> = Object.fromEntries(
  ASSET_CATEGORIES.map((c) => [c.value, c.label]),
);

/** Display label for a category enum value (falls back to a de-underscored value). */
export const assetCategoryLabel = (c: string | null | undefined): string =>
  (c && LABELS[c]) || (c || "").replace(/_/g, " ");

/** Badge colours keyed by category enum value. */
export const ASSET_CATEGORY_BADGE: Record<string, { bg: string; color: string }> = {
  LAND:            { bg: "#ECFDF5", color: "#065F46" },
  BUILDING:        { bg: "#EFF6FF", color: "#1E40AF" },
  VEHICLE:         { bg: "#FEF3C7", color: "#92400E" },
  EQUIPMENT:       { bg: "#F3E8FF", color: "#6B21A8" },
  FURNITURE:       { bg: "#FFF7ED", color: "#9A3412" },
  IT_EQUIPMENT:    { bg: "#E0E7FF", color: "#3730A3" },
  PIPELINE:        { bg: "#CCFBF1", color: "#115E59" },
  TREATMENT_PLANT: { bg: "#FCE7F3", color: "#9D174D" },
  SOFTWARE:        { bg: "#F0F9FF", color: "#0C4A6E" },
  OTHER:           { bg: "#F4F6FB", color: "#70768E" },
};
