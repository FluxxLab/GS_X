import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

/**
 * Editions: one per summit.
 *
 * Scope addition, 19 Sept 2026. The platform used to assume a summit was
 * permanently imminent, which was true for exactly one of them. Sessions are
 * scoped to whichever edition is current, so this screen decides what the
 * delegate app shows.
 */

export const EDITION_STATUSES = [
  "draft",
  "announced",
  "live",
  "ended",
] as const;
export type EditionStatus = (typeof EDITION_STATUSES)[number];

/** What each state means, shown to the operator rather than kept in my head. */
export const EDITION_STATUS_HELP: Record<EditionStatus, string> = {
  draft: "Being set up. Never visible to delegates, and cannot be made current.",
  announced: "Dates are public. The app shows a countdown.",
  live: "The summit is happening.",
  ended: "Over. Recordings and certificates only.",
};

/**
 * What the raised button in the middle of the app's tab bar opens.
 *
 * A closed set, not a free URL: the app can only reach screens it was built
 * with, so offering a text box here would promise something the client cannot
 * keep. Adding one means an app release, not a console change.
 */
export const CENTRE_ACTIONS = [
  "pass",
  "connect",
  "scan",
  "innovation",
  "networking",
  "trivia",
  "none",
] as const;
export type CentreAction = (typeof CENTRE_ACTIONS)[number];

export const CENTRE_ACTION_LABEL: Record<CentreAction, string> = {
  pass: "Access pass",
  connect: "Networking code",
  scan: "Scan a pass",
  innovation: "Innovation Hub",
  networking: "Networking",
  trivia: "Trivia",
  none: "Hidden",
};

/**
 * The pushes the sessions module sends on its own. Mirrors the API's
 * AUTOMATIC_NOTIFICATIONS; a kind not in this list is refused by the server.
 */
export const AUTOMATIC_NOTIFICATIONS = [
  "session-created",
  "session-updated",
  "session-live",
  "session-reminder",
] as const;
export type AutomaticNotification = (typeof AUTOMATIC_NOTIFICATIONS)[number];

export const AUTOMATIC_NOTIFICATION_LABEL: Record<
  AutomaticNotification,
  { title: string; help: string }
> = {
  "session-created": {
    title: "Added to the programme",
    help: "When a session is created. An import sends one push for the batch.",
  },
  "session-updated": {
    title: "Schedule change",
    help: "When a session's time or room moves. Switch off before a reshuffle.",
  },
  "session-live": {
    title: "Now live",
    help: "When a session is set live from Live Ops.",
  },
  "session-reminder": {
    title: "Starting in 15 minutes",
    help: "To delegates who saved the session.",
  },
};

export interface Edition {
  id: string;
  name: string;
  shortName: string;
  startsAt: string;
  endsAt: string;
  venue: string | null;
  status: EditionStatus;
  /** Whether tickets can be bought right now. Independent of status. */
  registrationOpen: boolean;
  /** The one the app shows. Exactly one row has this. */
  isCurrent: boolean;
  /** What the app's centre tab-bar button opens. */
  centreAction: CentreAction;
  /** Overrides the wording under it. Null means use the action's own. */
  centreLabel: string | null;
  /** Automatic pushes switched off for this edition. */
  mutedNotifications: AutomaticNotification[];
}

export interface EditionInput {
  name: string;
  shortName: string;
  startsAt: string;
  endsAt: string;
  venue?: string;
  status?: EditionStatus;
}

const EDITIONS_KEY = ["editions"] as const;

export function useEditions() {
  return useQuery({
    queryKey: EDITIONS_KEY,
    queryFn: async () => {
      const res = await api<Edition[]>("/editions");
      return Array.isArray(res) ? res : [];
    },
  });
}

/**
 * What the delegate app is being shown, or null between summits.
 *
 * Null is a real answer, not a failure: a draft is withheld by the API, so an
 * edition still being written up reads as "nothing announced".
 */
export function useCurrentEdition() {
  return useQuery({
    queryKey: ["editions", "current"],
    queryFn: () => api<Edition | null>("/editions/current"),
  });
}

/** Everything that writes invalidates both the list and the current pointer. */
function useEditionMutation<TArgs>(
  mutationFn: (args: TArgs) => Promise<Edition>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EDITIONS_KEY });
      // Sessions are scoped to the current edition, so pointing the app
      // elsewhere changes what every session query returns.
      void qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useCreateEdition() {
  return useEditionMutation((input: EditionInput) =>
    api<Edition>("/editions", { method: "POST", body: JSON.stringify(input) }),
  );
}

export function useUpdateEdition() {
  return useEditionMutation(
    ({
      id,
      ...patch
    }: Partial<EditionInput> & {
      id: string;
      registrationOpen?: boolean;
      centreAction?: CentreAction;
      centreLabel?: string;
      mutedNotifications?: AutomaticNotification[];
    }) =>
      api<Edition>(`/editions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
  );
}

/** Point the delegate app at this edition. The API refuses a draft. */
export function useSetCurrentEdition() {
  return useEditionMutation((id: string) =>
    api<Edition>(`/editions/${id}/current`, { method: "POST" }),
  );
}
