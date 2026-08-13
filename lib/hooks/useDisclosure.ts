'use client';

import { useState, useCallback } from 'react';

/**
 * Generic open/close state for a modal, drawer, dropdown, or popover.
 * Replaces ad-hoc `useState(false)` + inline setters scattered across pages.
 */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle, setIsOpen };
}
