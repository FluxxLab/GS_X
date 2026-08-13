'use client';

import { useCallback, useState } from 'react';
import { recruitmentService } from '@/lib/services/recruitment.service';
import { jobApplicationSchema } from '@/lib/validation/recruitment';
import { zodFieldErrors } from '@/lib/validation/helpers';

export interface WorkHistory {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface JobApplicationValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentCompany: string;
  currentRole: string;
  yearsOfExperience: string;
  noticePeriod: string;
  expectedSalary: string;
  linkedinUrl: string;
  resumeUrl: string;
  resumeFileName: string;
  coverLetterUrl: string;
  coverFileName: string;
}

const INITIAL: JobApplicationValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  currentCompany: '',
  currentRole: '',
  yearsOfExperience: '',
  noticePeriod: '',
  expectedSalary: '',
  linkedinUrl: '',
  resumeUrl: '',
  resumeFileName: '',
  coverLetterUrl: '',
  coverFileName: '',
};

/**
 * Owns the public job-application form: a single values object (not a useState
 * per field), work-history rows, file selection, the CV auto-fill (parse-cv)
 * flow, zod validation at the boundary (§6), and submit. Mirrors the original
 * page's behavior exactly.
 */
export function useJobApplicationForm(jobPostingId: string) {
  const [values, setValues] = useState<JobApplicationValues>(INITIAL);
  const [workHistory, setWorkHistory] = useState<WorkHistory[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // CV auto-fill flow
  const [showParseCvModal, setShowParseCvModal] = useState(false);
  const [parsingCv, setParsingCv] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [cvAutoFillSuccess, setCvAutoFillSuccess] = useState(false);

  const setField = useCallback((field: keyof JobApplicationValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setExpectedSalary = useCallback((rawInput: string) => {
    const raw = rawInput.replace(/[^0-9]/g, '');
    setValues((prev) => ({ ...prev, expectedSalary: raw ? Number(raw).toLocaleString() : '' }));
  }, []);

  const handleFileSelect = useCallback((type: 'resume' | 'cover', file: File) => {
    // The File object is kept and uploaded to object storage on submit; the
    // resume additionally feeds the parse-cv auto-fill below.
    if (type === 'resume') {
      setValues((prev) => ({ ...prev, resumeFileName: file.name }));
      setCvFile(file);
      // Show auto-fill modal for any file type
      setShowParseCvModal(true);
    } else {
      setValues((prev) => ({ ...prev, coverFileName: file.name }));
      setCoverFile(file);
    }
  }, []);

  const clearResume = useCallback(() => {
    setValues((prev) => ({ ...prev, resumeUrl: '', resumeFileName: '' }));
    setCvFile(null);
  }, []);

  const clearCover = useCallback(() => {
    setValues((prev) => ({ ...prev, coverLetterUrl: '', coverFileName: '' }));
    setCoverFile(null);
  }, []);

  const handleAutoFill = useCallback(async () => {
    if (!cvFile) return;
    setParsingCv(true);
    setError('');
    try {
      const parsed = await recruitmentService.parseCv(cvFile);
      let filled = 0;
      setValues((prev) => {
        const next = { ...prev };
        if (parsed.firstName) { next.firstName = parsed.firstName; filled++; }
        if (parsed.lastName) { next.lastName = parsed.lastName; filled++; }
        if (parsed.email) { next.email = parsed.email; filled++; }
        if (parsed.phone) { next.phone = parsed.phone; filled++; }
        if (parsed.currentCompany) { next.currentCompany = parsed.currentCompany; filled++; }
        if (parsed.currentRole) { next.currentRole = parsed.currentRole; filled++; }
        if (parsed.linkedinUrl) { next.linkedinUrl = parsed.linkedinUrl; filled++; }
        if (parsed.yearsOfExperience !== undefined) { next.yearsOfExperience = String(parsed.yearsOfExperience); filled++; }
        return next;
      });
      // Populate work history (skip the first/current entry since it goes in currentCompany/currentRole)
      if (parsed.workHistory && parsed.workHistory.length > 1) {
        const previousJobs = parsed.workHistory.slice(1).map((wh) => ({
          company: wh.company,
          role: wh.role,
          startDate: wh.startDate,
          endDate: wh.endDate,
          current: wh.current,
        }));
        setWorkHistory(previousJobs);
        filled += previousJobs.length;
      }
      setShowParseCvModal(false);
      if (filled > 0) {
        setCvAutoFillSuccess(true);
        setTimeout(() => setCvAutoFillSuccess(false), 5000);
      } else {
        setError('Could not extract details from this CV. Please fill the form manually.');
      }
    } catch (err) {
      setShowParseCvModal(false);
      setError('Failed to parse CV. Please fill the form manually.');
      console.error('CV parse error:', err);
    } finally {
      setParsingCv(false);
    }
  }, [cvFile]);

  const addWorkHistory = useCallback(() => {
    setWorkHistory((prev) => [...prev, { company: '', role: '', startDate: '', endDate: '', current: false }]);
  }, []);

  const updateWorkHistory = useCallback((index: number, field: keyof WorkHistory, value: string | boolean) => {
    setWorkHistory((prev) => {
      const updated = prev.map((wh) => ({ ...wh }));
      // Field is keyed by WorkHistory; value type matches the field at the call sites.
      (updated[index] as unknown as Record<string, string | boolean>)[field] = value;
      if (field === 'current' && value === true) updated[index].endDate = '';
      return updated;
    });
  }, []);

  const removeWorkHistory = useCallback((index: number) => {
    setWorkHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      // Validate at the boundary (§6) before hitting the API.
      const parsed = jobApplicationSchema.safeParse({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        linkedinUrl: values.linkedinUrl,
      });
      if (!parsed.success) {
        setFieldErrors(zodFieldErrors(parsed.error));
        return;
      }
      setFieldErrors({});
      setSubmitting(true);
      try {
        // Store the actual files so HR can open them from the candidate
        // profile. A storage hiccup must not block the application itself.
        let resumeKey = values.resumeUrl || undefined;
        let coverKey = values.coverLetterUrl || undefined;
        if (cvFile) {
          try {
            resumeKey = (await recruitmentService.uploadCandidateFile(cvFile)).key;
          } catch { /* keep applying without the file */ }
        }
        if (coverFile) {
          try {
            coverKey = (await recruitmentService.uploadCandidateFile(coverFile)).key;
          } catch { /* keep applying without the file */ }
        }
        const salaryNum = values.expectedSalary ? Number(values.expectedSalary.replace(/[^0-9]/g, '')) : undefined;
        await recruitmentService.createCandidate({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          jobPostingId,
          source: 'website',
          currentCompany: values.currentCompany || undefined,
          currentRole: values.currentRole || undefined,
          yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : undefined,
          expectedSalary: salaryNum,
          noticePeriod: values.noticePeriod || undefined,
          linkedinUrl: values.linkedinUrl || undefined,
          resumeUrl: resumeKey,
          coverLetterUrl: coverKey,
        });
        setSuccess(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [values, jobPostingId, cvFile, coverFile],
  );

  return {
    values,
    setField,
    setExpectedSalary,
    workHistory,
    fieldErrors,
    submitting,
    success,
    error,
    showParseCvModal,
    setShowParseCvModal,
    parsingCv,
    cvFile,
    cvAutoFillSuccess,
    setCvAutoFillSuccess,
    handleFileSelect,
    clearResume,
    clearCover,
    handleAutoFill,
    addWorkHistory,
    updateWorkHistory,
    removeWorkHistory,
    submit,
  };
}
