/**
 * Lightweight telemetry for the Warrior Routine flow.
 *
 * Emits a structured, grep-friendly console log every time a routine step
 * (or a subtask inside a step) transitions to "complete", together with the
 * *reason* it was marked complete. Used to spot regressions such as the
 * mindShifting step not bifându-se after a stack.
 *
 * Also dispatches a `window` CustomEvent (`routine:telemetry`) so future
 * dashboards / DB persistence can subscribe without touching call sites.
 *
 * Filter in DevTools: `[routine-telemetry]`
 */

export type RoutineTelemetryReason =
  // step-level
  | 'next'                 // user pressed "Next" / auto-advance
  | 'skip'                 // user chose to skip
  | 'auto_complete'        // programmatic completion (log field flipped)
  // mindShifting sub-reasons
  | 'stack_selected'       // user opened any stack from the chooser
  | 'stack_action_saved'   // a stack pushed an action to the HIT list
  | 'stack_flow_complete'  // MentalitateStackFlow internal onComplete fired
  | 'continue_button'      // "Continuă rutina →" button
  // habit sub-tasks
  | 'habit_toggled'
  | 'habit_completed'
  // relationships / people sub-tasks
  | 'relationship_action_completed'
  // catch-all
  | 'other';

export interface RoutineTelemetryPayload {
  step: string;              // e.g. 'mindShifting', 'habit_body', 'relationships'
  reason: RoutineTelemetryReason;
  sub?: string;              // e.g. stack id, habit name, action title
  meta?: Record<string, unknown>;
}

/**
 * Log a routine completion / progression event.
 *
 * Never throws — telemetry must not break the routine flow.
 */
export function logRoutineEvent(payload: RoutineTelemetryPayload): void {
  try {
    const entry = {
      ts: new Date().toISOString(),
      ...payload,
    };

    // Structured console log — searchable and copy-pasteable.
    // Use console.info so it survives production console filters.
    // eslint-disable-next-line no-console
    console.info('[routine-telemetry]', entry);

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('routine:telemetry', { detail: entry }),
      );
    }
  } catch {
    // Silently swallow — telemetry is best-effort.
  }
}
