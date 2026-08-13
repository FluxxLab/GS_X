import { z } from 'zod';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/;

/**
 * Validation for the public job-application form (§6: validate at the boundary
 * with zod before submit). Inputs are strings from the form fields.
 */
export const jobApplicationSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .regex(EMAIL_RE, 'Enter a valid email address'),
  phone: z.string().trim().optional(),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || URL_RE.test(v), 'Enter a valid URL (https://…)'),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

/** Validation for the create-job-posting form (§6). */
export const createJobPostingSchema = z.object({
  title: z.string().trim().min(1, 'Job title is required'),
  description: z.string().trim().min(1, 'Job description is required'),
});

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;

/** Validation for the create/edit-offer form (§6). */
export const createOfferSchema = z.object({
  candidateId: z.string().trim().min(1, 'Candidate is required'),
  jobPostingId: z.string().trim().min(1, 'Job posting is required'),
  proposedJobTitle: z.string().trim().min(1, 'Proposed job title is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  proposedSalary: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, 'Proposed salary must be greater than 0'),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
