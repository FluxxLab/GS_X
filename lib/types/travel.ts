export type TravelRequestStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type TravelType = "LOCAL" | "REGIONAL" | "INTERNATIONAL";

export type TravelMode = "AIR" | "ROAD" | "RAIL" | "SEA";

export type TravelRetirementStatus = "NONE" | "SUBMITTED" | "SETTLED";

export type TravelBookingStatus = "NOT_BOOKED" | "BOOKED";

export interface TravelExpenseLine {
  category: string;
  description?: string;
  amount: number;
}

export interface TravelRequest {
  id: string;
  requestNumber: string;
  travelerId: string | null;
  travelerName: string;
  requestedBy: string;
  purpose: string;
  travelType: TravelType;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  modeOfTransport: TravelMode;
  departmentId: string | null;
  department: string | null;
  projectId: string | null;
  project: string | null;
  estTransport: number;
  estAccommodation: number;
  perDiemDays: number | null;
  perDiemRate: number;
  estPerDiem: number;
  estOther: number;
  estimatedTotal: number;
  advanceRequired: boolean;
  advanceAmount: number | null;
  advancePvId: string | null;
  advancePvNumber: string | null;
  notes: string | null;
  bookingStatus: TravelBookingStatus;
  agencyVendorId: string | null;
  agencyName: string | null;
  carrier: string | null;
  bookingRef: string | null;
  ticketNumber: string | null;
  outboundFlight: string | null;
  outboundAt: string | null;
  returnFlight: string | null;
  returnAt: string | null;
  ticketCost: number | null;
  bookedBy: string | null;
  bookedAt: string | null;
  bookingPvId: string | null;
  bookingPvNumber: string | null;
  status: TravelRequestStatus;
  approvedBy: string | null;
  mdApprovedBy: string | null;
  rejectionReason: string | null;
  retirementStatus: TravelRetirementStatus;
  retirementLines: TravelExpenseLine[];
  actualTotal: number;
  retirementNotes: string | null;
  retirementSubmittedAt: string | null;
  settledAt: string | null;
  settlementType: string | null;
  settlementAmount: number;
  retirementJournalEntryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRetirementPayload {
  lines: TravelExpenseLine[];
  notes?: string;
}

export type TravelAttachmentKind = "E_TICKET" | "RECEIPT" | "OTHER";

export interface TravelAttachment {
  id: string;
  travelRequestId: string;
  kind: TravelAttachmentKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  caption: string | null;
  uploadedBy: string;
  createdAt: string;
}

export interface BookTravelPayload {
  agencyVendorId: string;
  ticketCost: number;
  carrier?: string;
  bookingRef?: string;
  ticketNumber?: string;
  outboundFlight?: string;
  outboundAt?: string;
  returnFlight?: string;
  returnAt?: string;
}

export interface CreateTravelRequestPayload {
  /** Omitted for self-service — the backend uses the logged-in user. */
  travelerId?: string;
  purpose: string;
  travelType?: TravelType;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  modeOfTransport?: TravelMode;
  departmentId?: string;
  projectId?: string;
  estTransport?: number;
  estAccommodation?: number;
  perDiemDays?: number;
  perDiemRate?: number;
  estPerDiem?: number;
  estOther?: number;
  advanceRequired?: boolean;
  advanceAmount?: number;
  notes?: string;
}

export interface TravelListResponse {
  data: TravelRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PerDiemRate {
  id: string;
  label: string;
  travelType: TravelType;
  salaryGrade: string | null;
  dailyRate: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePerDiemRatePayload {
  label: string;
  travelType: TravelType;
  salaryGrade?: string;
  dailyRate: number;
  currency?: string;
  isActive?: boolean;
}

export type UpdatePerDiemRatePayload = Partial<CreatePerDiemRatePayload>;
