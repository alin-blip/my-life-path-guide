import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const url = new URL(req.url);
    // Accept tracking id via query string (?id=... or ?token=...) or POST body { token }.
    let trackingId: string | null = url.searchParams.get("id") || url.searchParams.get("token");

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (typeof body?.token === "string") trackingId = body.token;
        else if (typeof body?.id === "string") trackingId = body.id;
        // Intentionally IGNORE any raw `email` in the body. Unauthenticated
        // unsubscribe by raw email is disabled; use handle-email-unsubscribe with a token.
      } catch {
        // ignore malformed JSON
      }
    }

    if (!trackingId) {
      return new Response(
        JSON.stringify({ error: "A valid unsubscribe token is required." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Resolve email from tracking log
    const { data: logData, error: logError } = await supabase
      .from("email_sequence_log")
      .select("email")
      .eq("tracking_id", trackingId)
      .maybeSingle();

    if (logError) {
      throw new Error(`Error finding tracking record: ${logError.message}`);
    }

    if (!logData?.email) {
      return new Response(
        JSON.stringify({ error: "Token not found." }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const email = logData.email;

    await supabase
      .from("email_sequence_log")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("tracking_id", trackingId);

    const { error: updateError } = await supabase
      .from("email_leads")
      .update({ subscribed: false })
      .eq("email", email);

    if (updateError) {
      throw new Error(`Error updating subscription: ${updateError.message}`);
    }

    console.log(`Unsubscribed via token: ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Successfully unsubscribed" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: any) {
    console.error("Error in unsubscribe-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
