// ─── Enums ──────────────────────────────────────────────────────────────────

export type SeparationType = 'RESIGNATION' | 'TERMINATION' | 'REDUNDANCY' | 'RETIREMENT' | 'END_OF_CONTRACT' | 'DEATH_IN_SERVICE';
export type SeparationStatus = 'INITIATED' | 'NOTICE_PERIOD' | 'CLEARANCE' | 'SETTLEMENT' | 'COMPLETED' | 'CANCELLED';
export type NoticeType = 'SERVE' | 'PAY_IN_LIEU' | 'WAIVED';
export type HandoverCategory = 'ONGOING_PROJECT' | 'KEY_CONTACT' | 'SYSTEM_ACCESS' | 'PENDING_ITEM' | 'DOCUMENT_LOCATION' | 'GENERAL_NOTE';
export type HandoverPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type HandoverStatus = 'PENDING' | 'IN_PROGRESS' | 'TRANSFERRED' | 'COMPLETED';
export type SettlementStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID';

// ─── Entities ───────────────────────────────────────────────────────────────

export interface ClearanceItem {
  id: string;
  separationId: string;
  department: string;
  task: string;
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HandoverNote {
  id: string;
  separationId: string;
  category: HandoverCategory;
  title: string;
  description: string;
  priority: HandoverPriority;
  assignedTo: string | null;
  dueDate: string | null;
  status: HandoverStatus;
  attachmentUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinalSettlement {
  id: string;
  separationId: string;
  outstandingSalary: number;
  proratedBonus: number;
  unusedLeaveDays: number;
  leaveEncashment: number;
  gratuity: number;
  severancePay: number;
  otherBenefits: number;
  otherBenefitsDescription: string | null;
  totalEntitlements: number;
  outstandingLoans: number;
  assetDeductions: number;
  trainingBondDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  otherDeductionsDescription: string | null;
  totalDeductions: number;
  netSettlement: number;
  status: SettlementStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  notes: string | null;
  nextOfKinName: string | null;
  nextOfKinRelationship: string | null;
  nextOfKinPhone: string | null;
  nextOfKinBankName: string | null;
  nextOfKinAccountNumber: string | null;
  nextOfKinAccountName: string | null;
  insurancePayout: number;
  pensionBalance: number;
  yearsOfService: number;
  redundancyPay: number;
  createdAt: string;
  updatedAt: string;
}

export interface Separation {
  id: string;
  employeeId: string | null;
  employeeName: string;
  department: string;
  jobTitle: string;
  type: SeparationType;
  reason: string;
  status: SeparationStatus;
  initiatedBy: string;
  initiatedAt: string;
  effectiveDate: string;
  lastWorkingDay: string;
  noticePeriodDays: number;
  noticeType: NoticeType;
  noticeStartDate: string | null;
  noticeEndDate: string | null;
  exitInterviewCompleted: boolean;
  exitInterviewNotes: string | null;
  managerSignOff: boolean;
  managerSignOffBy: string | null;
  hrSignOff: boolean;
  hrSignOffBy: string | null;
  notes: string | null;
  clearanceItems: ClearanceItem[];
  handoverNotes: HandoverNote[];
  settlement: FinalSettlement | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Create / Update Payloads ───────────────────────────────────────────────

export interface CreateSeparationPayload {
  employeeId?: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  type: SeparationType;
  reason: string;
  effectiveDate: string;
  lastWorkingDay: string;
  noticePeriodDays?: number;
  noticeType?: NoticeType;
  notes?: string;
}

export interface UpdateSeparationPayload extends Partial<CreateSeparationPayload> {
  status?: SeparationStatus;
  exitInterviewCompleted?: boolean;
  exitInterviewNotes?: string;
}

export interface CreateHandoverNotePayload {
  separationId: string;
  category: HandoverCategory;
  title: string;
  description: string;
  priority?: HandoverPriority;
  assignedTo?: string;
  dueDate?: string;
  attachmentUrl?: string;
}

export interface UpdateHandoverNotePayload extends Partial<CreateHandoverNotePayload> {
  status?: HandoverStatus;
}

export interface UpdateClearanceItemPayload {
  completed?: boolean;
  completedBy?: string;
  notes?: string;
}

export interface UpdateSettlementPayload {
  outstandingSalary?: number;
  proratedBonus?: number;
  unusedLeaveDays?: number;
  leaveEncashment?: number;
  gratuity?: number;
  severancePay?: number;
  otherBenefits?: number;
  otherBenefitsDescription?: string;
  outstandingLoans?: number;
  assetDeductions?: number;
  trainingBondDeduction?: number;
  taxDeduction?: number;
  otherDeductions?: number;
  otherDeductionsDescription?: string;
  notes?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  nextOfKinBankName?: string;
  nextOfKinAccountNumber?: string;
  nextOfKinAccountName?: string;
  insurancePayout?: number;
  pensionBalance?: number;
  yearsOfService?: number;
  redundancyPay?: number;
}

// ─── Bulk Separation ────────────────────────────────────────────────────────

export interface BulkSeparationEmployee {
  employeeName: string;
  department: string;
  jobTitle: string;
  employeeId?: string;
}

export interface BulkSeparationPayload {
  type: SeparationType;
  reason: string;
  effectiveDate: string;
  lastWorkingDay: string;
  noticePeriodDays?: number;
  notes?: string;
  employees: BulkSeparationEmployee[];
}

// ─── Query Params ───────────────────────────────────────────────────────────

export interface SeparationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: SeparationStatus;
  type?: SeparationType;
  department?: string;
  search?: string;
}

// ─── Paginated Response ─────────────────────────────────────────────────────

export interface PaginatedSeparations {
  data: Separation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
