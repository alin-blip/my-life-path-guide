import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parentingService, ParentingChild, ParentingProfile } from '@/services/parentingService';

export function useParentingProfile() {
  const [profile, setProfile] = useState<ParentingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const p = await parentingService.getProfile(user.id);
      setProfile(p);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (patch: Partial<ParentingProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const saved = await parentingService.upsertProfile(user.id, patch);
    setProfile(saved);
    return saved;
  }, []);

  return { profile, loading, save, reload: load };
}

export function useParentingChildren() {
  const [children, setChildren] = useState<ParentingChild[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const list = await parentingService.listChildren(user.id);
      setChildren(list);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createChild = useCallback(async (payload: Parameters<typeof parentingService.createChild>[1]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const created = await parentingService.createChild(user.id, payload);
    await load();
    return created;
  }, [load]);

  const updateChild = useCallback(async (id: string, patch: Partial<ParentingChild>) => {
    const updated = await parentingService.updateChild(id, patch);
    await load();
    return updated;
  }, [load]);

  const removeChild = useCallback(async (id: string) => {
    await parentingService.deactivateChild(id);
    await load();
  }, [load]);

  return { children, loading, reload: load, createChild, updateChild, removeChild };
}
