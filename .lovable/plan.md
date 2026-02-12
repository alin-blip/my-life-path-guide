

# Fix: LessonWelcomePost Shows Challenge Content in Personal Power

## Problem

The `LessonWelcomePost` component contains hardcoded content for the 7-day Challenge only (days 1-7 with challenge-specific tasks like "Domino Door", "Harta Realitatii", etc.). However, it's rendered inside `LessonCommunityPost` which is used by BOTH the Challenge and Personal Power courses. This means Personal Power Day 3 incorrectly shows "Ziua 3: Business + Domino Door" instead of content relevant to that Personal Power lesson.

## Solution

Pass the `sourcePrefix` from `LessonCommunityPost` down to `LessonWelcomePost` so it can differentiate between courses. For Personal Power, generate the welcome post dynamically using the day title and course name instead of the hardcoded challenge tasks.

## Technical Details

### 1. `src/components/programs/LessonWelcomePost.tsx`

- Add `sourcePrefix` and `dayTitle` props
- Only show the hardcoded challenge content when `sourcePrefix === 'challenge'`
- For other courses (like Personal Power), show a generic welcome post using the `dayTitle` and `courseName` with a simple CTA ("Share your insights and breakthroughs below!")

### 2. `src/components/programs/LessonCommunityPost.tsx`

- Pass `sourcePrefix` (the `prefix` variable) and `dayTitle` to `LessonWelcomePost`

### 3. Build error fix

- Ensure imports and props are consistent to resolve any build errors from the previous changes

