"use client";
import { useState } from "react";
import { ExternalLink, Megaphone, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SEGMENTS,
  useDeleteNotification,
  useNotifications,
  useSendNotification,
  type Segment,
} from "@/lib/summit/notifications";
import { useSessions } from "@/lib/summit/sessions";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";


export default function Announce(){
    const  {data: sent} = useNotifications();
    const send = useSendNotification();
    const remove = useDeleteNotification();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState("");
    const [segment, setSegment] = useState<Segment>("all");
    // Where a tap on the notification leads. Either, neither, never both:
    // a session opens inside the app, a link leaves it for the browser, and
    // one tap can only do one thing.
    const [sessionId, setSessionId] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const { data: sessions } = useSessions();
    const sessionTitle = (id?: string | null) => sessions?.find((s) => s.id === id)?.title;
    const [confirming, setConfirming] = useState(false);
    const [done, SetDone] = useState(false);

    async function submit(e: React.FormEvent){
        e.preventDefault();
        if(!confirming){
            setConfirming(true);
            return;
        }
        await send.mutateAsync({
          title,
          body,
          segment,
          ...(category ? { category } : {}),
          ...(sessionId ? { sessionId } : {}),
          ...(linkUrl.trim() ? { linkUrl: linkUrl.trim() } : {}),
        });
        setTitle("");
        setBody("");
        setCategory("");
        setSegment("all");
        setSessionId("");
        setLinkUrl("");
        setConfirming(false);
        SetDone(true);
        setTimeout(() => SetDone(false), 4000);

    }

     return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Announce
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Push notifications to delegate devices by segment.
        </p>
      </header>

      <form onSubmit={submit} className="glass-card flex flex-col gap-3 p-5">
        <input className={inputCls} placeholder="Push title" required maxLength={255} value={title}
          onChange={(e) => { setTitle(e.target.value); setConfirming(false); }} />
        <textarea className={inputCls} placeholder="Message body" required rows={3} value={body}
          onChange={(e) => { setBody(e.target.value); setConfirming(false); }} />
        <input className={inputCls} placeholder="Category (optional, e.g. schedule-change)" maxLength={100}
          value={category} onChange={(e) => setCategory(e.target.value)} />

        <fieldset className="flex flex-col gap-2 rounded-xl border border-summit-lilac/10 p-3">
          <legend className="px-1 text-xs uppercase tracking-wide text-summit-smoke">
            Links to (optional)
          </legend>
          <p className="text-xs text-summit-smoke">
            Tapping the notification opens this. Leave both empty for a plain announcement.
          </p>
          <select
            className={inputCls}
            value={sessionId}
            onChange={(e) => { setSessionId(e.target.value); if (e.target.value) setLinkUrl(""); setConfirming(false); }}
            aria-label="Session this announcement is about"
          >
            <option value="">No session</option>
            {(sessions ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                Day {s.day}: {s.title}
              </option>
            ))}
          </select>
          <input
            className={inputCls}
            type="url"
            inputMode="url"
            placeholder="or a web address, e.g. https://policycentre.org/communique"
            maxLength={500}
            value={linkUrl}
            disabled={Boolean(sessionId)}
            onChange={(e) => { setLinkUrl(e.target.value); setConfirming(false); }}
          />
        </fieldset>

        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSegment(s); setConfirming(false); }}
              className={cn(
                "rounded-full px-3 py-1 text-xs capitalize transition-colors",
                segment === s
                  ? "bg-summit-cerulean text-summit-violet"
                  : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {send.error && <p className="text-sm text-summit-cream">{(send.error as Error).message}</p>}
        {done && <p className="text-sm text-summit-green">Sent.</p>}

        <button
          type="submit"
          disabled={send.isPending}
          className={cn(
            "flex items-center justify-center gap-2 rounded-[20px] px-4 py-2 text-sm transition-opacity disabled:opacity-50",
            confirming ? "bg-summit-cream text-summit-violet" : "bg-summit-cerise text-white hover:opacity-90",
          )}
        >
          <Megaphone className="size-4" />
          {send.isPending
            ? "Sending…"
            : confirming
              ? `Confirm — push to “${segment}” now`
              : "Send announcement"}
        </button>
      </form>

      <section className="glass-card p-5">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          Recent
        </h2>
        <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
          {(sent ?? []).length === 0 && (
            <li className="py-3 text-sm text-summit-smoke">Nothing sent yet.</li>
          )}
          {(sent ?? []).map((n, i) => (
            <li key={n.id ?? i} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{n.title}</p>
                <p className="truncate text-xs text-summit-smoke">{n.body}</p>
                {(n.sessionId || n.linkUrl) && (
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-summit-cerulean">
                    <ExternalLink className="size-3 shrink-0" />
                    {n.sessionId ? (sessionTitle(n.sessionId) ?? "a session") : n.linkUrl}
                  </p>
                )}
              </div>
              <span className="rounded-full bg-summit-cerulean/15 px-2.5 py-0.5 text-[11px] text-summit-cerulean uppercase">
                {n.segment}
              </span>
              {n.id && (
                // two taps on purpose: the first arms, the second deletes -
                // a retraction removes the item from every delegate's inbox
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDelete !== n.id) { setConfirmDelete(n.id!); return; }
                    remove.mutate(n.id!, { onSettled: () => setConfirmDelete(null) });
                  }}
                  onBlur={() => setConfirmDelete(null)}
                  disabled={remove.isPending}
                  aria-label={confirmDelete === n.id ? "Confirm delete" : `Delete “${n.title}”`}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors disabled:opacity-50",
                    confirmDelete === n.id
                      ? "bg-summit-cream text-summit-violet"
                      : "text-summit-smoke hover:bg-summit-lilac/10 hover:text-summit-lilac",
                  )}
                >
                  <Trash2 className="size-3.5" />
                  {confirmDelete === n.id ? "Confirm" : "Delete"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

}