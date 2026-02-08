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
    scriptEn: `Welcome to Day One — the day you stop drifting and start building momentum.

If you're here, it's because something isn't working. Maybe you're exhausted but can't stop. Maybe you keep planning but never executing. That cycle ends today.

Today, we're going to cut through the fog by connecting deeply to your WHY — the reason change is no longer optional.

Think about where you want to be one year from today. What does clarity, energy, and real momentum look like for you?

This isn't wishful thinking — this is your anti-burnout blueprint.

One of the most powerful tools for breaking the cycle is a personal declaration, like Napoleon Hill taught us. This is a statement — your statement — that you commit to read every morning and night.

It rewires your mind from "I'm stuck" to "I'm building momentum."

So today, write your own declaration. Speak it out loud — feel every word.

Insert your declaration below, and when you're ready, click the "Share in the comment section" button.

Sharing it creates accountability and kills procrastination.

Remember: the burnout cycle breaks when you take the first step with intention.

This is your moment to reclaim your energy and direction.

Let's build momentum — starting now.`,
    scriptRo: `Bine ai venit în Prima Zi — ziua în care oprești deriva și începi să construiești momentum.

Dacă ești aici, e pentru că ceva nu funcționează. Poate ești epuizat dar nu te poți opri. Poate tot planifici dar nu execuți niciodată. Ciclul ăsta se termină azi.

Astăzi vom tăia prin ceață conectându-ne profund la DE CE-ul tău — motivul pentru care schimbarea nu mai e opțională.

Gândește-te unde vrei să fii peste un an. Cum arată claritatea, energia și momentum-ul real pentru tine?

Nu e vorba de visare — e planul tău anti-burnout.

Unul dintre cele mai puternice instrumente pentru a sparge ciclul este o declarație personală, așa cum ne-a învățat Napoleon Hill. Este o afirmație — afirmația ta — pe care te angajezi să o citești în fiecare dimineață și seară.

Îți reprogramează mintea de la "sunt blocat" la "construiesc momentum."

Așadar, astăzi scrie-ți propria declarație. Spune-o cu voce tare — simte fiecare cuvânt.

Introdu declarația ta mai jos și când ești pregătit, apasă butonul "Distribuie în secțiunea de comentarii".

Distribuirea creează responsabilitate și ucide procrastinarea.

Adu-ți aminte: ciclul burnout-ului se sparge când faci primul pas cu intenție.

Acesta este momentul tău să îți recapeți energia și direcția.

Să construim momentum — începând acum.`,
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
      "The burnout cycle breaks when you take the first step with intention",
      "A personal declaration rewires your mind from 'stuck' to 'building momentum'",
      "Sharing creates accountability and kills procrastination"
    ],
    keyInsightsRo: [
      "Ciclul burnout-ului se sparge când faci primul pas cu intenție",
      "O declarație personală îți reprogramează mintea de la 'blocat' la 'construiesc momentum'",
      "Distribuirea creează responsabilitate și ucide procrastinarea"
    ],
    actionPathsEn: [
      { label: "Open Day 1 Exercises", path: "/challenge/1" },
      { label: "Join Community", path: "/programs?tab=groups" }
    ],
    actionPathsRo: [
      { label: "Deschide Exercițiile Zilei 1", path: "/challenge/1" },
      { label: "Intră în Comunitate", path: "/programs?tab=groups" }
    ]
  },
  {
    day: 2,
    titleEn: "BODY + SPIRIT + RELATIONSHIPS",
    titleRo: "CORP + SPIRIT + RELAȚII",
    scriptEn: `Welcome to Day Two — rebuilding the foundation that burnout destroyed.

Today, we're focusing on the three pillars that collapse first when you're burned out — your body, your spirit, and your relationships.

Too many entrepreneurs pour all energy into business and neglect these essentials. That imbalance is exactly what creates the burnout-procrastination cycle.

Your body is the vehicle that carries you through every challenge. Without caring for it, your mind can't perform — and exhaustion wins.

Your spirit — your inner peace and focus — is the source of resilience. Without it, every setback feels like a wall.

Your relationships are your support system. When they suffer, isolation deepens the burnout.

Today, you'll set clear recovery goals for 2026, the next 90 days, the next 30 days, and daily routines that rebuild your energy, peace, and connections.

Take a moment now to share in the comment section your key commitments for body, spirit, and relationships.

Your words don't just empower you — they show others that recovery is possible.

Remember, this foundation is what prevents burnout from returning.

Rebuilding it is not optional. It's the cure.`,
    scriptRo: `Bine ai venit în Ziua a Doua — reconstruim fundația pe care burnout-ul a distrus-o.

Astăzi ne concentrăm pe cei trei piloni care se prăbușesc primii când ești în burnout — corpul, spiritul și relațiile tale.

Prea mulți antreprenori își toarnă toată energia în business și neglijează aceste esențiale. Exact acest dezechilibru creează ciclul burnout-procrastinare.

Corpul tău este vehiculul care te poartă prin fiecare provocare. Fără să ai grijă de el, mintea nu poate performa — și epuizarea câștigă.

Spiritul tău — pacea interioară și focusul — este sursa rezilienței. Fără el, fiecare obstacol pare un zid.

Relațiile tale sunt sistemul tău de suport. Când suferă, izolarea adâncește burnout-ul.

Astăzi vei seta obiective clare de recuperare pentru 2026, următoarele 90 de zile, următoarele 30 de zile și rutine zilnice care îți reconstruiesc energia, pacea și conexiunile.

Ia un moment acum să distribui în secțiunea de comentarii angajamentele cheie pentru corp, spirit și relații.

Cuvintele tale nu doar te împuternicesc — arată altora că recuperarea e posibilă.

Adu-ți aminte, această fundație e cea care previne revenirea burnout-ului.

A o reconstrui nu e opțional. E leacul.`,
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
      "Burnout collapses body, spirit, and relationships first",
      "Rebuilding this foundation prevents burnout from returning",
      "Recovery goals across all 3 pillars break the exhaustion cycle"
    ],
    keyInsightsRo: [
      "Burnout-ul prăbușește corpul, spiritul și relațiile primele",
      "Reconstruirea acestei fundații previne revenirea burnout-ului",
      "Obiectivele de recuperare în toți 3 piloni sparg ciclul epuizării"
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
    scriptEn: `Welcome to Day Three — the day you go from planning to executing.

Today, we're building the engine that turns clarity into momentum — your business system and the Domino Door.

If burnout taught you anything, it's that working harder without a system leads nowhere. Today we fix that.

Your business and your relationships are deeply intertwined. When your relationships are strong, you show up with more power and focus. When your business is aligned, it brings peace into everything else.

Today, you'll set clear goals and milestones for 2026, the next 90 days, the next 30 days, and your weekly actions in business.

The Domino Door concept helps you identify the vital tasks that, when done consistently, trigger a cascade of progress — without burning out.

Our AI wizard will guide you step-by-step to craft your most important weekly milestone and the four key tasks that will move everything forward.

It will also ask why each task matters, connecting your actions to your deeper purpose.

This is not a one-time exercise. It's a weekly ritual — plan Sunday, review next Sunday, recalibrate.

Share your key business goals in the comment section below.

Public commitment creates ownership — and ownership creates momentum.

This is how you build sustainable results without the burnout.`,
    scriptRo: `Bine ai venit în Ziua a Treia — ziua în care treci de la planificare la execuție.

Astăzi construim motorul care transformă claritatea în momentum — sistemul tău de business și Domino Door.

Dacă burnout-ul te-a învățat ceva, e că munca mai dură fără un sistem nu duce nicăieri. Azi reparăm asta.

Business-ul și relațiile tale sunt profund interconectate. Când relațiile sunt puternice, te prezinți cu mai multă putere și focus. Când business-ul e aliniat, aduce pace în tot restul.

Astăzi vei seta obiective clare și milestone-uri pentru 2026, următoarele 90 de zile, următoarele 30 de zile și acțiunile săptămânale în business.

Conceptul Domino Door te ajută să identifici task-urile vitale care, făcute consistent, declanșează o cascadă de progres — fără să te epuizezi.

Wizard-ul nostru AI te va ghida pas cu pas să creezi cel mai important milestone săptămânal și cele patru task-uri cheie care vor mișca totul înainte.

Va întreba și de ce contează fiecare task, conectându-ți acțiunile la scopul tău mai profund.

Nu e un exercițiu de o singură dată. E un ritual săptămânal — planifică duminică, revizuiește duminica următoare, recalibrează.

Distribuie obiectivele tale cheie de business în secțiunea de comentarii de mai jos.

Angajamentul public creează ownership — și ownership-ul creează momentum.

Așa construiești rezultate sustenabile fără burnout.`,
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
      "Working harder without a system leads to burnout, not results",
      "Domino Door triggers a cascade of progress without exhaustion",
      "Public commitment creates ownership, ownership creates momentum"
    ],
    keyInsightsRo: [
      "Munca mai dură fără un sistem duce la burnout, nu la rezultate",
      "Domino Door declanșează o cascadă de progres fără epuizare",
      "Angajamentul public creează ownership, ownership-ul creează momentum"
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
    scriptEn: `Welcome to Day Four — the moment where your vision moves from idea to unstoppable momentum.

You've created a personalized vision for each core area — body, being, balance, and business — that you'll now see daily as a reminder of who you are and who you're becoming.

Today, everything comes together inside your Warrior Routine.

Imagine starting each day with one click — one simple decision — to activate your personalized anti-burnout routine.

This isn't a checklist. It's your daily momentum engine.

I want you to share in the comments one daily action from your Warrior Routine that, when done consistently, will move you closest to your vision.

No more overwhelm. No more guessing. No more burnout spirals.

From this day forward, you create momentum through execution — not exhaustion.`,
    scriptRo: `Bine ai venit în Ziua a Patra — momentul în care viziunea ta trece de la idee la momentum de neoprit.

Ai creat o viziune personalizată pentru fiecare arie principală — corp, spirit, echilibru și business — pe care o vei vedea zilnic ca reminder despre cine ești și cine devii.

Astăzi, totul se unește în Warrior Routine.

Imaginează-ți că începi fiecare zi cu un click — o simplă decizie — pentru a-ți activa rutina personalizată anti-burnout.

Nu e o listă de bifat. E motorul tău zilnic de momentum.

Vreau să distribui în comentarii o acțiune zilnică din Warrior Routine care, făcută consistent, te va mișca cel mai aproape de viziunea ta.

Fără supraîncărcare. Fără ghicit. Fără spirale de burnout.

De azi înainte, creezi momentum prin execuție — nu prin epuizare.`,
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
      "Your Warrior Routine is your daily anti-burnout engine",
      "One click replaces overwhelm with structured momentum",
      "Create momentum through execution, not exhaustion"
    ],
    keyInsightsRo: [
      "Warrior Routine e motorul tău zilnic anti-burnout",
      "Un click înlocuiește supraîncărcarea cu momentum structurat",
      "Creezi momentum prin execuție, nu prin epuizare"
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
    scriptEn: `Welcome to Day Five — the day where accountability and mindset come together to break the procrastination loop.

Your Accountability Coach knows your journey. If you haven't started your Warrior Routine or created your Domino Door, it will guide you back on track.

But execution alone isn't enough — because burnout isn't just physical. Sometimes you feel stuck, angry, anxious, or doubtful. That's the mental side of the cycle.

That's where the Mind Coach Stacks come in.

These stacks help you unpack what you're feeling, understand the story behind it, take ownership of how you got here, and consciously choose a new story that puts you back into momentum.

Today, I want you to share your biggest breakthrough from using the Mind Coach or Accountability Coach.

What shifted for you? What procrastination pattern did you break?

Ownership is what turns burnout into momentum.`,
    scriptRo: `Bine ai venit în Ziua a Cincea — ziua în care accountability și mindset-ul se unesc pentru a sparge bucla procrastinării.

Accountability Coach-ul tău îți cunoaște călătoria. Dacă nu ai început Warrior Routine sau nu ai creat Domino Door-ul, te va ghida înapoi pe traseu.

Dar execuția singură nu e suficientă — pentru că burnout-ul nu e doar fizic. Uneori te simți blocat, supărat, anxios sau îndoielnic. Asta e latura mentală a ciclului.

Aici intervin Stack-urile Mind Coach.

Aceste stack-uri te ajută să despachetezi ce simți, să înțelegi povestea din spate, să îți asumi responsabilitatea pentru cum ai ajuns aici și să alegi conștient o nouă poveste care te readuce în momentum.

Astăzi, vreau să distribui cel mai mare breakthrough de la folosirea Mind Coach sau Accountability Coach.

Ce s-a schimbat pentru tine? Ce tipar de procrastinare ai spart?

Ownership-ul e ceea ce transformă burnout-ul în momentum.`,
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
      "Accountability Coach keeps you on track when procrastination creeps in",
      "Mind Coach transforms burnout emotions into momentum",
      "Ownership is what turns burnout into momentum"
    ],
    keyInsightsRo: [
      "Accountability Coach te ține pe traseu când procrastinarea apare",
      "Mind Coach transformă emoțiile de burnout în momentum",
      "Ownership-ul e ceea ce transformă burnout-ul în momentum"
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
    scriptEn: `Welcome to Day Six — Impulse Control and Strategic Filtering.

This section is NOT for execution. It's for getting ideas out of your head without destroying the momentum you built on Day 3.

Too often, burnout survivors swing from paralysis to hyperactivity — chasing every new idea feels like progress, but it's just another form of the cycle.

Today you'll learn to classify ideas using the Eisenhower Matrix:
- Important + Urgent: Do it now
- Important + Not Urgent: Schedule it
- Not Important + Urgent: Delegate it
- Not Important + Not Urgent: Delete it

The Idea List (Parking Lot) is your strategic container. When a new idea pops up:
1. Capture it immediately
2. Classify it with Eisenhower
3. Move on without breaking your momentum

This prevents shiny object syndrome — one of the biggest threats to your recovery from burnout.

Share in comments: What idea have you been chasing that should actually go in the "Delete" category?`,
    scriptRo: `Bine ai venit în Ziua a Șasea — Controlul Impulsului și Filtrarea Strategică.

Această secțiune NU e pentru execuție. E pentru a scoate ideile din cap fără să distrugi momentum-ul construit în Ziua 3.

De prea multe ori, supraviețuitorii burnout-ului oscilează de la paralizie la hiperactivitate — a urmări fiecare idee nouă pare progres, dar e doar o altă formă a ciclului.

Astăzi vei învăța să clasifici ideile folosind Matricea Eisenhower:
- Important + Urgent: Fă-l acum
- Important + Nu Urgent: Programează-l
- Nu Important + Urgent: Deleagă-l
- Nu Important + Nu Urgent: Șterge-l

Lista de Idei (Parking Lot) e containerul tău strategic. Când apare o idee nouă:
1. Captureaz-o imediat
2. Clasific-o cu Eisenhower
3. Continuă fără să îți rupi momentum-ul

Asta previne sindromul obiectului strălucitor — una din cele mai mari amenințări la recuperarea din burnout.

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
      "Idea List captures impulses without destroying momentum",
      "Eisenhower Matrix prevents shiny object syndrome",
      "Chasing every idea is a hidden form of the burnout cycle"
    ],
    keyInsightsRo: [
      "Lista de Idei capturează impulsuri fără să distrugă momentum-ul",
      "Matricea Eisenhower previne sindromul obiectului strălucitor",
      "A urmări fiecare idee e o formă ascunsă a ciclului de burnout"
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
    scriptEn: `Welcome to Day Seven — the day where the momentum you've built becomes permanent.

You've broken the burnout cycle.

You've rebuilt your foundation — body, spirit, relationships.

You've created a business execution system that doesn't require burning out.

You've learned to transform procrastination and anxiety into action.

Now it's time to choose: do you go back to the old cycle, or do you lock in this new way of living?

The Basic membership gives you access to your vision and foundational tools.

The Pro membership unlocks full AI personalization — your Accountability Coach, Mind Coach, and the ability to earn through sharing this platform.

And the Elite membership is for leaders and coaches — where you work with me, Alin Florin Radu, in weekly coaching, get access to the Warrior Launch Accelerator, and build your own mission and community.

This is not about software.

This is about choosing momentum over burnout. Permanently.

Choose your path — and let's build something unstoppable together.`,
    scriptRo: `Bine ai venit în Ziua a Șaptea — ziua în care momentum-ul pe care l-ai construit devine permanent.

Ai spart ciclul burnout-ului.

Ți-ai reconstruit fundația — corp, spirit, relații.

Ai creat un sistem de execuție de business care nu necesită epuizare.

Ai învățat să transformi procrastinarea și anxietatea în acțiune.

Acum e timpul să alegi: te întorci la ciclul vechi, sau blochezi acest nou mod de viață?

Membership-ul Basic îți oferă acces la viziune și instrumente fundamentale.

Membership-ul Pro deblochează personalizarea completă AI — Accountability Coach, Mind Coach și abilitatea de a câștiga prin distribuirea platformei.

Iar membership-ul Elite e pentru lideri și coach-i — unde lucrezi cu mine, Alin Florin Radu, în coaching săptămânal, ai acces la Warrior Launch Accelerator și îți construiești propria misiune și comunitate.

Nu e vorba despre software.

E vorba despre a alege momentum-ul în loc de burnout. Permanent.

Alege-ți calea — și hai să construim ceva de neoprit împreună.`,
    focusAreas: ['body', 'being', 'balance', 'business'],
    exercisesEn: [
      "Review Your Anti-Burnout Journey - Celebrate the momentum you've built",
      "Choose Your Membership Path - Basic, Pro, or Elite",
      "Final Friend Invite - Share with 3 more people who need to escape burnout"
    ],
    exercisesRo: [
      "Revizuiește Călătoria Anti-Burnout - Celebrează momentum-ul construit",
      "Alege Calea Membership-ului - Basic, Pro sau Elite",
      "Invitație Finală Prieteni - Distribuie cu încă 3 persoane care trebuie să iasă din burnout"
    ],
    keyInsightsEn: [
      "The momentum you've built becomes permanent with the right system",
      "Choose momentum over burnout — permanently",
      "Elite: weekly coaching with Alin + Warrior Launch Accelerator"
    ],
    keyInsightsRo: [
      "Momentum-ul construit devine permanent cu sistemul potrivit",
      "Alege momentum-ul în loc de burnout — permanent",
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
