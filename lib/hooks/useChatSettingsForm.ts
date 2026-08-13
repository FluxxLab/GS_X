'use client';

import { useState, useCallback } from 'react';

export interface ChatSettingsValues {
  privateGroup: boolean;
  muteGroup: boolean;
  pinSidebar: boolean;
}

const INITIAL: ChatSettingsValues = {
  privateGroup: true,
  muteGroup: false,
  pinSidebar: true,
};

/**
 * Owns the chat group settings toggle state in a single values object instead of
 * three separate useState flags. (No submit/zod yet — the page is a UI mockup
 * with no data layer; preserved as-is.)
 */
export function useChatSettingsForm() {
  const [values, setValues] = useState<ChatSettingsValues>(INITIAL);

  const toggle = useCallback(
    (key: keyof ChatSettingsValues) => setValues((prev) => ({ ...prev, [key]: !prev[key] })),
    [],
  );

  return { values, toggle };
}
