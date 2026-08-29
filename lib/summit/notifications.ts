import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const SEGMENTS = ["all", "vip", "press", "speakers", "volunteers"] as const;
export type Segment = (typeof SEGMENTS)[number];

export interface Notification {
  id?: string;
  title: string;
  body: string;
  category?: string;
  segment: Segment;
  createdAt?: string;
}

export function useNotifications(){
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
        const res = await api<Notification[]>("/notifications");
        return Array.isArray(res) ? res : [];
    },
  });
}

export function useSendNotification(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: Omit<Notification, "createdAt">) =>
            api<Notification>("/notifications", {
                method: "POST",
                body: JSON.stringify(input),
            }),
            onSuccess: () => qc.invalidateQueries({ queryKey:["notifications"]}),
    });
}

/** Retract an announcement: it disappears from every delegate inbox. */
export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}