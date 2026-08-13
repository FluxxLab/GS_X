"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { travelService } from "@/lib/services/travel.service";

/** Attachments (e-tickets, receipts) for a travel request: list + upload/download/delete. */
export function useTravelAttachments(requestId: string | null) {
  const queryClient = useQueryClient();
  const key = ["travel", "attachments", requestId];

  const listQuery = useQuery({
    queryKey: key,
    queryFn: () => travelService.listAttachments(requestId!),
    enabled: !!requestId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      kind,
      caption,
    }: {
      file: File;
      kind?: string;
      caption?: string;
    }) => travelService.uploadAttachment(requestId!, file, kind, caption),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (attId: string) => travelService.deleteAttachment(attId),
    onSuccess: invalidate,
  });

  const download = async (attId: string) => {
    const { url } = await travelService.attachmentDownloadUrl(attId);
    window.open(url, "_blank", "noopener");
  };

  return {
    attachments: listQuery.data ?? [],
    loading: listQuery.isLoading,
    upload: (file: File, kind?: string, caption?: string) =>
      uploadMutation.mutateAsync({ file, kind, caption }),
    uploading: uploadMutation.isPending,
    remove: deleteMutation.mutateAsync,
    download,
  };
}
