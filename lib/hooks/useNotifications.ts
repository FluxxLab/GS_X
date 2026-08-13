'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';

// The bell is kept fresh by server push (SSE via RealtimeBridge invalidates
// these keys when a notification is created), not by polling.
export function useNotifications() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
    qc.invalidateQueries({ queryKey: ['notifications', 'unread'] });
  };

  const { data: listData, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsService.getNotifications({ limit: 15 }),
    retry: false,
  });

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsService.getUnreadCount(),
    retry: false,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: invalidate,
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: invalidate,
  });

  return {
    notifications: listData?.data ?? [],
    unreadCount: unread?.count ?? 0,
    loading: isLoading,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
  };
}
