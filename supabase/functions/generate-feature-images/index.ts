import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin, corsHeaders, unauthorized } from "../_shared/auth.ts";

// Feature prompts optimized for AI image generation
const featurePrompts: Record<string, string> = {
  challenge: "A golden trophy on a podium with 7 glowing stepping stones leading to it, representing a 7-day transformation challenge. Warm golden lighting, achievement atmosphere, motivational, high quality digital art",
  aiCoaches: "Four holographic AI coach avatars floating in a futuristic purple-neon interface, each representing different coaching expertise (performance, relationships, therapy, accountability). Sleek technology aesthetic, digital art",
  visionBoard: "A beautiful vision board collage with 4 distinct life areas (body fitness, spiritual being, balanced relationships, business success) arranged harmoniously. Inspiring, dreamy, aspirational mood, digital illustration",
  warriorRoutine: "A warrior silhouette at sunrise doing morning routine - meditation pose transitioning to workout stance. Golden hour lighting, discipline and power atmosphere, cinematic digital art",
  theDoor: "A strategic war room with a large planning board showing priorities and battle maps. Professional, focused, strategic planning atmosphere. Dark room with spotlight on the board, digital art",
  accelerator: "A rocket launching from a business growth chart trajectory, with 100K milestone marker. Success, ambition, entrepreneurial spirit. Dynamic composition, digital illustration",
  stacks: "Abstract visualization of emotional energy transformation - dark clouds morphing into bright light streams. Spiritual, transformative, cathartic mood. Artistic digital illustration",
  brotherhood: "A band of warriors standing together in unity, fist bump in the center. Brotherhood, loyalty, community spirit. Epic cinematic lighting, digital art",
  monthlyMission: "A monthly calendar heatmap glowing with green progress checkmarks, showing consistent daily victories. Gamification, achievement, tracking progress. Clean modern design, digital illustration"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { isAdmin } = await requireAdmin(req);
  if (!isAdmin) return unauthorized("Admin access required", 403);

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { featureId, customPrompt } = await req.json();

    if (!featureId) {
      return new Response(
        JSON.stringify({ error: "featureId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use custom prompt or default feature prompt
    const prompt = customPrompt || featurePrompts[featureId];
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: `Unknown featureId: ${featureId}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating image for feature: ${featureId}`);
    console.log(`Prompt: ${prompt}`);

    // Call Lovable AI Gateway for image generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Generate a high-quality promotional image for a feature called "${featureId}". Style: Professional, modern, inspiring. Aspect ratio: 16:9 landscape. ${prompt}`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    console.log(`Image generated successfully for: ${featureId}`);

    return new Response(
      JSON.stringify({
        success: true,
        featureId,
        imageUrl,
        textContent,
        prompt
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating feature image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
