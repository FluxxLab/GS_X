import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

// FR-15. The mobile app reads GET /documents/purple-book, so the URL lives in
// the database rather than in the app bundle - republishing the PDF here is
// what updates the delegate screen, with no app release involved.

export interface AppDocument {
  key: string;
  title: string;
  url: string;
  sizeLabel: string | null;
  updatedAt: string;
}

export interface DocumentInput {
  title: string;
  url: string;
  sizeLabel?: string;
}

interface PresignedUpload {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

// 404 until an admin publishes it - that is a normal state before the summit,
// not an error, so callers get null rather than a thrown query.
export function usePurpleBook() {
  return useQuery<AppDocument | null>({
    queryKey: ["documents", "purple-book"],
    queryFn: () =>
      api<AppDocument>("/documents/purple-book").catch(() => null),
    retry: false,
  });
}

export function usePublishPurpleBook() {
  const qc = useQueryClient();
  return useMutation<AppDocument, Error, DocumentInput>({
    mutationFn: (input) =>
      api<AppDocument>("/documents/purple-book", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["documents", "purple-book"] }),
  });
}

/**
 * Upload the PDF itself. Goes straight to S3 with a one-time signed URL, so a
 * large book never passes through the API. Returns the public URL to publish.
 */
export function useDocumentUpload() {
  return useMutation<string, Error, File>({
    mutationFn: async (file: File) => {
      const { uploadUrl, publicUrl } = await api<PresignedUpload>(
        "/documents/upload-url",
        { method: "POST", body: JSON.stringify({ contentType: file.type }) },
      );

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);

      return publicUrl;
    },
  });
}

// the API only accepts the image/pdf types its presign whitelist allows
export const DOCUMENT_CONTENT_TYPES = ["application/pdf"] as const;

export const formatSize = (bytes: number): string =>
  bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;
