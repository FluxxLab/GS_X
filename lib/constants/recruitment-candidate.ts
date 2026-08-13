import type { CandidateStage } from "@/lib/types/recruitment";

/**
 * Display maps + ordering for the candidate profile page.
 * Neutral constants module — never imports from `app/`.
 */

export const CANDIDATE_STAGE_BADGE: Record<string, { bg: string; color: string }> = {
  applied: { bg: "#DBEAFE", color: "#1D4ED8" },
  screening: { bg: "#FEF3C7", color: "#B45309" },
  interview: { bg: "#EDE9FE", color: "#7C3AED" },
  shortlisted: { bg: "#CFFAFE", color: "#0E7490" },
  offered: { bg: "#E0E7FF", color: "#4338CA" },
  accepted: { bg: "#D1FAE5", color: "#047857" },
  rejected: { bg: "#FFE4E6", color: "#BE123C" },
  withdrawn: { bg: "#F4F6FB", color: "#70768E" },
};

export const CANDIDATE_STAGE_ORDER: CandidateStage[] = [
  "applied", "screening", "interview", "shortlisted", "offered", "accepted",
];

export const CANDIDATE_SOURCE_LABELS: Record<string, string> = {
  website: "Website", referral: "Referral", linkedin: "LinkedIn",
  agency: "Agency", job_board: "Job Board", other: "Other",
};
