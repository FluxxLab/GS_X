export type RecognitionType =
  | "employee_of_the_month"
  | "employee_of_the_quarter"
  | "employee_of_the_year"
  | "certificate"
  | "bonus"
  | "commendation";

export type RecognitionStatus = "nominated" | "approved" | "rejected";

export interface Recognition {
  id: string;
  reference: string;
  employeeId: string;
  employeeName: string;
  employeeStaffId: string | null;
  departmentName: string | null;
  valueKey: string;
  valueName: string;
  type: RecognitionType;
  period: string | null;
  citation: string;
  status: RecognitionStatus;
  isPublic: boolean;
  bonusAmount: number | null;
  /** Set once an approved bonus reaches payroll. Null = it did not queue. */
  payrollAdjustmentId: string | null;
  nominatedBy: string | null;
  nominatedByName: string | null;
  decidedBy: string | null;
  decidedByName: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NominateRecognitionPayload {
  employeeId: string;
  valueKey: string;
  type: RecognitionType;
  period?: string;
  citation: string;
  bonusAmount?: number;
  isPublic?: boolean;
}

export interface DecideRecognitionPayload {
  decisionNote?: string;
  bonusAmount?: number;
}

export interface ValueBreakdownRow {
  valueKey: string;
  valueName: string;
  count: number;
}
