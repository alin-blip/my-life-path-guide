

# Fix: Task completion flickering in Door HIT/DO lists

## Problem
When checking a task, it visually unchecks then rechecks. The sequence:
1. User clicks → optimistic state update (checked) ✅
2. Save to DB completes
3. Realtime subscription fires for the DB change
4. `loadData()` refetches everything from DB → sets state again → UI flickers

The `__doorRealtimeReloading` flag only suppresses auto-save during realtime, but doesn't suppress realtime itself during local saves.

## Fix

### Single change in `src/hooks/useDoorLists.tsx`

Add a **local save flag** (`__doorLocalSaving`) that suppresses realtime reloads when we know we just saved ourselves. This prevents the round-trip flicker.

**In `toggleHitListItemCompletion` and `toggleDoListItemCompletion`:**
- Set `(window as any).__doorLocalSaving = true` before saving
- Clear it after 2 seconds

**In the realtime handler (line 66-76):**
- Skip `loadData()` if `__doorLocalSaving` is true

This is a minimal, surgical fix — one file, ~10 lines changed.

## Files to modify
1. `src/hooks/useDoorLists.tsx` — add local save flag + check in realtime handler

