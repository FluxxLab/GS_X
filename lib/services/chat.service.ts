import { apiClient } from '../api/client';

export interface ChatConversation {
  id: string;
  type: 'group' | 'direct';
  name: string;
  memberCount: number;
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
  lastActivity: string;
}

export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  mine: boolean;
}

export interface ChatMember {
  userId: string;
  name: string;
  email: string;
  joinedAt: string;
}

const PATH = '/chat';

export const chatService = {
  listConversations(): Promise<ChatConversation[]> {
    return apiClient.get<ChatConversation[]>(`${PATH}/conversations`);
  },

  createChannel(name: string, memberIds: string[]): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>(`${PATH}/channels`, { name, memberIds });
  },

  openDirect(userId: string): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>(`${PATH}/direct`, { userId });
  },

  getMessages(channelId: string): Promise<ChatMessage[]> {
    return apiClient.get<ChatMessage[]>(`${PATH}/channels/${channelId}/messages`);
  },

  sendMessage(channelId: string, body: string): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>(`${PATH}/channels/${channelId}/messages`, { body });
  },

  getMembers(channelId: string): Promise<ChatMember[]> {
    return apiClient.get<ChatMember[]>(`${PATH}/channels/${channelId}/members`);
  },

  addMembers(channelId: string, memberIds: string[]): Promise<ChatMember[]> {
    return apiClient.post<ChatMember[]>(`${PATH}/channels/${channelId}/members`, { memberIds });
  },
};
