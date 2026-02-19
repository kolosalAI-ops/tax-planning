'use client';

import { useState, useCallback } from 'react';
import { CountryCode } from '@/lib/types';
import { COUNTRY_ORDER } from '@/lib/constants';

export function useCountryFilter(initial?: CountryCode[]) {
  const [selected, setSelected] = useState<Set<CountryCode>>(
    new Set(initial ?? COUNTRY_ORDER)
  );

  const toggle = useCallback((code: CountryCode) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        if (next.size > 1) next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  const isSelected = useCallback(
    (code: CountryCode) => selected.has(code),
    [selected]
  );

  const selectAll = useCallback(() => {
    setSelected(new Set(COUNTRY_ORDER));
  }, []);

  return { selected, toggle, isSelected, selectAll };
}
