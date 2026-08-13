import { idbGetAll, idbPut, idbDelete } from "./idb";

/**
 * Offline write queue ("outbox") for the vendor portal.
 *
 * A critical write (submit invoice / quote) goes through `submit()`: if we're
 * online it's sent immediately; if we're offline or the network drops mid-send,
 * it's persisted to IndexedDB and replayed automatically when the connection
 * returns. Every queued write carries a stable idempotency key, so a replay
 * resolves to the same server effect instead of duplicating it (the backend
 * IdempotencyInterceptor enforces this).
 *
 * Deliberately self-contained: it owns delivery so both the live path and the
 * replay path share one classifier, and it has no dependency on React.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type OutboxStatus = "queued" | "failed";

export type OutboxItem = {
  id: string; // also the Idempotency-Key
  endpoint: string; // e.g. "/vendor-portal/invoices"
  method: string; // "POST"
  body: unknown;
  label: string; // human-readable, e.g. "Invoice INV-001"
  kind: string; // coarse type for UI grouping, e.g. "invoice" | "quote"
  createdAt: number;
  attempts: number;
  status: OutboxStatus;
  error?: string; // last failure reason (when status === "failed")
};

export type OutboxSnapshot = {
  items: OutboxItem[];
  queued: number;
  failed: number;
};

type DeliverResult = { outcome: "success" | "transient" | "permanent" | "auth"; data?: unknown; message?: string };

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

// --- in-memory mirror of the IDB store, for synchronous snapshots ---
let items: OutboxItem[] = [];
let snapshot: OutboxSnapshot = { items: [], queued: 0, failed: 0 };
let initialised = false;
let initPromise: Promise<void> | null = null;
let flushing = false;

const listeners = new Set<() => void>();
const syncedListeners = new Set<(item: OutboxItem) => void>();

function rebuildSnapshot() {
  snapshot = {
    items: [...items].sort((a, b) => a.createdAt - b.createdAt),
    queued: items.filter((i) => i.status === "queued").length,
    failed: items.filter((i) => i.status === "failed").length,
  };
}

function emit() {
  rebuildSnapshot();
  listeners.forEach((l) => l());
}

async function init(): Promise<void> {
  if (initialised) return;
  if (!initPromise) {
    initPromise = (async () => {
      items = await idbGetAll<OutboxItem>();
      initialised = true;
      rebuildSnapshot();
      if (typeof window !== "undefined") {
        window.addEventListener("online", () => { void flush(); });
      }
      // Anything left from a previous session gets a chance to go out now.
      if (isOnline() && items.some((i) => i.status === "queued")) void flush();
    })();
  }
  return initPromise;
}

async function persist(item: OutboxItem) {
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  await idbPut(item);
  emit();
}

async function drop(id: string) {
  items = items.filter((i) => i.id !== id);
  await idbDelete(id);
  emit();
}

async function deliver(item: OutboxItem): Promise<DeliverResult> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${item.endpoint}`, {
      method: item.method,
      credentials: "include",
      headers: { "Content-Type": "application/json", "Idempotency-Key": item.id },
      body: JSON.stringify(item.body),
    });
  } catch {
    return { outcome: "transient" }; // offline / unreachable
  }
  if (res.ok) {
    const text = await res.text().catch(() => "");
    return { outcome: "success", data: text ? JSON.parse(text) : undefined };
  }
  if (res.status === 401 || res.status === 403) return { outcome: "auth" };
  if (res.status === 409 || res.status >= 500) return { outcome: "transient" }; // in-flight or server blip
  const body = await res.json().catch(() => null);
  return { outcome: "permanent", message: body?.message || `Request failed (${res.status})` };
}

/**
 * Send a critical write, falling back to the queue if it can't go out now.
 * Resolves `{ queued: true }` when it was persisted for later, or
 * `{ queued: false, data }` when it went through live. Throws only on a genuine
 * validation rejection (a 4xx), which the caller should show to the user.
 */
export async function submit(input: {
  endpoint: string;
  method?: string;
  body: unknown;
  label: string;
  kind: string;
}): Promise<{ queued: boolean; data?: unknown }> {
  await init();
  const item: OutboxItem = {
    id: uuid(),
    endpoint: input.endpoint,
    method: input.method ?? "POST",
    body: input.body,
    label: input.label,
    kind: input.kind,
    createdAt: Date.now(),
    attempts: 0,
    status: "queued",
  };

  if (!isOnline()) {
    await persist(item);
    return { queued: true };
  }

  const r = await deliver({ ...item, attempts: 1 });
  if (r.outcome === "success") {
    notifySynced(item);
    return { queued: false, data: r.data };
  }
  if (r.outcome === "permanent") {
    const err = new Error(r.message || "Request failed.");
    (err as Error & { permanent?: boolean }).permanent = true;
    throw err;
  }
  // transient or auth: keep the write safe and let a later flush deliver it.
  await persist(item);
  return { queued: true };
}

/** Deliver everything queued, oldest first. Stops on the first transient/auth. */
export async function flush(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    await init();
    const pending = [...items].filter((i) => i.status === "queued").sort((a, b) => a.createdAt - b.createdAt);
    for (const item of pending) {
      const r = await deliver({ ...item, attempts: item.attempts + 1 });
      if (r.outcome === "success") {
        await drop(item.id);
        notifySynced(item);
      } else if (r.outcome === "permanent") {
        await persist({ ...item, status: "failed", error: r.message, attempts: item.attempts + 1 });
      } else {
        // transient / auth: leave queued, stop this pass, retry on next trigger.
        await persist({ ...item, attempts: item.attempts + 1 });
        break;
      }
    }
  } finally {
    flushing = false;
  }
}

/** Re-queue a failed (dead-lettered) item and try again. */
export async function retry(id: string): Promise<void> {
  const item = items.find((i) => i.id === id);
  if (!item) return;
  await persist({ ...item, status: "queued", error: undefined });
  await flush();
}

/** Permanently remove an item (a discarded failure, or a user cancel). */
export async function discard(id: string): Promise<void> {
  await init();
  await drop(id);
}

// --- React store surface (useSyncExternalStore) ---
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void init();
  return () => listeners.delete(listener);
}

export function getSnapshot(): OutboxSnapshot {
  return snapshot;
}

const EMPTY: OutboxSnapshot = { items: [], queued: 0, failed: 0 };
export function getServerSnapshot(): OutboxSnapshot {
  return EMPTY;
}

/** Notified when a queued item is successfully delivered (for list reloads). */
export function onSynced(cb: (item: OutboxItem) => void): () => void {
  syncedListeners.add(cb);
  return () => syncedListeners.delete(cb);
}

function notifySynced(item: OutboxItem) {
  syncedListeners.forEach((l) => l(item));
}
