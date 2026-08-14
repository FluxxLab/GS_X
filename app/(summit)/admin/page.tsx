"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmins, useDelegates, useSetAdmin } from "@/lib/summit/delegates";

const inputCls =
  "rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";

export default function TeamPage() {
  const { data: admins, isLoading, error } = useAdmins();
  const setAdmin = useSetAdmin();
  const [search, setSearch] = useState("");
  const { data: candidates } = useDelegates({ search });
  const [confirming, setConfirming] = useState<string | null>(null);

  const nonAdmins = (candidates ?? []).filter((d) => d.accessTier !== "admin");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Team
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Who can operate this console. Admins control sessions, send announcements, and export
          data — every change here is logged as a critical security event.
        </p>
      </header>

      <section className="glass-card p-5">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          Current admins
        </h2>

        {isLoading && <p className="mt-3 text-sm text-summit-smoke">Loading…</p>}
        {error && <p className="mt-3 text-sm text-summit-cream">{(error as Error).message}</p>}

        <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
          {(admins ?? []).map((a) => (
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
          {!isLoading && (admins ?? []).length === 0 && (
            <li className="py-3 text-sm text-summit-smoke">No admins listed.</li>
          )}
        </ul>

        {setAdmin.error && (
          <p className="mt-3 text-sm text-summit-cream">{(setAdmin.error as Error).message}</p>
        )}

        {(admins ?? []).length === 1 && (
          <p className="mt-3 text-xs text-summit-cream">
            Only one admin exists. Add a second before the summit so a single unavailable laptop
            can&apos;t stop the event.
          </p>
        )}
      </section>

      <section className="glass-card p-5">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          Grant admin access
        </h2>
        <p className="mt-1 text-xs text-summit-smoke">
          Search a registered delegate to promote. They keep their existing login.
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
                  onClick={() => setAdmin.mutate({ id: d.id, admin: true })}
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
