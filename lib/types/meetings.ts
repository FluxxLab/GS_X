export type MeetingStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";

export interface MeetingParticipant {
  email: string;
  name?: string;
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string | null;
  startTime: string;
  durationMinutes: number;
  hostUserId: string;
  provider: string;
  providerMeetingId: string | null;
  joinUrl: string | null;
  startUrl: string | null;
  participants: MeetingParticipant[];
  linkedType: string | null;
  linkedId: string | null;
  status: MeetingStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingPayload {
  title: string;
  agenda?: string;
  startTime: string; // ISO
  durationMinutes: number;
  participants?: MeetingParticipant[];
  linkedType?: string;
  linkedId?: string;
}
