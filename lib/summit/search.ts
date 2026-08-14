import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { Track } from "./sessions";

export interface SearchResults {
  sessions: {
    id: string;
    title: string;
    room: string;
    day: number;
    startsAt: string;
    track: Track;
    status: string;
  }[];
  speakers: {
    id: string;
    name: string;
    role: string | null;
    organisation: string | null;
  }[];
  delegates: {
    id: string;
    name: string;
    title: string | null;
    organisation: string | null;
    country: string | null;
    track: string | null;
  }[];
}

/**
 * Debounce lives in the hook, not the component: every consumer gets it, and
 * no page can accidentally fire one request per keystroke. The backend rejects
 * queries under 2 characters, so `enabled` mirrors that rule client-side.
 */
export function useSearch(term: string) {
  const [debounced, setDebounced] = useState(term);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term), 250);
    return () => clearTimeout(timer);
  }, [term]);

  const ready = debounced.trim().length >= 2;

  return useQuery({
    queryKey: ["search", debounced],
    queryFn: () => api<SearchResults>(`/search?q=${encodeURIComponent(debounced.trim())}`),
    enabled: ready,
    placeholderData: (prev) => prev, // keeps old results visible while typing
  });
}
