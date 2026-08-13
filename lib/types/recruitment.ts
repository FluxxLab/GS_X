// ─── Enums ───────────────────────────────────────────────────────────────────

export type JobPostingEmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type JobPostingStatus = 'draft' | 'open' | 'closed' | 'on_hold' | 'filled';
export type CandidateSource = 'website' | 'referral' | 'linkedin' | 'agency' | 'job_board' | 'other';
export type CandidateStage = 'applied' | 'screening' | 'interview' | 'shortlisted' | 'offered' | 'accepted' | 'rejected' | 'withdrawn';
export type OfferStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'revised' | 'withdrawn';

// ─── Entities ────────────────────────────────────────────────────────────────

export interface JobPosting {
  id: string;
  title: string;
  departmentId: string | null;
  department?: { id: string; name: string; code: string };
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  location: string | null;
  employmentType: JobPostingEmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  jobLevel: string | null;
  numberOfPositions: number;
  status: JobPostingStatus;
  publishedAt: string | null;
  closingDate: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  candidateCount?: number;
}

export interface CandidateGuarantor {
  id: string;
  candidateId: string;
  email: string;
  status: 'pending' | 'submitted';
  fullName: string | null;
  phone: string | null;
  address: string | null;
  occupation: string | null;
  employer: string | null;
  relationship: string | null;
  yearsKnown: number | null;
  attested: boolean;
  comments: string | null;
  submittedAt: string | null;
  createdAt: string;
}

export interface SubmitGuarantorPayload {
  fullName: string;
  phone: string;
  address: string;
  occupation: string;
  employer?: string;
  relationship: string;
  yearsKnown: number;
  attested: boolean;
  comments?: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  coverLetterUrl: string | null;
  linkedinUrl: string | null;
  currentCompany: string | null;
  currentRole: string | null;
  yearsOfExperience: number | null;
  expectedSalary: number | null;
  noticePeriod: string | null;
  source: CandidateSource;
  jobPostingId: string;
  jobPosting?: JobPosting;
  stage: CandidateStage;
  rating: number | null;
  notes: string | null;
  interviewDate: string | null;
  interviewNotes: string | null;
  interviewToken: string | null;
  interviewResponse: string | null;
  declineReason: string | null;
  preferredRescheduleDate: string | null;
  rescheduleNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Offer {
  id: string;
  candidateId: string;
  candidate?: Candidate;
  jobPostingId: string;
  jobPosting?: JobPosting;
  offerDate: string;
  expiryDate: string;
  proposedSalary: number;
  currency: string;
  proposedJobTitle: string;
  proposedDepartmentId: string | null;
  proposedDepartment?: { id: string; name: string; code: string };
  proposedStartDate: string | null;
  benefits: string | null;
  status: OfferStatus;
  token: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  revisedOfferId: string | null;
  changeRequestSubject: string | null;
  changeRequestDescription: string | null;
  changeRequestProposedValue: string | null;
  changeRequestDate: string | null;
  changeRequestStatus: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface CreateJobPostingPayload {
  title: string;
  departmentId?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  location?: string;
  employmentType?: JobPostingEmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  jobLevel?: string;
  numberOfPositions?: number;
  status?: JobPostingStatus;
  closingDate?: string;
}

export type UpdateJobPostingPayload = Partial<CreateJobPostingPayload>;

export interface CreateCandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  linkedinUrl?: string;
  currentCompany?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  source?: CandidateSource;
  jobPostingId: string;
  rating?: number;
  notes?: string;
}

export type UpdateCandidatePayload = Partial<CreateCandidatePayload>;

export interface CreateOfferPayload {
  candidateId: string;
  jobPostingId: string;
  offerDate: string;
  expiryDate: string;
  proposedSalary: number;
  currency?: string;
  proposedJobTitle: string;
  proposedDepartmentId?: string;
  proposedStartDate?: string;
  benefits?: string;
}

export type UpdateOfferPayload = Partial<CreateOfferPayload> & {
  status?: OfferStatus;
};

// ─── Query Params ────────────────────────────────────────────────────────────

export interface JobPostingQueryParams {
  search?: string;
  status?: JobPostingStatus;
  departmentId?: string;
  employmentType?: JobPostingEmploymentType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CandidateQueryParams {
  search?: string;
  stage?: CandidateStage;
  source?: CandidateSource;
  jobPostingId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Stats & Paginated ──────────────────────────────────────────────────────

export interface RecruitmentStats {
  totalOpenPositions: number;
  totalCandidates: number;
  interviewsScheduled: number;
  pendingOffers: number;
  candidatesByStage: Record<CandidateStage, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
