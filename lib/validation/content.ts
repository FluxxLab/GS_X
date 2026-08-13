import { z } from "zod";

/**
 * Blog post form. Mirrors the backend DTO's limits (src/blog/dto/blog.dto.ts)
 * so the user is told what is wrong before a round trip, not after a 400.
 *
 * No `status` or `publishedAt`: the API refuses both on create/update, because
 * publishing is a separate privilege with its own endpoint.
 */
export const blogPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),

  /**
   * Optional: the server derives one from the title when this is blank. Kept
   * editable so a post's address can stay put after a retitle, since changing a
   * live slug breaks every link already shared.
   */
  slug: z
    .string()
    .trim()
    .max(220, "Slug cannot exceed 220 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and single hyphens, e.g. great-taste-fresh",
    )
    .optional()
    .or(z.literal("")),

  excerpt: z
    .string()
    .trim()
    .max(400, "Excerpt cannot exceed 400 characters")
    .optional()
    .or(z.literal("")),

  body: z.string().trim().min(1, "A post needs a body"),

  /**
   * Alt text. Not required, because a cover can legitimately be decorative, but
   * if it carries meaning this is the only thing describing it to a screen
   * reader.
   */
  coverAlt: z
    .string()
    .trim()
    .max(300, "Alt text cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),

  /** One category name. Matched-or-created server-side. */
  category: z
    .string()
    .trim()
    .max(80, "Category cannot exceed 80 characters")
    .optional()
    .or(z.literal("")),

  /** Comma-separated tag names in the form; split to an array on submit. */
  tags: z
    .string()
    .trim()
    .max(400, "Too many tags")
    .optional()
    .or(z.literal("")),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

/** Matches the backend's ALLOWED_COVER_TYPES and its 5MB interceptor limit. */
export const COVER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const COVER_MAX_BYTES = 5 * 1024 * 1024;

export function coverFileError(file: File): string | null {
  if (!COVER_MIME_TYPES.includes(file.type)) {
    return "Cover must be a JPEG, PNG, WebP or AVIF image.";
  }
  if (file.size > COVER_MAX_BYTES) {
    return "Cover must be 5MB or smaller.";
  }
  return null;
}
