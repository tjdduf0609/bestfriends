// hooks/useCurrentUserNames.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UserNames {
  myName: string;
  partnerName: string;
}

export function useCurrentUserNames() {
  const [names, setNames] = useState<UserNames | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const myName = localStorage.getItem('myName');
      if (!myName) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: settings } = await supabase
        .from('settings')
        .select('name1, name2')
        .single();

      if (settings) {
        const partnerName = settings.name1 === myName ? settings.name2 : settings.name1;
        setNames({ myName, partnerName });
      }
      setLoading(false);
    }
    load();
  }, []);

  return { names, loading };
}