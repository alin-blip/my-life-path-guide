// Stripe webhook tests: signature validation + event routing shape.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const URL_BASE = Deno.env.get("VITE_SUPABASE_URL") ?? "https://exsbnfmaadjyfblperas.supabase.co";
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

Deno.test("stripe-webhook: rejects request without signature", async () => {
  const res = await fetch(`${URL_BASE}/functions/v1/stripe-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON },
    body: JSON.stringify({ id: "evt_test", type: "ping" }),
  });
  const body = await res.text();
  assert(res.status === 400 || res.status === 401, `expected 4xx got ${res.status}: ${body}`);
});

Deno.test("stripe-webhook: rejects invalid signature", async () => {
  const res = await fetch(`${URL_BASE}/functions/v1/stripe-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      "stripe-signature": "t=1234,v1=deadbeef",
    },
    body: JSON.stringify({ id: "evt_test", type: "ping" }),
  });
  assert(res.status >= 400, `expected 4xx, got ${res.status}`);
});

// Pure helper: replicate the "justActivated" decision from stripe-webhook.
export function isJustActivated(eventType: string, currentStatus: string, previousStatus?: string) {
  return currentStatus === "active" && (
    eventType === "customer.subscription.created" ||
    previousStatus === "trialing" ||
    previousStatus === "incomplete"
  );
}

Deno.test("isJustActivated: trial -> active triggers upgrade email", () => {
  assertEquals(isJustActivated("customer.subscription.updated", "active", "trialing"), true);
});
Deno.test("isJustActivated: incomplete -> active triggers upgrade email", () => {
  assertEquals(isJustActivated("customer.subscription.updated", "active", "incomplete"), true);
});
Deno.test("isJustActivated: created + active triggers upgrade email", () => {
  assertEquals(isJustActivated("customer.subscription.created", "active"), true);
});
Deno.test("isJustActivated: active -> past_due does NOT trigger", () => {
  assertEquals(isJustActivated("customer.subscription.updated", "past_due", "active"), false);
});
Deno.test("isJustActivated: active -> active (no change) does NOT trigger", () => {
  assertEquals(isJustActivated("customer.subscription.updated", "active", "active"), false);
});
