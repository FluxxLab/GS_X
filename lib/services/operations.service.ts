import { apiClient } from '../api/client';
import type {
  AssetAssignment,
  AssetAssignmentQueryParams,
  CreateAssetAssignmentPayload,
  ReturnAssetPayload,
  AssetRequest,
  AssetRequestQueryParams,
  CreateAssetRequestPayload,
  FulfillRequestPayload,
  VehicleProfile,
  VehicleQueryParams,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  FuelLog,
  FuelLogQueryParams,
  CreateFuelLogPayload,
  TripLog,
  TripLogQueryParams,
  CreateTripPayload,
  CompleteTripPayload,
  WorkOrder,
  WorkOrderQueryParams,
  CreateWorkOrderPayload,
  UpdateWorkOrderPayload,
  CompleteWorkOrderPayload,
  RaiseWorkOrderPayload,
  ApproveWorkOrderPayload,
  RejectWorkOrderPayload,
  PreventiveSchedule,
  PreventiveScheduleQueryParams,
  CreatePreventiveSchedulePayload,
  UpdatePreventiveSchedulePayload,
  Project,
  ProjectQueryParams,
  CreateProjectPayload,
  UpdateProjectPayload,
  AssetIncident,
  IncidentQueryParams,
  CreateIncidentPayload,
  UpdateIncidentPayload,
  ExitReturnPayload,
  PaginatedResponse,
} from '../types/operations';

const PATH = '/operations';

export const operationsService = {
  // ─── Asset Assignments ──────────────────────────────────────────────────────

  // Backend routes live under the AssetsController at `operations/assets/*`.

  getAssignments(params?: AssetAssignmentQueryParams): Promise<PaginatedResponse<AssetAssignment>> {
    return apiClient.get<PaginatedResponse<AssetAssignment>>(
      `${PATH}/assets/assignments`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createAssignment(data: CreateAssetAssignmentPayload): Promise<AssetAssignment> {
    return apiClient.post<AssetAssignment>(`${PATH}/assets/assignments/checkout`, data);
  },

  returnAsset(id: string, data: ReturnAssetPayload): Promise<AssetAssignment> {
    return apiClient.patch<AssetAssignment>(`${PATH}/assets/assignments/${id}/return`, data);
  },

  // ─── Asset Requests ─────────────────────────────────────────────────────────

  getRequests(params?: AssetRequestQueryParams): Promise<PaginatedResponse<AssetRequest>> {
    return apiClient.get<PaginatedResponse<AssetRequest>>(
      `${PATH}/assets/requests`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createRequest(data: CreateAssetRequestPayload): Promise<AssetRequest> {
    return apiClient.post<AssetRequest>(`${PATH}/assets/requests`, data);
  },

  approveRequest(id: string, approvedBy: string): Promise<AssetRequest> {
    return apiClient.patch<AssetRequest>(`${PATH}/assets/requests/${id}/approve`, { approvedBy });
  },

  rejectRequest(id: string, reason: string): Promise<AssetRequest> {
    return apiClient.patch<AssetRequest>(`${PATH}/assets/requests/${id}/reject`, { reason });
  },

  fulfillRequest(id: string, payload: FulfillRequestPayload): Promise<AssetRequest> {
    return apiClient.patch<AssetRequest>(`${PATH}/assets/requests/${id}/fulfill`, payload);
  },

  // ─── Fleet - Vehicles ──────────────────────────────────────────────────────

  getVehicles(params?: VehicleQueryParams): Promise<PaginatedResponse<VehicleProfile>> {
    return apiClient.get<PaginatedResponse<VehicleProfile>>(
      `${PATH}/fleet/vehicles`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getVehicle(id: string): Promise<VehicleProfile> {
    return apiClient.get<VehicleProfile>(`${PATH}/fleet/vehicles/${id}`);
  },

  createVehicle(data: CreateVehiclePayload): Promise<VehicleProfile> {
    return apiClient.post<VehicleProfile>(`${PATH}/fleet/vehicles`, data);
  },

  updateVehicle(id: string, data: UpdateVehiclePayload): Promise<VehicleProfile> {
    return apiClient.patch<VehicleProfile>(`${PATH}/fleet/vehicles/${id}`, data);
  },

  // ─── Fleet - Fuel Logs ─────────────────────────────────────────────────────

  getFuelLogs(params?: FuelLogQueryParams): Promise<PaginatedResponse<FuelLog>> {
    return apiClient.get<PaginatedResponse<FuelLog>>(
      `${PATH}/fleet/fuel-logs`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createFuelLog(data: CreateFuelLogPayload): Promise<FuelLog> {
    return apiClient.post<FuelLog>(`${PATH}/fleet/fuel-logs`, data);
  },

  // ─── Fleet - Driver self-service (My Vehicle) ──────────────────────────────

  getMyVehicles(): Promise<VehicleProfile[]> {
    return apiClient.get<VehicleProfile[]>(`${PATH}/fleet/my/vehicles`);
  },

  getMyFuelLogs(): Promise<{ data: FuelLog[]; total: number }> {
    return apiClient.get<{ data: FuelLog[]; total: number }>(`${PATH}/fleet/my/fuel-logs`);
  },

  logMyFuel(data: CreateFuelLogPayload): Promise<FuelLog> {
    return apiClient.post<FuelLog>(`${PATH}/fleet/my/fuel-logs`, data);
  },

  getMyTrips(): Promise<{ data: TripLog[]; total: number }> {
    return apiClient.get<{ data: TripLog[]; total: number }>(`${PATH}/fleet/my/trips`);
  },

  logMyTrip(data: Omit<CreateTripPayload, "driverName">): Promise<TripLog> {
    return apiClient.post<TripLog>(`${PATH}/fleet/my/trips`, data);
  },

  completeMyTrip(id: string, data: CompleteTripPayload): Promise<TripLog> {
    return apiClient.patch<TripLog>(`${PATH}/fleet/my/trips/${id}/complete`, data);
  },

  // ─── Fleet - Trip Logs ─────────────────────────────────────────────────────

  getTripLogs(params?: TripLogQueryParams): Promise<PaginatedResponse<TripLog>> {
    return apiClient.get<PaginatedResponse<TripLog>>(
      `${PATH}/fleet/trips`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createTrip(data: CreateTripPayload): Promise<TripLog> {
    return apiClient.post<TripLog>(`${PATH}/fleet/trips`, data);
  },

  completeTrip(id: string, data: CompleteTripPayload): Promise<TripLog> {
    return apiClient.patch<TripLog>(`${PATH}/fleet/trips/${id}/complete`, data);
  },

  approveTrip(id: string, approvedBy: string): Promise<TripLog> {
    return apiClient.patch<TripLog>(`${PATH}/fleet/trips/${id}/approve`, { approvedBy });
  },

  rejectTrip(id: string, reason?: string): Promise<TripLog> {
    return apiClient.patch<TripLog>(`${PATH}/fleet/trips/${id}/reject`, { reason });
  },

  // ─── Maintenance - Work Orders ─────────────────────────────────────────────

  getWorkOrders(params?: WorkOrderQueryParams): Promise<PaginatedResponse<WorkOrder>> {
    return apiClient.get<PaginatedResponse<WorkOrder>>(
      `${PATH}/maintenance/work-orders`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  /** Reports page: SQL-aggregated stats + filtered rows (server does the
   *  status/date filtering and the totals, so they're correct at any volume). */
  getWorkOrderReportSummary(params?: { status?: string; from?: string; to?: string }): Promise<{
    stats: { count: number; done: number; cost: number };
    rows: WorkOrder[];
  }> {
    return apiClient.get(`${PATH}/maintenance/work-orders/report-summary`, params);
  },

  getWorkOrder(id: string): Promise<WorkOrder> {
    return apiClient.get<WorkOrder>(`${PATH}/maintenance/work-orders/${id}`);
  },

  getMyWorkOrders(): Promise<WorkOrder[]> {
    return apiClient.get<WorkOrder[]>(`${PATH}/maintenance/work-orders/mine`);
  },

  createWorkOrder(data: CreateWorkOrderPayload): Promise<WorkOrder> {
    return apiClient.post<WorkOrder>(`${PATH}/maintenance/work-orders`, data);
  },

  updateWorkOrder(id: string, data: UpdateWorkOrderPayload): Promise<WorkOrder> {
    return apiClient.patch<WorkOrder>(`${PATH}/maintenance/work-orders/${id}`, data);
  },

  startWorkOrder(id: string): Promise<WorkOrder> {
    return apiClient.patch<WorkOrder>(`${PATH}/maintenance/work-orders/${id}/start`);
  },

  completeWorkOrder(id: string, data: CompleteWorkOrderPayload): Promise<WorkOrder> {
    return apiClient.patch<WorkOrder>(`${PATH}/maintenance/work-orders/${id}/complete`, data);
  },

  raiseWorkOrder(data: RaiseWorkOrderPayload): Promise<WorkOrder> {
    return apiClient.post<WorkOrder>(`${PATH}/maintenance/work-orders/raise`, data);
  },

  approveWorkOrder(id: string, data: ApproveWorkOrderPayload): Promise<WorkOrder> {
    return apiClient.patch<WorkOrder>(`${PATH}/maintenance/work-orders/${id}/approve`, data);
  },

  rejectWorkOrder(id: string, data: RejectWorkOrderPayload): Promise<WorkOrder> {
    return apiClient.patch<WorkOrder>(`${PATH}/maintenance/work-orders/${id}/reject`, data);
  },

  // ─── Maintenance - Preventive Schedules ────────────────────────────────────

  getSchedules(params?: PreventiveScheduleQueryParams): Promise<PaginatedResponse<PreventiveSchedule>> {
    return apiClient.get<PaginatedResponse<PreventiveSchedule>>(
      `${PATH}/maintenance/preventive-schedules`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  createSchedule(data: CreatePreventiveSchedulePayload): Promise<PreventiveSchedule> {
    return apiClient.post<PreventiveSchedule>(`${PATH}/maintenance/preventive-schedules`, data);
  },

  updateSchedule(id: string, data: UpdatePreventiveSchedulePayload): Promise<PreventiveSchedule> {
    return apiClient.patch<PreventiveSchedule>(`${PATH}/maintenance/preventive-schedules/${id}`, data);
  },

  getOverdueSchedules(): Promise<PreventiveSchedule[]> {
    return apiClient.get<PreventiveSchedule[]>(`${PATH}/maintenance/preventive-schedules/overdue`);
  },

  // ─── Projects ──────────────────────────────────────────────────────────────

  getProjects(params?: ProjectQueryParams): Promise<PaginatedResponse<Project>> {
    return apiClient.get<PaginatedResponse<Project>>(
      `${PATH}/projects`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`${PATH}/projects/${id}`);
  },

  createProject(data: CreateProjectPayload): Promise<Project> {
    return apiClient.post<Project>(`${PATH}/projects`, data);
  },

  updateProject(id: string, data: UpdateProjectPayload): Promise<Project> {
    return apiClient.patch<Project>(`${PATH}/projects/${id}`, data);
  },

  deleteProject(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/projects/${id}`);
  },

  addProjectTask(projectId: string, data: { title: string; description?: string; assigneeId?: string; dueDate?: string }): Promise<Project> {
    return apiClient.post<Project>(`${PATH}/projects/${projectId}/tasks`, data);
  },
  updateProjectTask(projectId: string, taskId: string, data: { title?: string; status?: string; assigneeId?: string; dueDate?: string }): Promise<Project> {
    return apiClient.patch<Project>(`${PATH}/projects/${projectId}/tasks/${taskId}`, data);
  },
  deleteProjectTask(projectId: string, taskId: string): Promise<Project> {
    return apiClient.delete<Project>(`${PATH}/projects/${projectId}/tasks/${taskId}`);
  },

  // ─── Asset Register Signing ───────────────────────────────────────────────

  signAssetRegister(assignmentId: string, signedBy: string, comments?: string): Promise<AssetAssignment> {
    return apiClient.patch<AssetAssignment>(`${PATH}/assets/assignments/${assignmentId}/sign`, { signedBy, signoffComments: comments });
  },

  disputeAssetRegister(assignmentId: string, signedBy: string, comments: string): Promise<AssetAssignment> {
    return apiClient.patch<AssetAssignment>(`${PATH}/assets/assignments/${assignmentId}/dispute`, { signedBy, comments });
  },

  // ─── Asset Incidents ──────────────────────────────────────────────────────

  getIncidents(params?: IncidentQueryParams): Promise<PaginatedResponse<AssetIncident>> {
    return apiClient.get<PaginatedResponse<AssetIncident>>(
      `${PATH}/assets/incidents`,
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getIncident(id: string): Promise<AssetIncident> {
    return apiClient.get<AssetIncident>(`${PATH}/assets/incidents/${id}`);
  },

  reportIncident(data: CreateIncidentPayload): Promise<AssetIncident> {
    return apiClient.post<AssetIncident>(`${PATH}/assets/incidents`, data);
  },

  updateIncident(id: string, data: UpdateIncidentPayload): Promise<AssetIncident> {
    return apiClient.patch<AssetIncident>(`${PATH}/assets/incidents/${id}`, data);
  },

  resolveIncident(id: string, data: { resolution: string; actualLoss?: number }): Promise<AssetIncident> {
    return apiClient.patch<AssetIncident>(`${PATH}/assets/incidents/${id}/resolve`, data);
  },

  // ─── Exit Asset Returns ───────────────────────────────────────────────────

  getExitReturns(separationId: string): Promise<AssetAssignment[]> {
    return apiClient.get<AssetAssignment[]>(`${PATH}/assets/exit-returns/${separationId}`);
  },

  processExitReturn(data: ExitReturnPayload): Promise<AssetAssignment> {
    return apiClient.post<AssetAssignment>(`${PATH}/assets/exit-returns`, data);
  },
};
