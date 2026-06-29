import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { marriageService, MarriageProfile, MarriageSession } from '@/services/marriageService';

export function useMarriageProfile() {
  const [profile, setProfile] = useState<MarriageProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const p = await marriageService.getProfile(user.id);
      setProfile(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (data: Partial<MarriageProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const saved = await marriageService.upsertProfile(user.id, data);
    setProfile(saved);
    return saved;
  }, []);

  return { profile, loading, save, reload: load };
}

export function useMarriageSessions() {
  const [sessions, setSessions] = useState<MarriageSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const list = await marriageService.listSessions(user.id);
      setSessions(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { sessions, loading, reload: load };
}

export function useMarriageTimeline() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const list = await marriageService.getTimeline(user.id);
        setEvents(list);
      } finally { setLoading(false); }
    })();
  }, []);

  return { events, loading };
}
