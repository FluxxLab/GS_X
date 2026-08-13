import { apiClient } from "../api/client";
import type {
  BlogPost,
  BlogPostSummary,
  CreateBlogPostPayload,
  UpdateBlogPostPayload,
  QueryBlogPostsParams,
  BlogCommentRow,
  BlogCommentStatus,
} from "../types/blog";

/**
 * /blog/admin, not /blog: the public controller owns /blog/:slug, so without
 * the prefix "admin" would be a valid post slug and the two would race for the
 * same path.
 */
const PATH = "/blog/admin";

export const blogService = {
  getAll(params?: QueryBlogPostsParams): Promise<BlogPostSummary[]> {
    return apiClient.get<BlogPostSummary[]>(
      PATH,
      params as Record<string, string | undefined>,
    );
  },

  getOne(id: string): Promise<BlogPost> {
    return apiClient.get<BlogPost>(`${PATH}/${id}`);
  },

  create(data: CreateBlogPostPayload): Promise<BlogPost> {
    return apiClient.post<BlogPost>(PATH, data);
  },

  update(id: string, data: UpdateBlogPostPayload): Promise<BlogPost> {
    return apiClient.patch<BlogPost>(`${PATH}/${id}`, data);
  },

  /** Requires content.blog.approve. Omit publishedAt to go live now. */
  publish(id: string, publishedAt?: string): Promise<BlogPost> {
    return apiClient.post<BlogPost>(`${PATH}/${id}/publish`, publishedAt ? { publishedAt } : {});
  },

  unpublish(id: string): Promise<BlogPost> {
    return apiClient.post<BlogPost>(`${PATH}/${id}/unpublish`, {});
  },

  archive(id: string): Promise<BlogPost> {
    return apiClient.post<BlogPost>(`${PATH}/${id}/archive`, {});
  },

  /** The post must already be saved: the key is scoped to its id. */
  uploadCover(id: string, file: File): Promise<BlogPost> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<BlogPost>(`${PATH}/${id}/cover`, formData);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/${id}`);
  },

  // ── comment moderation (content.comments.*) ──────────────────────────────

  listComments(status?: BlogCommentStatus): Promise<BlogCommentRow[]> {
    return apiClient.get<BlogCommentRow[]>(`${PATH}/comments/list`, { status });
  },

  pendingCommentCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>(`${PATH}/comments/pending-count`);
  },

  moderateComment(commentId: string, status: "approved" | "rejected"): Promise<unknown> {
    return apiClient.patch(`${PATH}/comments/${commentId}`, { status });
  },

  deleteComment(commentId: string): Promise<void> {
    return apiClient.delete<void>(`${PATH}/comments/${commentId}`);
  },
};
