// ─── Enums ──────────────────────────────────────────────────────────────────

export type AssetAssignmentType = 'EMPLOYEE' | 'VEHICLE' | 'SITE' | 'DEPARTMENT';
export type AssetAssignmentStatus = 'CHECKED_OUT' | 'RETURNED' | 'TRANSFERRED' | 'LOST';
export type AssetSignoffStatus = 'PENDING' | 'SIGNED' | 'DISPUTED';
export type AssetRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';
export type WorkOrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'INSPECTION';
export type MaintenanceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
export type FuelType = 'DIESEL' | 'PETROL' | 'CNG';
export type VehicleAssignmentType = 'PERMANENT' | 'TEMPORARY' | 'POOL';
export type TripStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

// ─── Asset Assignment ───────────────────────────────────────────────────────

export interface AssetAssignment {
  id: string;
  assetId: string;
  assignmentType: AssetAssignmentType;
  assignedTo: string;
  assignedToDepartment: string | null;
  site: string | null;
  status: AssetAssignmentStatus;
  checkoutDate: string;
  expectedReturnDate: string | null;
  actualReturnDate: string | null;
  conditionAtCheckout: string;
  conditionAtReturn: string | null;
  notes: string | null;
  checkedOutBy: string;
  returnedBy: string | null;
  signoffStatus: AssetSignoffStatus;
  signedAt: string | null;
  signedBy: string | null;
  signoffComments: string | null;
  assetCode: string | null;
  assetName: string | null;
  serialNumber: string | null;
  isExitReturn: boolean;
  separationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetAssignmentPayload {
  assetId: string;
  assignmentType: AssetAssignmentType;
  assignedTo: string;
  assignedToDepartment?: string;
  site?: string;
  checkoutDate: string;
  expectedReturnDate?: string;
  conditionAtCheckout: string;
  checkedOutBy: string;
  notes?: string;
}

export interface ReturnAssetPayload {
  actualReturnDate: string;
  conditionAtReturn: string;
  returnedBy?: string;
  notes?: string;
}

export interface AssetAssignmentQueryParams {
  page?: number;
  limit?: number;
  assetId?: string;
  status?: AssetAssignmentStatus;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Asset Request ──────────────────────────────────────────────────────────

export interface AssetRequest {
  id: string;
  requestNumber: string;
  requestedBy: string;
  department: string;
  assetCategory: string;
  description: string;
  justification: string;
  status: AssetRequestStatus;
  approvedBy: string | null;
  approvalDate: string | null;
  rejectionReason: string | null;
  neededBy: string | null;
  fulfilledAssetId: string | null;
  requestedAssetId: string | null;
  requestedAssetCode: string | null;
  requestedAssetName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetRequestPayload {
  requestedBy: string;
  department: string;
  assetCategory: string;
  description: string;
  justification: string;
  neededBy?: string;
  notes?: string;
  requestedAssetId?: string;
  requestedAssetCode?: string;
  requestedAssetName?: string;
}

export interface FulfillRequestPayload {
  assetId: string;
  // When true, the asset is also checked out (handed over) to the requester.
  checkout?: boolean;
  checkedOutBy?: string;
  expectedReturnDate?: string;
  conditionAtCheckout?: string;
}

export interface AssetRequestQueryParams {
  page?: number;
  limit?: number;
  status?: AssetRequestStatus;
  department?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Vehicle Profile ────────────────────────────────────────────────────────

export interface VehicleProfile {
  id: string;
  assetId: string | null;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  tankCapacityLitres: number | null;
  currentOdometerKm: number;
  insuranceExpiry: string | null;
  roadWorthinessExpiry: string | null;
  assignmentType: VehicleAssignmentType;
  assignedDriverName: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehiclePayload {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  tankCapacityLitres?: number;
  assignmentType: VehicleAssignmentType;
  assignedDriverName?: string;
  assetId?: string;
  notes?: string;
}

export interface UpdateVehiclePayload extends Partial<CreateVehiclePayload> {
  status?: string;
}

export interface VehicleQueryParams {
  page?: number;
  limit?: number;
  fuelType?: FuelType;
  assignmentType?: VehicleAssignmentType;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Fuel Log ───────────────────────────────────────────────────────────────

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  litres: number;
  costPerLitre: number;
  totalCost: number;
  odometerReading: number;
  station: string | null;
  receiptReference: string | null;
  loggedBy: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFuelLogPayload {
  vehicleId: string;
  date: string;
  litres: number;
  costPerLitre: number;
  odometerReading: number;
  station?: string;
  receiptReference?: string;
  notes?: string;
}

export interface FuelLogQueryParams {
  page?: number;
  limit?: number;
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Trip Log ───────────────────────────────────────────────────────────────

export interface TripLog {
  id: string;
  vehicleId: string;
  driverName: string;
  status: TripStatus;
  purpose: string;
  startLocation: string;
  endLocation: string;
  startOdometerKm: number;
  endOdometerKm: number | null;
  startTime: string;
  endTime: string | null;
  approvedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripPayload {
  vehicleId: string;
  driverName: string;
  purpose: string;
  startLocation: string;
  endLocation: string;
  startOdometerKm: number;
  startTime: string;
  notes?: string;
}

export interface CompleteTripPayload {
  endOdometerKm: number;
  endTime: string;
}

export interface TripLogQueryParams {
  page?: number;
  limit?: number;
  vehicleId?: string;
  status?: TripStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Work Order ─────────────────────────────────────────────────────────────

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  assetId: string | null;
  assetName: string;
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  reportedBy: string;
  assignedTo: string | null;
  scheduledDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  labourHours: number | null;
  partsUsed: string | null;
  resolution: string | null;
  preventiveScheduleId: string | null;
  approvedBy: string | null;
  mdApprovedBy: string | null;
  rejectionReason: string | null;
  vendorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RaiseWorkOrderPayload {
  assetName: string;
  assetId?: string;
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  priority?: WorkOrderPriority;
  estimatedCost?: number;
}

export interface ApproveWorkOrderPayload {
  assignedTo?: string;
  scheduledDate?: string;
}

export interface RejectWorkOrderPayload {
  reason: string;
}

export interface CreateWorkOrderPayload {
  assetName: string;
  assetId?: string;
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  priority: WorkOrderPriority;
  reportedBy: string;
  assignedTo?: string;
  scheduledDate?: string;
  estimatedCost?: number;
}

export interface UpdateWorkOrderPayload extends Partial<CreateWorkOrderPayload> {
  status?: WorkOrderStatus;
}

export interface CompleteWorkOrderPayload {
  resolution: string;
  actualCost?: number;
  labourHours?: number;
  partsUsed?: string;
  vendorName?: string;
}

export interface WorkOrderQueryParams {
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  maintenanceType?: MaintenanceType;
  assetId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Preventive Schedule ────────────────────────────────────────────────────

export interface PreventiveSchedule {
  id: string;
  assetId: string | null;
  assetName: string;
  title: string;
  description: string | null;
  frequency: MaintenanceFrequency;
  lastPerformedDate: string | null;
  nextDueDate: string;
  assignedTo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreventiveSchedulePayload {
  assetName: string;
  assetId?: string;
  title: string;
  description?: string;
  frequency: MaintenanceFrequency;
  nextDueDate: string;
  assignedTo?: string;
}

export interface UpdatePreventiveSchedulePayload extends Partial<CreatePreventiveSchedulePayload> {
  isActive?: boolean;
}

export interface PreventiveScheduleQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  frequency?: MaintenanceFrequency;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Project ────────────────────────────────────────────────────────────────

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigneeId: string | null;
  assignee: string | null;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  projectManagerId: string | null;
  projectManager: string;
  departmentId: string | null;
  department: string | null;
  startDate: string;
  targetEndDate: string;
  actualEndDate: string | null;
  budgetAmount: number | null;
  actualSpend: number;
  progressPercent: number;
  location: string | null;
  notes: string | null;
  tasks: ProjectTask[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  priority: ProjectPriority;
  projectManagerId: string;
  departmentId?: string;
  startDate: string;
  targetEndDate: string;
  budgetAmount?: number;
  location?: string;
  notes?: string;
  tasks?: {
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: string;
  }[];
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  status?: ProjectStatus;
  progressPercent?: number;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  department?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Asset Incidents ────────────────────────────────────────────────────────
export type IncidentType = 'LOST' | 'DAMAGED' | 'STOLEN' | 'MALFUNCTION';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'REPORTED' | 'INVESTIGATING' | 'RESOLVED' | 'WRITTEN_OFF';

// Supporting document attached to an incident (police report, affidavit, etc.).
// `data` (base64) is only present when fetching a single incident; list
// responses omit it and return metadata only.
export interface IncidentAttachment {
  name: string; type?: string; mimeType: string; data?: string;
  size?: number; uploadedBy?: string; uploadedAt?: string;
}

export interface AssetIncident {
  id: string; incidentNumber: string; assetId: string | null; assetCode: string; assetName: string;
  type: IncidentType; severity: IncidentSeverity; status: IncidentStatus;
  reportedBy: string; reportedDate: string; description: string; location: string | null;
  witnessName: string | null; witnessStatement: string | null;
  estimatedLoss: number | null; actualLoss: number | null;
  resolution: string | null; resolvedBy: string | null; resolvedAt: string | null;
  policeReportNumber: string | null; insuranceClaim: boolean; insuranceClaimNumber: string | null;
  attachments: IncidentAttachment[] | null;
  notes: string | null; createdAt: string; updatedAt: string;
}

export interface CreateIncidentPayload {
  assetCode: string; assetName: string; assetId?: string; type: IncidentType; severity: IncidentSeverity;
  reportedBy: string; reportedDate: string; description: string; location?: string;
  witnessName?: string; witnessStatement?: string; estimatedLoss?: number;
  attachments?: IncidentAttachment[];
}

export interface UpdateIncidentPayload extends Partial<CreateIncidentPayload> {
  status?: IncidentStatus; resolution?: string; resolvedBy?: string; actualLoss?: number;
  policeReportNumber?: string; insuranceClaim?: boolean; insuranceClaimNumber?: string;
  notes?: string;
}

export interface IncidentQueryParams {
  page?: number; limit?: number; type?: IncidentType; severity?: IncidentSeverity;
  status?: IncidentStatus; assetId?: string; startDate?: string; endDate?: string;
  search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC';
}

export interface ExitReturnPayload {
  assignmentId: string; conditionAtReturn: string; separationId: string; notes?: string;
}

// ─── Paginated Response ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
