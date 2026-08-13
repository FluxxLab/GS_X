import { apiClient } from "../api/client";

const PATH = "/settings/system";

export type SettingsData = Record<string, unknown>;

export const systemSettingsService = {
  get(category: string): Promise<SettingsData> {
    return apiClient.get<SettingsData>(PATH, { category });
  },

  update(category: string, data: SettingsData): Promise<SettingsData> {
    return apiClient.put<SettingsData>(PATH, { category, data });
  },
};
