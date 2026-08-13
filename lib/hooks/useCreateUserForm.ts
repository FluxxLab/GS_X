'use client';

import { useCallback, useState } from 'react';
import { createUserStep1Schema, createUserStep2Schema } from '@/lib/validation/user';
import { zodFieldErrors } from '@/lib/validation/helpers';
import { userService } from '@/lib/services/user.service';
import {
  ROLE_TO_ENUM,
  ACCESS_SCOPE_TO_ENUM,
  APPROVAL_LEVEL_TO_NUM,
  STATUS_TO_ENUM,
} from '@/lib/constants/user-create';
import type { CreateUserPayload, UserRole } from '@/lib/types/user';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface CreateUserFormValues {
  fullName: string;
  workEmail: string;
  employeeId: string;
  phoneNumber: string;
  department: string;
  jobTitle: string;
  employmentStatus: string;
  role: string;
  mfaRequired: boolean;
  accessScope: string;
  approvalLevel: string;
  canApprove: boolean;
}

const INITIAL: CreateUserFormValues = {
  fullName: '',
  workEmail: '',
  employeeId: '',
  phoneNumber: '',
  department: '',
  jobTitle: '',
  employmentStatus: 'Active',
  role: '',
  mfaRequired: false,
  accessScope: 'Own Department Only',
  approvalLevel: 'None',
  canApprove: false,
};

type FieldErrors = Partial<Record<keyof CreateUserFormValues, string>>;

/**
 * Owns the multi-step create-user wizard: a single values object (not a useState
 * per field), step navigation, zod validation at each step boundary, the MFA
 * auto-toggle on role change, and the (local-only) create confirmation.
 *
 * Create persists via userService.create, then triggers the set-password email
 * (forgot-password flow) so the new user chooses their own password.
 */
export function useCreateUserForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [values, setValues] = useState<CreateUserFormValues>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setField = useCallback(
    (field: keyof CreateUserFormValues, value: string | boolean) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        // Auto-toggle MFA for certain roles
        if (field === 'role') {
          if (value === 'Super Admin' || value === 'Finance Officer') {
            next.mfaRequired = true;
          } else {
            next.mfaRequired = false;
          }
        }
        return next;
      });
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const validateStep1 = useCallback(() => {
    const parsed = createUserStep1Schema.safeParse({
      fullName: values.fullName,
      department: values.department,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error) as FieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [values.fullName, values.department]);

  const validateStep2 = useCallback(() => {
    const parsed = createUserStep2Schema.safeParse({ role: values.role });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error) as FieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [values.role]);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  }, [currentStep, validateStep1, validateStep2]);

  const handlePrevious = useCallback(() => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  }, []);

  const goToStep = useCallback((step: number) => setCurrentStep(step), []);

  const handleCreate = useCallback(async () => {
    if (submitting) return;
    setSubmitError('');

    const email = values.workEmail.trim();
    const employeeId = values.employeeId.trim();
    // The invite is emailed, and the backend requires both — guard with a clear
    // message rather than a raw 400.
    if (!email) {
      setSubmitError('Work email is required. The set-password invite is sent there.');
      return;
    }
    if (!employeeId) {
      setSubmitError('Employee ID is required.');
      return;
    }

    setSubmitting(true);
    try {
      const parts = values.fullName.trim().split(/\s+/);
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || firstName; // backend needs a non-empty last name

      const approvalLevel = APPROVAL_LEVEL_TO_NUM[values.approvalLevel];

      const payload: CreateUserPayload = {
        firstName,
        lastName,
        email,
        employeeId,
        // values.role is now a role key from the roles table; keep the legacy
        // display-label → enum map as a fallback for any old callers.
        role: (ROLE_TO_ENUM[values.role] ?? values.role ?? 'employee') as UserRole,
        // No password: the backend creates the account and emails a
        // set-password invite (UsersService.create invite flow).
        status: STATUS_TO_ENUM[values.employmentStatus] ?? 'active',
        mfaEnabled: values.mfaRequired,
        canApprove: values.canApprove,
        accessScope: ACCESS_SCOPE_TO_ENUM[values.accessScope],
        ...(values.phoneNumber.trim() ? { phone: values.phoneNumber.trim() } : {}),
        ...(values.jobTitle.trim() ? { jobTitle: values.jobTitle.trim() } : {}),
        // department holds a real department UUID (Step 1 loads live departments).
        ...(UUID_RE.test(values.department) ? { departmentId: values.department } : {}),
        ...(approvalLevel != null ? { approvalLevel } : {}),
      };

      // The backend creates the user and emails the set-password invite in one
      // authenticated call (no public rate limit, so bulk onboarding is fine).
      await userService.create(payload);
      setCreated(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [values, submitting]);

  return {
    currentStep,
    values,
    errors,
    created,
    submitting,
    submitError,
    setField,
    handleNext,
    handlePrevious,
    goToStep,
    handleCreate,
  };
}

export type CreateUserForm = ReturnType<typeof useCreateUserForm>;
