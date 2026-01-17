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
          mode: session.mode 
        });

        const customerEmail = session.customer_email;
        const customerId = session.customer as string;
        
        if (!customerEmail) {
          log("No customer email in session");
          break;
        }

        // Determine subscription tier from metadata or session
        let subscriptionTier = "pro";
        let subscriptionEnd: Date | null = null;
        
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          subscriptionEnd = new Date(subscription.current_period_end * 1000);
          
          // Check if it's Elite based on amount
          const amount = subscription.items.data[0]?.price?.unit_amount || 0;
          if (amount >= 49000) {
            subscriptionTier = "elite";
          }
        } else if (session.mode === "payment") {
          // One-time payment (Warrior Accelerator)
          subscriptionTier = "warrior-accelerator";
          subscriptionEnd = null; // Lifetime access
        }

        // Find user by email
        const { data: userData } = await supabaseService.auth.admin.listUsers();
        const user = userData?.users?.find(u => u.email === customerEmail);

        // Get subscription status if available
        let subscriptionStatus = "active";
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          subscriptionStatus = subscription.status; // "trialing" or "active"
        }

        // Upsert subscriber record
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
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });

        if (upsertError) {
          log("Error upserting subscriber", { error: upsertError.message });
        } else {
          log("Subscriber upserted successfully", { email: customerEmail, tier: subscriptionTier });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        log("Subscription updated", { 
          status: subscription.status,
          customer: subscription.customer 
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
        
        // Determine tier based on amount
        const amount = subscription.items.data[0]?.price?.unit_amount || 0;
        let subscriptionTier = "pro";
        if (amount >= 49000) {
          subscriptionTier = "elite";
        }

        // Find user
        const { data: userData } = await supabaseService.auth.admin.listUsers();
        const user = userData?.users?.find(u => u.email === customerEmail);

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
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });

        if (upsertError) {
          log("Error upserting subscriber", { error: upsertError.message });
        } else {
          log("Subscriber updated", { email: customerEmail, active: isActive, tier: subscriptionTier });
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
