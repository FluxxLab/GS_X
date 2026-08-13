// ─── Enums (verbatim from backend src/sales/enums.ts) ────────────────────────

export type SalesReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

// ─── Sales Line ──────────────────────────────────────────────────────────────

export interface SalesLine {
  id: string;
  reportId: string;
  productId: string;
  productName: string;
  quantitySold: number;
  unitPrice: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Sales Report ────────────────────────────────────────────────────────────

export interface SalesReport {
  id: string;
  reportNumber: string;
  date: string;
  salesSupervisor: string;
  salesSupervisorId: string | null;
  status: SalesReportStatus;
  totalSalesAmount: number;
  cashReceived: number;
  transferReceived: number;
  creditSales: number;
  totalCollections: number;
  preparedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  lines: SalesLine[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesLinePayload {
  productId: string;
  quantitySold: number;
  unitPrice?: number;
}

export interface CreateSalesReportPayload {
  date: string;
  salesSupervisorId: string;
  lines: SalesLinePayload[];
  cashReceived?: number;
  transferReceived?: number;
  creditSales?: number;
  notes?: string;
}

export type UpdateSalesReportPayload = Partial<CreateSalesReportPayload>;

export interface SalesReportQueryParams {
  page?: number;
  limit?: number;
  status?: SalesReportStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Paginated Response ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
