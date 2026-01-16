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
    const trackingId = url.searchParams.get('id');
    
    // Also support POST with body
    let email: string | null = null;
    if (req.method === "POST") {
      const body = await req.json();
      email = body.email;
    }

    if (!trackingId && !email) {
      throw new Error("Missing tracking ID or email");
    }

    if (trackingId) {
      // Find the email from tracking log
      const { data: logData, error: logError } = await supabase
        .from('email_sequence_log')
        .select('email')
        .eq('tracking_id', trackingId)
        .maybeSingle();

      if (logError) {
        throw new Error(`Error finding tracking record: ${logError.message}`);
      }

      if (logData) {
        email = logData.email;
        
        // Mark as unsubscribed in log
        await supabase
          .from('email_sequence_log')
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq('tracking_id', trackingId);
      }
    }

    if (email) {
      // Update email_leads to unsubscribe
      const { error: updateError } = await supabase
        .from('email_leads')
        .update({ subscribed: false })
        .eq('email', email);

      if (updateError) {
        throw new Error(`Error updating subscription: ${updateError.message}`);
      }

      console.log(`Unsubscribed: ${email}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully unsubscribed' 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in unsubscribe-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
