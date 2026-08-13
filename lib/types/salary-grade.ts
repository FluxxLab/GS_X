export interface SalaryGrade {
  id: string;
  level: string;
  label: string;
  description: string | null;
  minimumSalary: number;
  maximumSalary: number;
  steps: number;
  stepIncrement: number | null;
  currency: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryStep {
  step: number;
  salary: number;
}

export interface CreateSalaryGradePayload {
  level: string;
  label: string;
  description?: string;
  minimumSalary: number;
  maximumSalary: number;
  steps?: number;
  stepIncrement?: number;
  currency?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateSalaryGradePayload = Partial<CreateSalaryGradePayload>;
