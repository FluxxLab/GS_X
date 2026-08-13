"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogService } from "../services/blog.service";
import type { BlogCommentRow, BlogCommentStatus } from "../types/blog";

/**
 * Blog comment moderation. Gated on content.comments.* server-side.
 *
 * No `onError` on any mutation: that would silence the global MutationCache
 * toast, hiding a failed approve/delete from the moderator.
 */
export function useBlogComments(status: BlogCommentStatus = "pending") {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["blog", "comments"] });

  const { data, isLoading } = useQuery({
    queryKey: ["blog", "comments", status],
    queryFn: () => blogService.listComments(status),
  });

  const moderate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      blogService.moderateComment(id, status),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => blogService.deleteComment(id),
    onSuccess: invalidate,
  });

  return {
    comments: (data ?? []) as BlogCommentRow[],
    loading: isLoading,
    moderate,
    remove,
  };
}
