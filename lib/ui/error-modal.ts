// Framework-agnostic global error-modal store. Callable from anywhere,
// including outside React (the React Query cache handlers, window error
// listeners), so that no failure can leave the user staring at a screen that
// silently did nothing. Errors surface as a blocking modal the user must
// acknowledge, so they can't be missed the way a transient toast can.

export interface AppError {
  id: number;
  title: string;
  message: string;
}

const DEDUPE_WINDOW_MS = 4000;

let current: AppError | null = null;
const queue: AppError[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const recent = new Map<string, number>(); // message -> last shown ts

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Surface an error to the user as a blocking modal. If one is already open the
 * new error queues behind it (shown one at a time, never stacked). Identical
 * messages within a short window are de-duplicated so a retry loop or a
 * double-click can't spam the modal.
 */
export function showError(message: string, title = "Something went wrong"): void {
  const text = (message || "").trim();
  if (!text) return;

  const now = Date.now();
  const last = recent.get(text);
  if (last && now - last < DEDUPE_WINDOW_MS) return;
  recent.set(text, now);

  const err: AppError = { id: nextId++, title, message: text };
  if (current) {
    if (!queue.some((q) => q.message === text)) queue.push(err);
  } else {
    current = err;
    emit();
  }
}

/** Acknowledge the current error; shows the next queued one, if any. */
export function dismissError(): void {
  current = queue.length ? (queue.shift() as AppError) : null;
  emit();
}

export function subscribeError(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getErrorSnapshot(): AppError | null {
  return current;
}
