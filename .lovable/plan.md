

# Plan: Fix Domino Door Task Disappearance Bug

## Root Cause

There is a **race condition** between two save mechanisms:

1. **`addIdeaToWeek`** - inserts tasks directly to the database (used by AI planning, Stack, manual add)
2. **`saveWeekLists`** - takes the in-memory `hitList`/`doList`, upserts them, and **deletes any DB task NOT in the in-memory lists**

When a user adds tasks (via planning or manual), they go to the DB but the in-memory React state hasn't been updated. The next save operation (triggered by toggling a checkbox, moving a task, or auto-save) runs `saveWeekLists` with stale in-memory data, which **deletes the newly added tasks**.

The realtime subscription then reloads, but by then the tasks are already deleted.

## Fix Strategy

### Fix 1: Make `saveWeekLists` only delete tasks it originally knew about

In `doorUserTasksService.ts`, the delete logic currently removes any DB task not in `currentIds`. Change it to only delete tasks that were in the **original `existingTasks` snapshot AND are no longer in the new lists** - but skip deleting tasks that were added **after** the initial load (i.e., tasks with IDs not known to the caller).

Concretely: instead of blindly deleting all DB tasks not in the current in-memory list, only delete tasks whose IDs were passed in the previous state. This prevents deleting tasks added by other code paths.

### Fix 2: Refresh in-memory state after `addIdeaToWeek`

After `addIdeaToWeek` successfully inserts, trigger a reload of the hitList/doList state to sync in-memory with DB. This ensures the next `saveWeekLists` call has the complete picture.

In `DoorPlanningModal.tsx` (line ~670), after all steps are added, dispatch the `doorDataUpdated` event so `useDoorStorage` reloads the lists.

### Fix 3: Guard against realtime-triggered saves

In `useDoorLists.tsx`, when the realtime subscription triggers a reload (lines 32-48), set a flag to prevent the `useDoorStorageSave` from immediately saving the stale state back.

---

## Technical Changes

### File 1: `src/services/doorUserTasksService.ts` (saveWeekLists)
- Change the delete logic (lines 264-275): instead of deleting all DB tasks not in `currentIds`, only delete tasks that existed in the `existingTasks` fetch but are missing from the new lists. This prevents deleting tasks that were added by `addIdeaToWeek` between the initial load and this save.

### File 2: `src/components/door/DoorPlanningModal.tsx` (after steps saved)
- After the loop that adds steps to daily tasks (line ~670), dispatch a `doorDataUpdated` event to force a state reload:
```typescript
window.dispatchEvent(new CustomEvent('doorDataUpdated', { detail: { source: 'planning-complete' } }));
```

### File 3: `src/hooks/useDoorLists.tsx` (refreshLists)
- Add a public `refreshLists` function that reloads from DB and updates in-memory state
- Ensure this is called after any `addIdeaToWeek` operations

---

## What this fixes
- Tasks added via AI planning no longer disappear when another action triggers a save
- Tasks moved between lists persist correctly
- Manual task additions are preserved across save cycles
