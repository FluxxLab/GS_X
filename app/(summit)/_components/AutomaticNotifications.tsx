"use client";

import { BellOff } from "lucide-react";
import {
  AUTOMATIC_NOTIFICATIONS,
  AUTOMATIC_NOTIFICATION_LABEL,
  useCurrentEdition,
  useUpdateEdition,
  type AutomaticNotification,
} from "@/lib/summit/editions";

/**
 * The pushes the sessions module sends on its own, each with an off switch.
 *
 * Lives on the Sessions page because that is where the edits that trigger
 * them are made: an organiser about to reshuffle the afternoon reaches for
 * this first. The setting itself is per edition and is read by the API at
 * the moment of sending, so a change here takes effect on the next edit,
 * with no deploy and no restart.
 */
export function AutomaticNotifications() {
  const { data: edition, isLoading } = useCurrentEdition();
  const update = useUpdateEdition();

  if (isLoading) {
    return (
      <section className="glass-card p-4">
        <p className="text-sm text-summit-smoke">Loading notification settings…</p>
      </section>
    );
  }

  if (!edition) {
    return (
      <section className="glass-card p-4">
        <p className="text-sm text-summit-smoke">
          No edition is current, so there is nothing to switch off. Set one on
          the Editions page.
        </p>
      </section>
    );
  }

  const muted = new Set(edition.mutedNotifications);

  const toggle = (kind: AutomaticNotification, on: boolean) => {
    const next = new Set(muted);
    if (on) next.delete(kind);
    else next.add(kind);
    update.mutate({ id: edition.id, mutedNotifications: [...next] });
  };

  return (
    <section className="glass-card p-4" aria-labelledby="auto-notifications-title">
      <div className="flex items-center gap-2">
        <BellOff className="size-4 text-summit-smoke" />
        <h2
          id="auto-notifications-title"
          className="text-xs uppercase tracking-wide text-summit-smoke"
        >
          Automatic notifications for {edition.shortName}
        </h2>
      </div>
      <p className="mt-1 text-xs text-summit-smoke">
        Pushes the system sends by itself when the programme changes. Switch
        one off before a bulk edit so delegates are not buzzed forty times.
      </p>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {AUTOMATIC_NOTIFICATIONS.map((kind) => {
          const on = !muted.has(kind);
          return (
            <li key={kind}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-summit-lilac/10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={on}
                  disabled={update.isPending}
                  onChange={(e) => toggle(kind, e.target.checked)}
                  aria-describedby={`auto-${kind}-help`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">
                    {AUTOMATIC_NOTIFICATION_LABEL[kind].title}
                  </span>
                  <span
                    id={`auto-${kind}-help`}
                    className="block text-xs text-summit-smoke"
                  >
                    {AUTOMATIC_NOTIFICATION_LABEL[kind].help}
                  </span>
                </span>
                {!on && (
                  <span className="rounded-full bg-summit-lilac/10 px-2 py-0.5 text-[11px] uppercase text-summit-smoke">
                    Paused
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>

      {update.error && (
        <p className="mt-3 text-sm text-summit-cream" role="alert">
          {(update.error as Error).message}
        </p>
      )}
    </section>
  );
}
