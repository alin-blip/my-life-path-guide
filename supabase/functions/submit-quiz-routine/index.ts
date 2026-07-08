import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WARRIOR_TYPES = ['reactor', 'disciplined', 'experimenter', 'warrior'] as const;
type WarriorType = typeof WARRIOR_TYPES[number];

// Mirror of src/data/warriorTypes.ts — kept in sync manually.
// If you change the quiz questions/scoring on the client, update here too.
const QUIZ_QUESTIONS: Array<{
  id: string;
  options: Array<{ scores: Partial<Record<WarriorType, number>> }>;
}> = [
  { id: 'q1_morning', options: [{ scores: { reactor: 3 } }, { scores: { disciplined: 3 } }, { scores: { experimenter: 3 } }, { scores: { warrior: 3 } }] },
  { id: 'q2_meditation', options: [{ scores: { reactor: 3 } }, { scores: { disciplined: 3 } }, { scores: { experimenter: 3 } }, { scores: { warrior: 3 } }] },
  { id: 'q3_workout', options: [{ scores: { reactor: 3 } }, { scores: { disciplined: 3 } }, { scores: { experimenter: 3 } }, { scores: { warrior: 3 } }] },
  { id: 'q4_reading', options: [{ scores: { reactor: 3 } }, { scores: { disciplined: 3 } }, { scores: { experimenter: 3 } }, { scores: { warrior: 3 } }] },
  { id: 'q5_priorities', options: [{ scores: { reactor: 3 } }, { scores: { disciplined: 3 } }, { scores: { experimenter: 3 } }, { scores: { warrior: 3 } }] },
  { id: 'q6_energy', options: [{ scores: { reactor: 3 } }, { scores: { disciplined: 2, warrior: 2 } }, { scores: { experimenter: 3 } }, { scores: { warrior: 3 } }] },
  { id: 'q7_stack', options: [{ scores: { reactor: 3 } }, { scores: { disciplined: 2 } }, { scores: { experimenter: 3 } }, { scores: { warrior: 3 } }] },
  { id: 'q8_vision', options: [{ scores: { reactor: 3 } }, { scores: { disciplined: 3 } }, { scores: { experimenter: 2 } }, { scores: { warrior: 3 } }] },
];

function computeWarriorType(answers: Array<{ questionId: string; optionIndex: number }>): {
  type: WarriorType;
  scores: Record<WarriorType, number>;
} {
  const scores: Record<WarriorType, number> = { reactor: 0, disciplined: 0, experimenter: 0, warrior: 0 };
  for (const a of answers) {
    const q = QUIZ_QUESTIONS.find((x) => x.id === a.questionId);
    if (!q) continue;
    const opt = q.options[a.optionIndex];
    if (!opt) continue;
    for (const [t, v] of Object.entries(opt.scores)) {
      scores[t as WarriorType] += v || 0;
    }
  }
  const order: WarriorType[] = ['warrior', 'disciplined', 'experimenter', 'reactor'];
  let winner: WarriorType = 'reactor';
  let max = -1;
  for (const t of order) {
    if (scores[t] > max) { max = scores[t]; winner = t; }
  }
  return { type: winner, scores };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const { answers, email, language = 'ro', source = 'quiz-rutina' } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid answers' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optional email validation
    if (email && typeof email === 'string') {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { type, scores } = computeWarriorType(answers);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Try to attach to authenticated user if a JWT was sent
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user) userId = userData.user.id;
    }

    const { data: inserted, error } = await supabase
      .from('quiz_routine_results')
      .insert({
        user_id: userId,
        email: email || null,
        warrior_type: type,
        scores,
        answers,
        source,
        language,
      })
      .select()
      .single();

    if (error) {
      console.error('[submit-quiz-routine] insert error', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      result_id: inserted.id,
      warrior_type: type,
      scores,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[submit-quiz-routine] error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
