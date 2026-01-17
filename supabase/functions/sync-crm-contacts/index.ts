import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting CRM contact sync...");

    // 1. Get all email leads
    const { data: emailLeads, error: leadsError } = await supabase
      .from("email_leads")
      .select("*");

    if (leadsError) {
      console.error("Error fetching email_leads:", leadsError);
      throw leadsError;
    }

    console.log(`Found ${emailLeads?.length || 0} email leads`);

    // 2. Get all auth users with their emails
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error fetching auth users:", authError);
    }

    const userEmailMap = new Map(
      authUsers?.users?.map(u => [u.email?.toLowerCase(), u.id]) || []
    );

    console.log(`Found ${userEmailMap.size} auth users`);

    // 3. Get existing CRM contacts
    const { data: existingContacts, error: contactsError } = await supabase
      .from("crm_contact_profiles")
      .select("email");

    if (contactsError) {
      console.error("Error fetching existing contacts:", contactsError);
    }

    const existingEmails = new Set(
      existingContacts?.map(c => c.email.toLowerCase()) || []
    );

    // 4. Get warrior power results for lead scoring
    const { data: warriorPowerResults } = await supabase
      .from("warrior_power_results")
      .select("user_id, total_score, created_at");

    const warriorPowerMap = new Map(
      warriorPowerResults?.map(w => [w.user_id, w]) || []
    );

    // 5. Get challenge progress for engagement
    const { data: challengeProgress } = await supabase
      .from("challenge_progress")
      .select("user_id, day_number, completed");

    const challengeMap = new Map<string, number>();
    challengeProgress?.forEach(cp => {
      if (cp.completed) {
        const current = challengeMap.get(cp.user_id) || 0;
        challengeMap.set(cp.user_id, current + 1);
      }
    });

    // 6. Get stack sessions count
    const { data: stackSessions } = await supabase
      .from("stack_sessions")
      .select("user_id, id");

    const stackSessionsMap = new Map<string, number>();
    stackSessions?.forEach(ss => {
      const current = stackSessionsMap.get(ss.user_id) || 0;
      stackSessionsMap.set(ss.user_id, current + 1);
    });

    // 7. Get purchases for customer identification
    const { data: purchases } = await supabase
      .from("course_purchases")
      .select("user_id, amount_paid, purchased_at");

    const purchaseMap = new Map<string, { count: number; total: number; first: string }>();
    purchases?.forEach(p => {
      const existing = purchaseMap.get(p.user_id);
      if (existing) {
        existing.count++;
        existing.total += p.amount_paid || 0;
      } else {
        purchaseMap.set(p.user_id, {
          count: 1,
          total: p.amount_paid || 0,
          first: p.purchased_at
        });
      }
    });

    // 8. Get Stripe subscribers for customer identification
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email, subscribed, subscription_tier, created_at, subscription_end");

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
    }

    const subscriberMap = new Map(
      subscribers?.filter(s => s.subscribed).map(s => [
        s.email.toLowerCase(), 
        { 
          tier: s.subscription_tier, 
          since: s.created_at,
          tierValue: s.subscription_tier === 'Elite' ? 1990 : (s.subscription_tier === 'Pro' ? 990 : 0)
        }
      ]) || []
    );

    console.log(`Found ${subscriberMap.size} active subscribers`);

    // 9. Get daily tracking for streak/engagement
    const { data: dailyTracking } = await supabase
      .from("daily_tracking")
      .select("user_id, date, door_tasks_completed")
      .order("date", { ascending: false });

    const streakMap = new Map<string, { streak: number; doorRate: number }>();
    
    // Group by user
    const userTracking = new Map<string, typeof dailyTracking>();
    dailyTracking?.forEach(dt => {
      const existing = userTracking.get(dt.user_id) || [];
      existing.push(dt);
      userTracking.set(dt.user_id, existing);
    });

    // Calculate streaks
    userTracking.forEach((tracking, userId) => {
      if (!tracking || tracking.length === 0) {
        streakMap.set(userId, { streak: 0, doorRate: 0 });
        return;
      }
      
      let streak = 0;
      let totalDoorTasks = 0;
      const sortedTracking = [...tracking].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Simple streak calculation
      for (const t of sortedTracking) {
        if (t.door_tasks_completed && t.door_tasks_completed > 0) {
          streak++;
          totalDoorTasks += t.door_tasks_completed;
        } else {
          break;
        }
      }
      
      const doorRate = tracking.length > 0 
        ? (tracking.filter(t => t.door_tasks_completed && t.door_tasks_completed > 0).length / tracking.length) * 100
        : 0;
      
      streakMap.set(userId, { streak, doorRate });
    });

    let syncedCount = 0;
    let updatedCount = 0;

    // 10. Process each email lead
    for (const lead of emailLeads || []) {
      const emailLower = lead.email.toLowerCase();
      const userId = userEmailMap.get(emailLower);
      const subscription = subscriberMap.get(emailLower);
      
      // Calculate lead score
      let leadScore = 10; // Base score for being a lead
      let funnelStage = 'lead';
      
      // Check if subscriber (Stripe payment)
      if (subscription) {
        leadScore += 100;
        funnelStage = 'customer';
      }
      
      if (userId) {
        const warrior = warriorPowerMap.get(userId);
        const challengeDays = challengeMap.get(userId) || 0;
        const stackCount = stackSessionsMap.get(userId) || 0;
        const purchaseData = purchaseMap.get(userId);
        const streakData = streakMap.get(userId);
        
        // Add points for various activities
        if (warrior) leadScore += 20;
        leadScore += challengeDays * 10;
        leadScore += stackCount * 5;
        if (streakData && streakData.streak >= 7) leadScore += 25;
        if (purchaseData) leadScore += 100;
        
        // Determine funnel stage (subscription takes priority)
        if (subscription || purchaseData) {
          funnelStage = 'customer';
        } else if (challengeDays > 0 || stackCount > 0 || (streakData && streakData.streak > 0)) {
          funnelStage = 'engaged';
        }
        
        // Cap at 100
        leadScore = Math.min(leadScore, 100);
        
        // Calculate total lifetime value (subscription + purchases)
        const subscriptionValue = subscription?.tierValue || 0;
        const purchaseValue = purchaseData?.total || 0;
        const totalLifetimeValue = subscriptionValue + purchaseValue;
        
        const contactData = {
          email: lead.email,
          user_id: userId,
          name: lead.name,
          phone: lead.phone,
          gender: lead.gender,
          funnel_stage: funnelStage,
          lead_source: lead.lead_magnet || lead.source,
          lead_score: leadScore,
          lead_captured_at: lead.created_at,
          account_created_at: userId ? new Date().toISOString() : null,
          first_purchase_at: purchaseData?.first || (subscription ? subscription.since : null),
          lifetime_value: totalLifetimeValue,
          total_purchases: (purchaseData?.count || 0) + (subscription ? 1 : 0),
          total_stack_sessions: stackCount,
          warrior_power_score: warrior?.total_score || null,
          current_streak: streakData?.streak || 0,
          door_completion_rate: streakData?.doorRate || 0,
          subscription_tier: subscription?.tier || null,
          subscription_status: subscription ? 'active' : null,
          updated_at: new Date().toISOString()
        };
        
        if (existingEmails.has(emailLower)) {
          // Update existing contact
          const { error: updateError } = await supabase
            .from("crm_contact_profiles")
            .update(contactData)
            .eq("email", lead.email);
          
          if (updateError) {
            console.error(`Error updating contact ${lead.email}:`, updateError);
          } else {
            updatedCount++;
          }
        } else {
          // Insert new contact
          const { error: insertError } = await supabase
            .from("crm_contact_profiles")
            .insert(contactData);
          
          if (insertError) {
            console.error(`Error inserting contact ${lead.email}:`, insertError);
          } else {
            syncedCount++;
          }
        }
      } else {
        // Lead without account - check if they have a subscription
        const contactData = {
          email: lead.email,
          name: lead.name,
          phone: lead.phone,
          gender: lead.gender,
          funnel_stage: subscription ? 'customer' : 'lead',
          lead_source: lead.lead_magnet || lead.source,
          lead_score: subscription ? 100 : 10,
          lead_captured_at: lead.created_at,
          lifetime_value: subscription?.tierValue || 0,
          total_purchases: subscription ? 1 : 0,
          subscription_tier: subscription?.tier || null,
          subscription_status: subscription ? 'active' : null,
          updated_at: new Date().toISOString()
        };
        
        if (existingEmails.has(emailLower)) {
          // Update existing contact
          const { error: updateError } = await supabase
            .from("crm_contact_profiles")
            .update(contactData)
            .eq("email", lead.email);
          
          if (updateError) {
            console.error(`Error updating lead ${lead.email}:`, updateError);
          } else {
            updatedCount++;
          }
        } else {
          const { error: insertError } = await supabase
            .from("crm_contact_profiles")
            .insert(contactData);
          
          if (insertError) {
            console.error(`Error inserting lead ${lead.email}:`, insertError);
          } else {
            syncedCount++;
          }
        }
      }
    }

    // 11. Also sync users who might not be in email_leads
    for (const user of authUsers?.users || []) {
      if (!user.email) continue;
      
      const emailLower = user.email.toLowerCase();
      
      // Check if this email was already processed from leads
      const alreadyProcessed = emailLeads?.some(l => l.email.toLowerCase() === emailLower);
      if (alreadyProcessed) continue;
      
      const userId = user.id;
      const subscription = subscriberMap.get(emailLower);
      const warrior = warriorPowerMap.get(userId);
      const challengeDays = challengeMap.get(userId) || 0;
      const stackCount = stackSessionsMap.get(userId) || 0;
      const purchaseData = purchaseMap.get(userId);
      const streakData = streakMap.get(userId);
      
      let leadScore = 25; // Has account
      let funnelStage = 'engaged';
      
      // Check if subscriber
      if (subscription) {
        leadScore += 100;
        funnelStage = 'customer';
      }
      
      if (warrior) leadScore += 20;
      leadScore += challengeDays * 10;
      leadScore += stackCount * 5;
      if (streakData && streakData.streak >= 7) leadScore += 25;
      if (purchaseData) {
        leadScore += 100;
        funnelStage = 'customer';
      }
      
      leadScore = Math.min(leadScore, 100);
      
      // Calculate total lifetime value
      const subscriptionValue = subscription?.tierValue || 0;
      const purchaseValue = purchaseData?.total || 0;
      const totalLifetimeValue = subscriptionValue + purchaseValue;
      
      const contactData = {
        email: user.email,
        user_id: userId,
        funnel_stage: funnelStage,
        lead_source: 'direct_signup',
        lead_score: leadScore,
        account_created_at: user.created_at,
        first_purchase_at: purchaseData?.first || (subscription ? subscription.since : null),
        lifetime_value: totalLifetimeValue,
        total_purchases: (purchaseData?.count || 0) + (subscription ? 1 : 0),
        total_stack_sessions: stackCount,
        warrior_power_score: warrior?.total_score || null,
        current_streak: streakData?.streak || 0,
        door_completion_rate: streakData?.doorRate || 0,
        subscription_tier: subscription?.tier || null,
        subscription_status: subscription ? 'active' : null,
        updated_at: new Date().toISOString()
      };
      
      if (existingEmails.has(emailLower)) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from("crm_contact_profiles")
          .update(contactData)
          .eq("email", user.email);
        
        if (updateError) {
          console.error(`Error updating user ${user.email}:`, updateError);
        } else {
          updatedCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from("crm_contact_profiles")
          .insert(contactData);
        
        if (insertError) {
          console.error(`Error inserting user ${user.email}:`, insertError);
        } else {
          syncedCount++;
        }
      }
    }

    // 12. Sync any subscribers not yet in CRM (edge case)
    for (const [email, subscription] of subscriberMap) {
      if (existingEmails.has(email)) continue;
      
      // Check if already processed
      const alreadyProcessed = emailLeads?.some(l => l.email.toLowerCase() === email) ||
        authUsers?.users?.some(u => u.email?.toLowerCase() === email);
      if (alreadyProcessed) continue;
      
      const contactData = {
        email: email,
        funnel_stage: 'customer',
        lead_source: 'stripe_subscription',
        lead_score: 100,
        lifetime_value: subscription.tierValue,
        total_purchases: 1,
        first_purchase_at: subscription.since,
        subscription_tier: subscription.tier,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from("crm_contact_profiles")
        .insert(contactData);
      
      if (insertError) {
        console.error(`Error inserting subscriber ${email}:`, insertError);
      } else {
        syncedCount++;
      }
    }

    console.log(`Sync complete: ${syncedCount} new contacts, ${updatedCount} updated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncedCount, 
        updated: updatedCount,
        total: (emailLeads?.length || 0) + (authUsers?.users?.length || 0),
        subscribers: subscriberMap.size
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in sync-crm-contacts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
