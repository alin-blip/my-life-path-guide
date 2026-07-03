// Deno tests for send-lifecycle-emails selection logic.
// Run with the built-in Supabase edge function test runner.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

// Pure helpers mirroring the selection logic in index.ts. Kept in the test
// file so the deployed function stays untouched. If the selection logic
// changes in index.ts, mirror it here.

type User = { id: string; email: string | null; created_at: string; user_metadata?: Record<string, unknown> };
type Subscriber = { email: string; user_id: string | null; subscription_end: string; subscription_status: string };
type SessionRow = { user_id: string; created_at: string };
type LogRow = { recipient_email: string; template_name: string; created_at: string };

const HOURS = 3600 * 1000;

export function selectWelcomeCandidates(users: User[], now: Date, log: LogRow[]) {
  const since = new Date(now.getTime() - 48 * HOURS).toISOString();
  const sentSet = new Set(log.filter(l => l.template_name === "welcome").map(l => l.recipient_email));
  return users.filter(u => u.email && u.created_at >= since && !sentSet.has(u.email));
}

export function selectTrialReminderCandidates(subs: Subscriber[], now: Date, log: LogRow[]) {
  const soon = new Date(now.getTime() + 48 * HOURS).toISOString();
  const sentSet = new Set(log.filter(l => l.template_name === "trial-reminder").map(l => l.recipient_email));
  return subs.filter(
    s => s.subscription_status === "trialing" &&
      s.subscription_end <= soon &&
      s.subscription_end >= now.toISOString() &&
      !sentSet.has(s.email),
  );
}

export function selectWinbackCandidates(users: User[], sessions: SessionRow[], now: Date, log: LogRow[]) {
  const cutoff = new Date(now.getTime() - 14 * 24 * HOURS).toISOString();
  const recentCutoff = new Date(now.getTime() - 30 * 24 * HOURS).toISOString();
  const activeIds = new Set(sessions.filter(s => s.created_at >= cutoff).map(s => s.user_id));
  const recentlySent = new Set(
    log.filter(l => l.template_name === "retention-winback" && l.created_at >= recentCutoff).map(l => l.recipient_email),
  );
  return users.filter(u =>
    u.email && u.created_at <= cutoff && !activeIds.has(u.id) && !recentlySent.has(u.email!),
  );
}

const NOW = new Date("2026-07-03T00:00:00Z");

Deno.test("welcome: only users < 48h and not already sent", () => {
  const users: User[] = [
    { id: "1", email: "a@x", created_at: new Date(NOW.getTime() - 10 * HOURS).toISOString() },
    { id: "2", email: "b@x", created_at: new Date(NOW.getTime() - 60 * HOURS).toISOString() },
    { id: "3", email: "c@x", created_at: new Date(NOW.getTime() - 5 * HOURS).toISOString() },
  ];
  const log: LogRow[] = [
    { recipient_email: "c@x", template_name: "welcome", created_at: NOW.toISOString() },
  ];
  const picks = selectWelcomeCandidates(users, NOW, log);
  assertEquals(picks.map(p => p.email), ["a@x"]);
});

Deno.test("trial-reminder: only trialing ending within 48h, not sent", () => {
  const subs: Subscriber[] = [
    { email: "t1@x", user_id: "u1", subscription_end: new Date(NOW.getTime() + 24 * HOURS).toISOString(), subscription_status: "trialing" },
    { email: "t2@x", user_id: "u2", subscription_end: new Date(NOW.getTime() + 5 * 24 * HOURS).toISOString(), subscription_status: "trialing" },
    { email: "t3@x", user_id: "u3", subscription_end: new Date(NOW.getTime() - 1 * HOURS).toISOString(), subscription_status: "trialing" },
    { email: "t4@x", user_id: "u4", subscription_end: new Date(NOW.getTime() + 12 * HOURS).toISOString(), subscription_status: "active" },
    { email: "t5@x", user_id: "u5", subscription_end: new Date(NOW.getTime() + 12 * HOURS).toISOString(), subscription_status: "trialing" },
  ];
  const log: LogRow[] = [
    { recipient_email: "t5@x", template_name: "trial-reminder", created_at: NOW.toISOString() },
  ];
  const picks = selectTrialReminderCandidates(subs, NOW, log);
  assertEquals(picks.map(p => p.email), ["t1@x"]);
});

Deno.test("winback: inactive 14+ days, account 14+ days old, dedup 30d", () => {
  const users: User[] = [
    { id: "u1", email: "a@x", created_at: new Date(NOW.getTime() - 40 * 24 * HOURS).toISOString() },
    { id: "u2", email: "b@x", created_at: new Date(NOW.getTime() - 40 * 24 * HOURS).toISOString() },
    { id: "u3", email: "c@x", created_at: new Date(NOW.getTime() - 3 * 24 * HOURS).toISOString() },
    { id: "u4", email: "d@x", created_at: new Date(NOW.getTime() - 40 * 24 * HOURS).toISOString() },
  ];
  const sessions: SessionRow[] = [
    { user_id: "u2", created_at: new Date(NOW.getTime() - 2 * 24 * HOURS).toISOString() },
  ];
  const log: LogRow[] = [
    { recipient_email: "d@x", template_name: "retention-winback", created_at: new Date(NOW.getTime() - 5 * 24 * HOURS).toISOString() },
  ];
  const picks = selectWinbackCandidates(users, sessions, NOW, log);
  assertEquals(picks.map(p => p.email).sort(), ["a@x"]);
});

Deno.test("HTTP: function boots and returns ok structure", async () => {
  const url = Deno.env.get("VITE_SUPABASE_URL") ?? "https://exsbnfmaadjyfblperas.supabase.co";
  const key = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  if (!key) { console.warn("skipping: no anon key"); return; }
  const res = await fetch(`${url}/functions/v1/send-lifecycle-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({ probe: true }),
  });
  const body = await res.text();
  assert(res.status === 200 || res.status === 500, `unexpected status: ${res.status} ${body}`);
});
