import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireAdmin, corsHeaders, unauthorized } from "../_shared/auth.ts";

const MINIMUM_PAYOUT_EUR = 25; // Minimum €25 for payout

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow scheduled cron via CRON_SECRET header, otherwise require admin JWT.
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedCron = req.headers.get("x-cron-secret");
  if (!cronSecret || providedCron !== cronSecret) {
    const { isAdmin } = await requireAdmin(req);
    if (!isAdmin) return unauthorized("Admin access required", 403);
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Optional: specific coach_id from request body (for manual payouts)
    let specificCoachId: string | null = null;
    try {
      const body = await req.json();
      specificCoachId = body?.coach_id || null;
    } catch {
      // No body provided, process all eligible coaches
    }

    // Find coaches with pending payouts >= minimum
    let query = supabaseService
      .from("coach_profiles")
      .select("*")
      .eq("stripe_onboarding_complete", true)
      .gte("pending_payout", MINIMUM_PAYOUT_EUR);

    if (specificCoachId) {
      query = query.eq("id", specificCoachId);
    }

    const { data: coaches, error: coachError } = await query;

    if (coachError) {
      throw new Error(`Error fetching coaches: ${coachError.message}`);
    }

    console.log(`[COACH-PAYOUTS] Found ${coaches?.length || 0} coaches eligible for payout`);

    const results: Array<{ coachId: string; amount: number; status: string; error?: string }> = [];

    for (const coach of coaches || []) {
      try {
        if (!coach.stripe_connect_id) {
          results.push({ coachId: coach.id, amount: 0, status: "skipped", error: "No Stripe account" });
          continue;
        }

        const payoutAmount = Math.floor(coach.pending_payout * 100); // Convert to cents

        // Create transfer to connected account
        const transfer = await stripe.transfers.create({
          amount: payoutAmount,
          currency: "eur",
          destination: coach.stripe_connect_id,
          metadata: {
            coach_id: coach.id,
            user_id: coach.user_id,
          },
        });

        console.log(`[COACH-PAYOUTS] Created transfer ${transfer.id} for coach ${coach.id}: €${coach.pending_payout}`);

        // Update commissions to paid
        const { error: commissionError } = await supabaseService
          .from("commissions")
          .update({
            status: "paid",
            stripe_transfer_id: transfer.id,
            paid_at: new Date().toISOString(),
          })
          .eq("coach_id", coach.id)
          .eq("status", "pending");

        if (commissionError) {
          console.error(`[COACH-PAYOUTS] Error updating commissions:`, commissionError);
        }

        // Reset pending payout
        const { error: updateError } = await supabaseService
          .from("coach_profiles")
          .update({ pending_payout: 0 })
          .eq("id", coach.id);

        if (updateError) {
          console.error(`[COACH-PAYOUTS] Error resetting pending payout:`, updateError);
        }

        // Record in payout history
        const { error: historyError } = await supabaseService
          .from("payout_history")
          .insert({
            coach_id: coach.id,
            amount: coach.pending_payout,
            currency: "EUR",
            stripe_transfer_id: transfer.id,
            status: "completed",
          });

        if (historyError) {
          console.error(`[COACH-PAYOUTS] Error recording payout history:`, historyError);
        }

        results.push({ 
          coachId: coach.id, 
          amount: coach.pending_payout, 
          status: "success" 
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[COACH-PAYOUTS] Error processing payout for coach ${coach.id}:`, errorMessage);
        results.push({ 
          coachId: coach.id, 
          amount: coach.pending_payout, 
          status: "failed", 
          error: errorMessage 
        });
      }
    }

    return new Response(JSON.stringify({ 
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[COACH-PAYOUTS] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
