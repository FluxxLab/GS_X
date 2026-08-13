import { apiClient } from "../api/client";

export interface HrAnalytics {
  headcount: number;
  newHiresThisMonth: number;
  newHiresThisYear: number;
  separationsThisYear: number;
  attritionRatePct: number;
  openVacancies: number;
  monthlyPayrollCost: number;
  costPerEmployee: number;
  leaveDaysUsedThisYear: number;
  avgLeaveDaysPerEmployee: number;
  headcountByDepartment: { department: string; count: number }[];
  headcountByEmploymentType: { type: string; count: number }[];
  genderDiversity: { gender: string; count: number }[];
  hiresTrend: { month: string; hires: number }[];
}

export const hrAnalyticsService = {
  getDashboard(): Promise<HrAnalytics> {
    return apiClient.get<HrAnalytics>("/hr-analytics/dashboard");
  },
};
