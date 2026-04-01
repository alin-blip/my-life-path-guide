

# Plan: Fix Door Audit — Build Script, Drag-Drop, and Arrow Button

## Problems Found

### 1. Build fails: missing `build:dev` script
`package.json` has `dev`, `build`, `preview`, `lint` but no `build:dev`.

### 2. Drag-and-drop from Ideas to Domino Door doesn't work
HotList uses `@hello-pangea/dnd` library for internal reordering. Each idea item sets native `onDragStart` with `application/json` data (type `idea-bank-item`). However, `DominoDoor.handleLocalDrop` only checks for `monthly-mission` type — it ignores `idea-bank-item`. The fallback `handleDropOnDomino` (from `useDoorDrag`) relies on `draggedItem` state being set, but HotList never calls `handleDragStartToDomino()` to set that state. So dropping an idea on Domino does nothing.

### 3. Arrow button on tasks doesn't move to Ideas list
`moveTaskBackToHotList` adds the task to the old `hotList` state array and saves via `doorUserTasksService.saveGlobalHotList()`. But the Ideas column (`HotList.tsx`) loads from `ideasBankService.fetchAllIdeas()` (the `ideas_bank` table), not the old `hotList` state. So the task disappears from tasks but never appears in Ideas.

---

## Fix Plan

### Step 1: Add `build:dev` script to `package.json`
Add `"build:dev": "vite build --mode development"` to scripts.

### Step 2: Fix drag-drop — Ideas to Domino Door
In `DominoDoor.tsx` → `handleLocalDrop`, add handling for `idea-bank-item` type:
- When an idea is dropped on Domino, set it as `selectedDomino` using `setSelectedDomino`
- Archive the idea from ideas_bank after setting it
- Show success toast

### Step 3: Fix drag-drop — Ideas to TaskList
The current `useDoorDrag.handleDrop` creates local state items but doesn't persist to DB. After adding to local state, it should also call `doorUserTasksService.addIdeaToWeek()` and `ideasBankService.archiveIdea()` to persist.

### Step 4: Fix arrow button — Task back to Ideas
Change `moveTaskBackToHotList` in `useDoorLists.tsx` to:
- Instead of adding to old `hotList` state, call `ideasBankService.addIdea()` to insert into `ideas_bank` table
- Remove from task list (current behavior is fine)
- Delete from `user_tasks` DB (current behavior is fine)
- The HotList component will pick up the new idea on next load/refresh

---

## Files to Modify
1. `package.json` — add `build:dev` script
2. `src/components/door/DominoDoor.tsx` — handle `idea-bank-item` drop type
3. `src/hooks/useDoorDrag.tsx` — persist idea drops to DB
4. `src/hooks/useDoorLists.tsx` — fix `moveTaskBackToHotList` to use `ideasBankService`

