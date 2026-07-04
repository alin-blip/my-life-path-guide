import { supabase } from '@/integrations/supabase/client';

/**
 * One-shot migration of pre-auth localStorage journal entries into the
 * `journal_entries` table. Safe to call multiple times: sets a per-user
 * flag in localStorage after a successful run so we don't re-migrate.
 */
const MIGRATED_FLAG = 'journal_entries_migrated_v1';

type LegacyEntry = {
  id?: string;
  title?: string;
  content?: string;
  lesson?: string | null;
  date?: string;
  created_at?: string;
  timestamp?: string;
};

function readLegacyEntries(): LegacyEntry[] {
  const buckets = ['journalEntries', 'journal-entries'];
  const all: LegacyEntry[] = [];
  for (const key of buckets) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all.push(...parsed);
    } catch {
      // ignore malformed
    }
  }
  return all;
}

export async function migrateLocalJournalEntries(userId: string): Promise<void> {
  const flagKey = `${MIGRATED_FLAG}_${userId}`;
  if (localStorage.getItem(flagKey)) return;

  const legacy = readLegacyEntries().filter(e => e && (e.content || '').trim().length > 0);
  if (legacy.length === 0) {
    localStorage.setItem(flagKey, '1');
    return;
  }

  const rows = legacy.map(e => {
    const iso = e.created_at || e.timestamp || new Date().toISOString();
    const entryDate = e.date || iso.split('T')[0];
    return {
      user_id: userId,
      title: (e.title || 'Intrare fără titlu').slice(0, 500),
      content: e.content || '',
      lesson: e.lesson || null,
      entry_date: entryDate,
    };
  });

  const { error } = await supabase.from('journal_entries').insert(rows);
  if (error) {
    console.error('[journalMigration] Failed to migrate entries:', error);
    return;
  }

  // Clear legacy buckets and set flag so we don't re-migrate.
  localStorage.removeItem('journalEntries');
  localStorage.removeItem('journal-entries');
  localStorage.setItem(flagKey, '1');
  console.info(`[journalMigration] Migrated ${rows.length} journal entries to DB.`);
}
