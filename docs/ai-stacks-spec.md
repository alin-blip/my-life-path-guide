# AI Stacks Specification

This document explains exactly how the Anger Stack and Divine Prayer Stack work (manual and AI-guided), so you can replicate them in another app.

## Overview
- Two modes for each stack
  - Manual: step-by-step questions with validation and auto-advance rules
  - AI-guided: chat-style flow via a Supabase Edge Function that proxies OpenAI
- Persistence
  - Online: Supabase tables (anger_stack_sessions, divine_coaching_sessions, stack_library, user_progress, user_statistics)
  - Offline fallback: localStorage keys
- Action capture: final committed action can be added to a local “Hot List” (door-hot-list)

## Data and LocalStorage Keys
- Session autosave (generic pattern handled by useStackSession hook)
  - stack-session-{stackType}-{sessionId}
  - stack-draft-{stackType}-{sessionId}-{currentStep}
- Anger Stack fallback store
  - anger-stack-{sessionId}: { [stepIndex]: { question, answer, timestamp } }
- Hot List
  - door-hot-list: array of { id, text, selected, priority }

## Supabase Tables Used
- anger_stack_sessions: { session_id, user_id, answers jsonb, completed, created_at, updated_at }
- divine_coaching_sessions: same shape as above
- stack_library: stores completed stacks (title, type, content)
- user_progress: daily activity entries
- user_statistics: totals and streaks

All tables have strict RLS: users can only access their own rows. Authentication is required for cloud persistence to work.

## Manual Mode Logic
- Questions source: now exported as JSON files in src/data/stacks/
  - anger.en.json, anger.ro.json
  - divine.ro.json
- Placeholder replacement (Anger):
  - {peCinece} → answer to question index 2 (target)
  - {careEste} → answer to question index 9 (original story)
- Yes/No steps (Anger): indices [13,14,19,20,23,26,29,30,39,40,31]
- Special auto-advances and branching handled in EnhancedAngerStack and useAngerStack
- Completion flow:
  - Persist session as completed
  - saveToStackLibrary('anger' | 'divine', sessionId, answers, questions)
  - updateDailyProgress('stack')
  - Extract committed action (e.g., answers[38] in Anger) and optionally add to Hot List

## AI-Guided Mode
- Component: AiGuidedStack
- Backend: Supabase Edge Function supabase/functions/ai-live-coaching (CORS enabled)
  - Request body: { messages: ChatMessage[], systemPrompt?: string }
  - Model: gpt-4o-mini (can be swapped)
  - Response: { message, usage }
- Flow:
  - Start with a system prompt tailored by stack type ('anger' or 'divine-prayer')
  - Chat messages collected in UI, sent to edge function
  - Generate final action from the transcript; user can add to Hot List

## JSON Question Files
- src/data/stacks/anger.en.json: array of strings
- src/data/stacks/anger.ro.json: array of strings with placeholders
- src/data/stacks/divine.ro.json: array of strings

These mirror the original TypeScript arrays one-to-one, enabling reuse in other apps.

## Minimal AI Client Example
- See src/examples/MinimalAIClient.tsx for a tiny component that calls the ai-live-coaching function and displays responses.

## Porting Checklist
1) Frontend
- Recreate manual step engine (state: step, answers, currentAnswer, yes/no mapping)
- Implement placeholder replacement and special branching rules
2) Persistence
- Implement Supabase tables or create similar endpoints; keep localStorage fallback
3) AI Backend
- Create an Edge Function or API route that forwards to OpenAI with a safe API key
- Match request/response shape used here
4) Action Integration
- Implement a Hot List (or tasks) store and a way to append the committed action

## Notes
- Language is determined via document.documentElement.lang === 'en' ? 'en' : 'ro'
- For production, ensure OPENAI_API_KEY is set in Supabase Edge Functions settings
