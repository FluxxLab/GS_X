export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface OnboardingItem {
  id: string;
  onboardingId: string;
  title: string;
  description: string | null;
  category: string;
  isCompleted: boolean;
  completedAt: string | null;
  completedBy: string | null;
  isRequired: boolean;
  sortOrder: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Onboarding {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    personalEmail: string | null;
    employeeId: string;
    jobTitle: string | null;
    grossSalary: number | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
    pensionProvider: string | null;
    pensionNumber: string | null;
    taxId: string | null;
    nhfNumber: string | null;
    nin: string | null;
    userId: string | null;
    // Next of Kin
    nextOfKinName: string | null;
    nextOfKinPhone: string | null;
    nextOfKinRelationship: string | null;
    nextOfKinAddress: string | null;
    nextOfKinEmail: string | null;
    // HMO
    hmoProvider: string | null;
    hmoPlan: string | null;
    hmoId: string | null;
    hmoStartDate: string | null;
    hmoExpiryDate: string | null;
    hmoHospital: string | null;
    hmoCoverageType: string | null;
    hmoDependents: number | null;
    hmoDependentDetails:
      | { fullName: string; relationship: string; dateOfBirth: string }[]
      | null;
    department?: { id: string; name: string } | null;
  };
  status: OnboardingStatus;
  startDate: string;
  completedDate: string | null;
  completedBy: string | null;
  assignedTo: string | null;
  notes: string | null;
  items?: OnboardingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStats {
  totalOnboarding: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface OnboardingQueryParams {
  page?: number;
  limit?: number;
  status?: OnboardingStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
