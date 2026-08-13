"use client";

import { useCallback, useState } from "react";
import { blogPostSchema, coverFileError, type BlogPostFormValues } from "../validation/content";
import { zodFieldErrors } from "../validation/helpers";
import { blogService } from "../services/blog.service";
import type { BlogPost, BlogPostSummary, CreateBlogPostPayload } from "../types/blog";

const EMPTY: BlogPostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverAlt: "",
  category: "",
  tags: "",
};

/**
 * Blog post form state, kept out of the page per the decomposition standard.
 *
 * The cover is the awkward part: its S3 key is scoped to the post's id, so it
 * cannot be uploaded before the post exists. On create we therefore save first,
 * then upload against the returned id. The file is held here until then.
 */
export function useBlogPostForm({
  onCreate,
  onUpdate,
  onUploadCover,
  onSuccess,
}: {
  onCreate: (payload: CreateBlogPostPayload) => Promise<BlogPost>;
  onUpdate: (args: { id: string; payload: CreateBlogPostPayload }) => Promise<BlogPost>;
  onUploadCover: (args: { id: string; file: File }) => Promise<BlogPost>;
  onSuccess: () => void;
}) {
  const [values, setValues] = useState<BlogPostFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<BlogPostSummary["status"] | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const setField = useCallback((key: keyof BlogPostFormValues, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }, []);

  const reset = useCallback(() => {
    setValues(EMPTY);
    setErrors({});
    setEditingId(null);
    setEditingStatus(null);
    setCoverFile(null);
  }, []);

  /** Needs the full post: listings omit `body`, category and tags. */
  const loadForEdit = useCallback(async (id: string) => {
    const post = await blogService.getOne(id);
    setValues({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      body: post.body,
      coverAlt: post.coverAlt ?? "",
      category: post.category?.name ?? "",
      tags: post.tags.map((t) => t.name).join(", "),
    });
    setErrors({});
    setEditingId(post.id);
    setEditingStatus(post.status);
    setCoverFile(null);
  }, []);

  const pickCover = useCallback((file: File | null) => {
    if (!file) {
      setCoverFile(null);
      return;
    }
    // Checked here as well as on the server so the user is told immediately,
    // rather than after uploading 5MB to be rejected.
    const problem = coverFileError(file);
    if (problem) {
      setErrors((e) => ({ ...e, cover: problem }));
      setCoverFile(null);
      return;
    }
    setErrors((e) => ({ ...e, cover: "" }));
    setCoverFile(file);
  }, []);

  const submit = useCallback(async () => {
    const parsed = blogPostSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    // Comma-separated tags become an array; blanks dropped, so "a, , b" is
    // ["a","b"]. Sent even when empty on an edit, so clearing the field clears
    // the post's tags.
    const tagList = (parsed.data.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Empty strings mean "not set", not "set to empty": send undefined so the
    // server derives a slug rather than trying to save a blank one. Category is
    // always sent (empty clears it); tags always sent (empty clears them).
    const payload: CreateBlogPostPayload = {
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category ?? "",
      tags: tagList,
      ...(parsed.data.slug ? { slug: parsed.data.slug } : {}),
      ...(parsed.data.excerpt ? { excerpt: parsed.data.excerpt } : {}),
      ...(parsed.data.coverAlt ? { coverAlt: parsed.data.coverAlt } : {}),
    };

    setSaving(true);
    try {
      const saved = editingId
        ? await onUpdate({ id: editingId, payload })
        : await onCreate(payload);

      if (coverFile) await onUploadCover({ id: saved.id, file: coverFile });

      reset();
      onSuccess();
    } finally {
      // Always clears, so a failed save leaves the modal open with the user's
      // work intact and the button usable again rather than stuck on "Saving".
      setSaving(false);
    }
  }, [values, editingId, coverFile, onCreate, onUpdate, onUploadCover, onSuccess, reset]);

  return {
    values,
    errors,
    setField,
    reset,
    loadForEdit,
    submit,
    saving,
    editingId,
    editingStatus,
    coverFile,
    pickCover,
  };
}
