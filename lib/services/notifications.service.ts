import { apiClient } from '../api/client';
import type { NotificationsPage, NotificationQueryParams } from '../types/notifications';

const PATH = '/notifications';

export const notificationsService = {
  getNotifications(params?: NotificationQueryParams): Promise<NotificationsPage> {
    return apiClient.get<NotificationsPage>(PATH, params as Record<string, string | number | boolean | undefined>);
  },

  getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>(`${PATH}/unread-count`);
  },

  markRead(id: string): Promise<{ success: true }> {
    return apiClient.patch<{ success: true }>(`${PATH}/${id}/read`);
  },

  markAllRead(): Promise<{ success: true }> {
    return apiClient.patch<{ success: true }>(`${PATH}/read-all`);
  },

  remove(id: string): Promise<{ success: true }> {
    return apiClient.delete<{ success: true }>(`${PATH}/${id}`);
  },
};
