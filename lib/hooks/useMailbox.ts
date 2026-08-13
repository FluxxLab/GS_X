"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mailboxService } from "@/lib/services/mailbox.service";
import type {
  ConnectSharedPayload,
  SendMailPayload,
} from "@/lib/types/mailbox";

/** Available mailboxes (personal + shared) + connect/disconnect + send/reply. */
export function useMailbox() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["mailbox", "list"],
    queryFn: () => mailboxService.list(),
  });

  const connect = async () => {
    const { url } = await mailboxService.getConnectUrl();
    window.location.assign(url);
  };

  const connectShared = async (payload: ConnectSharedPayload) => {
    const { url } = await mailboxService.connectShared(payload);
    window.location.assign(url);
  };

  const disconnectMutation = useMutation({
    mutationFn: (mailboxId: string) => mailboxService.disconnect(mailboxId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mailbox"] }),
  });

  const sendMutation = useMutation({
    mutationFn: ({
      mailboxId,
      payload,
    }: {
      mailboxId: string;
      payload: SendMailPayload;
    }) => mailboxService.send(mailboxId, payload),
  });

  const replyMutation = useMutation({
    mutationFn: ({
      mailboxId,
      id,
      payload,
    }: {
      mailboxId: string;
      id: string;
      payload: SendMailPayload;
    }) => mailboxService.reply(mailboxId, id, payload),
  });

  return {
    mailboxes: listQuery.data ?? [],
    loading: listQuery.isLoading,
    connect,
    connectShared,
    disconnect: disconnectMutation.mutateAsync,
    send: (mailboxId: string, payload: SendMailPayload) =>
      sendMutation.mutateAsync({ mailboxId, payload }),
    sending: sendMutation.isPending,
    reply: (mailboxId: string, id: string, payload: SendMailPayload) =>
      replyMutation.mutateAsync({ mailboxId, id, payload }),
    replying: replyMutation.isPending,
  };
}
