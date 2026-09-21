"use client";

import { useState } from "react";
import { CalendarRange, Check, MapPin, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CENTRE_ACTIONS,
  CENTRE_ACTION_LABEL,
  EDITION_STATUSES,
  EDITION_STATUS_HELP,
  useCreateEdition,
  useCurrentEdition,
  useEditions,
  useSetCurrentEdition,
  useUpdateEdition,
  type CentreAction,
  type Edition,
  type EditionStatus,
} from "@/lib/summit/editions";
import { fromSummitInput, toSummitInput } from "@/lib/summit/time";
import { editionErrors, type EditionFormValues } from "@/lib/validation/edition";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";

const STATUS_TONE: Record<EditionStatus, string> = {
  draft: "bg-summit-lilac/10 text-summit-smoke",
  announced: "bg-summit-cerulean/15 text-summit-cerulean",
  live: "bg-summit-green/15 text-summit-green",
  ended: "bg-summit-lilac/10 text-summit-lilac",
};

const EMPTY: EditionFormValues = {
  name: "",
  shortName: "",
  startsAt: "",
  endsAt: "",
  venue: "",
};

/**
 * Editions: which summit the platform is running.
 *
 * The one screen that decides what every delegate sees. Sessions are scoped to
 * whichever edition is current, so "Make current" is the most consequential
 * button in the console and is treated accordingly: two taps, and the API
 * refuses to point the app at a draft.
 */
export default function EditionsPage() {
  const { data: editions, isLoading, isError, refetch } = useEditions();
  const { data: current } = useCurrentEdition();
  const create = useCreateEdition();
  const update = useUpdateEdition();
  const setCurrent = useSetCurrentEdition();

  const [form, setForm] = useState<EditionFormValues>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditionFormValues, string>>
  >({});
  const [confirmCurrent, setConfirmCurrent] = useState<string | null>(null);

  const field = (key: keyof EditionFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // clear this field's complaint as soon as it is being addressed
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = editionErrors(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    await create.mutateAsync({
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      // wall-clock in, instant out: see lib/summit/time.ts
      startsAt: fromSummitInput(form.startsAt),
      endsAt: fromSummitInput(form.endsAt),
      ...(form.venue?.trim() ? { venue: form.venue.trim() } : {}),
    });
    setForm(EMPTY);
  }

  const busy = create.isPending || update.isPending || setCurrent.isPending;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Editions
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Which summit the platform is running. The delegate app follows
          whichever edition is current.
        </p>
      </header>

      <section className="glass-card p-5" aria-live="polite">
        <h2 className="text-xs uppercase tracking-wide text-summit-smoke">
          The app is showing
        </h2>
        {current ? (
          <p className="mt-1 text-lg font-medium">
            {current.name}{" "}
            <span className="text-sm text-summit-smoke">
              ({current.status}
              {current.registrationOpen ? ", registration open" : ""})
            </span>
          </p>
        ) : (
          <p className="mt-1 text-lg font-medium text-summit-smoke">
            Nothing. Delegates see no summit.
          </p>
        )}
      </section>

      <form onSubmit={submit} className="glass-card flex flex-col gap-3 p-5" noValidate>
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          Add an edition
        </h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="edition-name" className="text-xs text-summit-smoke">
            Name
          </label>
          <input
            id="edition-name"
            className={inputCls}
            placeholder="GS-27 Gender and Inclusion Summit"
            value={form.name}
            onChange={(e) => field("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "edition-name-error" : undefined}
          />
          {errors.name && (
            <p id="edition-name-error" className="text-xs text-summit-cream">
              {errors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edition-short" className="text-xs text-summit-smoke">
            Short name
          </label>
          <input
            id="edition-short"
            className={inputCls}
            placeholder="GS-27"
            value={form.shortName}
            onChange={(e) => field("shortName", e.target.value)}
            aria-invalid={Boolean(errors.shortName)}
            aria-describedby={errors.shortName ? "edition-short-error" : undefined}
          />
          {errors.shortName && (
            <p id="edition-short-error" className="text-xs text-summit-cream">
              {errors.shortName}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="edition-starts" className="text-xs text-summit-smoke">
              Starts (Abuja time)
            </label>
            <input
              id="edition-starts"
              type="datetime-local"
              className={inputCls}
              value={form.startsAt}
              onChange={(e) => field("startsAt", e.target.value)}
              aria-invalid={Boolean(errors.startsAt)}
              aria-describedby={errors.startsAt ? "edition-starts-error" : undefined}
            />
            {errors.startsAt && (
              <p id="edition-starts-error" className="text-xs text-summit-cream">
                {errors.startsAt}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="edition-ends" className="text-xs text-summit-smoke">
              Ends (Abuja time)
            </label>
            <input
              id="edition-ends"
              type="datetime-local"
              className={inputCls}
              value={form.endsAt}
              onChange={(e) => field("endsAt", e.target.value)}
              aria-invalid={Boolean(errors.endsAt)}
              aria-describedby={errors.endsAt ? "edition-ends-error" : undefined}
            />
            {errors.endsAt && (
              <p id="edition-ends-error" className="text-xs text-summit-cream">
                {errors.endsAt}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edition-venue" className="text-xs text-summit-smoke">
            Venue (optional)
          </label>
          <input
            id="edition-venue"
            className={inputCls}
            placeholder="Abuja, Nigeria"
            value={form.venue ?? ""}
            onChange={(e) => field("venue", e.target.value)}
          />
        </div>

        <p className="text-xs text-summit-smoke">
          New editions start as a draft, invisible to delegates. Build the
          programme, then announce it and make it current.
        </p>

        {create.error && (
          <p className="text-sm text-summit-cream" role="alert">
            {(create.error as Error).message}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="size-4" />
          {create.isPending ? "Adding…" : "Add edition"}
        </button>
      </form>

      <section className="glass-card p-5">
        <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          All editions
        </h2>

        {isLoading && (
          <p className="mt-3 text-sm text-summit-smoke">Loading…</p>
        )}

        {isError && (
          <div className="mt-3 flex items-center gap-3">
            <p className="text-sm text-summit-cream">
              Could not load editions.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-sm text-summit-cerise underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && (editions ?? []).length === 0 && (
          <p className="mt-3 text-sm text-summit-smoke">
            No editions yet. Add one above.
          </p>
        )}

        <ul className="mt-3 flex flex-col divide-y divide-summit-lilac/10">
          {(editions ?? []).map((edition) => (
            <EditionRow
              key={edition.id}
              edition={edition}
              busy={busy}
              confirming={confirmCurrent === edition.id}
              onConfirmCurrent={() =>
                setConfirmCurrent(
                  confirmCurrent === edition.id ? null : edition.id,
                )
              }
              onMakeCurrent={() => {
                setCurrent.mutate(edition.id, {
                  onSettled: () => setConfirmCurrent(null),
                });
              }}
              onStatus={(status) =>
                update.mutate({ id: edition.id, status })
              }
              onRegistration={(registrationOpen) =>
                update.mutate({ id: edition.id, registrationOpen })
              }
              onCentreAction={(centreAction) =>
                update.mutate({ id: edition.id, centreAction })
              }
            />
          ))}
        </ul>

        {(update.error || setCurrent.error) && (
          <p className="mt-3 text-sm text-summit-cream" role="alert">
            {((update.error ?? setCurrent.error) as Error).message}
          </p>
        )}
      </section>
    </div>
  );
}

function EditionRow({
  edition,
  busy,
  confirming,
  onConfirmCurrent,
  onMakeCurrent,
  onStatus,
  onRegistration,
  onCentreAction,
}: {
  edition: Edition;
  busy: boolean;
  confirming: boolean;
  onConfirmCurrent: () => void;
  onMakeCurrent: () => void;
  onStatus: (status: EditionStatus) => void;
  onRegistration: (open: boolean) => void;
  onCentreAction: (action: CentreAction) => void;
}) {
  const dates = `${toSummitInput(edition.startsAt).replace("T", " ")} to ${toSummitInput(
    edition.endsAt,
  ).replace("T", " ")}`;

  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {edition.name}
        </p>
        {edition.isCurrent && (
          <span className="flex items-center gap-1 rounded-full bg-summit-cerise/15 px-2.5 py-0.5 text-[11px] text-summit-cerise">
            <Star className="size-3" />
            Current
          </span>
        )}
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] uppercase",
            STATUS_TONE[edition.status],
          )}
        >
          {edition.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-summit-smoke">
        <span className="flex items-center gap-1">
          <CalendarRange className="size-3.5" />
          {dates}
        </span>
        {edition.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {edition.venue}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-summit-smoke">
          <span>Status</span>
          <select
            className="rounded-lg border border-summit-lilac/15 bg-summit-lilac/5 px-2 py-1 text-summit-lilac"
            value={edition.status}
            disabled={busy}
            onChange={(e) => onStatus(e.target.value as EditionStatus)}
            aria-label={`Status of ${edition.name}`}
          >
            {EDITION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-summit-smoke">
          <input
            type="checkbox"
            checked={edition.registrationOpen}
            disabled={busy}
            onChange={(e) => onRegistration(e.target.checked)}
            aria-label={`Registration open for ${edition.name}`}
          />
          Registration open
        </label>

        <label className="flex items-center gap-2 text-xs text-summit-smoke">
          <span>Centre button</span>
          <select
            className="rounded-lg border border-summit-lilac/15 bg-summit-lilac/5 px-2 py-1 text-summit-lilac"
            value={edition.centreAction}
            disabled={busy}
            onChange={(e) => onCentreAction(e.target.value as CentreAction)}
            aria-label={`Centre tab-bar button for ${edition.name}`}
          >
            {CENTRE_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {CENTRE_ACTION_LABEL[action]}
              </option>
            ))}
          </select>
        </label>

        {!edition.isCurrent && (
          // Two taps: the first arms, the second switches. This changes what
          // every delegate sees, including which programme the app shows.
          <button
            type="button"
            disabled={busy}
            onClick={confirming ? onMakeCurrent : onConfirmCurrent}
            onBlur={confirming ? onConfirmCurrent : undefined}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors disabled:opacity-50",
              confirming
                ? "bg-summit-cream text-summit-violet"
                : "text-summit-smoke hover:bg-summit-lilac/10 hover:text-summit-lilac",
            )}
          >
            <Check className="size-3.5" />
            {confirming ? "Confirm: point the app here" : "Make current"}
          </button>
        )}
      </div>

      <p className="text-[11px] text-summit-smoke/80">
        {EDITION_STATUS_HELP[edition.status]} The raised button in the middle of
        the app&apos;s tab bar opens{" "}
        {edition.centreAction === "none"
          ? "nothing, and is hidden"
          : CENTRE_ACTION_LABEL[edition.centreAction]}
        .
      </p>
    </li>
  );
}
