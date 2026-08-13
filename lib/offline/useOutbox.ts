"use client";

import { useSyncExternalStore, useEffect, useRef } from "react";
import { subscribe, getSnapshot, getServerSnapshot, onSynced, type OutboxItem } from "./outbox";

/**
 * Live view of the offline write queue. Re-renders when items are queued,
 * delivered, or fail. Pass an `endpoint` to get just that route's pending
 * items (for showing "Pending sync" rows), and an `onSync` callback to reload
 * the list when one of them is delivered.
 */
export function useOutbox(opts?: { endpoint?: string; onSync?: (item: OutboxItem) => void }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep the latest callback/endpoint in a ref so we subscribe to sync events
  // exactly once, regardless of inline-callback identity changing each render.
  // Updated in an effect (never during render) so it's safe under StrictMode /
  // concurrent rendering.
  const cfg = useRef(opts);
  useEffect(() => {
    cfg.current = opts;
  });

  useEffect(() => {
    return onSynced((item) => {
      const c = cfg.current;
      if (!c?.onSync) return;
      if (!c.endpoint || item.endpoint === c.endpoint) c.onSync(item);
    });
  }, []);

  const items = opts?.endpoint ? snap.items.filter((i) => i.endpoint === opts.endpoint) : snap.items;

  return {
    items,
    all: snap.items,
    queued: snap.queued,
    failed: snap.failed,
    pending: snap.queued + snap.failed,
  };
}
