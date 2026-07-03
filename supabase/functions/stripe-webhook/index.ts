import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    // Helper function to process coach commissions (50%)
    const processCoachCommission = async (userId: string, paymentAmount: number, currency: string, stripePaymentId: string) => {
      try {
        // Find active referral for this user
        const { data: referral, error: refError } = await supabaseService
          .from("referrals")
          .select("*, coach_profiles!inner(*)")
          .eq("referred_user_id", userId)
          .eq("status", "active")
          .single();

        if (refError || !referral) {
          log("No active referral found for user", { userId });
          return;
        }

        const coachProfile = referral.coach_profiles;
        const commissionRate = coachProfile.commission_rate || 0.50; // Default 50%
        const commissionAmount = paymentAmount * commissionRate;

        log("Processing coach commission", {
          coachId: coachProfile.id,
          referralId: referral.id,
          originalPayment: paymentAmount,
          commissionRate,
          commissionAmount,
        });

        // Create commission record
        const { error: commError } = await supabaseService
          .from("commissions")
          .insert({
            referral_id: referral.id,
            coach_id: coachProfile.id,
            amount: commissionAmount,
            original_payment: paymentAmount,
            currency: currency.toUpperCase(),
            stripe_payment_id: stripePaymentId,
            status: "pending",
          });

        if (commError) {
          log("Error creating commission", { error: commError.message });
          return;
        }

        // Update coach pending payout
        const newPendingPayout = (coachProfile.pending_payout || 0) + commissionAmount;
        const newTotalEarnings = (coachProfile.total_earnings || 0) + commissionAmount;

        const { error: updateError } = await supabaseService
          .from("coach_profiles")
          .update({
            pending_payout: newPendingPayout,
            total_earnings: newTotalEarnings,
          })
          .eq("id", coachProfile.id);

        if (updateError) {
          log("Error updating coach payout", { error: updateError.message });
        } else {
          log("Coach commission processed successfully", {
            coachId: coachProfile.id,
            commission: commissionAmount,
            pendingPayout: newPendingPayout,
          });
        }

        // Update referral lifetime value
        const newLifetimeValue = (referral.lifetime_value || 0) + paymentAmount;
        await supabaseService
          .from("referrals")
          .update({
            lifetime_value: newLifetimeValue,
            first_payment_at: referral.first_payment_at || new Date().toISOString(),
          })
          .eq("id", referral.id);

      } catch (err) {
        log("Error in processCoachCommission", { error: err instanceof Error ? err.message : String(err) });
      }
    };

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

        // Process coach commission on initial checkout
        if (user?.id && session.amount_total) {
          const paymentAmountEur = session.amount_total / 100; // Convert cents to euros
          await processCoachCommission(user.id, paymentAmountEur, session.currency || "eur", session.id);
        }

        // === BURNOUT/EBOOK FUNNEL HOOKS ===
        try {
          const planId = session.metadata?.plan_id || "";
          const isEbookPurchase = ["ebook-only", "ebook-bundle", "ebook-only-en", "ebook-bundle-en"].includes(planId);
          const isUpsellPurchase = ["ebook-accelerator", "ebook-accelerator-en", "challenge-plus-trial", "challenge-plus-trial-en"].includes(planId);
          const language = planId.endsWith("-en") ? "en" : "ro";

          const EBOOK_DOWNLOADS = {
            ro: {
              ebookPdf: "https://drive.google.com/uc?export=download&id=1lpBl2_3V_HBzf3gXyrOq-oMs4SlxTJef",
              audiobookMp3: "https://drive.google.com/uc?export=download&id=1hMJei1BUOnuaoY9ad2qqTyC0jKZ9YPd4",
            },
            en: {
              ebookPdf: "https://drive.google.com/uc?export=download&id=1lbRXNa9qy4gMrCDTbgykhx9JqKkst-Wl",
              audiobookMp3: "https://drive.google.com/uc?export=download&id=1Rz6pHYGxJX76hG_9n__K2yg7wOudI0I_",
            },
          } as const;

          if (isEbookPurchase) {
            // Record ebook purchase
            const { error: ebookErr } = await supabaseService
              .from("ebook_purchases")
              .upsert({
                email: customerEmail,
                language,
                stripe_session_id: session.id,
                purchased_at: new Date().toISOString(),
                delivery_email_sent_at: new Date().toISOString(),
              }, { onConflict: "stripe_session_id" });

            if (ebookErr) {
              log("Error inserting ebook_purchase", { error: ebookErr.message });
            } else {
              log("Ebook purchase recorded", { email: customerEmail, language });
            }

            // Send delivery email immediately
            try {
              await supabaseService.functions.invoke("send-transactional-email", {
                body: {
                  templateName: "ebook-delivery",
                  recipientEmail: customerEmail,
                  idempotencyKey: `ebook-delivery-${session.id}`,
                  templateData: {
                    language,
                    ebookUrl: EBOOK_DOWNLOADS[language].ebookPdf,
                    audiobookUrl: EBOOK_DOWNLOADS[language].audiobookMp3,
                  },
                },
              });
              log("Ebook delivery email queued", { email: customerEmail });
            } catch (emailErr) {
              log("Error sending ebook delivery email", { error: emailErr instanceof Error ? emailErr.message : String(emailErr) });
            }
          }

          if (isUpsellPurchase) {
            // Mark upsell as purchased to stop the upsell sequence
            const { error: upsellErr } = await supabaseService
              .from("ebook_purchases")
              .update({ upsell_purchased_at: new Date().toISOString() })
              .ilike("email", customerEmail)
              .is("upsell_purchased_at", null);

            if (upsellErr) {
              log("Error marking upsell purchased", { error: upsellErr.message });
            } else {
              log("Upsell marked as purchased", { email: customerEmail, planId });
            }

            // For Challenge purchases: ensure user exists + send password-setup email
            const isChallenge = planId === "challenge-plus-trial" || planId === "challenge-plus-trial-en";
            if (isChallenge) {
              try {
                let challengeUser = user;
                if (!challengeUser) {
                  // Create account on the fly with random password
                  const tempPwd = crypto.randomUUID().replace(/-/g, "") + "A1!";
                  const { data: created, error: createErr } = await supabaseService.auth.admin.createUser({
                    email: customerEmail,
                    password: tempPwd,
                    email_confirm: true,
                    user_metadata: {
                      display_name: session.metadata?.guest_name || "",
                      source: "challenge_purchase",
                    },
                  });
                  if (createErr) {
                    log("Auto-create user error", { error: createErr.message });
                  } else if (created?.user) {
                    challengeUser = created.user;
                    // Link subscriber row to the new user
                    await supabaseService
                      .from("subscribers")
                      .update({ user_id: created.user.id })
                      .eq("email", customerEmail);
                  }
                }

                // Generate password recovery link
                const origin = req.headers.get("origin") || "https://ceomindos.com";
                const { data: linkData, error: linkErr } = await supabaseService.auth.admin.generateLink({
                  type: "recovery",
                  email: customerEmail,
                  options: { redirectTo: `${origin}/reset-password` },
                });
                if (linkErr) {
                  log("generateLink error", { error: linkErr.message });
                } else {
                  await supabaseService.functions.invoke("send-transactional-email", {
                    body: {
                      templateName: "challenge-welcome-set-password",
                      recipientEmail: customerEmail,
                      idempotencyKey: `challenge-welcome-${session.id}`,
                      templateData: {
                        name: session.metadata?.guest_name || undefined,
                        language,
                        setPasswordUrl: linkData?.properties?.action_link || `${origin}/auth`,
                      },
                    },
                  });
                  log("Challenge welcome email queued", { email: customerEmail });
                }
              } catch (challengeErr) {
                log("Challenge welcome flow error", { error: challengeErr instanceof Error ? challengeErr.message : String(challengeErr) });
              }
            }
          }
        } catch (funnelErr) {
          log("Burnout funnel hook error", { error: funnelErr instanceof Error ? funnelErr.message : String(funnelErr) });
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

        // Send subscription-upgraded email when subscription becomes active
        // (either created active, or trial converted to active).
        try {
          const previousStatus = (event.data as any)?.previous_attributes?.status;
          const justActivated = subscription.status === "active" && (
            event.type === "customer.subscription.created" ||
            previousStatus === "trialing" ||
            previousStatus === "incomplete"
          );
          if (justActivated) {
            const lang = ((subscription.metadata?.language === "en" || subscription.metadata?.language === "ro")
              ? subscription.metadata.language
              : (await supabaseService.rpc("get_user_language_by_email", { _email: customerEmail })).data) || "ro";
            const name = (user?.user_metadata as any)?.display_name
              || (user?.user_metadata as any)?.full_name
              || customerEmail.split("@")[0];
            await supabaseService.functions.invoke("send-transactional-email", {
              body: {
                templateName: "subscription-upgraded",
                recipientEmail: customerEmail,
                idempotencyKey: `sub-upgraded-${subscription.id}`,
                templateData: { name, language: lang, tier: subscriptionTier },
              },
            });
            log("Subscription-upgraded email queued", { email: customerEmail, tier: subscriptionTier });
          }
        } catch (e) {
          log("Subscription-upgraded email error", { error: e instanceof Error ? e.message : String(e) });
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

      case "invoice.paid": {
        // Handle recurring subscription payments
        const invoice = event.data.object as Stripe.Invoice;
        
        // Skip if this is the first invoice (already processed in checkout.session.completed)
        if (invoice.billing_reason === "subscription_create") {
          log("Skipping initial invoice - already processed", { invoiceId: invoice.id });
          break;
        }

        log("Invoice paid (recurring)", { 
          customer: invoice.customer,
          amount: invoice.amount_paid,
          billingReason: invoice.billing_reason
        });

        const customerId = invoice.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer.deleted || !("email" in customer) || !customer.email) {
          log("Customer not found or no email");
          break;
        }

        // CRITICAL: Get subscriber tier from database
        // Only ELITE tier gets lifetime recurring commissions
        // PRO gets 50% only on first payment (handled in checkout.session.completed)
        const { data: subscriber } = await supabaseService
          .from("subscribers")
          .select("subscription_tier")
          .eq("email", customer.email)
          .single();

        const userTier = subscriber?.subscription_tier || "basic";

        // Only process recurring commission for ELITE tier
        if (userTier !== "elite") {
          log("Skipping recurring commission - not elite tier", { 
            email: customer.email, 
            tier: userTier 
          });
          break;
        }

        log("Processing ELITE recurring commission (50% lifetime)", { 
          customer: invoice.customer,
          amount: invoice.amount_paid,
          tier: userTier
        });

        // Find user by email and process commission (only for ELITE)
        const { data: invoiceUserData } = await supabaseService.auth.admin.listUsers();
        const invoiceUser = invoiceUserData?.users?.find(u => u.email === customer.email);

        if (invoiceUser?.id && invoice.amount_paid) {
          const paymentAmountEur = invoice.amount_paid / 100;
          await processCoachCommission(invoiceUser.id, paymentAmountEur, invoice.currency || "eur", invoice.id);
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
