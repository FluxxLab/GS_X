"use client";

import { useState } from "react";
import { Mic as MicIcon, ShieldPlus } from "lucide-react";
import { Mic, ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { isStaff, useAdmins, useCreateStaff, useDelegates, useSetAdmin, type StaffRole } from "@/lib/summit/delegates";

const inputCls =
  "rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";

export default function TeamPage() {
  const { data: admins, isLoading, error } = useAdmins();
  const setAdmin = useSetAdmin();
  const [search, setSearch] = useState("");
  const { data: candidates } = useDelegates({ search });
  const [confirming, setConfirming] = useState<string | null>(null);

  // the add-a-team-member form
  const createStaff = useCreateStaff();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "session_admin" as StaffRole });
  const [created, setCreated] = useState<{ name: string; email: string; role: StaffRole } | null>(null);
  const canSubmit = form.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email) && form.password.length >= 8;
  const suggestPassword = () => {
    // readable, no ambiguous glyphs, long enough to be a real password
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const bytes = new Uint8Array(14);
    crypto.getRandomValues(bytes);
    const pw = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    setForm((f) => ({ ...f, password: pw }));
  };
  const submitStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || createStaff.isPending) return;
    const payload = { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase() };
    await createStaff.mutateAsync(payload);
    setCreated({ name: payload.name, email: payload.email, role: payload.role });
    setForm({ name: "", email: "", password: "", role: payload.role });
  };

  const nonAdmins = (candidates ?? []).filter((d) => !isStaff(d.accessTier));
  const fullAdmins = (admins ?? []).filter((a) => a.accessTier === "admin");
  const sessionAdmins = (admins ?? []).filter((a) => a.accessTier === "session_admin");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Team
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Who can operate this console. Admins control sessions, send announcements, and export
          data. Session admins see the Capture tab only: they can start, stop and clear captions
          for a room and nothing else. Every change here is logged as a critical security event.
        </p>
      </header>

      <section className="glass-card p-5">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          Current admins
        </h2>

        {isLoading && <p className="mt-3 text-sm text-summit-smoke">Loading…</p>}
        {error && <p className="mt-3 text-sm text-summit-cream">{(error as Error).message}</p>}

        <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
          {fullAdmins.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-3">
              <ShieldCheck className="size-4 shrink-0 text-summit-green" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="truncate text-xs text-summit-smoke">{a.email}</p>
              </div>
              <button
                onClick={() =>
                  confirming === a.id
                    ? (setAdmin.mutate({ id: a.id, admin: false }), setConfirming(null))
                    : setConfirming(a.id)
                }
                disabled={setAdmin.isPending}
                className={cn(
                  "flex items-center gap-1.5 rounded-[20px] px-3 py-1.5 text-xs disabled:opacity-50",
                  confirming === a.id
                    ? "bg-summit-cream text-summit-violet"
                    : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
                )}
              >
                <ShieldOff className="size-3.5" />
                {confirming === a.id ? "Confirm revoke" : "Revoke"}
              </button>
            </li>
          ))}
          {!isLoading && fullAdmins.length === 0 && (
            <li className="py-3 text-sm text-summit-smoke">No admins listed.</li>
          )}
        </ul>

        {setAdmin.error && (
          <p className="mt-3 text-sm text-summit-cream">{(setAdmin.error as Error).message}</p>
        )}

        {fullAdmins.length === 1 && (
          <p className="mt-3 text-xs text-summit-cream">
            Only one admin exists. Add a second before the summit so a single unavailable laptop
            can&apos;t stop the event.
          </p>
        )}
      </section>

      <section className="glass-card p-5">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          Session admins
        </h2>
        <p className="mt-1 text-xs text-summit-smoke">
          Caption operators. Their console is the Capture tab and nothing else.
        </p>
        <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
          {sessionAdmins.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-3">
              <Mic className="size-4 shrink-0 text-summit-cerulean" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="truncate text-xs text-summit-smoke">{a.email}</p>
              </div>
              <button
                onClick={() =>
                  confirming === a.id
                    ? (setAdmin.mutate({ id: a.id, admin: false }), setConfirming(null))
                    : setConfirming(a.id)
                }
                disabled={setAdmin.isPending}
                className={cn(
                  "flex items-center gap-1.5 rounded-[20px] px-3 py-1.5 text-xs disabled:opacity-50",
                  confirming === a.id
                    ? "bg-summit-cream text-summit-violet"
                    : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
                )}
              >
                <ShieldOff className="size-3.5" />
                {confirming === a.id ? "Confirm revoke" : "Revoke"}
              </button>
            </li>
          ))}
          {!isLoading && sessionAdmins.length === 0 && (
            <li className="py-3 text-sm text-summit-smoke">No session admins yet.</li>
          )}
        </ul>
      </section>

      <section className="glass-card p-5">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          Add a team member
        </h2>
        <p className="mt-1 text-xs text-summit-smoke">
          Creates their console login straight away. No app registration, no code. Give them the
          email and password; they sign in at this address.
        </p>
        <form onSubmit={submitStaff} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoComplete="off"
          />
          <input
            className={inputCls}
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="off"
          />
          <div className="flex gap-2">
            <input
              className={cn(inputCls, "flex-1 font-mono")}
              placeholder="Password (8+ characters)"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={suggestPassword}
              className="rounded-xl border border-summit-lilac/15 px-3 text-xs text-summit-smoke hover:text-summit-lilac"
            >
              Suggest
            </button>
          </div>
          <div className="flex items-center gap-2">
            {(["session_admin", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                aria-pressed={form.role === r}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition",
                  form.role === r
                    ? "border-summit-cerise bg-summit-cerise/15 text-summit-lilac"
                    : "border-summit-lilac/15 text-summit-smoke hover:text-summit-lilac",
                )}
              >
                {r === "session_admin" ? <MicIcon className="size-3.5" /> : <ShieldPlus className="size-3.5" />}
                {r === "session_admin" ? "Session admin (Capture only)" : "Admin (whole console)"}
              </button>
            ))}
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || createStaff.isPending}
              className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {createStaff.isPending ? "Creating…" : "Create login"}
            </button>
            {createStaff.error && (
              <p className="text-sm text-summit-cream">{(createStaff.error as Error).message}</p>
            )}
            {created && !createStaff.error && (
              <p className="text-sm text-summit-green">
                {created.name} can now sign in as {created.email}
                {created.role === "session_admin" ? " and will see Capture only." : " with full access."}
              </p>
            )}
          </div>
        </form>
      </section>

      <section className="glass-card p-5">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          Promote an existing delegate
        </h2>
        <p className="mt-1 text-xs text-summit-smoke">
          Search a registered delegate to promote. They keep their existing login. Make them an
          admin for the whole console, or a session admin for Capture only.
        </p>
        <input
          className={cn(inputCls, "mt-3 w-72")}
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search.length >= 2 && (
          <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
            {nonAdmins.slice(0, 8).map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="truncate text-xs text-summit-smoke">
                    {d.email} · {d.accessTier}
                  </p>
                </div>
                <button
                  onClick={() => setAdmin.mutate({ id: d.id, admin: true, role: "session_admin" })}
                  disabled={setAdmin.isPending}
                  className="flex items-center gap-1.5 rounded-[20px] border border-summit-cerulean/40 px-3 py-1.5 text-xs text-summit-cerulean hover:bg-summit-cerulean/10 disabled:opacity-50"
                >
                  <Mic className="size-3.5" />
                  Session admin
                </button>
                <button
                  onClick={() => setAdmin.mutate({ id: d.id, admin: true, role: "admin" })}
                  disabled={setAdmin.isPending}
                  className="rounded-[20px] bg-summit-cerise px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  Make admin
                </button>
              </li>
            ))}
            {nonAdmins.length === 0 && (
              <li className="py-3 text-sm text-summit-smoke">No matching delegates.</li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
