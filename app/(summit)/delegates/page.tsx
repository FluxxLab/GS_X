"use client";

import { useState } from "react";
import { Download, Flag, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRACKS } from "@/lib/summit/sessions";
import {
  GRANTABLE_TIERS,
  TIERS,
  downloadDelegatesCsv,
  useAddRegistrationEntry,
  useDelegates,
  useRegistrationList,
  useSetTier,
  type Tier,
} from "@/lib/summit/delegates";

const inputCls =
  "rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";

const TIER_STYLES: Record<Tier, string> = {
  standard: "bg-summit-lilac/10 text-summit-smoke",
  vip: "bg-summit-cream/15 text-summit-cream",
  vvip: "bg-summit-cerise/20 text-summit-cerise",
  press: "bg-summit-cerulean/15 text-summit-cerulean",
  admin: "bg-summit-green/15 text-summit-green",
};

export default function DelegatesPage() {
  const [tab, setTab] = useState<"directory" | "registration">("directory");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
            Delegates
          </h1>
          <p className="mt-1 text-sm text-summit-smoke">
            Directory, tiers, and the pre-approved registration list.
          </p>
        </div>
        <div className="flex gap-2">
          {(["directory", "registration"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-[20px] px-4 py-2 text-sm capitalize transition-colors",
                tab === t
                  ? "bg-summit-cerise text-white"
                  : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
              )}
            >
              {t === "registration" ? "Registration list" : "Directory"}
            </button>
          ))}
        </div>
      </header>

      {tab === "directory" ? <Directory /> : <RegistrationList />}
    </div>
  );
}

function Directory() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<Tier | "">("");
  const [track, setTrack] = useState("");
  const { data: delegates, isLoading, error } = useDelegates({ search, tier, track });
  const setTierMut = useSetTier();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function onExport() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadDelegatesCsv();
    } catch (e) {
      setExportError((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <input
          className={cn(inputCls, "w-64")}
          placeholder="Search name, email, organisation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={inputCls} value={tier} onChange={(e) => setTier(e.target.value as Tier | "")}>
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className={inputCls} value={track} onChange={(e) => setTrack(e.target.value)}>
          <option value="">All tracks</option>
          {TRACKS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="ml-auto flex flex-col items-end">
          <button
            onClick={onExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-[20px] bg-summit-cerulean px-4 py-2 text-sm text-summit-violet transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Download className="size-4" />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <span className="mt-1 text-[11px] text-summit-smoke">
            Exports are logged to security events
          </span>
        </div>
      </div>

      {exportError && <p className="text-sm text-summit-cream">{exportError}</p>}
      {isLoading && <p className="text-sm text-summit-smoke">Loading directory…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load delegates — {(error as Error).message}
        </div>
      )}

      <section className="glass-card overflow-x-auto p-5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-[11px] tracking-[0.1em] text-summit-smoke uppercase">
              <th className="pb-3 font-normal">Delegate</th>
              <th className="pb-3 font-normal">Organisation</th>
              <th className="pb-3 font-normal">Tracks</th>
              <th className="pb-3 font-normal">Interests</th>
              <th className="pb-3 font-normal">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-summit-lilac/10">
            {(delegates ?? []).map((d) => (
              <tr key={d.id}>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{d.name}</p>
                      <p className="truncate text-xs text-summit-smoke">{d.email}</p>
                    </div>
                    {d.flagged && <Flag className="size-3.5 shrink-0 text-summit-cerise" />}
                  </div>
                </td>
                <td className="py-3 pr-4 text-summit-smoke">
                  {d.organisation ?? "—"}
                  {d.country ? ` · ${d.country}` : ""}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex max-w-48 flex-wrap gap-1">
                    {d.tracks.map((t) => (
                      <span key={t} className="rounded-full bg-summit-cerulean/15 px-2 py-0.5 text-[11px] text-summit-cerulean">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex max-w-48 flex-wrap gap-1">
                    {d.interests.map((i) => (
                      <span key={i} className="rounded-full bg-summit-lilac/10 px-2 py-0.5 text-[11px] text-summit-smoke">
                        {i}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3">
                  <select
                    value={d.accessTier}
                    disabled={setTierMut.isPending}
                    onChange={(e) => setTierMut.mutate({ id: d.id, tier: e.target.value as Tier })}
                    className={cn(
                      "cursor-pointer rounded-full border-0 px-3 py-1 text-xs outline-none",
                      TIER_STYLES[d.accessTier],
                    )}
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t} className="bg-summit-violet text-summit-lilac">
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!isLoading && (delegates ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-summit-smoke">
                  No delegates match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

function RegistrationList() {
  const { data: entries, isLoading, error } = useRegistrationList();
  const add = useAddRegistrationEntry();
  const [form, setForm] = useState({ email: "", inviteCode: "", name: "", assignedTier: "standard" as Tier });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await add.mutateAsync({
      assignedTier: form.assignedTier,
      ...(form.email ? { email: form.email } : {}),
      ...(form.inviteCode ? { inviteCode: form.inviteCode } : {}),
      ...(form.name ? { name: form.name } : {}),
    });
    setForm({ email: "", inviteCode: "", name: "", assignedTier: "standard" });
  }

  return (
    <>
      <form onSubmit={submit} className="glass-card flex flex-wrap items-end gap-3 p-5">
        <input className={cn(inputCls, "w-56")} type="email" placeholder="Email (match key)"
          value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input className={cn(inputCls, "w-40")} placeholder="Invite code (optional)"
          value={form.inviteCode} onChange={(e) => setForm((f) => ({ ...f, inviteCode: e.target.value }))} />
        <input className={cn(inputCls, "w-48")} placeholder="Label / name (optional)"
          value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <select className={inputCls} value={form.assignedTier}
          onChange={(e) => setForm((f) => ({ ...f, assignedTier: e.target.value as Tier }))}>
          {GRANTABLE_TIERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="submit" disabled={add.isPending}
          className="flex items-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white disabled:opacity-50">
          <Plus className="size-4" /> {add.isPending ? "Adding…" : "Add entry"}
        </button>
        {add.error && <p className="w-full text-sm text-summit-cream">{(add.error as Error).message}</p>}
      </form>

      {isLoading && <p className="text-sm text-summit-smoke">Loading…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load registration list — {(error as Error).message}
        </div>
      )}

      <section className="glass-card p-5">
        <ul className="flex flex-col divide-y divide-summit-lilac/10">
          {(entries ?? []).map((r) => (
            <li key={r.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name ?? r.email ?? r.inviteCode}</p>
                <p className="truncate text-xs text-summit-smoke">
                  {r.email ?? "no email"} {r.inviteCode ? `· code ${r.inviteCode}` : ""}
                </p>
              </div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] uppercase", TIER_STYLES[r.assignedTier])}>
                {r.assignedTier}
              </span>
              <span className={cn("text-xs", r.claimedAt ? "text-summit-green" : "text-summit-smoke")}>
                {r.claimedAt ? "claimed" : "unclaimed"}
              </span>
            </li>
          ))}
          {!isLoading && (entries ?? []).length === 0 && (
            <li className="py-4 text-sm text-summit-smoke">No entries yet — add the first above.</li>
          )}
        </ul>
      </section>
    </>
  );
}
