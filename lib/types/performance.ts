import type { Employee } from './employee';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'submitted' | 'completed' | 'rejected' | 'overdue' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string;
  assignee?: Employee;
  assignedById: string;
  assignedBy?: Employee;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedDate: string | null;
  progressPercent: number;
  completionNotes: string | null;
  submittedDate: string | null;
  submissionEvidence: string | null;
  rejectionReason: string | null;
  verifiedDate: string | null;
  quarter: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Kpi {
  id: string;
  title: string;
  description: string | null;
  employeeId: string;
  employee?: Employee;
  assignedById: string;
  assignedBy?: Employee;
  quarter: string;
  year: number;
  targetValue: number;
  actualValue: number;
  unit: string;
  weight: number;
  rating: number | null;
  managerComment: string | null;
  employeeComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  completionRate: number;
}

export interface EmployeePerformance {
  employeeId: string;
  quarter: string;
  year: number;
  tasks: { total: number; completed: number; completionRate: number };
  kpis: { total: number; rated: number; avgRating: number; achievement: number };
  overallScore: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigneeId: string;
  priority?: TaskPriority;
  dueDate: string;
  quarter?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  progressPercent?: number;
  completionNotes?: string;
}

export interface CreateKpiPayload {
  title: string;
  description?: string;
  employeeId: string;
  quarter: string;
  year: number;
  targetValue: number;
  unit?: string;
  weight?: number;
}

export interface UpdateKpiPayload {
  actualValue?: number;
  rating?: number;
  managerComment?: string;
  employeeComment?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
