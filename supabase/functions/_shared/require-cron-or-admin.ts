// Shared auth helper for bulk/cron email endpoints.
// Accepts EITHER:
//   1. A matching `x-cron-secret` header (used by pg_cron jobs), OR
//   2. A valid admin JWT (Authorization: Bearer <token>) with the 'admin' role.
// Returns null when authorized, or a Response (401) when not.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

export async function requireCronOrAdmin(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const expected = Deno.env.get("CRON_SECRET");
  const provided = req.headers.get("x-cron-secret");

  if (expected && provided && provided === expected) {
    return null;
  }

  // Fallback: admin JWT
  const authHeader = req.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claims } = await supabase.auth.getClaims(token);
      const userId = claims?.claims?.sub;
      if (userId) {
        const service = createClient(
          supabaseUrl,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const { data: isAdmin } = await service.rpc("has_role", {
          _user_id: userId,
          _role: "admin",
        });
        if (isAdmin === true) return null;
      }
    } catch (_e) {
      // fall through to 401
    }
  }

  return new Response(
    JSON.stringify({ error: "Unauthorized. Provide x-cron-secret header or an admin JWT." }),
    { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
  );
}
