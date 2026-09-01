import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export interface Speaker {
  id: string;
  name: string;
  role: string | null;
  organisation: string | null;
  avatarUrl: string | null;
}

export interface SpeakerInput {
  name: string;
  role?: string;
  organisation?: string;
  /** public URL from useSpeakerAvatarUpload */
  avatarUrl?: string;
}

interface PresignedUpload {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

/**
 * Upload a speaker headshot. The file goes straight to S3 with a one-time
 * signed URL, so the image never passes through the API and there is no
 * request-size limit to trip over. Returns the public URL to submit with the
 * speaker.
 */
export function useSpeakerAvatarUpload() {
  return useMutation<string, Error, File>({
    mutationFn: async (file: File) => {
      const { uploadUrl, publicUrl } = await api<PresignedUpload>(
        "/speakers/avatar-upload",
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

export function useSpeakers() {
  return useQuery({
    queryKey: ["speakers"],
    queryFn: () => api<Speaker[]>("/speakers"),
    staleTime: 5 * 60_000, // speakers change rarely; don't refetch on every form open
  });
}

export function useCreateSpeaker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SpeakerInput) =>
      api<Speaker>("/speakers", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["speakers"] }),
  });
}

/**
 * The speaker reveal: one global switch for the whole programme.
 *
 * While it is off the API withholds every speaker's name, role, organisation
 * and photo from delegates - the mobile app shows "To be announced" - and
 * speaker search returns nothing. Admin always sees the real line-up, which is
 * why this dashboard looks the same either way.
 */
export function useSpeakerReveal() {
  return useQuery({
    queryKey: ["speakers", "reveal"],
    queryFn: () => api<{ revealed: boolean }>("/speakers/reveal"),
  });
}

export function useSetSpeakerReveal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (revealed: boolean) =>
      api<{ revealed: boolean }>("/speakers/reveal", {
        method: "POST",
        body: JSON.stringify({ revealed }),
      }),
    // Sessions carry speakers, so both caches are stale once this flips.
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["speakers"] });
      void qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
