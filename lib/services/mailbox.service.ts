import { apiClient } from "../api/client";
import type {
  MailboxSummary,
  ConnectSharedPayload,
  MailFolder,
  MailMessage,
  MailMessageContent,
  SendMailPayload,
} from "../types/mailbox";

const PATH = "/mailbox";

export const mailboxService = {
  list(): Promise<MailboxSummary[]> {
    return apiClient.get<MailboxSummary[]>(`${PATH}/list`);
  },

  getConnectUrl(): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`${PATH}/connect`);
  },

  connectShared(payload: ConnectSharedPayload): Promise<{ url: string }> {
    return apiClient.post<{ url: string }>(`${PATH}/shared/connect`, payload);
  },

  disconnect(mailboxId: string): Promise<{ disconnected: boolean }> {
    return apiClient.delete<{ disconnected: boolean }>(`${PATH}/${mailboxId}`);
  },

  getFolders(mailboxId: string): Promise<MailFolder[]> {
    return apiClient.get<MailFolder[]>(`${PATH}/${mailboxId}/folders`);
  },

  getMessages(
    mailboxId: string,
    params?: { folderId?: string; limit?: number; start?: number },
  ): Promise<MailMessage[]> {
    return apiClient.get<MailMessage[]>(
      `${PATH}/${mailboxId}/messages`,
      params,
    );
  },

  getMessage(
    mailboxId: string,
    id: string,
    folderId: string,
  ): Promise<MailMessageContent> {
    return apiClient.get<MailMessageContent>(
      `${PATH}/${mailboxId}/messages/${id}`,
      { folderId },
    );
  },

  send(mailboxId: string, payload: SendMailPayload): Promise<unknown> {
    return apiClient.post(`${PATH}/${mailboxId}/messages`, payload);
  },

  reply(
    mailboxId: string,
    id: string,
    payload: SendMailPayload,
  ): Promise<unknown> {
    return apiClient.post(`${PATH}/${mailboxId}/messages/${id}/reply`, payload);
  },
};
