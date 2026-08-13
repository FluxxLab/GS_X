import type { CreateLookupPayload } from "@/lib/types/lookup";
import type { CreateSalaryGradePayload } from "@/lib/types/salary-grade";
import type { CreateOfficeIpPayload } from "@/lib/types/attendance";

/** A configurable HR lookup category (tab) on the HR Configuration page. */
export interface HrCategory {
  key: string;
  label: string;
  singular: string;
  valuePlaceholder: string;
  labelPlaceholder: string;
  descPlaceholder: string;
}

/**
 * Tab definitions for the HR Configuration page, preserved byte-for-byte from
 * the original page. `salary_grades` and `office_ips` are special-cased tabs
 * that render their own tables/modals rather than the generic lookup table.
 */
export const HR_CATEGORIES: HrCategory[] = [
  { key: "employment_type", label: "Employment Types", singular: "Employment Type", valuePlaceholder: "e.g. full_time", labelPlaceholder: "e.g. Full-time", descPlaceholder: "Brief description of this employment type" },
  { key: "gender", label: "Gender", singular: "Gender", valuePlaceholder: "e.g. male", labelPlaceholder: "e.g. Male", descPlaceholder: "" },
  { key: "marital_status", label: "Marital Status", singular: "Marital Status", valuePlaceholder: "e.g. single", labelPlaceholder: "e.g. Single", descPlaceholder: "" },
  { key: "nationality", label: "Nationalities", singular: "Nationality", valuePlaceholder: "e.g. nigerian", labelPlaceholder: "e.g. Nigerian", descPlaceholder: "" },
  { key: "state_of_origin", label: "States of Origin", singular: "State of Origin", valuePlaceholder: "e.g. lagos", labelPlaceholder: "e.g. Lagos", descPlaceholder: "" },
  { key: "city", label: "Cities", singular: "City", valuePlaceholder: "e.g. lagos", labelPlaceholder: "e.g. Lagos", descPlaceholder: "" },
  { key: "tax_type", label: "Tax Types", singular: "Tax Type", valuePlaceholder: "e.g. paye", labelPlaceholder: "e.g. PAYE Tax", descPlaceholder: "" },
  { key: "candidate_source", label: "Candidate Sources", singular: "Candidate Source", valuePlaceholder: "e.g. linkedin", labelPlaceholder: "e.g. LinkedIn", descPlaceholder: "How candidates find and apply through this channel" },
  { key: "hmo_provider", label: "HMO Providers", singular: "HMO Provider", valuePlaceholder: "e.g. hygeia", labelPlaceholder: "e.g. Hygeia HMO", descPlaceholder: "Health Maintenance Organization" },
  { key: "hmo_plan", label: "HMO Plans", singular: "HMO Plan", valuePlaceholder: "e.g. premium", labelPlaceholder: "e.g. Premium Plan", descPlaceholder: "Coverage tier" },
  { key: "kin_relationship", label: "Kin Relationships", singular: "Relationship", valuePlaceholder: "e.g. spouse", labelPlaceholder: "e.g. Spouse", descPlaceholder: "" },
  { key: "salary_grades", label: "Salary Grades", singular: "Salary Grade", valuePlaceholder: "", labelPlaceholder: "", descPlaceholder: "" },
  { key: "office_ips", label: "Office IPs", singular: "Office IP", valuePlaceholder: "", labelPlaceholder: "", descPlaceholder: "" },
];

export const LOOKUP_COLUMNS = ["S/N", "Value", "Label", "Description", "Sort Order", "System", "Status", "Actions"];
export const OFFICE_IP_COLUMNS = ["S/N", "IP Address", "Label", "Description", "Status", "Actions"];
export const HR_SALARY_GRADE_COLUMNS = ["S/N", "Grade", "Label", "Min Salary", "Max Salary", "Steps", "Step Increment", "Status", "Actions"];

/** Empty/default values for the create-lookup form (preserved). */
export const EMPTY_LOOKUP_FORM = (category: string): CreateLookupPayload => ({
  category,
  value: "",
  label: "",
  description: "",
  sortOrder: 0,
  isActive: true,
  metadata: {},
});

/** Empty/default values for the create-salary-grade form on the HR page (preserved). */
export const EMPTY_HR_GRADE_FORM: CreateSalaryGradePayload = {
  level: "",
  label: "",
  minimumSalary: 0,
  maximumSalary: 0,
  steps: 10,
  description: "",
  sortOrder: 0,
  isActive: true,
};

/** Empty/default values for the create-office-IP form (preserved). */
export const EMPTY_OFFICE_IP_FORM: CreateOfficeIpPayload = {
  ip: "",
  label: "",
  description: "",
  isActive: true,
};
