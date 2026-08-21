"use client";

import { useState } from "react";
import { BookOpen, ExternalLink, Upload } from "lucide-react";
import {
  formatSize,
  useDocumentUpload,
  usePublishPurpleBook,
  usePurpleBook,
} from "@/lib/summit/documents";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";

// FR-15. Publishing here is what makes the mobile Purple Book screen stop
// saying "not published yet" - the app reads the URL from the API, so a new
// edition needs no app release.
export default function DocumentsPage() {
  const { data: book, isLoading } = usePurpleBook();
  const upload = useDocumentUpload();
  const publish = usePublishPurpleBook();

  const [title, setTitle] = useState("The Purple Book 2026");
  const [url, setUrl] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");

  async function pickFile(file: File | undefined) {
    if (!file) return;
    const publicUrl = await upload.mutateAsync(file);
    setUrl(publicUrl);
    setSizeLabel(formatSize(file.size));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await publish.mutateAsync({ title, url, sizeLabel: sizeLabel || undefined });
  }

  const busy = upload.isPending || publish.isPending;
  const error = upload.error ?? publish.error;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Documents
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          The Purple Book, as delegates see it in the app (FR-15)
        </p>
      </header>

      <section className="glass-card flex items-start gap-4 p-5">
        <div className="rounded-xl bg-summit-cerise/10 p-3">
          <BookOpen className="size-5 text-summit-cerise" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <p className="text-sm text-summit-smoke">Checking…</p>
          ) : book ? (
            <>
              <p className="text-sm font-medium text-summit-lilac">{book.title}</p>
              <p className="mt-1 text-xs text-summit-smoke">
                {book.sizeLabel ? `${book.sizeLabel} · ` : ""}
                published {new Date(book.updatedAt).toLocaleString()}
              </p>
              <a
                href={book.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-summit-cerise hover:underline"
              >
                Open current PDF <ExternalLink className="size-3" />
              </a>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-summit-lilac">Not published</p>
              <p className="mt-1 text-xs text-summit-smoke">
                Delegates see “not published yet” on the Purple Book screen until
                this is set.
              </p>
            </>
          )}
        </div>
      </section>

      <form onSubmit={submit} className="glass-card flex flex-col gap-3 p-5">
        <p className="text-sm font-medium text-summit-lilac">
          {book ? "Replace the PDF" : "Publish the Purple Book"}
        </p>

        <input
          className={inputCls}
          placeholder="Title"
          required
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-summit-lilac/25 px-3 py-6 text-sm text-summit-smoke hover:border-summit-cerise">
          <Upload className="size-4" />
          {upload.isPending
            ? "Uploading…"
            : url
              ? "Choose a different PDF"
              : "Choose a PDF"}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => void pickFile(e.target.files?.[0])}
          />
        </label>

        {/* the URL stays editable: a book already hosted elsewhere can be
            published without re-uploading it here */}
        <input
          className={inputCls}
          placeholder="PDF URL"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Size label shown next to the download button (e.g. 4.2 MB)"
          value={sizeLabel}
          onChange={(e) => setSizeLabel(e.target.value)}
        />

        {error && (
          <p className="text-sm text-summit-cream">{(error as Error).message}</p>
        )}
        {publish.isSuccess && !error && (
          <p className="text-sm text-summit-cerise">
            Published. Delegates see it on their next visit to the screen.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={busy || !url}
            className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {publish.isPending ? "Publishing…" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
