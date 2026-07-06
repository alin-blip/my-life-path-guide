/**
 * Unit tests for shared edge auth helpers.
 * Run: deno test --allow-env scripts/auth-helpers.test.ts
 */
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  parseJwtClaims,
  isServiceRoleToken,
  LEAD_VERIFIED_TEMPLATES,
} from "../supabase/functions/_shared/auth.ts";

Deno.test("parseJwtClaims extracts role from anon JWT payload", () => {
  // Minimal JWT: header.payload.sig (payload = {"role":"anon"})
  const payload = btoa(JSON.stringify({ role: "anon", iss: "supabase" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.fake`;
  const claims = parseJwtClaims(token);
  assertEquals(claims?.role, "anon");
});

Deno.test("isServiceRoleToken false for anon role", () => {
  const payload = btoa(JSON.stringify({ role: "anon" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.fake`;
  assertEquals(isServiceRoleToken(token), false);
});

Deno.test("isServiceRoleToken true for service_role", () => {
  const payload = btoa(JSON.stringify({ role: "service_role" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.fake`;
  assertEquals(isServiceRoleToken(token), true);
});

Deno.test("LEAD_VERIFIED_TEMPLATES includes burnout-results", () => {
  assertEquals(LEAD_VERIFIED_TEMPLATES["burnout-results"], "burnout_test");
});
