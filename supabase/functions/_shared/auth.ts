import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function unauthorized(msg = "Unauthorized", status = 401) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function forbidden(msg = "Forbidden") {
  return unauthorized(msg, 403);
}

export function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1]
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    return JSON.parse(atob(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isServiceRoleToken(token: string): boolean {
  const claims = parseJwtClaims(token);
  return claims?.role === "service_role";
}

export async function requireUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return { user: null, token: null };
  const token = authHeader.slice(7).trim();
  if (!token) return { user: null, token: null };
  if (isServiceRoleToken(token)) return { user: null, token };
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return { user: null, token: null };
  return { user: data.user, token };
}

export async function requireServiceRole(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return false;
  const token = authHeader.slice(7).trim();
  return isServiceRoleToken(token);
}

export async function requireAdmin(req: Request) {
  const { user, token } = await requireUser(req);
  if (!user) return { user: null, isAdmin: false, token: null };
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (error) return { user, isAdmin: false, token };
  return { user, isAdmin: !!data, token };
}

/** Templates callable by authenticated users only to their own email. */
export const USER_SELF_EMAIL_TEMPLATES = new Set([
  "welcome",
  "trial-reminder",
  "subscription-upgraded",
]);

/** Public funnel templates — allowed when a matching lead was captured recently. */
export const LEAD_VERIFIED_TEMPLATES: Record<string, string> = {
  "burnout-results": "burnout_test",
};

export async function authorizeTransactionalEmail(
  req: Request,
  templateName: string,
  recipientEmail: string,
): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (token && isServiceRoleToken(token)) return null;

  const { user } = await requireUser(req);
  const normalizedRecipient = recipientEmail.toLowerCase().trim();

  if (user) {
    const userEmail = (user.email ?? "").toLowerCase();
    if (userEmail === normalizedRecipient) return null;
    return forbidden("Recipient must match authenticated user email");
  }

  const leadMagnet = LEAD_VERIFIED_TEMPLATES[templateName];
  if (!leadMagnet) {
    return unauthorized("Authentication required");
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: lead } = await admin
    .from("email_leads")
    .select("id")
    .eq("email", normalizedRecipient)
    .eq("lead_magnet", leadMagnet)
    .gte("created_at", since)
    .maybeSingle();

  if (!lead) {
    return forbidden("No recent lead capture for this email and template");
  }

  return null;
}
