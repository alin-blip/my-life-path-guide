import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get user from auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("Invalid user");

    const { content_id } = await req.json();
    if (!content_id) throw new Error("content_id required");

    // Use service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get content details
    const { data: content, error: contentError } = await supabaseService
      .from("coach_content")
      .select("*, coach_profiles!inner(id, display_name, stripe_connect_id, stripe_onboarding_complete)")
      .eq("id", content_id)
      .eq("is_published", true)
      .single();

    if (contentError || !content) {
      throw new Error("Content not found or not published");
    }

    if (content.price_cents <= 0) {
      throw new Error("This content is free");
    }

    // Check if user already purchased this content
    const { data: existingPurchase } = await supabaseService
      .from("coach_content_purchases")
      .select("id")
      .eq("content_id", content_id)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single();

    if (existingPurchase) {
      throw new Error("You already own this content");
    }

    const coachProfile = content.coach_profiles;
    
    // Calculate shares: 70% coach, 30% platform
    const coachShare = Math.round(content.price_cents * 0.70);
    const platformShare = content.price_cents - coachShare;

    // Create or get Stripe product
    let stripeProductId = content.stripe_product_id;
    let stripePriceId = content.stripe_price_id;

    if (!stripeProductId) {
      const product = await stripe.products.create({
        name: content.title,
        description: content.description || undefined,
        metadata: {
          coach_content_id: content.id,
          coach_id: coachProfile.id,
        },
      });
      stripeProductId = product.id;

      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: content.price_cents,
        currency: content.currency,
      });
      stripePriceId = price.id;

      // Update content with Stripe IDs
      await supabaseService
        .from("coach_content")
        .update({
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
        })
        .eq("id", content.id);
    }

    // Determine success/cancel URLs
    const origin = req.headers.get("origin") || "https://napoleonhillacademy.com";

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [{ price: stripePriceId!, quantity: 1 }],
      success_url: `${origin}/coach-content?purchase=success&content_id=${content.id}`,
      cancel_url: `${origin}/coach-content?purchase=cancelled`,
      customer_email: user.email,
      metadata: {
        type: "coach_content",
        content_id: content.id,
        coach_id: coachProfile.id,
        user_id: user.id,
        coach_share: coachShare.toString(),
        platform_share: platformShare.toString(),
      },
    };

    // If coach has Stripe Connect, set up application fee for platform
    if (coachProfile.stripe_connect_id && coachProfile.stripe_onboarding_complete) {
      sessionConfig.payment_intent_data = {
        application_fee_amount: platformShare,
        transfer_data: {
          destination: coachProfile.stripe_connect_id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Created checkout session ${session.id} for content ${content.id}`);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
