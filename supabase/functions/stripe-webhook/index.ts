import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

// Helper function to determine tier from amount (in cents)
// HORMOZI 3-TIER STRUCTURE (Updated Jan 2025):
// - Basic: €49 = 4900 cents / €399 annual = 39900 cents
// - Pro: €97 = 9700 cents / €970 annual = 97000 cents
// - Elite: €297 = 29700 cents / €2970 annual = 297000 cents
// - Accelerator: €497 = 49700 cents (one-time)
const getTierFromAmount = (amount: number, currency: string): string => {
  // Normalize to EUR cents for comparison
  const normalizedAmount = currency.toLowerCase() === "ron" 
    ? Math.round(amount / 5) // Approximate RON to EUR conversion
    : amount;
  
  // Elite Annual: €2970 = 297000 cents (range 290000-305000)
  if (normalizedAmount >= 290000 && normalizedAmount <= 305000) {
    return "elite";
  }
  // Pro Annual: €970 = 97000 cents (range 95000-100000)
  if (normalizedAmount >= 95000 && normalizedAmount <= 100000) {
    return "pro";
  }
  // Accelerator: €497 = 49700 cents (range 49000-50500)
  if (normalizedAmount >= 49000 && normalizedAmount <= 50500) {
    return "accelerator";
  }
  // Basic Annual: €399 = 39900 cents (range 38000-41000)
  if (normalizedAmount >= 38000 && normalizedAmount <= 41000) {
    return "basic";
  }
  // Elite: €297 = 29700 cents (range 29000-30500)
  if (normalizedAmount >= 29000 && normalizedAmount <= 30500) {
    return "elite";
  }
  // Pro: €97 = 9700 cents (range 9000-10500)
  if (normalizedAmount >= 9000 && normalizedAmount <= 10500) {
    return "pro";
  }
  // Basic: €49 = 4900 cents (range 4500-5500)
  if (normalizedAmount >= 4500 && normalizedAmount <= 5500) {
    return "basic";
  }
  // Default to basic for unknown amounts
  return "basic";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET missing");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe-signature header");

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify the webhook signature - MUST use async version in Deno/Edge Functions
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      log("Signature verified successfully");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log("Signature verification failed", { error: errorMessage, signaturePresent: !!signature });
      return new Response(JSON.stringify({ error: "Invalid signature", details: errorMessage }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("Event received", { type: event.type, id: event.id });

    // Initialize Supabase with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        log("Checkout completed", { 
          customer: session.customer, 
          email: session.customer_email,
          mode: session.mode,
          metadata: session.metadata
        });

        const customerEmail = session.customer_email;
        const customerId = session.customer as string;
        
        if (!customerEmail) {
          log("No customer email in session");
          break;
        }

        // PRIORITY: Get tier from metadata (most reliable)
        let subscriptionTier = session.metadata?.tier || "basic";
        let subscriptionEnd: Date | null = null;
        let subscriptionStatus = "active";
        
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          subscriptionEnd = new Date(subscription.current_period_end * 1000);
          subscriptionStatus = subscription.status; // "trialing" or "active"
          
          // Fallback: detect tier from amount if metadata not available
          if (!session.metadata?.tier) {
            const amount = subscription.items.data[0]?.price?.unit_amount || 0;
            const currency = subscription.items.data[0]?.price?.currency || "eur";
            subscriptionTier = getTierFromAmount(amount, currency);
          }
          
          log("Subscription details", {
            status: subscriptionStatus,
            tier: subscriptionTier,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
          });
        } else if (session.mode === "payment") {
          // One-time payment (Warrior Accelerator)
          subscriptionTier = session.metadata?.tier || "accelerator";
          subscriptionEnd = null; // Lifetime access
          subscriptionStatus = "lifetime";
          
          // Also record as course purchase for the accelerator
          if (subscriptionTier === "accelerator") {
            const { data: userData } = await supabaseService.auth.admin.listUsers();
            const user = userData?.users?.find(u => u.email === customerEmail);
            
            if (user) {
              const { error: purchaseError } = await supabaseService
                .from("course_purchases")
                .insert({
                  user_id: user.id,
                  product_id: "warrior-accelerator",
                  stripe_session_id: session.id,
                  amount_paid: session.amount_total,
                  currency: session.currency,
                });
              
              if (purchaseError) {
                log("Error recording accelerator purchase", { error: purchaseError.message });
              } else {
                log("Accelerator purchase recorded", { userId: user.id });
              }
            }
          }
        }

        // Find user by email
        const { data: userData } = await supabaseService.auth.admin.listUsers();
        const user = userData?.users?.find(u => u.email === customerEmail);

        // Fetch existing early_bird_expires_at to preserve it
        const { data: existingSubscriber } = await supabaseService
          .from("subscribers")
          .select("early_bird_expires_at")
          .eq("email", customerEmail)
          .single();

        // Upsert subscriber record - PRESERVE early_bird_expires_at
        const { error: upsertError } = await supabaseService
          .from("subscribers")
          .upsert({
            email: customerEmail,
            user_id: user?.id || null,
            stripe_customer_id: customerId,
            subscribed: true,
            subscription_tier: subscriptionTier,
            subscription_end: subscriptionEnd?.toISOString() || null,
            subscription_status: subscriptionStatus,
            early_bird_expires_at: existingSubscriber?.early_bird_expires_at || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });

        if (upsertError) {
          log("Error upserting subscriber", { error: upsertError.message });
        } else {
          log("Subscriber upserted successfully", { 
            email: customerEmail, 
            tier: subscriptionTier,
            status: subscriptionStatus 
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        log("Subscription updated", { 
          status: subscription.status,
          customer: subscription.customer,
          metadata: subscription.metadata
        });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer.deleted || !("email" in customer) || !customer.email) {
          log("Customer not found or no email");
          break;
        }

        const customerEmail = customer.email;
        const isActive = ["active", "trialing"].includes(subscription.status);
        const subscriptionEnd = new Date(subscription.current_period_end * 1000);
        
        // PRIORITY: Get tier from metadata
        let subscriptionTier = subscription.metadata?.tier;
        
        // Fallback: detect tier from amount
        if (!subscriptionTier) {
          const amount = subscription.items.data[0]?.price?.unit_amount || 0;
          const currency = subscription.items.data[0]?.price?.currency || "eur";
          subscriptionTier = getTierFromAmount(amount, currency);
        }

        // Find user
        const { data: userData } = await supabaseService.auth.admin.listUsers();
        const user = userData?.users?.find(u => u.email === customerEmail);

        // Fetch existing early_bird_expires_at to preserve it
        const { data: existingSubscriber } = await supabaseService
          .from("subscribers")
          .select("early_bird_expires_at")
          .eq("email", customerEmail)
          .single();

        const { error: upsertError } = await supabaseService
          .from("subscribers")
          .upsert({
            email: customerEmail,
            user_id: user?.id || null,
            stripe_customer_id: customerId,
            subscribed: isActive,
            subscription_tier: isActive ? subscriptionTier : null,
            subscription_end: subscriptionEnd.toISOString(),
            subscription_status: subscription.status,
            early_bird_expires_at: existingSubscriber?.early_bird_expires_at || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });

        if (upsertError) {
          log("Error upserting subscriber", { error: upsertError.message });
        } else {
          log("Subscriber updated", { 
            email: customerEmail, 
            active: isActive, 
            tier: subscriptionTier,
            status: subscription.status 
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        log("Subscription deleted", { customer: subscription.customer });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer.deleted || !("email" in customer) || !customer.email) {
          log("Customer not found or no email");
          break;
        }

        const { error: updateError } = await supabaseService
          .from("subscribers")
          .update({
            subscribed: false,
            subscription_tier: null,
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("email", customer.email);

        if (updateError) {
          log("Error updating subscriber", { error: updateError.message });
        } else {
          log("Subscription cancelled", { email: customer.email });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        log("Payment failed", { 
          customer: invoice.customer,
          amount: invoice.amount_due 
        });
        
        // Could send notification email here
        break;
      }

      default:
        log("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
