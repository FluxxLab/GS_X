// Framework-agnostic global toast store. Callable from anywhere — including
// outside React (e.g. the React Query cache error handlers) — so that no
// failed request can end up showing the user nothing at all.
//
// Errors are intentionally NOT toasts: `toast.error` routes to the global error
// modal (lib/ui/error-modal) so a failure is a blocking dialog the user must
// acknowledge and can't miss. Success/info stay as transient toasts.

import { showError } from "./error-modal";

export type ToastType = "error" | "success" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  /** Sticky toasts never auto-dismiss — the user must acknowledge ("Continue"). */
  sticky: boolean;
}

const AUTO_DISMISS_MS = 6000;
const DEDUPE_WINDOW_MS = 4000;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const recent = new Map<string, number>(); // `${type}:${message}` -> last shown ts

function emit() {
  for (const listener of listeners) listener();
}

function push(type: ToastType, message: string): number | undefined {
  const text = (message || "").trim();
  if (!text) return undefined;

  // Suppress an identical toast fired again within the dedupe window so a
  // polling query or a double-click can't stack the same message.
  const key = `${type}:${text}`;
  const now = Date.now();
  const last = recent.get(key);
  if (last && now - last < DEDUPE_WINDOW_MS) return undefined;
  recent.set(key, now);

  const id = nextId++;
  // Errors stick until acknowledged so a failure can't scroll past unseen;
  // success/info are transient.
  toasts = [...toasts, { id, type, message: text, sticky: type === "error" }];
  emit();
  return id;
}

export function dismissToast(id: number): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  // Errors go to the blocking modal, not the toast strip, so they can't be missed.
  error: (message: string) => showError(message),
  success: (message: string) => push("success", message),
  info: (message: string) => push("info", message),
};

// ── useSyncExternalStore wiring ──────────────────────────────────────────
export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToastsSnapshot(): ToastItem[] {
  return toasts;
}

export const TOAST_AUTO_DISMISS_MS = AUTO_DISMISS_MS;

/** Best-effort extraction of a human-readable message from any thrown value. */
export function toErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (typeof error === "string" && error.trim()) return error;
  return "Something went wrong. Please try again.";
}
