'use client';

import { useState, useEffect, useCallback } from 'react';
import { onboardingService } from '@/lib/services/onboarding.service';
import type { Onboarding, OnboardingItem } from '@/lib/types/onboarding';
import type { Employee } from '@/lib/types/employee';

/**
 * Owns the current user's self-service onboarding load via the self-scoped
 * /onboarding/me endpoint (the HR-guarded employee endpoints 403 for staff).
 * The employee profile rides along on the onboarding record. Also derives
 * progress / grouped items and owns the category expand/collapse set.
 */
export function useMyOnboarding() {
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    onboardingService
      .getMy()
      .then((mine) => {
        if (cancelled) return;
        if (!mine) {
          setError('No onboarding is linked to your account.');
          return;
        }
        setOnboarding(mine);
        setEmployee((mine.employee as unknown as Employee) ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load your onboarding information.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Expand all categories by default once onboarding loads
  useEffect(() => {
    if (onboarding?.items) {
      const cats = new Set(onboarding.items.map((i) => i.category));
      setExpandedCategories(cats);
    }
  }, [onboarding]);

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  return { onboarding, employee, loading, error, expandedCategories, toggleCategory };
}

export type { Onboarding, OnboardingItem };
