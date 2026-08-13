import { describe, it, expect } from 'vitest';
import { jobApplicationSchema, createJobPostingSchema, createOfferSchema } from './recruitment';
import { zodFieldErrors } from './helpers';

const valid = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '08012345678',
  linkedinUrl: 'https://linkedin.com/in/jane',
};

describe('jobApplicationSchema', () => {
  it('accepts a valid application', () => {
    expect(jobApplicationSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an empty optional linkedin URL and phone', () => {
    const r = jobApplicationSchema.safeParse({ ...valid, linkedinUrl: '', phone: '' });
    expect(r.success).toBe(true);
  });

  it('requires first name, last name, and email', () => {
    const r = jobApplicationSchema.safeParse({ firstName: '', lastName: '', email: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errors = zodFieldErrors(r.error);
      expect(errors.firstName).toBeTruthy();
      expect(errors.lastName).toBeTruthy();
      expect(errors.email).toBeTruthy();
    }
  });

  it('rejects a malformed email', () => {
    const r = jobApplicationSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(zodFieldErrors(r.error).email).toBe('Enter a valid email address');
    }
  });

  it('rejects a malformed linkedin URL', () => {
    const r = jobApplicationSchema.safeParse({ ...valid, linkedinUrl: 'linkedin.com/jane' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(zodFieldErrors(r.error).linkedinUrl).toContain('valid URL');
    }
  });
});

describe('createJobPostingSchema', () => {
  it('accepts a valid job posting', () => {
    expect(createJobPostingSchema.safeParse({ title: 'Engineer', description: 'Build things' }).success).toBe(true);
  });

  it('requires a title and description', () => {
    const r = createJobPostingSchema.safeParse({ title: '  ', description: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.title).toBeTruthy();
      expect(e.description).toBeTruthy();
    }
  });
});

describe('createOfferSchema', () => {
  const validOffer = { candidateId: 'cand-1', jobPostingId: 'job-1', proposedJobTitle: 'Engineer', expiryDate: '2026-07-31', proposedSalary: 350000 };

  it('accepts a valid offer', () => {
    expect(createOfferSchema.safeParse(validOffer).success).toBe(true);
  });

  it('requires candidate, job posting, title and expiry', () => {
    const r = createOfferSchema.safeParse({ ...validOffer, candidateId: '', jobPostingId: '', proposedJobTitle: '  ', expiryDate: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = zodFieldErrors(r.error);
      expect(e.candidateId).toBeTruthy();
      expect(e.jobPostingId).toBeTruthy();
      expect(e.proposedJobTitle).toBeTruthy();
      expect(e.expiryDate).toBeTruthy();
    }
  });

  it('rejects a zero/NaN proposed salary', () => {
    expect(createOfferSchema.safeParse({ ...validOffer, proposedSalary: 0 }).success).toBe(false);
    expect(createOfferSchema.safeParse({ ...validOffer, proposedSalary: Number.NaN }).success).toBe(false);
  });
});
