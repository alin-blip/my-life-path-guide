

# Plan: Fix Missing Tasks from AI Planning in Domino Door

## Root Cause Identified

After analyzing the code flow and database data, there are **two bugs** causing tasks to not appear after AI planning:

### Bug 1: Steps returned as plain strings are silently dropped

In `DoorPlanningModal.tsx` (line 649-653), when the AI returns a step as a plain string instead of an object `{text, day, listType}`, the day is set to `null`:

```text
stepText = typeof step === 'string' ? step : step.text;   // OK - gets text
stepDay  = typeof step === 'object' ? step.day : null;     // BUG - null if string
```

Then line 653 checks `if (stepText && stepDay)` -- since `stepDay` is null, the task is **silently skipped**. No error, no log, no warning. The AI sometimes returns steps as plain strings despite the schema requiring objects.

### Bug 2: Duplicate check ignores day_of_week

In `doorUserTasksService.ts` (line 314-323), the duplicate detection checks `title + task_type + week_key` but **NOT day_of_week**. If the AI assigns the same task text to two different days (e.g., "Follow up emails" on Monday and Thursday), only the first is saved. The second is treated as a duplicate.

## Fixes

### Fix 1: `DoorPlanningModal.tsx` - Handle string steps with fallback day

When a step is a plain string (no day/listType), assign it to the current day and default to `hit` list type instead of silently dropping it. Also add a console warning.

### Fix 2: `doorUserTasksService.ts` - Include day_of_week in duplicate check

Update the duplicate query in `addIdeaToWeek` to also check `day_of_week`, so the same task text on different days is allowed.

## Technical Details

**File 1: `src/components/door/DoorPlanningModal.tsx`** (lines 649-653)
- When `step` is a string, set `stepDay` to the next available weekday (round-robin M-F) instead of null
- Add console.warn for visibility
- Remove the `if (stepText && stepDay)` guard - always attempt to add if stepText exists

**File 2: `src/services/doorUserTasksService.ts`** (lines 314-323)
- Add `.eq('day_of_week', effectiveDay)` to the duplicate query for non-hot tasks
- This allows the same task text on different days

**Total: 2 files modified, no new files.**

