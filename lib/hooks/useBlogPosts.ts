"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogService } from "../services/blog.service";
import type {
  BlogPostSummary,
  CreateBlogPostPayload,
  UpdateBlogPostPayload,
  QueryBlogPostsParams,
} from "../types/blog";

/**
 * Admin blog data. Every mutation invalidates rather than hand-patching the
 * cache, per the house rule.
 *
 * None of these define `onError`: doing so silently disables the global
 * MutationCache toast, so a failure would vanish. Let it surface.
 */
export function useBlogPosts(params: QueryBlogPostsParams = {}) {
  const qc = useQueryClient();
  // Params are in the key so a slow response for an old filter cannot land on
  // top of a newer one.
  const invalidate = () => qc.invalidateQueries({ queryKey: ["blog", "posts"] });

  const { data, isLoading } = useQuery({
    queryKey: ["blog", "posts", params],
    queryFn: () => blogService.getAll(params),
  });

  const create = useMutation({
    mutationFn: (payload: CreateBlogPostPayload) => blogService.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBlogPostPayload }) =>
      blogService.update(id, payload),
    onSuccess: invalidate,
  });

  const publish = useMutation({
    mutationFn: ({ id, publishedAt }: { id: string; publishedAt?: string }) =>
      blogService.publish(id, publishedAt),
    onSuccess: invalidate,
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => blogService.unpublish(id),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: (id: string) => blogService.archive(id),
    onSuccess: invalidate,
  });

  const uploadCover = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => blogService.uploadCover(id, file),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => blogService.remove(id),
    onSuccess: invalidate,
  });

  return {
    posts: (data ?? []) as BlogPostSummary[],
    loading: isLoading,
    create,
    update,
    publish,
    unpublish,
    archive,
    uploadCover,
    remove,
  };
}
