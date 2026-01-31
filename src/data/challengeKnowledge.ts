// Challenge Knowledge Base - Complete 7-Day Challenge curriculum

export interface ChallengeDayScript {
  day: number;
  titleEn: string;
  titleRo: string;
  scriptEn: string;
  scriptRo: string;
  focusAreas: ('body' | 'being' | 'balance' | 'business')[];
  exercisesEn: string[];
  exercisesRo: string[];
  keyInsightsEn: string[];
  keyInsightsRo: string[];
  actionPathsEn: { label: string; path: string }[];
  actionPathsRo: { label: string; path: string }[];
}

export const CHALLENGE_SCRIPTS: ChallengeDayScript[] = [
  {
    day: 1,
    titleEn: "VISION & DECLARATION",
    titleRo: "VIZIUNE ȘI DECLARAȚIE",
    scriptEn: `Welcome to Day One of your transformation journey.

I want to start by celebrating your decision to show up—because that's where all breakthroughs begin.

Today, we're going to ignite the vision for your life by connecting deeply to the reasons why you want change.

Think about where you want to be one year from today. What does your ideal life look like? The kind of health, peace of mind, relationships, and success you want.

This isn't wishful thinking — this is clarity on what drives you.

One of the most powerful tools for making this real is a personal declaration, like Napoleon Hill taught us. This is a statement—your statement—that you commit to read every morning and night.

It's a promise to yourself that fuels your motivation and rewires your mind for success.

So today, I want you to write your own declaration. Speak it out loud—feel every word.

Insert your declaration below, and when you're ready, click the "Share in the comment section" button.

Sharing it creates accountability and inspires others in this community.

Remember: what you say to yourself becomes your destiny.

This is your moment to own your future.

Let's start this journey with power, passion, and unstoppable commitment.`,
    scriptRo: `Bine ai venit în Prima Zi a călătoriei tale de transformare.

Vreau să încep prin a celebra decizia ta de a fi aici—pentru că de aici pornesc toate schimbările.

Astăzi, vom aprinde viziunea pentru viața ta conectându-ne profund la motivele pentru care vrei schimbare.

Gândește-te unde vrei să fii peste un an. Cum arată viața ta ideală? Ce fel de sănătate, pace mentală, relații și succes vrei.

Nu e vorba de visare—e vorba de claritate asupra a ceea ce te motivează.

Unul dintre cele mai puternice instrumente pentru a face asta real este o declarație personală, așa cum ne-a învățat Napoleon Hill. Este o afirmație—afirmația ta—pe care te angajezi să o citești în fiecare dimineață și seară.

Este o promisiune către tine însuți care îți alimentează motivația și îți reprogramează mintea pentru succes.

Așadar, astăzi vreau să îți scrii propria declarație. Spune-o cu voce tare—simte fiecare cuvânt.

Introdu declarația ta mai jos și când ești pregătit, apasă butonul "Distribuie în secțiunea de comentarii".

Distribuirea creează responsabilitate și inspiră pe alții din această comunitate.

Adu-ți aminte: ceea ce îți spui ție însuți devine destinul tău.

Acesta este momentul tău să îți preiei viitorul.

Să începem această călătorie cu putere, pasiune și angajament de neoprit.`,
    focusAreas: ['being', 'balance'],
    exercisesEn: [
      "Discover Your WHY - Answer 5 fundamental questions about your desires and purpose",
      "Vision 2026 (All 4 Areas) - Define your vision for Body, Spirit, Relationships, and Business",
      "Write Your Declaration - Create your Napoleon Hill style declaration in present tense",
      "Join Community - Enter the Warrior tribe and introduce yourself",
      "Invite 1-3 Friends - Share your exclusive invite link"
    ],
    exercisesRo: [
      "Descoperă DE CE-ul Tău - Răspunde la 5 întrebări fundamentale despre dorințele și scopul tău",
      "Viziune 2026 (Toate 4 Ariile) - Definește viziunea pentru Corp, Spirit, Relații și Business",
      "Scrie Declarația - Creează declarația ta în stilul Napoleon Hill la prezent",
      "Alătură-te Comunității - Intră în tribul Warrior și prezintă-te",
      "Invită 1-3 Prieteni - Trimite link-ul tău exclusiv"
    ],
    keyInsightsEn: [
      "What you say to yourself becomes your destiny",
      "A personal declaration read morning and evening rewires your mind for success",
      "Sharing creates accountability and inspires others"
    ],
    keyInsightsRo: [
      "Ceea ce îți spui ție însuți devine destinul tău",
      "O declarație personală citită dimineața și seara îți reprogramează mintea pentru succes",
      "Distribuirea creează responsabilitate și inspiră pe alții"
    ],
    actionPathsEn: [
      { label: "Open Day 1 Exercises", path: "/challenge/1" },
      { label: "Join Community", path: "/brotherhood?tab=tribes" }
    ],
    actionPathsRo: [
      { label: "Deschide Exercițiile Zilei 1", path: "/challenge/1" },
      { label: "Intră în Comunitate", path: "/brotherhood?tab=tribes" }
    ]
  },
  {
    day: 2,
    titleEn: "BODY + SPIRIT + RELATIONSHIPS",
    titleRo: "CORP + SPIRIT + RELAȚII",
    scriptEn: `Welcome to Day Two of your transformation journey.

Today, we're focusing on the foundation that powers everything in your life—your body and your spirit.

Too many entrepreneurs pour all their energy into business and neglect these essentials, and that imbalance steals both results and joy.

Your body is the vehicle that carries you through every challenge and opportunity. Without caring for it, your mind can't perform at its best.

Your spirit—your inner peace and focus—is the source of your resilience in times of stress and uncertainty.

Today, you'll set clear goals for 2026, the next 90 days, the next 30 days, and daily routines that keep you strong, centered, and unstoppable.

Take a moment now to share in the comment section your declaration and your key commitments for your body and spirit.

Your words don't just empower you—they impact and inspire others in this community.

Remember, this foundation fuels everything—from your business success to the quality of your relationships.

Building it is not optional. It's essential.`,
    scriptRo: `Bine ai venit în Ziua a Doua a călătoriei tale de transformare.

Astăzi ne concentrăm pe fundația care alimentează totul în viața ta—corpul și spiritul tău.

Prea mulți antreprenori își toarnă toată energia în business și neglijează aceste esențiale, iar acest dezechilibru fură atât rezultatele cât și bucuria.

Corpul tău este vehiculul care te poartă prin fiecare provocare și oportunitate. Fără să ai grijă de el, mintea ta nu poate performa la cel mai înalt nivel.

Spiritul tău—pacea interioară și focusul—este sursa rezilienței tale în momente de stres și incertitudine.

Astăzi vei seta obiective clare pentru 2026, următoarele 90 de zile, următoarele 30 de zile și rutine zilnice care te țin puternic, centrat și de neoprit.

Ia un moment acum să distribui în secțiunea de comentarii declarația ta și angajamentele cheie pentru corp și spirit.

Cuvintele tale nu doar te împuternicesc—ele impactează și inspiră pe alții din această comunitate.

Adu-ți aminte, această fundație alimentează totul—de la succesul în business la calitatea relațiilor tale.

A o construi nu e opțional. E esențial.`,
    focusAreas: ['body', 'being', 'balance'],
    exercisesEn: [
      "Body Objectives: 2026 → 90 Days → 30 Days - Set health and fitness goals on all 3 levels",
      "Spirit Objectives: 2026 → 90 Days → 30 Days - Set spiritual and purpose goals",
      "Relationship Objectives: 2026 → 90 Days → 30 Days - Set relationship goals",
      "Share in Comments - Post your 2-3 key objectives"
    ],
    exercisesRo: [
      "Obiective Corp: 2026 → 90 Zile → 30 Zile - Setează obiective de sănătate și fitness",
      "Obiective Spirit: 2026 → 90 Zile → 30 Zile - Setează obiective spirituale",
      "Obiective Relații: 2026 → 90 Zile → 30 Zile - Setează obiective de relații",
      "Postează în Comentarii - Scrie 2-3 obiective cheie"
    ],
    keyInsightsEn: [
      "Body is the vehicle that carries you through challenges",
      "Spirit is the source of resilience in stress",
      "This foundation fuels everything - business and relationships"
    ],
    keyInsightsRo: [
      "Corpul e vehiculul care te poartă prin provocări",
      "Spiritul e sursa rezilienței în stres",
      "Această fundație alimentează totul - business și relații"
    ],
    actionPathsEn: [
      { label: "Set Body Goals", path: "/game-objectives?category=body" },
      { label: "Set Spirit Goals", path: "/game-objectives?category=being" },
      { label: "Set Relationship Goals", path: "/game-objectives?category=balance" }
    ],
    actionPathsRo: [
      { label: "Setează Obiective Corp", path: "/game-objectives?category=body" },
      { label: "Setează Obiective Spirit", path: "/game-objectives?category=being" },
      { label: "Setează Obiective Relații", path: "/game-objectives?category=balance" }
    ]
  },
  {
    day: 3,
    titleEn: "BUSINESS + DOMINO DOOR",
    titleRo: "BUSINESS + DOMINO DOOR",
    scriptEn: `Welcome to Day Three of your transformation journey.

Today, we're diving into two of the most powerful areas that shape your life—your business and your relationships.

True success isn't just about numbers or achievements; it's about connection, contribution, and alignment.

Your business and your relationships are deeply intertwined.

When your relationships are strong, you show up with more power, clarity, and focus in business.

And when your business is aligned and stable, it brings peace and presence into your relationships.

Today, you'll set clear goals and milestones for 2026, the next 90 days, the next 30 days, and your weekly actions in both business and relationships.

The Domino Door concept helps you identify the vital tasks that, when done consistently, trigger a cascade of progress across all areas.

Our AI wizard will guide you step-by-step to craft your most important weekly milestone and the four key tasks that will move everything forward.

It will also ask why each task matters, connecting your actions to your deeper purpose.

This is not a one-time exercise. It's a weekly ritual you'll do every Sunday—planning your week—and the next Sunday you'll review and recalibrate.

Share your key business and relationship goals in the comment section below.

Public commitment creates ownership—and ownership creates results.

This is how you build a life where every area fuels the others.`,
    scriptRo: `Bine ai venit în Ziua a Treia a călătoriei tale de transformare.

Astăzi ne scufundăm în două dintre cele mai puternice arii care îți modelează viața—business-ul și relațiile tale.

Succesul adevărat nu e doar despre cifre sau realizări; e despre conexiune, contribuție și aliniere.

Business-ul și relațiile tale sunt profund interconectate.

Când relațiile tale sunt puternice, te prezinți cu mai multă putere, claritate și focus în business.

Și când business-ul tău e aliniat și stabil, aduce pace și prezență în relațiile tale.

Astăzi vei seta obiective clare și milestone-uri pentru 2026, următoarele 90 de zile, următoarele 30 de zile și acțiunile săptămânale atât în business cât și în relații.

Conceptul Domino Door te ajută să identifici task-urile vitale care, făcute consistent, declanșează o cascadă de progres în toate ariile.

Wizard-ul nostru AI te va ghida pas cu pas să creezi cel mai important milestone săptămânal și cele patru task-uri cheie care vor mișca totul înainte.

Va întreba și de ce contează fiecare task, conectându-ți acțiunile la scopul tău mai profund.

Nu e un exercițiu de o singură dată. E un ritual săptămânal pe care îl vei face în fiecare duminică—planificându-ți săptămâna—și duminica următoare vei revizui și recalibra.

Distribuie obiectivele tale cheie de business și relații în secțiunea de comentarii de mai jos.

Angajamentul public creează ownership—și ownership-ul creează rezultate.

Așa construiești o viață în care fiecare arie o alimentează pe cealaltă.`,
    focusAreas: ['business'],
    exercisesEn: [
      "Complete Business Flow (ONE GO) - AI Wizard: Annual → 90 Days → Monthly → Weekly Door with 4 keys",
      "Configure Domino Door: 1 milestone + 4 keys + WHY for each",
      "Share Your Domino Door in comments"
    ],
    exercisesRo: [
      "Flow Business Complet (ONE GO) - AI Wizard: Anual → 90 Zile → Lunar → Door Săptămânal cu 4 chei",
      "Configurează Domino Door: 1 milestone + 4 chei + WHY pentru fiecare",
      "Distribuie Domino Door-ul în comentarii"
    ],
    keyInsightsEn: [
      "Domino Door identifies vital tasks that trigger cascade of progress",
      "Weekly ritual: plan Sunday, review next Sunday",
      "Public commitment creates ownership, ownership creates results"
    ],
    keyInsightsRo: [
      "Domino Door identifică task-urile vitale care declanșează cascada de progres",
      "Ritual săptămânal: planifică duminică, revizuiește duminica următoare",
      "Angajamentul public creează ownership, ownership-ul creează rezultate"
    ],
    actionPathsEn: [
      { label: "Start AI Wizard", path: "/game-objectives?category=business&wizard=full" },
      { label: "Open Command Center", path: "/door" }
    ],
    actionPathsRo: [
      { label: "Începe AI Wizard", path: "/game-objectives?category=business&wizard=full" },
      { label: "Deschide Centrul de Comandă", path: "/door" }
    ]
  },
  {
    day: 4,
    titleEn: "WARRIOR ROUTINE + VISION AI + MEDITATION",
    titleRo: "WARRIOR ROUTINE + VISION AI + MEDITAȚIE",
    scriptEn: `Welcome to Day Five—the moment where your vision moves from idea to unstoppable momentum.

You've created a personalized vision for each core area—body, being, balance, and business—that you'll now see daily as a reminder of who you are and who you're becoming.

Today, everything comes together inside your Warrior Routine.

Imagine starting each day with one click—one simple decision—to activate your personalized routine.

This isn't a checklist.

It's your daily declaration of identity.

I want you to share in the comments one daily action from your Warrior Routine that, when done consistently, will move you closest to your vision.

No more overwhelm.

No more guessing.

From this day forward, you create momentum through execution.`,
    scriptRo: `Bine ai venit în Ziua a Cincea—momentul în care viziunea ta trece de la idee la momentum de neoprit.

Ai creat o viziune personalizată pentru fiecare arie principală—corp, spirit, echilibru și business—pe care o vei vedea zilnic ca reminder despre cine ești și cine devii.

Astăzi, totul se unește în Warrior Routine.

Imaginează-ți că începi fiecare zi cu un click—o simplă decizie—pentru a-ți activa rutina personalizată.

Nu e o listă de bifat.

E declarația ta zilnică de identitate.

Vreau să distribui în comentarii o acțiune zilnică din Warrior Routine care, făcută consistent, te va mișca cel mai aproape de viziunea ta.

Fără supraîncărcare.

Fără ghicit.

De azi înainte, creezi momentum prin execuție.`,
    focusAreas: ['body', 'being', 'balance', 'business'],
    exercisesEn: [
      "Vision AI (4 Quadrants) - Generate AI images for Body, Spirit, Relationships, Business",
      "Configure Warrior Routine - Set up personalized daily routine with habits",
      "Personalized Meditation - Create meditation based on YOUR objectives",
      "Start Execution - Begin first daily routine execution",
      "Share Your AHA Moment in comments"
    ],
    exercisesRo: [
      "Vision AI (4 Cadrane) - Generează imagini AI pentru Corp, Spirit, Relații, Business",
      "Configurează Warrior Routine - Setează rutina zilnică personalizată cu obiceiuri",
      "Meditație Personalizată - Creează meditație bazată pe obiectivele TALE",
      "Începe Execuția - Începe prima execuție a rutinei zilnice",
      "Distribuie Momentul AHA în comentarii"
    ],
    keyInsightsEn: [
      "One click to activate personalized routine",
      "It's your daily declaration of identity",
      "Create momentum through execution, not planning"
    ],
    keyInsightsRo: [
      "Un click pentru a activa rutina personalizată",
      "E declarația ta zilnică de identitate",
      "Creezi momentum prin execuție, nu prin planificare"
    ],
    actionPathsEn: [
      { label: "Open Vision Board", path: "/vision-board" },
      { label: "Configure Routine", path: "/daily-flow" }
    ],
    actionPathsRo: [
      { label: "Deschide Vision Board", path: "/vision-board" },
      { label: "Configurează Rutina", path: "/daily-flow" }
    ]
  },
  {
    day: 5,
    titleEn: "ACCOUNTABILITY COACH + MIND COACH",
    titleRo: "ACCOUNTABILITY COACH + MIND COACH",
    scriptEn: `Welcome to Day Six—the day where accountability and mindset come together.

Your Accountability Coach knows your journey.

If you haven't started your Warrior Routine or created your Domino Door, it will guide you back on track.

But execution alone isn't enough—because sometimes you feel stuck, angry, anxious, or doubtful.

That's where the Mind Coach Stacks come in.

These stacks help you unpack what you're feeling, understand the story behind it, take ownership of how you got here, and consciously choose a new story that puts you back into power.

Today, I want you to share your biggest breakthrough from using the Mind Coach or Accountability Coach.

What shifted for you?

Ownership is what turns plans into results.`,
    scriptRo: `Bine ai venit în Ziua a Șasea—ziua în care accountability și mindset-ul se unesc.

Accountability Coach-ul tău îți cunoaște călătoria.

Dacă nu ai început Warrior Routine sau nu ai creat Domino Door-ul, te va ghida înapoi pe traseu.

Dar execuția singură nu e suficientă—pentru că uneori te simți blocat, supărat, anxios sau îndoielnic.

Aici intervin Stack-urile Mind Coach.

Aceste stack-uri te ajută să despachetezi ce simți, să înțelegi povestea din spate, să îți asumi responsabilitatea pentru cum ai ajuns aici și să alegi conștient o nouă poveste care te readuce în putere.

Astăzi, vreau să distribui cel mai mare breakthrough de la folosirea Mind Coach sau Accountability Coach.

Ce s-a schimbat pentru tine?

Ownership-ul e ceea ce transformă planurile în rezultate.`,
    focusAreas: ['body', 'being', 'balance', 'business'],
    exercisesEn: [
      "Accountability Coach - Check status: what's done, what's missing, what's next",
      "Mind Coach Session - Transform fear, anger, anxiety, procrastination into power",
      "Share Your Breakthrough - Post what story you left behind / what changed"
    ],
    exercisesRo: [
      "Accountability Coach - Verifică statusul: ce e făcut, ce lipsește, ce urmează",
      "Sesiune Mind Coach - Transformă frica, furia, anxietatea, procrastinarea în putere",
      "Distribuie Breakthrough-ul - Postează ce poveste ai lăsat în urmă / ce s-a schimbat"
    ],
    keyInsightsEn: [
      "Accountability Coach knows your journey and guides you back on track",
      "Mind Coach transforms stuck/angry/anxious into power",
      "Ownership turns plans into results"
    ],
    keyInsightsRo: [
      "Accountability Coach îți cunoaște călătoria și te ghidează înapoi pe traseu",
      "Mind Coach transformă blocarea/furia/anxietatea în putere",
      "Ownership-ul transformă planurile în rezultate"
    ],
    actionPathsEn: [
      { label: "Open Accountability Coach", path: "/accountability-coach" },
      { label: "Start Mind Coach", path: "/mind-coach" }
    ],
    actionPathsRo: [
      { label: "Deschide Accountability Coach", path: "/accountability-coach" },
      { label: "Începe Mind Coach", path: "/mind-coach" }
    ]
  },
  {
    day: 6,
    titleEn: "IDEA LIST (STRATEGIC FILTER)",
    titleRo: "IDEA LIST (FILTRU STRATEGIC)",
    scriptEn: `Welcome to Day Six—Impulse Control and Strategic Filtering.

This section is NOT for execution. It's for getting ideas out of your head without destroying the focus set on Day 3.

Too often, we get distracted by shiny new ideas that seem urgent but aren't actually important.

Today you'll learn to classify ideas using the Eisenhower Matrix:
- Important + Urgent: Do it now
- Important + Not Urgent: Schedule it
- Not Important + Urgent: Delegate it
- Not Important + Not Urgent: Delete it

The Idea List (Parking Lot) is your strategic container. When a new idea pops up:
1. Capture it immediately
2. Classify it with Eisenhower
3. Move on without breaking your focus

This prevents shiny object syndrome and protects your Domino Door priorities.

Share in comments: What idea have you been chasing that should actually go in the "Delete" category?`,
    scriptRo: `Bine ai venit în Ziua a Șasea—Controlul Impulsului și Filtrarea Strategică.

Această secțiune NU e pentru execuție. E pentru a scoate ideile din cap fără să distrugi focusul setat în Ziua 3.

De prea multe ori, suntem distrași de idei noi strălucitoare care par urgente dar nu sunt de fapt importante.

Astăzi vei învăța să clasifici ideile folosind Matricea Eisenhower:
- Important + Urgent: Fă-l acum
- Important + Nu Urgent: Programează-l
- Nu Important + Urgent: Deleagă-l
- Nu Important + Nu Urgent: Șterge-l

Lista de Idei (Parking Lot) e containerul tău strategic. Când apare o idee nouă:
1. Captureaz-o imediat
2. Clasific-o cu Eisenhower
3. Continuă fără să îți rupi focusul

Asta previne sindromul obiectului strălucitor și protejează prioritățile Domino Door.

Distribuie în comentarii: Ce idee ai urmărit care ar trebui de fapt să meargă în categoria "Șterge"?`,
    focusAreas: ['business'],
    exercisesEn: [
      "Open Idea List / Parking Lot - Add ideas without disrupting focus",
      "Classify with Eisenhower Matrix - Sort each idea into the 4 categories",
      "Protect Domino Door - Don't let new ideas derail your weekly priorities"
    ],
    exercisesRo: [
      "Deschide Lista de Idei / Parking Lot - Adaugă idei fără să distrugi focusul",
      "Clasifică cu Matricea Eisenhower - Sortează fiecare idee în cele 4 categorii",
      "Protejează Domino Door - Nu lăsa ideile noi să te deraieze de la prioritățile săptămânale"
    ],
    keyInsightsEn: [
      "Idea List is for capture, not execution",
      "Eisenhower Matrix: Important+Urgent, Important+NotUrgent, NotImportant+Urgent, Delete",
      "Shiny object syndrome kills focus"
    ],
    keyInsightsRo: [
      "Lista de Idei e pentru capturare, nu execuție",
      "Matricea Eisenhower: Important+Urgent, Important+NeUrgent, NeImportant+Urgent, Șterge",
      "Sindromul obiectului strălucitor ucide focusul"
    ],
    actionPathsEn: [
      { label: "Open Idea List", path: "/ideas" },
      { label: "View Command Center", path: "/door" }
    ],
    actionPathsRo: [
      { label: "Deschide Lista de Idei", path: "/ideas" },
      { label: "Vezi Centrul de Comandă", path: "/door" }
    ]
  },
  {
    day: 7,
    titleEn: "MEMBERSHIP & CONTINUITY",
    titleRo: "MEMBERSHIP ȘI CONTINUITATE",
    scriptEn: `Welcome to Day Seven—the day where everything you've built becomes your new standard.

You've created your vision.

You've built your routines.

You've learned how to unblock your mind and stay accountable.

Now it's time to choose how deeply you want to commit to this new way of living.

The Basic membership gives you access to your vision and foundational tools.

The Pro membership unlocks full AI personalization and gives you the ability to earn through sharing this platform.

And the Elite membership is for leaders and coaches—where you work with me, Alin Florin Radu, in weekly coaching, get access to the Warrior Launch Accelerator, and build your own mission and community inside the platform.

This is not about software.

This is about choosing who you become next.

Choose your path—and let's rise together.`,
    scriptRo: `Bine ai venit în Ziua a Șaptea—ziua în care tot ce ai construit devine noul tău standard.

Ți-ai creat viziunea.

Ți-ai construit rutinele.

Ai învățat cum să îți deblochezi mintea și să rămâi responsabil.

Acum e timpul să alegi cât de profund vrei să te angajezi la acest nou mod de viață.

Membership-ul Basic îți oferă acces la viziune și instrumente fundamentale.

Membership-ul Pro deblochează personalizarea completă AI și îți oferă abilitatea de a câștiga prin distribuirea acestei platforme.

Iar membership-ul Elite e pentru lideri și coach-i—unde lucrezi cu mine, Alin Florin Radu, în coaching săptămânal, ai acces la Warrior Launch Accelerator și îți construiești propria misiune și comunitate în platformă.

Nu e vorba despre software.

E vorba despre a alege cine devii în continuare.

Alege-ți calea—și să ne ridicăm împreună.`,
    focusAreas: ['body', 'being', 'balance', 'business'],
    exercisesEn: [
      "Review Your 7-Day Journey - Celebrate what you've accomplished",
      "Choose Your Membership Path - Basic, Pro, or Elite",
      "Final Friend Invite - Share with 3 more people who need transformation"
    ],
    exercisesRo: [
      "Revizuiește Călătoria de 7 Zile - Celebrează ce ai realizat",
      "Alege Calea Membership-ului - Basic, Pro sau Elite",
      "Invitație Finală Prieteni - Distribuie cu încă 3 persoane care au nevoie de transformare"
    ],
    keyInsightsEn: [
      "Everything you've built becomes your new standard",
      "Choose who you become next",
      "Elite: weekly coaching with Alin + Warrior Launch Accelerator"
    ],
    keyInsightsRo: [
      "Tot ce ai construit devine noul tău standard",
      "Alege cine devii în continuare",
      "Elite: coaching săptămânal cu Alin + Warrior Launch Accelerator"
    ],
    actionPathsEn: [
      { label: "View Pricing", path: "/pricing" },
      { label: "Share Invite Link", path: "/challenge/1#invite" }
    ],
    actionPathsRo: [
      { label: "Vezi Prețuri", path: "/pricing" },
      { label: "Distribuie Link Invitație", path: "/challenge/1#invite" }
    ]
  }
];

// Helper to get challenge day by number
export const getChallengeDayScript = (dayNumber: number): ChallengeDayScript | undefined => {
  return CHALLENGE_SCRIPTS.find(s => s.day === dayNumber);
};

// Get all scripts as knowledge base for AI
export const getChallengeKnowledgeBase = (language: 'en' | 'ro'): string => {
  return CHALLENGE_SCRIPTS.map(day => {
    const title = language === 'en' ? day.titleEn : day.titleRo;
    const script = language === 'en' ? day.scriptEn : day.scriptRo;
    const exercises = language === 'en' ? day.exercisesEn : day.exercisesRo;
    const insights = language === 'en' ? day.keyInsightsEn : day.keyInsightsRo;
    
    return `
=== DAY ${day.day}: ${title} ===
Focus Areas: ${day.focusAreas.join(', ')}

SCRIPT:
${script}

EXERCISES:
${exercises.map((e, i) => `${i + 1}. ${e}`).join('\n')}

KEY INSIGHTS:
${insights.map(i => `• ${i}`).join('\n')}
`;
  }).join('\n\n');
};
