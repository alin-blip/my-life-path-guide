# Mobile-first fix: top bar under the iPhone camera + scrolling

## Problem
- On iPhone (installed app / PWA), the top bar (logo, messages, notifications, profile) and the menu button sit under the camera/notch, so they can't be tapped.
- Scrolling sometimes gets stuck because the page has two nested scroll areas.

## What changes for the user
- The top bar starts below the camera on every iPhone; all buttons are tappable.
- One smooth page scroll, no getting stuck.
- Bottom navigation sits above the home indicator.
- The menu button moves inside the top bar (no floating button overlapping content).
- Side menu opens with its content below the camera.
- Same fixes on the Community/Courses pages and the public landing header.

## Technical details
- `GlobalTopBar`: add `padding-top: env(safe-area-inset-top)` on the sticky header; height = 56px + inset; left/right safe-area padding; touch targets min 44px.
- `Layout`: remove the floating hamburger, render a hamburger button inside `GlobalTopBar` on mobile (prop `onMenuClick`). Remove `overflow-y-auto` from the root flex wrapper and main column on mobile so the document is the single scroll container (fixes iOS sticky + scroll lock); keep `overflow-x-hidden`. Use `min-h-[100dvh]`.
- Mobile sidebar drawer: `h-[100dvh]`, padding-top safe inset, `overscroll-contain`; lock body scroll while open.
- `MobileGlobalNav`: keep `safe-bottom`, ensure content padding-bottom = 56px + inset.
- `ProgramsLayout`: same single-scroll approach; lessons bar sticky below the top bar offset.
- `StickyHeader` (landing): safe-area top padding; mobile drawer `top` offset includes inset.
- `capacitor.config.ts`: add `ios.contentInset: 'never'` so web safe-area handling is the single source (config test stays green).
- Verify with Playwright at 390x844 simulating safe-area insets, and run `bun test scripts/capacitor-config.test.ts`.
