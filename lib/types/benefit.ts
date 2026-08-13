export type BenefitType = "hmo" | "pension" | "life_insurance" | "gym" | "other";
export type EnrollmentStatus = "pending" | "active" | "terminated";

export interface BenefitPlan {
  id: string;
  name: string;
  type: BenefitType;
  provider: string;
  description: string | null;
  employeeContribution: number;
  employerContribution: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Dependant {
  name: string;
  relationship: string;
  dateOfBirth?: string;
}

export interface BenefitEnrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  planId: string;
  planName: string;
  type: BenefitType;
  provider: string;
  memberNumber: string | null;
  effectiveDate: string;
  endDate: string | null;
  status: EnrollmentStatus;
  dependants: Dependant[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertBenefitPlanPayload {
  name: string;
  type: BenefitType;
  provider: string;
  description?: string;
  employeeContribution?: number;
  employerContribution?: number;
  isActive?: boolean;
}

export interface CreateEnrollmentPayload {
  employeeId: string;
  planId: string;
  effectiveDate: string;
  memberNumber?: string;
  dependants?: Dependant[];
  notes?: string;
}
