'use client';

import { useCallback, useEffect, useState } from 'react';
import { employeeService } from '@/lib/services/employee.service';
import type { Employee, EmployeeDocument, UpdateEmployeePayload } from '@/lib/types/employee';

/** The settled result of a fetch, tagged with the id it belongs to. */
interface FetchResult {
  id: string;
  employee: Employee | null;
  error: string | null;
}

// Documents go straight to S3 as multipart now, so the old 5MB base64 ceiling
// is gone; this just matches the server's own upload limit.
const MAX_DOC_BYTES = 15 * 1024 * 1024;

/**
 * Owns the employee-profile data lifecycle: load the employee by id (guarding
 * against stale responses), lazily load documents, persist edits, and delete a
 * document. Mirrors the original page's fetch/update behavior exactly.
 */
export function useEmployeeProfile(id: string | null) {
  // Single settled-result state, tagged with its id. State is only written from
  // async callbacks (never synchronously in the effect body), so loading is
  // derived: an id with no matching settled result yet means "loading".
  const [result, setResult] = useState<FetchResult | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    employeeService
      .getById(id)
      .then((data) => {
        if (cancelled) return;
        document.title = `${data.firstName} ${data.lastName} | Maizube Water ERP`;
        setResult({ id, employee: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setResult({ id, employee: null, error: err?.message || 'Failed to load employee profile.' });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const settled = result && result.id === id ? result : null;
  const employee = settled?.employee ?? null;
  // No id → not loading, surface the error immediately (original behavior).
  // With an id but no settled result for it yet → loading.
  const loading = id ? !settled : false;
  const error = id ? settled?.error ?? null : 'No employee ID provided.';

  const loadDocuments = useCallback(() => {
    if (!employee || documents.length > 0) return;
    setDocsLoading(true);
    employeeService
      .getDocuments(employee.id)
      .then((docs) => setDocuments(docs))
      .catch(() => setDocuments([]))
      .finally(() => setDocsLoading(false));
  }, [employee, documents.length]);

  const removeDocument = useCallback(async (docId: string) => {
    await employeeService.removeDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }, []);

  const uploadDocument = useCallback(
    async (file: File) => {
      if (!employee) return;
      if (file.size > MAX_DOC_BYTES) {
        throw new Error('File exceeds the 15MB limit.');
      }
      setUploadingDoc(true);
      try {
        const doc = await employeeService.addDocument(employee.id, file, {
          type: 'other',
        });
        setDocuments((prev) => [doc, ...prev]);
      } finally {
        setUploadingDoc(false);
      }
    },
    [employee],
  );

  /** Resolve the document's URL and open it. Signed URLs are short-lived, so
   *  this is deliberately fetched at click time rather than with the list. */
  const viewDocument = useCallback(async (docId: string) => {
    const { url } = await employeeService.documentDownloadUrl(docId);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const saveEmployee = useCallback(
    async (payload: UpdateEmployeePayload): Promise<Employee> => {
      if (!id) throw new Error('No employee ID provided.');
      const updated = await employeeService.update(id, payload);
      setResult({ id, employee: updated, error: null });
      return updated;
    },
    [id],
  );

  return {
    employee,
    loading,
    error,
    documents,
    docsLoading,
    uploadingDoc,
    loadDocuments,
    removeDocument,
    uploadDocument,
    viewDocument,
    saveEmployee,
  };
}
