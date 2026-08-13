'use client';

import { useCallback, useState } from 'react';
import { lookupService } from '@/lib/services/lookup.service';
import { departmentService } from '@/lib/services/department.service';
import type { Lookup } from '@/lib/types/lookup';

/**
 * Holds the dropdown lookups for the profile edit modals and loads each set
 * lazily when its modal opens — preserving the original page's
 * fetch-on-edit-click timing rather than fetching everything up front.
 */
export function useEmployeeLookups() {
  const [genderOptions, setGenderOptions] = useState<Lookup[]>([]);
  const [maritalOptions, setMaritalOptions] = useState<Lookup[]>([]);
  const [nationalityOptions, setNationalityOptions] = useState<Lookup[]>([]);
  const [stateOptions, setStateOptions] = useState<Lookup[]>([]);
  const [cityOptions, setCityOptions] = useState<Lookup[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<Lookup[]>([]);
  const [kinRelationships, setKinRelationships] = useState<Lookup[]>([]);
  const [hmoProviders, setHmoProviders] = useState<Lookup[]>([]);
  const [hmoPlans, setHmoPlans] = useState<Lookup[]>([]);

  const loadPersonal = useCallback(() => {
    Promise.all([
      lookupService.getByCategory('gender'),
      lookupService.getByCategory('marital_status'),
      lookupService.getByCategory('nationality'),
      lookupService.getByCategory('state_of_origin'),
      lookupService.getByCategory('city'),
    ])
      .then(([g, m, n, s, c]) => {
        setGenderOptions(g);
        setMaritalOptions(m);
        setNationalityOptions(n);
        setStateOptions(s);
        setCityOptions(c);
      })
      .catch(() => {});
  }, []);

  const loadEmployment = useCallback(() => {
    departmentService.getAll({ limit: 100 }).then((r) => setDepartments(r.data)).catch(() => {});
    lookupService.getByCategory('employment_type').then(setEmploymentTypes).catch(() => {});
  }, []);

  const loadKinRelationships = useCallback(() => {
    lookupService.getByCategory('kin_relationship').then(setKinRelationships).catch(() => {});
  }, []);

  const loadHmo = useCallback(() => {
    Promise.all([
      lookupService.getByCategory('hmo_provider'),
      lookupService.getByCategory('hmo_plan'),
    ])
      .then(([p, pl]) => {
        setHmoProviders(p);
        setHmoPlans(pl);
      })
      .catch(() => {});
  }, []);

  return {
    genderOptions,
    maritalOptions,
    nationalityOptions,
    stateOptions,
    cityOptions,
    departments,
    employmentTypes,
    kinRelationships,
    hmoProviders,
    hmoPlans,
    loadPersonal,
    loadEmployment,
    loadKinRelationships,
    loadHmo,
  };
}
