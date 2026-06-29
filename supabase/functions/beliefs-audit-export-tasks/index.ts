import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function currentWeekKey(): string {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - yearStart.getTime()) / 86400000);
  const week = Math.ceil((days + yearStart.getDay() + 1) / 7);
  return `door-week-${now.getFullYear()}-${String(week).padStart(2, "0")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthenticated");

    const { audit_id } = await req.json();
    if (!audit_id) throw new Error("audit_id required");

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: audit, error: auditErr } = await adminClient
      .from("belief_audits")
      .select("*")
      .eq("id", audit_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (auditErr) throw auditErr;
    if (!audit) throw new Error("Audit not found");

    const tasks = audit.strategic_plan?.tasks ?? [];
    if (tasks.length === 0) {
      return new Response(JSON.stringify({ inserted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const weekKey = currentWeekKey();
    const rows = tasks.slice(0, 7).map((t: any) => ({
      user_id: user.id,
      week_key: weekKey,
      list_type: "hit",
      item_id: crypto.randomUUID(),
      title: `[${t.chapter ?? "Credințe"}] ${t.title}`,
    }));

    const { error: insErr } = await adminClient.from("hot_list_items").insert(rows);
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ inserted: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
