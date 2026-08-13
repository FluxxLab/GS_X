'use client';

import { useCallback, useState } from 'react';
import { recruitmentService } from '@/lib/services/recruitment.service';
import { createOfferSchema } from '@/lib/validation/recruitment';
import { zodFieldErrors } from '@/lib/validation/helpers';
import type { Offer, CreateOfferPayload } from '@/lib/types/recruitment';

const emptyForm = (): CreateOfferPayload => ({
  candidateId: '',
  jobPostingId: '',
  offerDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  proposedSalary: 0,
  currency: 'NGN',
  proposedJobTitle: '',
  proposedDepartmentId: '',
  proposedStartDate: '',
  benefits: '',
});

interface Options {
  onSuccess: () => void;
}

/**
 * Owns the create/edit offer form: a single `form` values object, zod
 * validation at the boundary (§6), edit-prefill, and submit (create or update).
 * The page wires open/close disclosure and a success callback.
 */
export function useOfferForm({ onSuccess }: Options) {
  const [form, setForm] = useState<CreateOfferPayload>(emptyForm);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = useCallback(
    (field: keyof CreateOfferPayload, value: string | number) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const resetForCreate = useCallback(() => {
    setEditingOffer(null);
    setForm(emptyForm());
    setModalError(null);
    setFieldErrors({});
  }, []);

  const loadForEdit = useCallback((offer: Offer) => {
    setEditingOffer(offer);
    setForm({
      candidateId: offer.candidateId || '',
      jobPostingId: offer.jobPostingId || '',
      offerDate: offer.offerDate?.split('T')[0] || '',
      expiryDate: offer.expiryDate?.split('T')[0] || '',
      proposedSalary: Number(offer.proposedSalary) || 0,
      currency: offer.currency || 'NGN',
      proposedJobTitle: offer.proposedJobTitle || '',
      proposedDepartmentId: offer.proposedDepartmentId || '',
      proposedStartDate: offer.proposedStartDate?.split('T')[0] || '',
      benefits: offer.benefits || '',
    });
    setModalError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createOfferSchema.safeParse({
      candidateId: form.candidateId,
      jobPostingId: form.jobPostingId,
      proposedJobTitle: form.proposedJobTitle,
      expiryDate: form.expiryDate,
      proposedSalary: Number(form.proposedSalary),
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      setModalError('Please fill in all required fields.');
      return false;
    }
    setFieldErrors({});
    setSubmitting(true);
    setModalError(null);
    try {
      const payload: CreateOfferPayload = {
        ...form,
        proposedSalary: Number(form.proposedSalary),
        proposedDepartmentId: form.proposedDepartmentId || undefined,
        proposedStartDate: form.proposedStartDate || undefined,
        benefits: form.benefits || undefined,
      };
      if (editingOffer) {
        await recruitmentService.updateOffer(editingOffer.id, payload);
      } else {
        await recruitmentService.createOffer(payload);
      }
      setEditingOffer(null);
      setForm(emptyForm());
      onSuccess();
      return true;
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to create offer');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [form, editingOffer, onSuccess]);

  return {
    form,
    editingOffer,
    fieldErrors,
    modalError,
    submitting,
    handleFormChange,
    resetForCreate,
    loadForEdit,
    submit,
  };
}
