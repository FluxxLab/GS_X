import { apiClient } from '../api/client';
import type {
  JobPosting,
  CreateJobPostingPayload,
  UpdateJobPostingPayload,
  JobPostingQueryParams,
  Candidate,
  CandidateGuarantor,
  SubmitGuarantorPayload,
  CreateCandidatePayload,
  UpdateCandidatePayload,
  CandidateQueryParams,
  CandidateStage,
  Offer,
  CreateOfferPayload,
  UpdateOfferPayload,
  RecruitmentStats,
  PaginatedResponse,
} from '../types/recruitment';

const JOBS_PATH = '/recruitment/jobs';
const CANDIDATES_PATH = '/recruitment/candidates';
const OFFERS_PATH = '/recruitment/offers';

export type ParsedCvResult = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  currentCompany?: string;
  currentRole?: string;
  linkedinUrl?: string;
  yearsOfExperience?: number;
  workHistory?: { role: string; company: string; startDate: string; endDate: string; current: boolean }[];
};

export const recruitmentService = {
  // ─── Job Postings ────────────────────────────────────────────────────────────

  getAllJobs(params?: JobPostingQueryParams): Promise<PaginatedResponse<JobPosting>> {
    return apiClient.get<PaginatedResponse<JobPosting>>(JOBS_PATH, params as Record<string, string | number | boolean | undefined>);
  },

  // ── Guarantors ──────────────────────────────────────────────────────

  /** Name up to 5 guarantors; each gets an emailed form link. */
  requestGuarantors(candidateId: string, emails: string[]): Promise<CandidateGuarantor[]> {
    return apiClient.post<CandidateGuarantor[]>(`${CANDIDATES_PATH}/${candidateId}/guarantors`, { emails });
  },

  listGuarantors(candidateId: string): Promise<CandidateGuarantor[]> {
    return apiClient.get<CandidateGuarantor[]>(`${CANDIDATES_PATH}/${candidateId}/guarantors`);
  },

  /** Public form context (by token). */
  guarantorInfo(token: string): Promise<{ candidateName: string; email: string; status: 'pending' | 'submitted'; relationships: { value: string; label: string }[] }> {
    return apiClient.get(`/recruitment/guarantor/${token}`);
  },

  /** Public one-shot submission (by token). */
  submitGuarantor(token: string, data: SubmitGuarantorPayload): Promise<{ submitted: boolean }> {
    return apiClient.post(`/recruitment/guarantor/${token}`, data);
  },

  /** Store a CV/cover letter file (public apply flow). Returns the storage key. */
  uploadCandidateFile(file: File): Promise<{ key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<{ key: string }>('/recruitment/candidates/files', formData);
  },

  /** Signed short-lived URL to open a stored candidate file (ERP side). */
  candidateFileUrl(id: string, kind: 'resume' | 'cover'): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`/recruitment/candidates/${id}/files/${kind}`);
  },

  /** Departments with at least one open posting (public careers filter chips). */
  getOpenJobDepartments(): Promise<{ id: string; name: string }[]> {
    return apiClient.get<{ id: string; name: string }[]>(`${JOBS_PATH}/departments`);
  },

  getJobById(id: string): Promise<JobPosting> {
    return apiClient.get<JobPosting>(`${JOBS_PATH}/${id}`);
  },

  getStats(): Promise<RecruitmentStats> {
    return apiClient.get<RecruitmentStats>(`${JOBS_PATH}/stats`);
  },

  createJob(data: CreateJobPostingPayload): Promise<JobPosting> {
    return apiClient.post<JobPosting>(JOBS_PATH, data);
  },

  updateJob(id: string, data: UpdateJobPostingPayload): Promise<JobPosting> {
    return apiClient.patch<JobPosting>(`${JOBS_PATH}/${id}`, data);
  },

  deleteJob(id: string): Promise<void> {
    return apiClient.delete<void>(`${JOBS_PATH}/${id}`);
  },

  // ─── Candidates ──────────────────────────────────────────────────────────────

  getAllCandidates(params?: CandidateQueryParams): Promise<PaginatedResponse<Candidate>> {
    return apiClient.get<PaginatedResponse<Candidate>>(CANDIDATES_PATH, params as Record<string, string | number | boolean | undefined>);
  },

  getCandidateById(id: string): Promise<Candidate> {
    return apiClient.get<Candidate>(`${CANDIDATES_PATH}/${id}`);
  },

  createCandidate(data: CreateCandidatePayload): Promise<Candidate> {
    return apiClient.post<Candidate>(CANDIDATES_PATH, data);
  },

  updateCandidate(id: string, data: UpdateCandidatePayload): Promise<Candidate> {
    return apiClient.patch<Candidate>(`${CANDIDATES_PATH}/${id}`, data);
  },

  moveCandidateStage(id: string, stage: CandidateStage): Promise<Candidate> {
    return apiClient.patch<Candidate>(`${CANDIDATES_PATH}/${id}/stage`, { stage });
  },

  deleteCandidate(id: string): Promise<void> {
    return apiClient.delete<void>(`${CANDIDATES_PATH}/${id}`);
  },

  resendInterviewInvite(id: string, interviewDate: string, notes?: string): Promise<Candidate> {
    return apiClient.post<Candidate>(`${CANDIDATES_PATH}/${id}/resend-interview`, { interviewDate, notes });
  },

  // ─── Public interview actions (token-based, used on the candidate pages) ─────

  confirmInterview(token: string): Promise<unknown> {
    return apiClient.post(`/recruitment/interview/${token}/confirm`);
  },

  rescheduleInterview(token: string, data: { preferredDate?: string; note?: string }): Promise<unknown> {
    return apiClient.post(`/recruitment/interview/${token}/reschedule`, data);
  },

  declineInterview(token: string, data: { reason?: string }): Promise<unknown> {
    return apiClient.post(`/recruitment/interview/${token}/decline`, data);
  },

  getHrSignatory(): Promise<{ firstName: string; lastName: string }> {
    return apiClient.get<{ firstName: string; lastName: string }>('/recruitment/hr-signatory');
  },

  // ─── Offers ──────────────────────────────────────────────────────────────────

  getAllOffers(): Promise<Offer[]> {
    return apiClient.get<Offer[]>(OFFERS_PATH);
  },

  getOfferById(id: string): Promise<Offer> {
    return apiClient.get<Offer>(`${OFFERS_PATH}/${id}`);
  },

  createOffer(data: CreateOfferPayload): Promise<Offer> {
    return apiClient.post<Offer>(OFFERS_PATH, data);
  },

  updateOffer(id: string, data: UpdateOfferPayload): Promise<Offer> {
    return apiClient.patch<Offer>(`${OFFERS_PATH}/${id}`, data);
  },

  getOfferByToken(token: string): Promise<Offer> {
    return apiClient.get<Offer>(`${OFFERS_PATH}/token/${token}`);
  },

  acceptOffer(token: string, signatureData?: string): Promise<unknown> {
    return apiClient.post(`${OFFERS_PATH}/token/${token}/accept`, { signatureData });
  },

  rejectOffer(token: string, reason?: string): Promise<unknown> {
    return apiClient.post(`${OFFERS_PATH}/token/${token}/reject`, { reason });
  },

  resendOfferEmail(id: string): Promise<Offer> {
    return apiClient.post<Offer>(`${OFFERS_PATH}/${id}/resend`);
  },

  requestOfferChange(token: string, data: { subject: string; description: string; proposedValue?: string }): Promise<unknown> {
    return apiClient.post(`${OFFERS_PATH}/token/${token}/request-change`, data);
  },

  reviewChangeRequest(id: string, action: 'accept' | 'dismiss'): Promise<Offer> {
    return apiClient.patch<Offer>(`${OFFERS_PATH}/${id}/review-change`, { action });
  },

  // ─── CV Parser ────────────────────────────────────────────────────────────────

  async parseCv(file: File): Promise<ParsedCvResult> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<ParsedCvResult>('/recruitment/parse-cv', formData);
  },
};
