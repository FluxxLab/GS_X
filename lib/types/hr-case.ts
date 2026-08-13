export type DisciplinaryStatus =
  | "open"
  | "under_review"
  | "hearing"
  | "action_taken"
  | "appealed"
  | "closed"
  | "dismissed";

export type DisciplinaryAction =
  | "none"
  | "verbal_warning"
  | "written_warning"
  | "final_warning"
  | "suspension"
  | "dismissal";

export interface DisciplinaryCase {
  id: string;
  caseNumber: string;
  employeeId: string;
  employeeName: string;
  category: string;
  description: string;
  incidentDate: string | null;
  status: DisciplinaryStatus;
  action: DisciplinaryAction;
  hearingDate: string | null;
  outcome: string | null;
  appealNote: string | null;
  appealOutcome: string | null;
  raisedBy: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisciplinaryPayload {
  employeeId: string;
  category: string;
  description: string;
  incidentDate?: string;
}

export interface UpdateDisciplinaryPayload {
  status?: DisciplinaryStatus;
  action?: DisciplinaryAction;
  hearingDate?: string;
  outcome?: string;
}

export type GrievanceStatus =
  | "submitted"
  | "under_review"
  | "resolved"
  | "dismissed"
  | "escalated";

export interface GrievanceCase {
  id: string;
  caseNumber: string;
  employeeId: string;
  employeeName: string;
  category: string;
  description: string;
  confidential: boolean;
  status: GrievanceStatus;
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGrievancePayload {
  employeeId: string;
  category: string;
  description: string;
  confidential?: boolean;
}

export interface UpdateGrievancePayload {
  status?: GrievanceStatus;
  resolution?: string;
}

/** Self-service submission — no employeeId (resolved from the auth token). */
export interface SelfCreateGrievancePayload {
  category: string;
  description: string;
  confidential?: boolean;
}
