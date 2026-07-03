import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Module-level cache: survives component remounts (route changes, tab refocus).
// Avoids resetting `loading` to true on every ProtectedRoute mount, which was
// the root cause of the "Conexiunea pare blocată" recovery screen appearing
// randomly when has_role RPC was slow.
const adminCache = new Map<string, boolean>();
const inflight = new Map<string, Promise<boolean>>();

async function fetchIsAdmin(userId: string): Promise<boolean> {
  if (adminCache.has(userId)) return adminCache.get(userId)!;
  if (inflight.has(userId)) return inflight.get(userId)!;

  const p = (async () => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });
      if (error) throw error;
      const result = Boolean(data);
      adminCache.set(userId, result);
      return result;
    } catch (err) {
      console.error('Error checking admin role:', err);
      return false;
    } finally {
      inflight.delete(userId);
    }
  })();

  inflight.set(userId, p);
  return p;
}

export const useAdminAuth = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Initialize synchronously from cache when possible → no loading flash on remount.
  const cached = userId ? adminCache.get(userId) : undefined;
  const [isAdmin, setIsAdmin] = useState<boolean>(cached ?? false);
  const [loading, setLoading] = useState<boolean>(cached === undefined && !!userId);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    if (adminCache.has(userId)) {
      setIsAdmin(adminCache.get(userId)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchIsAdmin(userId).then((result) => {
      if (cancelled) return;
      setIsAdmin(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { isAdmin, loading };
};
