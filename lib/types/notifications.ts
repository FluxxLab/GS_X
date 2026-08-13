export interface AppNotification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsPage {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}
