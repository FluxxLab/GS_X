import { apiClient } from '../api/client';
import type {
  Attendance,
  AttendanceStats,
  MonthlyReport,
  LeaveRequest,
  LeaveBalance,
  LeaveAccrualPolicy,
  LeaveQueryParams,
  ClockInPayload,
  ClockOutPayload,
  CreateLeaveRequestPayload,
  PaginatedResponse,
  OfficeIp,
  CreateOfficeIpPayload,
  UpdateOfficeIpPayload,
  RemoteWorkRequest,
  CreateRemoteWorkRequestPayload,
  RemoteWorkQueryParams,
  OvertimeRequest,
  CreateOvertimeRequestPayload,
  OvertimeQueryParams,
} from '../types/attendance';

const PATH = '/attendance';

export const attendanceService = {
  // ─── Attendance ────────────────────────────────────────────────────────────

  clockIn(data: ClockInPayload): Promise<Attendance> {
    return apiClient.post<Attendance>(`${PATH}/clock-in`, data);
  },

  clockOut(data: ClockOutPayload): Promise<Attendance> {
    return apiClient.post<Attendance>(`${PATH}/clock-out`, data);
  },

  getToday(departmentId?: string): Promise<Attendance[]> {
    return apiClient.get<Attendance[]>(
      `${PATH}/today`,
      departmentId ? { departmentId } : undefined,
    );
  },

  getDailyLog(date: string, departmentId?: string): Promise<Attendance[]> {
    return apiClient.get<Attendance[]>(`${PATH}/daily-log`, {
      date,
      ...(departmentId ? { departmentId } : {}),
    });
  },

  getEmployeeAttendance(
    employeeId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Attendance[]> {
    return apiClient.get<Attendance[]>(`${PATH}/employee/${employeeId}`, {
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    });
  },

  // ─── Self-service ─────────────────────────────────────────────────────────────

  getMyAttendance(dateFrom?: string, dateTo?: string): Promise<Attendance[]> {
    return apiClient.get<Attendance[]>(`${PATH}/my`, {
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    });
  },

  getMyLeaveBalance(): Promise<LeaveBalance> {
    return apiClient.get<LeaveBalance>(`${PATH}/my/leave-balance`);
  },

  getStats(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<AttendanceStats> {
    return apiClient.get<AttendanceStats>(`${PATH}/stats/${employeeId}`, {
      month,
      year,
    });
  },

  getMonthlyReport(
    month: number,
    year: number,
    departmentId?: string,
  ): Promise<MonthlyReport> {
    return apiClient.get<MonthlyReport>(`${PATH}/monthly-report`, {
      month,
      year,
      ...(departmentId ? { departmentId } : {}),
    });
  },

  // ─── Leave ─────────────────────────────────────────────────────────────────

  createLeaveRequest(data: CreateLeaveRequestPayload): Promise<LeaveRequest> {
    return apiClient.post<LeaveRequest>(`${PATH}/leave`, data);
  },

  getLeaveRequests(
    params?: LeaveQueryParams,
  ): Promise<PaginatedResponse<LeaveRequest>> {
    return apiClient.get<PaginatedResponse<LeaveRequest>>(
      `${PATH}/leave`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
    return apiClient.get<LeaveBalance>(
      `${PATH}/leave/balance/${employeeId}`,
    );
  },

  // ─── Leave accrual policies & carryover ─────────────────────────────────────

  getLeavePolicies(): Promise<LeaveAccrualPolicy[]> {
    return apiClient.get<LeaveAccrualPolicy[]>(`${PATH}/leave/policies`);
  },
  upsertLeavePolicy(data: LeaveAccrualPolicy): Promise<LeaveAccrualPolicy> {
    return apiClient.patch<LeaveAccrualPolicy>(`${PATH}/leave/policies`, data);
  },
  processLeaveCarryover(year: number): Promise<{ employees: number; rows: number }> {
    return apiClient.post<{ employees: number; rows: number }>(`${PATH}/leave/carryover`, { year });
  },

  approveLeave(id: string): Promise<LeaveRequest> {
    return apiClient.patch<LeaveRequest>(`${PATH}/leave/${id}/approve`);
  },

  rejectLeave(id: string, reason?: string): Promise<LeaveRequest> {
    return apiClient.patch<LeaveRequest>(`${PATH}/leave/${id}/reject`, {
      reason,
    });
  },

  cancelLeave(id: string): Promise<LeaveRequest> {
    return apiClient.patch<LeaveRequest>(`${PATH}/leave/${id}/cancel`);
  },

  // ─── Office IPs ─────────────────────────────────────────────────────

  getOfficeIps(): Promise<OfficeIp[]> {
    return apiClient.get<OfficeIp[]>(`${PATH}/office-ips`);
  },

  createOfficeIp(data: CreateOfficeIpPayload): Promise<OfficeIp> {
    return apiClient.post<OfficeIp>(`${PATH}/office-ips`, data);
  },

  updateOfficeIp(id: string, data: UpdateOfficeIpPayload): Promise<OfficeIp> {
    return apiClient.patch<OfficeIp>(`${PATH}/office-ips/${id}`, data);
  },

  deleteOfficeIp(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/office-ips/${id}`);
  },

  // ─── Remote Work Requests ──────────────────────────────────────────

  createRemoteWorkRequest(data: CreateRemoteWorkRequestPayload): Promise<RemoteWorkRequest> {
    return apiClient.post<RemoteWorkRequest>(`${PATH}/remote-work`, data);
  },

  getRemoteWorkRequests(params?: RemoteWorkQueryParams): Promise<PaginatedResponse<RemoteWorkRequest>> {
    return apiClient.get<PaginatedResponse<RemoteWorkRequest>>(
      `${PATH}/remote-work`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  approveRemoteWork(id: string): Promise<RemoteWorkRequest> {
    return apiClient.patch<RemoteWorkRequest>(`${PATH}/remote-work/${id}/approve`);
  },

  rejectRemoteWork(id: string, reason?: string): Promise<RemoteWorkRequest> {
    return apiClient.patch<RemoteWorkRequest>(`${PATH}/remote-work/${id}/reject`, { reason });
  },

  cancelRemoteWork(id: string): Promise<RemoteWorkRequest> {
    return apiClient.patch<RemoteWorkRequest>(`${PATH}/remote-work/${id}/cancel`);
  },

  // ─── Overtime Requests ──────────────────────────────────────────────

  createOvertimeRequest(data: CreateOvertimeRequestPayload): Promise<OvertimeRequest> {
    return apiClient.post<OvertimeRequest>(`${PATH}/overtime`, data);
  },

  getOvertimeRequests(params?: OvertimeQueryParams): Promise<PaginatedResponse<OvertimeRequest>> {
    return apiClient.get<PaginatedResponse<OvertimeRequest>>(
      `${PATH}/overtime`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getOvertimeRequest(id: string): Promise<OvertimeRequest> {
    return apiClient.get<OvertimeRequest>(`${PATH}/overtime/${id}`);
  },

  approveOvertime(id: string): Promise<OvertimeRequest> {
    return apiClient.patch<OvertimeRequest>(`${PATH}/overtime/${id}/approve`);
  },

  rejectOvertime(id: string, reason?: string): Promise<OvertimeRequest> {
    return apiClient.patch<OvertimeRequest>(`${PATH}/overtime/${id}/reject`, { reason });
  },

  cancelOvertime(id: string): Promise<OvertimeRequest> {
    return apiClient.patch<OvertimeRequest>(`${PATH}/overtime/${id}/cancel`);
  },

  // ─── Auto attendance (fire-and-forget from session lifecycle) ────────────────

  autoClockIn(): Promise<void> {
    return apiClient.post<void>(`${PATH}/auto-clock-in`);
  },

  autoClockOut(): Promise<void> {
    return apiClient.post<void>(`${PATH}/auto-clock-out`);
  },

  setWorkMode(workMode: string): Promise<void> {
    return apiClient.patch<void>(`${PATH}/work-mode`, { workMode });
  },
};
