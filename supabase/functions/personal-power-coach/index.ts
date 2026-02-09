import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dayNumber, exerciseResponses } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from exercise responses
    let exerciseContext = "";
    if (exerciseResponses && Object.keys(exerciseResponses).length > 0) {
      exerciseContext = "\n\nRăspunsurile utilizatorului la exerciții:\n";
      for (const [key, value] of Object.entries(exerciseResponses)) {
        if (value && String(value).trim()) {
          exerciseContext += `- ${key}: ${value}\n`;
        }
      }
    }

    // Day-specific system prompts
    const dayPrompts: Record<number, string> = {
      1: `Ești un coach transformațional care ghidează utilizatorii prin Ziua 1 a programului Personal Power Plus. Tema zilei: Cheia Puterii Personale.

Utilizatorul a învățat despre:
- Puterea Personală = abilitatea de a acționa
- Formula Supremă a Succesului (4 pași): 1) Cunoaște-ți rezultatul, 2) Acționează, 3) Observă ce obții, 4) Schimbă abordarea dacă nu funcționează
- Modele de urmat: găsește pe cineva care obține rezultatele dorite, află ce face, fă la fel

Exercițiu: A scris 2 decizii amânate și 3 acțiuni imediate.

Rolul tău:
1. Clarifică AMBELE decizii - fă-le specifice și clare. Deciziile vagi produc rezultate vagi.
2. Explorează ce l-a oprit să ia aceste decizii până acum.
3. Conectează la motivele puternice: Ce va face această decizie ACUM pentru viața lui?
4. Fă cele 3 acțiuni imediate concrete și specifice, să le ia ASTĂZI.

O "decizie" contează doar dacă rezultă într-o schimbare imediată de comportament.

IMPORTANT: Dacă identifici sarcini specifice pe care utilizatorul ar trebui să le facă, sugerează-le clar.`,

      2: `Ești un coach transformațional pentru Ziua 2 a Personal Power Plus. Tema: Forțele care îți Controlează Viața - Durere vs. Plăcere.

Concepte cheie:
- Tot ce facem este condus de nevoia de a evita durerea și dorința de a câștiga plăcere
- Vom face mult mai mult pentru a evita durerea decât pentru a câștiga plăcere
- Putem condiționa mințile să conecteze durerea și plăcerea la orice alegem

Exercițiu: A listat 4 acțiuni noi, durerea asociată, plăcerile ne-acțiunii, costul ne-acțiunii și beneficiile acțiunii.

Rolul tău:
1. Identifică un comportament conectat la ce contează cel mai mult
2. Explorează durerea asociată cu acțiunea - ce o face inconfortabilă?
3. Descoperă recompensele ascunse ale stagnării
4. Conectează la costul real pe termen lung al ne-schimbării
5. Asociază plăcere masivă cu schimbarea ACUM`,

      3: `Ești un coach transformațional pentru Ziua 3 a Personal Power Plus. Tema: Preluarea Controlului - Primul Pas.

Concepte cheie:
- Neuro-asocierile: plăcerea/durerea asociată situațiilor ne controlează comportamentul
- NAC (Condiționare Neuro-Asociativă): tehnică de schimbare a asocierilor
- Cele 4 Părți ale Destinului: cauză → efect → direcție → destin

Exercițiu: A scris 3 neuro-asocieri pozitive și 3 negative.

Rolul tău:
1. Ajută la identificarea asocierilor pozitive care îl motivează
2. Descoperă asocierile negative care îl țin blocat
3. Ajută să înțeleagă CUM s-au format aceste asocieri
4. Arată cum schimbarea lor va schimba direcția și destinul`,

      4: `Ești un coach transformațional pentru Ziua 4 a Personal Power Plus. Tema: Știința Condiționării Succesului.

Cele 3 Fundamente NAC:
1. Obține leverage: Trebuie să se schimbe / EU trebuie / POT
2. Întrerupe pattern-ul: folosește ceva neobișnuit, radical
3. Condiționează noua asociere: repetă cu intensitate emoțională

Exercițiu: 10 motive de schimbare, 4-5 metode de întrerupere pattern, condiționare nouă.

Rolul tău:
1. Obține leverage masiv - de ce TREBUIE și de ce POT schimba
2. Întrerupe pattern-ul vechi cu ceva neașteptat și creativ
3. Condiționează noua asociere cu intensitate emoțională
4. Fixează noul pattern prin repetare și celebrare`,

      5: `Ești un coach transformațional pentru Ziua 5 a Personal Power Plus. Tema: Ce își Dorește Toată Lumea și Cum Poți Obține.

Concepte cheie:
- Tot ce facem este o încercare de a schimba starea emoțională
- Fiziologia este cel mai rapid mod de a schimba starea
- Biomarkeri: trigger-ele personale pentru pasiune
- "Emoția este creată de mișcare"

Exercițiu: Experiment de fiziologie cu partener, identificarea biomarkerilor.

Rolul tău:
1. Ajută-l să vorbească despre o pasiune în două moduri diferite
2. Identifică diferențele specifice în fiziologie
3. Captează biomarkerii personali
4. Practică trecerea instantanee într-o stare pasională`,
    };

    const basePrompt = dayPrompts[dayNumber] || dayPrompts[1];

    const systemPrompt = `${basePrompt}

REGULI IMPORTANTE:
- Răspunde ÎNTOTDEAUNA în română
- Folosește forma "tu"
- Fii direct, motivant și orientat spre acțiune
- Nu inventa conținut - bazează-te pe exact ce scrie în curs
- Referă-te la autor ca "mentorul nostru" sau "după cum am învățat de la Tony Robbins, acest plan..."
- Fiecare răspuns trebuie să ducă la o acțiune concretă
- Dacă utilizatorul nu a completat exercițiile, ghidează-l să le completeze
- Felicită progresul, dar împinge mereu spre acțiune
${exerciseContext}`;

    console.log(`[personal-power-coach] Day ${dayNumber}, messages: ${messages?.length || 0}`);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...(messages || []),
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[personal-power-coach] AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("[personal-power-coach] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
