"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  systemSettingsService,
  type SettingsData,
} from "@/lib/services/system-settings.service";

/** Read + save a settings category (e.g. 'general', 'notifications'). */
export function useSystemSettings(category: string) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["system-settings", category],
    queryFn: () => systemSettingsService.get(category),
  });

  const saveMutation = useMutation({
    mutationFn: (data: SettingsData) =>
      systemSettingsService.update(category, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["system-settings", category] }),
  });

  return {
    data: listQuery.data ?? {},
    loading: listQuery.isLoading,
    save: saveMutation.mutateAsync,
    saving: saveMutation.isPending,
  };
}
