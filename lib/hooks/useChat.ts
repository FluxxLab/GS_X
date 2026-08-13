'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';

/**
 * Chat data layer (real backend via chatService). Conversations and messages are
 * kept fresh by server push (SSE via RealtimeBridge, which invalidates these
 * keys on a new message) instead of polling; sending/creating/opening/
 * adding-members are mutations that invalidate the relevant queries.
 */

export function useConversations() {
  const { data, isLoading } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () => chatService.listConversations(),
  });

  return { conversations: data ?? [], loading: isLoading };
}

export function useMessages(channelId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['chat', 'messages', channelId],
    queryFn: () => chatService.getMessages(channelId as string),
    enabled: !!channelId,
  });

  return { messages: data ?? [], loading: isLoading };
}

export function useMembers(channelId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['chat', 'members', channelId],
    queryFn: () => chatService.getMembers(channelId as string),
    enabled: !!channelId,
  });

  return { members: data ?? [], loading: isLoading };
}

export function useChatActions() {
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: ({ channelId, body }: { channelId: string; body: string }) =>
      chatService.sendMessage(channelId, body),
    onSuccess: (_data, { channelId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', channelId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: ({ name, memberIds }: { name: string; memberIds: string[] }) =>
      chatService.createChannel(name, memberIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] }),
  });

  const openDirectMutation = useMutation({
    mutationFn: (userId: string) => chatService.openDirect(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] }),
  });

  const addMembersMutation = useMutation({
    mutationFn: ({ channelId, memberIds }: { channelId: string; memberIds: string[] }) =>
      chatService.addMembers(channelId, memberIds),
    onSuccess: (_data, { channelId }) =>
      queryClient.invalidateQueries({ queryKey: ['chat', 'members', channelId] }),
  });

  return {
    sendMessage: (channelId: string, body: string) => sendMutation.mutateAsync({ channelId, body }),
    sending: sendMutation.isPending,
    createChannel: (name: string, memberIds: string[]) =>
      createChannelMutation.mutateAsync({ name, memberIds }),
    creatingChannel: createChannelMutation.isPending,
    openDirect: (userId: string) => openDirectMutation.mutateAsync(userId),
    openingDirect: openDirectMutation.isPending,
    addMembers: (channelId: string, memberIds: string[]) =>
      addMembersMutation.mutateAsync({ channelId, memberIds }),
    addingMembers: addMembersMutation.isPending,
  };
}
