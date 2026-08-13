"use client";

import { useState } from "react";
import {
    SessionInput,
  TRACKS,
  useCreateSession,
  useUpdateSession,
  type Session,
  type Track,
} from "@/lib/summit/sessions";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";


  export function SessionForm({session, onClose}: {session: Session | null, onClose: () => void, }){
    const create = useCreateSession();
    const update = useUpdateSession();
    const pending = create.isPending || update.isPending;
    const err = create.error || update.error;
    const [form, setForm] = useState({
        title: session?.title ?? "",
    description: session?.description ?? "",
    day: session?.day ?? 1,
    startsAt: session?.startsAt?.slice(0, 16) ?? "2026-09-08T09:00",
    endsAt: session?.endsAt?.slice(0, 16) ?? "2026-09-08T10:00",
    room: session?.room ?? "",
    track: (session?.track ?? "plenary") as Track,
    type: session?.type ?? "Breakout Session",
    audience: session?.audience ?? "",
    });
    const set = (k: string, v: string | number) => setForm((f) => ({...f, [k] : v}));
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const payload = {
            ...form,
            day: Number(form.day),
            startsAt: new Date(form.startsAt).toISOString(),
            endsAt: new Date(form.endsAt).toISOString(),
            status: session?.status ?? ("scheduled" as const)
        };
        if(session){
            await update.mutateAsync({id: session.id, ...payload});
        } else {
           
            await create.mutateAsync(payload);
            
        }
        onClose();
    };

      return (
    <form onSubmit={submit} className="glass-card flex flex-col gap-3 p-5">
      <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
        {session ? "Edit session" : "New session"}
      </h2>
      <input className={inputCls} placeholder="Title" required value={form.title} onChange={(e) => set("title", e.target.value)} />
      <textarea className={inputCls} placeholder="Description" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <select className={inputCls} value={form.day} onChange={(e) => set("day", Number(e.target.value))}>
          <option value={1}>Day 1 — 8 Sept</option>
          <option value={2}>Day 2 — 9 Sept</option>
        </select>
        <input className={inputCls} type="datetime-local" required value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
        <input className={inputCls} type="datetime-local" required value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
        <input className={inputCls} placeholder="Room" required value={form.room} onChange={(e) => set("room", e.target.value)} />
        <select className={inputCls} value={form.track} onChange={(e) => set("track", e.target.value)}>
          {TRACKS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input className={inputCls} placeholder="Type (e.g. Breakout Session)" required value={form.type} onChange={(e) => set("type", e.target.value)} />
        <input className={inputCls} placeholder="Audience (optional)" value={form.audience} onChange={(e) => set("audience", e.target.value)} />
      </div>
      {err && <p className="text-sm text-summit-cream">{(err as Error).message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onClose} className="rounded-[20px] px-4 py-2 text-sm text-summit-smoke hover:text-summit-lilac">
          Cancel
        </button>
      </div>
    </form>
  );
  }