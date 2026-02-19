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
    if (leadsError) throw leadsError;
    console.log(`Found ${emailLeads?.length || 0} email leads`);

    // 2. Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) console.error("Error fetching auth users:", authError);
    const userEmailMap = new Map(
      authUsers?.users?.map(u => [u.email?.toLowerCase(), { id: u.id, created_at: u.created_at }]) || []
    );
    console.log(`Found ${userEmailMap.size} auth users`);

    // 3. Get existing CRM contacts
    const { data: existingContacts } = await supabase
      .from("crm_contact_profiles")
      .select("email");
    const existingEmails = new Set(
      existingContacts?.map(c => c.email.toLowerCase()) || []
    );

    // 4. Get engagement data
    const { data: warriorPowerResults } = await supabase
      .from("warrior_power_results")
      .select("user_id, total_score, created_at");
    const warriorPowerMap = new Map(
      warriorPowerResults?.map(w => [w.user_id, w]) || []
    );

    const { data: challengeProgress } = await supabase
      .from("challenge_progress")
      .select("user_id, day_number, completed");
    const challengeMap = new Map<string, number>();
    challengeProgress?.forEach(cp => {
      if (cp.completed) {
        challengeMap.set(cp.user_id, (challengeMap.get(cp.user_id) || 0) + 1);
      }
    });

    const { data: stackSessions } = await supabase
      .from("stack_sessions")
      .select("user_id, id");
    const stackSessionsMap = new Map<string, number>();
    stackSessions?.forEach(ss => {
      stackSessionsMap.set(ss.user_id, (stackSessionsMap.get(ss.user_id) || 0) + 1);
    });

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
        purchaseMap.set(p.user_id, { count: 1, total: p.amount_paid || 0, first: p.purchased_at });
      }
    });

    // 5. Get Stripe subscribers
    const { data: subscribers } = await supabase
      .from("subscribers")
      .select("email, subscribed, subscription_tier, subscription_status, created_at, subscription_end");
    const subscriberMap = new Map(
      subscribers?.filter(s => s.subscribed).map(s => [
        s.email.toLowerCase(),
        {
          tier: s.subscription_tier,
          status: s.subscription_status,
          since: s.created_at,
          tierValue: s.subscription_tier === 'Elite' ? 29700 : (s.subscription_tier === 'Pro' ? 9900 : 0)
        }
      ]) || []
    );
    console.log(`Found ${subscriberMap.size} active subscribers`);

    // 6. Get daily tracking for streaks
    const { data: dailyTracking } = await supabase
      .from("daily_tracking")
      .select("user_id, date, door_tasks_completed")
      .order("date", { ascending: false });
    const streakMap = new Map<string, { streak: number; doorRate: number }>();
    const userTracking = new Map<string, typeof dailyTracking>();
    dailyTracking?.forEach(dt => {
      const existing = userTracking.get(dt.user_id) || [];
      existing.push(dt);
      userTracking.set(dt.user_id, existing);
    });
    userTracking.forEach((tracking, userId) => {
      if (!tracking || tracking.length === 0) {
        streakMap.set(userId, { streak: 0, doorRate: 0 });
        return;
      }
      let streak = 0;
      const sorted = [...tracking].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      for (const t of sorted) {
        if (t.door_tasks_completed && t.door_tasks_completed > 0) streak++;
        else break;
      }
      const doorRate = tracking.length > 0
        ? (tracking.filter(t => t.door_tasks_completed && t.door_tasks_completed > 0).length / tracking.length) * 100
        : 0;
      streakMap.set(userId, { streak, doorRate });
    });

    let syncedCount = 0;
    let updatedCount = 0;

    // Helper: determine funnel stage
    // Simplified: Lead (no account) → Engaged (has account) → Trial → Customer
    const determineFunnelStage = (
      hasAccount: boolean,
      subscription: { status: string } | undefined,
      hasPurchase: boolean
    ): string => {
      if (subscription) {
        if (subscription.status === 'trialing') return 'trial';
        return 'customer';
      }
      if (hasPurchase) return 'customer';
      if (hasAccount) return 'engaged'; // Account created = engaged
      return 'lead';
    };

    // Helper: build contact data
    const buildContactData = (
      email: string,
      userId: string | undefined,
      lead: any | null,
      subscription: any | undefined
    ) => {
      let leadScore = userId ? 25 : 10;
      const warrior = userId ? warriorPowerMap.get(userId) : undefined;
      const challengeDays = userId ? (challengeMap.get(userId) || 0) : 0;
      const stackCount = userId ? (stackSessionsMap.get(userId) || 0) : 0;
      const purchaseData = userId ? purchaseMap.get(userId) : undefined;
      const streakData = userId ? streakMap.get(userId) : undefined;

      if (warrior) leadScore += 20;
      leadScore += challengeDays * 10;
      leadScore += stackCount * 5;
      if (streakData && streakData.streak >= 7) leadScore += 25;
      if (purchaseData) leadScore += 100;
      if (subscription) leadScore += subscription.status === 'trialing' ? 75 : 100;
      leadScore = Math.min(leadScore, 100);

      const funnelStage = determineFunnelStage(!!userId, subscription, !!purchaseData);

      const authUser = userId ? userEmailMap.get(email.toLowerCase()) : undefined;

      return {
        email,
        user_id: userId || null,
        name: lead?.name || null,
        phone: lead?.phone || null,
        gender: lead?.gender || null,
        funnel_stage: funnelStage,
        lead_source: lead?.lead_magnet || lead?.source || (userId ? 'direct_signup' : 'unknown'),
        lead_score: leadScore,
        lead_captured_at: lead?.created_at || null,
        account_created_at: authUser?.created_at || null,
        first_purchase_at: purchaseData?.first || (subscription ? subscription.since : null),
        lifetime_value: (subscription?.tierValue || 0) + (purchaseData?.total || 0),
        total_purchases: (purchaseData?.count || 0) + (subscription ? 1 : 0),
        total_stack_sessions: stackCount,
        warrior_power_score: warrior?.total_score || null,
        current_streak: streakData?.streak || 0,
        door_completion_rate: streakData?.doorRate || 0,
        subscription_tier: subscription?.tier || null,
        subscription_status: subscription?.status || null,
        updated_at: new Date().toISOString()
      };
    };

    // Process email leads
    const processedEmails = new Set<string>();
    for (const lead of emailLeads || []) {
      const emailLower = lead.email.toLowerCase();
      processedEmails.add(emailLower);
      const authUser = userEmailMap.get(emailLower);
      const subscription = subscriberMap.get(emailLower);
      const contactData = buildContactData(lead.email, authUser?.id, lead, subscription);

      if (existingEmails.has(emailLower)) {
        const { error } = await supabase.from("crm_contact_profiles").update(contactData).eq("email", lead.email);
        if (!error) updatedCount++;
      } else {
        const { error } = await supabase.from("crm_contact_profiles").insert(contactData);
        if (!error) syncedCount++;
      }
    }

    // Process auth users not in leads
    for (const user of authUsers?.users || []) {
      if (!user.email) continue;
      const emailLower = user.email.toLowerCase();
      if (processedEmails.has(emailLower)) continue;
      processedEmails.add(emailLower);

      const subscription = subscriberMap.get(emailLower);
      const contactData = buildContactData(user.email, user.id, null, subscription);

      if (existingEmails.has(emailLower)) {
        const { error } = await supabase.from("crm_contact_profiles").update(contactData).eq("email", user.email);
        if (!error) updatedCount++;
      } else {
        const { error } = await supabase.from("crm_contact_profiles").insert(contactData);
        if (!error) syncedCount++;
      }
    }

    // Process subscribers not yet in CRM
    for (const [email, subscription] of subscriberMap) {
      if (processedEmails.has(email)) continue;
      const contactData = buildContactData(email, undefined, null, subscription);
      if (existingEmails.has(email)) {
        const { error } = await supabase.from("crm_contact_profiles").update(contactData).eq("email", email);
        if (!error) updatedCount++;
      } else {
        const { error } = await supabase.from("crm_contact_profiles").insert(contactData);
        if (!error) syncedCount++;
      }
    }

    console.log(`Sync complete: ${syncedCount} new, ${updatedCount} updated`);

    return new Response(
      JSON.stringify({ success: true, synced: syncedCount, updated: updatedCount, subscribers: subscriberMap.size }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in sync-crm-contacts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
