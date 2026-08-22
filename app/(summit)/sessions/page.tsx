"use client";

import { useState, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { read, utils } from "xlsx";
import { cn } from "@/lib/utils";
import {
  SESSION_STATUSES,
  useSessions,
  useUpdateSessionStatus,
  useBulkCreateSessions,
  type Session,
  type SessionStatus,
} from "@/lib/summit/sessions";
import { SessionForm } from "@/app/(summit)/_components/SessionForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_STYLES: Record<SessionStatus, string> = {
  scheduled: "bg-summit-lilac/10 text-summit-smoke",
  live: "bg-summit-cerise text-white",
  completed: "bg-summit-green/15 text-summit-green",
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function SessionsPage(){
    const {data: sessions, isLoading, error} = useSessions();
    const updateStatus = useUpdateSessionStatus();
    const bulkCreate = useBulkCreateSessions();
    const [editing, setEditing] = useState<Session | null>(null);
    const [creating, setCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = utils.sheet_to_json(worksheet) as any[];

        const sessionsPayload = json.map(row => ({
           title: row.title || row.Title || "Untitled Session",
           description: row.description || row.Description || "",
           day: Number(row.day || row.Day || 1),
           startsAt: row.startsAt || row.StartsAt || new Date().toISOString(),
           endsAt: row.endsAt || row.EndsAt || new Date().toISOString(),
           room: row.room || row.Room || "",
           // Left blank when a row omits it: the API rejects an unknown track
           // with a 400, which is better than silently filing it under one
           // the uploader never chose.
           track: (row.track || row.Track || "").toLowerCase(),
           type: row.type || row.Type || "Session",
           audience: row.audience || row.Audience || "",
        }));
        
        bulkCreate.mutate(sessionsPayload as any);
      } catch (err) {
        console.error("Failed to parse file", err);
      }
      e.target.value = "";
    };

    const days =[...new Set((sessions ?? []).map((s) => s.day))].sort();

    return (
<div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
            Sessions
          </h1>
          <p className="mt-1 text-sm text-summit-smoke">
            Agenda control — status changes go live to delegates instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={bulkCreate.isPending}
            className="flex items-center gap-2 rounded-[20px] bg-summit-violet px-4 py-2 text-sm text-summit-lilac transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Upload className="size-4" /> {bulkCreate.isPending ? "Uploading..." : "Bulk upload"}
          </button>
          <button
            onClick={() => { setEditing(null); setCreating(true); }}
            className="flex items-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" /> New session
          </button>
        </div>
      </header>

      {(creating || editing) && (
        <SessionForm
          session={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}

      {isLoading && <p className="text-sm text-summit-smoke">Loading agenda…</p>}
      {error && (
        <div className="glass-card p-5 text-sm text-summit-cream">
          Couldn&apos;t load sessions — {(error as Error).message}
        </div>
      )}
      {!isLoading && !error && days.length === 0 && (
        <div className="glass-card p-5 text-sm text-summit-smoke">
          No sessions yet — create the first one above.
        </div>
      )}

      {days.map((day) => (
        <section key={day} className="glass-card p-5">
          <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
            Day {day}
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
            {(sessions ?? [])
              .filter((s) => s.day === day)
              .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
              .map((s) => (
                <li key={s.id} className="flex items-center gap-4 py-3">
                  <span className="w-24 shrink-0 text-sm text-summit-smoke">
                    {fmtTime(s.startsAt)}–{fmtTime(s.endsAt)}
                  </span>
                  <button
                    onClick={() => { setCreating(false); setEditing(s); }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-summit-smoke">
                      {s.room} · {s.type}
                    </p>
                    <p className="text-xs text-summit-smoke">
                      {s.room} · {s.type}
                      {s.speakers?.length ? ` · ${s.speakers.map((sp) => sp.name).join(", ")}` : ""}
                    </p>

                  </button>
                  <span className="rounded-full bg-summit-cerulean/15 px-2.5 py-0.5 text-[11px] tracking-wide text-summit-cerulean uppercase">
                    {s.track}
                  </span>
                  <Select
                    value={s.status}
                    disabled={updateStatus.isPending}
                    onValueChange={(val) =>
                      updateStatus.mutate({ id: s.id, status: val as SessionStatus })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "h-auto w-[120px] cursor-pointer rounded-full border-0 px-3 py-1 text-xs outline-none",
                        STATUS_STYLES[s.status],
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
    );
}