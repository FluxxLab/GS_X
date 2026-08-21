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
