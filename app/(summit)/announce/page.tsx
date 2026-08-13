"use client";
import { useState } from "react";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEGMENTS, useNotifications, useSendNotification, type Segment } from "@/lib/summit/notifications";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";


export default function Announce(){
    const  {data: sent} = useNotifications();
    const send = useSendNotification();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState("");
    const [segment, setSegment] = useState<Segment>("all");
    const [confirming, setConfirming] = useState(false);
    const [done, SetDone] = useState(false);

    async function submit(e: React.FormEvent){
        e.preventDefault();
        if(!confirming){
            setConfirming(true);
            return;
        }
        await send.mutateAsync({title, body, segment,...(category ?{category}: {})});
        setTitle("");
        setBody("");
        setCategory("");
        setSegment("all");
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
              </div>
              <span className="rounded-full bg-summit-cerulean/15 px-2.5 py-0.5 text-[11px] text-summit-cerulean uppercase">
                {n.segment}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

}