export type InterviewMode = "in_person" | "video" | "phone";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type InterviewRecommendation = "strong_yes" | "yes" | "no" | "strong_no";

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobPostingId: string | null;
  round: string;
  scheduledAt: string;
  mode: InterviewMode;
  locationOrLink: string | null;
  interviewerName: string;
  interviewerId: string | null;
  status: InterviewStatus;
  rating: number | null;
  recommendation: InterviewRecommendation | null;
  strengths: string | null;
  concerns: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleInterviewPayload {
  candidateId: string;
  jobPostingId?: string;
  round: string;
  scheduledAt: string;
  mode?: InterviewMode;
  locationOrLink?: string;
  interviewerName: string;
}

export interface InterviewFeedbackPayload {
  status?: InterviewStatus;
  rating?: number;
  recommendation?: InterviewRecommendation;
  strengths?: string;
  concerns?: string;
  notes?: string;
}

export type ReferenceStatus = "requested" | "received" | "declined";

export interface ReferenceCheck {
  id: string;
  candidateId: string;
  candidateName: string;
  refereeName: string;
  relationship: string;
  refereeContact: string | null;
  status: ReferenceStatus;
  rating: number | null;
  feedback: string | null;
  wouldRehire: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferencePayload {
  candidateId: string;
  refereeName: string;
  relationship: string;
  refereeContact?: string;
}

export type AppraisalStatus = "draft" | "self_review" | "manager_review" | "completed";

export interface AppraisalGoal {
  title: string;
  weight?: number;
  rating?: number;
  comment?: string;
}

/** A core value from the Culture & Values Framework, as scored on an appraisal. */
export interface AppraisalValueRating {
  valueKey: string;
  valueName: string;
  selfRating?: number | null;
  managerRating?: number | null;
  comment?: string | null;
}

/** The rating rubric, served from /talent/core-values. */
export interface CoreValue {
  key: string;
  name: string;
  definition: string;
  message: string;
  question: string;
  sortOrder: number;
}

export interface ValueRatingPayload {
  valueKey: string;
  selfRating?: number;
  managerRating?: number;
  comment?: string;
}

export interface Appraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  cycle: string;
  managerId: string | null;
  status: AppraisalStatus;
  goals: AppraisalGoal[];
  values: AppraisalValueRating[];
  selfRating: number | null;
  selfComments: string | null;
  selfSubmittedAt: string | null;
  managerRating: number | null;
  managerComments: string | null;
  peerFeedback: string | null;
  overallRating: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppraisalPayload {
  employeeId: string;
  cycle: string;
  managerId?: string;
  goals?: AppraisalGoal[];
}

export interface SelfReviewPayload {
  selfRating: number;
  selfComments?: string;
  values?: ValueRatingPayload[];
  goals?: AppraisalGoal[];
}

export interface ManagerReviewPayload {
  managerRating: number;
  managerComments?: string;
  peerFeedback?: string;
  overallRating: number;
  values?: ValueRatingPayload[];
  goals?: AppraisalGoal[];
}
