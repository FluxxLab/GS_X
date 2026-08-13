/**
 * Mirrors the backend's src/blog DTOs and entity.
 *
 * Note what is NOT here: `status` and `publishedAt` are absent from the create
 * and update payloads on purpose. The API refuses them. Writing a post and
 * putting it in front of customers are separate privileges
 * (content.blog.create vs content.blog.approve), so going live is its own
 * endpoint. A post is always created as a draft.
 */
export type BlogPostStatus = "draft" | "published" | "archived";

export const BLOG_STATUS_LABEL: Record<BlogPostStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export interface BlogCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTagRef {
  id: string;
  name: string;
  slug: string;
}

/** List rows. The API omits `body` from listings on purpose. */
export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverKey: string | null;
  coverAlt: string | null;
  status: BlogPostStatus;
  publishedAt: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost extends BlogPostSummary {
  body: string;
  category: BlogCategoryRef | null;
  tags: BlogTagRef[];
}

export interface CreateBlogPostPayload {
  title: string;
  /** Optional: derived from the title when omitted. */
  slug?: string;
  excerpt?: string;
  /** Markdown. */
  body: string;
  coverAlt?: string;
  /** Category name; matched-or-created by slug server-side. */
  category?: string;
  /** Tag names; each matched-or-created by slug. */
  tags?: string[];
}

export type BlogCommentStatus = "pending" | "approved" | "rejected";

/** A row in the moderation queue. */
export interface BlogCommentRow {
  id: string;
  authorName: string;
  authorEmail: string | null;
  body: string;
  status: BlogCommentStatus;
  createdAt: string;
  postId: string;
  postTitle: string;
  postSlug: string;
}

export type UpdateBlogPostPayload = Partial<CreateBlogPostPayload>;

export interface QueryBlogPostsParams {
  status?: BlogPostStatus;
  search?: string;
}
