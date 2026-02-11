import { PersonalPowerDay } from './personalPowerContent';

export const personalPowerDays6to10: PersonalPowerDay[] = [
  {
    day: 6,
    title: 'Întărește-ți Fundația',
    titleEn: 'Strengthen Your Foundation',
    quote: '"Identitatea ta este modelată de ceea ce faci în mod repetat. Nu primești ceea ce vrei — primești ceea ce practici."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: `## Ziua 6 — Întărește-ți Fundația (Zi de Integrare)

### Recapitulare: Primele 5 Zile

Aceasta este o zi de integrare — un moment de oprire, recapitulare și consolidare a tot ceea ce ai învățat și practicat în primele cinci zile. Nu subestima puterea acestui pas. Cele mai puternice schimbări vin din **repetarea** și **întărirea** obiceiurilor noi.

Să recapitulăm ce ai învățat:

1. **Ziua 1 — Cheia Puterii Personale**: Puterea personală = abilitatea de a acționa. Formula Supremă a Succesului. Ai luat două decizii importante.
2. **Ziua 2 — Forțele Care Îți Controlează Viața**: Durerea și plăcerea ca forțe motrice. Ai identificat cum te-au ținut blocat.
3. **Ziua 3 — Preluarea Controlului**: Neuro-asocierile și cele Patru Părți ale Destinului. Ai descoperit ce asocieri te limitează.
4. **Ziua 4 — Știința Condiționării Succesului**: Cei 5 pași NAC pentru schimbarea comportamentului. Ai aplicat procesul pe un comportament specific.
5. **Ziua 5 — Totul se Schimbă într-o Clipă**: Fiziologia ca instrument de schimbare a stărilor. Ai descoperit biomarkerii tăi.

### Practica Trigger-elor de Stare

Trigger-ele de stare sunt gesturi, posturi sau mișcări pe care le-ai ancorat la o stare emoțională puternică. Astăzi, practică aceste trigger-e de cel puțin **două ori**:

- **Dimineața**: Folosește fiziologia pentru a crea o stare de energie și determinare. Stai drept, respiră adânc, zâmbește, mișcă-te cu putere.
- **După-amiaza**: Când simți că energia scade, activează-ți trigger-ul de stare. Schimbă-ți postura, ritmul respirației, expresia facială.

### Observă-ți Stările

Pe parcursul zilei de astăzi, observă cum stările tale se schimbă în funcție de context. Fii atent la pattern-urile tale:

- **Când mă trezesc**, starea mea este ___
- **Când lucrez**, starea mea este ___
- **Când interacționez cu alții**, starea mea este ___
- **Când sunt singur**, starea mea este ___

> **Scopul de astăzi nu este să adaugi ceva nou, ci să cimentezi ceea ce ai construit. Fundația solidă este cea care susține tot ce urmează.**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Revizuiește Zilele 1-5: Ce exerciții nu ai completat? Ce merită mai multă atenție?',
        promptEn: 'Review Days 1-5: What exercises haven\'t you completed? What deserves more attention?',
        type: 'paragraph',
      },
      {
        step: 2,
        prompt: 'Practică trigger-ele de stare de cel puțin 2 ori azi. Descrie experiența: ce ai făcut și cum te-ai simțit după.',
        promptEn: 'Practice your state triggers at least twice today. Describe the experience: what you did and how you felt after.',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Observă-ți stările pe parcursul zilei. Completează: "Când eu ___, starea mea ___" (scrie cel puțin 4 observații)',
        promptEn: 'Observe your states throughout the day. Complete: "When I ___, my state ___" (write at least 4 observations)',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 6 of Personal Power Plus — an Integration Day. Today the user reviews Days 1-5, practices state triggers (physiology), and observes their emotional states throughout the day.

Your job is to:
1. Check which exercises from Days 1-5 are complete — ask specifically about each day.
2. Help them identify what needs more attention or practice.
3. Guide them through practicing physiological state triggers — remind them of posture, breathing, movement, facial expressions.
4. Help them become aware of how their states shift throughout the day — when do they feel powerful? When do they feel drained?
5. Reinforce the momentum — celebrate what they've accomplished in the first 5 days.

This is NOT a day for new content — it's about deepening what they've already learned. Mastery comes from repetition and awareness.

IMPORTANT: Respond in Romanian. Be encouraging, observant, and help them see patterns. Use "tu" form.`,

    aiCoachingPoints: [
      'Verifică care exerciții din Zilele 1-5 sunt complete',
      'Practică trigger-ele fiziologice de stare',
      'Observă pattern-urile stărilor emoționale pe parcursul zilei',
      'Întărește momentumul și celebrează progresul',
    ],

    aiCoachingReminder: 'Aceasta este o zi de consolidare. Nu adăugăm nimic nou — cimentăm fundația.',

    doListTasks: [
      'Revizuiește exercițiile din Zilele 1-5',
      'Practică trigger-ele de stare de 2 ori',
      'Observă-ți stările pe parcursul zilei',
    ],

    breakthroughPrompt: 'Ce ai descoperit revizuind prima săptămână? Ce instrument funcționează cel mai bine pentru tine?',
    breakthroughPromptEn: 'What did you discover reviewing the first week? Which tool works best for you?',
  },

  {
    day: 7,
    title: 'Fixează-l: Construiește Momentum',
    titleEn: 'Lock It In: Building Momentum',
    quote: '"Nu ceea ce facem o dată la un timp ne modelează viața. Ci ceea ce facem constant."',
    quoteAuthor: 'Tony Robbins',
    definitions: [],
    lessonContent: `## Ziua 7 — Fixează-l: Construiește Momentum (Zi de Integrare)

### Completarea Primei Săptămâni

Felicitări! Ai ajuns la sfârșitul primei săptămâni din programul Personal Power Plus. Aceasta nu este doar o realizare — este o **declarație** despre cine ești și ce ești capabil să faci.

Dar hai să fim sinceri cu noi înșine: cât de profund ai aplicat ceea ce ai învățat?

### Evaluarea Consistenței

Consistența este cheia. Nu contează cât de puternică a fost o lecție dacă o practici o singură dată și apoi o uiți. Întreabă-te sincer:

- Am practicat **zilnic** schimbarea fiziologiei?
- Am folosit **durerea și plăcerea** conștient pentru a-mi direcționa comportamentul?
- Am luat **decizii** și am acționat asupra lor?
- Am observat **neuro-asocierile** mele și am încercat să le schimb?

### Reangajarea

Chiar dacă ai fost perfect consistent, aceasta este o oportunitate de **reangajare**. Angajamentul nu este ceva ce faci o singură dată — este ceva ce **reafirmi** în fiecare zi.

> **Nu ceea ce facem o dată la un timp ne modelează viața. Ci ceea ce facem constant.**

### Focusul pentru Săptămâna 2

Săptămâna viitoare vom intra în teritoriu nou: **focusul**, **întrebările**, **valorile** și **credințele**. Acestea sunt instrumentele care îți vor permite să controlezi nu doar ce faci, ci **cine ești** la nivel fundamental.

Dar nimic din ceea ce urmează nu va funcționa dacă nu ai o fundație solidă. De aceea, astăzi este despre a te asigura că ești pregătit.

> **Întreabă-te: Cum vreau să mă prezint săptămâna aceasta? Nu doar ce vreau să fac — ci în ce stare emoțională vreau să fiu?**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Pe o scară de la 1-10, cât de consistent ai folosit instrumentele din primele 5 zile?',
        promptEn: 'On a scale of 1-10, how consistently have you used the tools from the first 5 days?',
        type: 'scale',
      },
      {
        step: 2,
        prompt: 'La ce te angajezi să lucrezi mai constant săptămâna aceasta? Ce practică vei face zilnic?',
        promptEn: 'What do you commit to working on more consistently this week? What practice will you do daily?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Cum vrei să te prezinți săptămâna aceasta? În ce stare emoțională? Ce tip de persoană vrei să fii?',
        promptEn: 'How do you want to show up this week? In what emotional state? What kind of person do you want to be?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 7 of Personal Power Plus — the final Integration Day of Week 1. Today the user evaluates their consistency, recommits, and sets their emotional intention for Week 2.

Your job is to:
1. Evaluate their consistency honestly — ask what they actually DID vs what they intended to do.
2. Identify 1-2 practices they should continue and deepen.
3. Help them understand that momentum isn't about perfection — it's about showing up consistently.
4. Clarify their focus and emotional intention for Week 2.
5. Celebrate the completion of Week 1 while keeping them hungry for growth.

The key insight: consistency > intensity. Small daily actions compound into massive transformation.

IMPORTANT: Respond in Romanian. Be honest yet encouraging, practical, and forward-looking. Use "tu" form.`,

    aiCoachingPoints: [
      'Evaluează consistența reală din săptămâna 1',
      'Identifică 1-2 practici de menținut și aprofundat',
      'Clarifică focusul emoțional pentru săptămâna 2',
      'Celebrează progresul și menține motivația',
    ],

    aiCoachingReminder: 'Consistența > Intensitatea. Acțiunile mici zilnice se compun în transformare masivă.',

    doListTasks: [
      'Evaluează consistența din săptămâna 1',
      'Angajează-te la o practică zilnică specifică',
      'Definește starea emoțională pentru săptămâna 2',
    ],

    breakthroughPrompt: 'Ce lecție din prima săptămână a avut cel mai mare impact asupra ta? De ce?',
    breakthroughPromptEn: 'What lesson from the first week had the biggest impact on you? Why?',
  },

  {
    day: 8,
    title: 'Puterea Focusului',
    titleEn: 'The Power of Focus',
    quote: '"Întrebările sunt laserul conștiinței umane. Ele ne concentrează focusul și determină ce simțim și ce facem."',
    quoteAuthor: 'Tony Robbins',
    definitions: [
      {
        term: 'Focus',
        definition: 'Focusul determină starea emoțională. Ceea ce ne focalizăm atenția asupra devine realitatea noastră — nu neapărat pentru că este adevărul, ci pentru că acolo ne direcționăm energia.',
      },
    ],
    lessonContent: `## Ziua 8 — Puterea Focusului

### Al Doilea Vehicul: Focusul

În Zilele 1-5, ai învățat despre **fiziologie** — primul vehicul pentru gestionarea stărilor emoționale. Astăzi descoperim al doilea vehicul, la fel de puternic: **focusul**.

Ceea ce ne focalizăm atenția asupra determină modul în care ne simțim. Nu evenimentele din viața noastră ne modelează — ci **semnificația** pe care le-o dăm. Și semnificația este determinată de unde ne plasăm focusul.

### Procesul de "Ștergere"

Creierul nostru procesează milioane de informații în fiecare secundă, dar conștient putem gestiona doar o fracțiune. Restul este "șters" — filtrat automat de creierul nostru. **Ce decidem să filtrăm și ce decidem să păstrăm determină calitatea vieții noastre.**

De exemplu: Într-o cameră plină de oameni, unii vor observa pericolele, alții oportunitățile, alții frumusețea. Aceeași cameră — experiențe complet diferite. Diferența? **Focusul.**

### Două Moduri de a Controla Focusul

Există două aspecte ale focusului pe care le putem controla:

1. **CE imagini ne formăm în minte** — Pe ce ne concentrăm: pe ce avem sau pe ce ne lipsește? Pe ce putem controla sau pe ce nu putem?
2. **CUM ne formăm acele imagini** — Sunt luminoase sau întunecate? Apropiate sau îndepărtate? Mari sau mici? Cu sunet sau în liniște?

### Întrebările Determină Gândurile

Cel mai puternic mod de a-ți controla focusul este prin **întrebări**. Creierul tău este o mașină de răspuns la întrebări. Orice întrebare îi pui, va căuta un răspuns. Dacă întrebi "De ce nu reușesc niciodată?", creierul tău va găsi dovezi. Dacă întrebi "Cum pot face asta să funcționeze?", va găsi soluții.

> **Întrebările sunt laserul conștiinței umane.**

### Morning Power Questions

Întrebările pe care ți le pui dimineața setează tonul pentru întreaga zi. Iată câteva exemple:

1. **Ce mă face fericit/ă în viața mea acum?** Ce simt în legătură cu asta?
2. **Ce mă entuziasmează în viața mea acum?** Ce simt în legătură cu asta?
3. **Pentru ce sunt recunoscător/oare în viața mea acum?** Ce simt în legătură cu asta?
4. **De ce mă bucur cel mai mult în viața mea acum?** Ce simt în legătură cu asta?
5. **La ce sunt dedicat/ă în viața mea acum?** Ce simt în legătură cu asta?

Observă structura: fiecare întrebare te cere să identifici ceva specific ȘI să te conectezi emoțional la acel lucru.

### Evening Power Questions

La sfârșitul zilei, pune-ți și aceste întrebări:

1. **Ce am dat astăzi?** Cum am contribuit?
2. **Ce am învățat astăzi?**
3. **Cum a crescut calitatea vieții mele astăzi?**

> **Calitatea vieții tale este direct proporțională cu calitatea întrebărilor pe care ți le pui constant.**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Dezvoltă 5 întrebări personale pe care să ți le pui în fiecare dimineață (Morning Power Questions). Fă-le profund personale și relevante pentru viața ta:',
        promptEn: 'Develop 5 personal questions to ask yourself every morning (Morning Power Questions). Make them deeply personal and relevant to your life:',
        type: 'list',
        listCount: 5,
      },
      {
        step: 2,
        prompt: 'Pune-ți cele 5 întrebări acum și găsește cel puțin 2 răspunsuri pentru fiecare. Cum te fac să te simți?',
        promptEn: 'Ask yourself the 5 questions now and find at least 2 answers for each. How do they make you feel?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 8 of Personal Power Plus — The Power of Focus. Today's lesson covers focus as the second vehicle for managing emotional states (after physiology), the "deletion" process, two ways to control focus (what images and how), how questions determine thoughts, and Morning/Evening Power Questions.

Your job is to:
1. Help them develop 5 truly personal Morning Power Questions — not generic ones. These should touch what matters MOST in their life right now.
2. Make each question deeply emotional — the power is in FEELING the answer, not just thinking it.
3. Practice answering the questions with them — guide them to find specific, vivid answers.
4. Help them understand that questions direct focus, focus creates emotion, emotion drives action.
5. Create a commitment to ask these questions EVERY morning.

The key insight: You don't get what you want in life — you get what you focus on. And questions are the most powerful tool to direct focus.

IMPORTANT: Respond in Romanian. Be deeply personal, help them craft questions that move them emotionally. Use "tu" form.`,

    aiCoachingPoints: [
      'Dezvoltă Morning Power Questions profund personale',
      'Practică răspunsurile cu intensitate emoțională',
      'Conectează focusul la starea emoțională',
      'Creează angajamentul de a pune aceste întrebări zilnic',
    ],

    aiCoachingReminder: 'Întrebările sunt laserul conștiinței. Calitatea vieții tale depinde de calitatea întrebărilor pe care ți le pui.',

    doListTasks: [
      'Creează 5 Morning Power Questions personale',
      'Răspunde la cele 5 întrebări cu emoție',
      'Practică Evening Power Questions diseară',
    ],

    breakthroughPrompt: 'Ce Morning Power Questions ai creat? Cum te-au făcut să te simți când ai răspuns la ele?',
    breakthroughPromptEn: 'What Morning Power Questions did you create? How did they make you feel when you answered them?',
  },

  {
    day: 9,
    title: 'Valori și Credințe: Sursa Succesului sau a Eșecului',
    titleEn: 'Values and Beliefs: The Source of Success or Failure',
    quote: '"Trebuie să fim clari în privința a ceea ce este cel mai important în viețile noastre și să decidem să trăim după aceste valori, indiferent de ce."',
    quoteAuthor: 'Tony Robbins',
    definitions: [
      {
        term: 'Valori (Values)',
        definition: 'Stările emoționale pe care le consideri cele mai importante în viața ta. Valorile tale sunt busola internă care îți ghidează toate deciziile.',
      },
      {
        term: 'Credințe (Beliefs)',
        definition: 'Sentimente de certitudine despre ceea ce ceva înseamnă. Credințele noastre determină ce este posibil și ce nu în viața noastră.',
      },
      {
        term: 'Valori Moving-Toward',
        definition: 'Stările emoționale pe care le cauți activ — cele pe care vrei să le experimentezi (ex: dragoste, succes, libertate, pasiune).',
      },
      {
        term: 'Valori Moving-Away-From',
        definition: 'Stările emoționale pe care le eviți — cele de care fugi (ex: respingere, frustrare, depresie, singurătate).',
      },
      {
        term: 'Credințe Globale',
        definition: 'Generalizări pe care le facem despre viață, oameni și noi înșine (ex: "Viața este grea", "Oamenii sunt buni", "Eu sunt puternic").',
      },
      {
        term: 'Reguli (Rules)',
        definition: 'Condițiile pe care le setăm pentru a simți valorile noastre. "Mă simt fericit CÂND ___" — acel "când" este regula ta.',
      },
    ],
    lessonContent: `## Ziua 9 — Valori și Credințe: Sursa Succesului sau a Eșecului

### Ce Sunt Valorile?

Valorile sunt **stările emoționale** pe care le consideri cele mai importante în viața ta. Nu sunt lucruri sau realizări — sunt **sentimente**. Când spui că vrei "succes", ceea ce vrei de fapt este **sentimentul** pe care crezi că succesul ți-l va da.

Valorile tale sunt organizate într-o **ierarhie**. Această ierarhie determină cum iei decizii, cum îți petreci timpul, și în cele din urmă, cum îți trăiești viața.

### Moving-Toward vs Moving-Away-From

Avem două tipuri de valori:

1. **Valori Moving-Toward**: Stările emoționale pe care le cauți activ (dragoste, succes, libertate, pasiune, sănătate)
2. **Valori Moving-Away-From**: Stările emoționale de care fugi (respingere, frustrare, depresie, singurătate, eșec)

Ambele tipuri îți influențează comportamentul. Uneori, valorile Moving-Away-From sunt mai puternice decât cele Moving-Toward — și asta poate crea conflicte interne masive.

### Ends vs Means Values

Este important să distingi între:
- **Valori-scop (Ends)**: Starea emoțională pe care o cauți cu adevărat (ex: libertate, siguranță, dragoste)
- **Valori-mijloc (Means)**: Vehiculul prin care crezi că vei ajunge la starea emoțională (ex: bani, casă, mașină)

Banii nu sunt o valoare — sunt un **mijloc** către ceea ce crezi că îți vor oferi (siguranță, libertate, putere). Când confunzi mijloacele cu scopurile, riști să-ți petreci viața alergând după lucruri care nu te vor împlini.

### Puterea Credințelor

Credințele sunt **sentimente de certitudine** despre ceea ce ceva înseamnă. Ele funcționează ca niște filtre prin care interpretăm totul. Există două tipuri principale:

1. **Credințe Globale**: Generalizări despre viață ("Viața este plină de oportunități" vs "Viața este o luptă")
2. **Reguli**: Condițiile pe care le setăm pentru a experimenta valorile noastre ("Mă simt fericit CÂND ___")

### Regulile — Cheia Ascunsă

Regulile sunt cel mai important concept de astăzi. **Regula** este condiția pe care ai stabilit-o pentru a simți o anumită valoare.

De exemplu:
- "Mă simt de succes **când** câștig mai mult decât anul trecut" — regulă restrictivă
- "Mă simt de succes **când** dau tot ce am mai bun" — regulă împuternicoare

Dacă regulile tale sunt prea stricte sau depind de lucruri pe care nu le poți controla, vei trăi într-o stare constantă de frustrare. Dacă regulile tale sunt sub controlul tău și ușor de activat, vei trăi într-o stare constantă de împlinire.

> **Întrebarea nu este "Ce valori am?" — ci "Ce reguli am creat pentru a experimenta acele valori?"**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Determină valorile tale Moving-Toward: "Ce este cel mai important pentru mine în viață?" Enumeră cele mai importante stări emoționale pe care le cauți:',
        promptEn: 'Determine your Moving-Toward values: "What is most important to me in life?" List the emotional states you seek most:',
        type: 'list',
        listCount: 10,
      },
      {
        step: 2,
        prompt: 'Rescrie valorile Moving-Toward în ordinea importanței lor (de la cea mai importantă la cea mai puțin importantă):',
        promptEn: 'Rewrite your Moving-Toward values in order of importance (most important to least important):',
        type: 'list',
        listCount: 12,
      },
      {
        step: 3,
        prompt: 'Determină valorile Moving-Away-From: Ce stări emoționale faci totul posibil să le eviți?',
        promptEn: 'Determine your Moving-Away-From values: What emotional states do you do everything to avoid?',
        type: 'list',
        listCount: 10,
      },
      {
        step: 4,
        prompt: 'Rescrie valorile Moving-Away-From în ordinea intensității (de la cea pe care o eviți cel mai mult):',
        promptEn: 'Rewrite your Moving-Away-From values in order of intensity (from the one you avoid most):',
        type: 'list',
        listCount: 12,
      },
      {
        step: 5,
        prompt: 'Determină regulile pentru cele mai importante 3 valori Moving-Toward. Ce condiții ai setat? "Mă simt [valoare] CÂND ___":',
        promptEn: 'Determine the rules for your top 3 Moving-Toward values. What conditions have you set? "I feel [value] WHEN ___":',
        type: 'paragraph',
      },
      {
        step: 6,
        prompt: 'Ai descoperit reguli care limitează calitatea vieții tale? Care sunt dispus să le schimbi? Cu ce le vei înlocui?',
        promptEn: 'Have you discovered rules that limit your quality of life? Which ones are you willing to change? What will you replace them with?',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 9 of Personal Power Plus — Values and Beliefs. Today covers values as hierarchically organized emotional states, Moving-Toward vs Moving-Away-From values, Ends vs Means values, beliefs (global beliefs and rules), and how rules determine whether we experience our values or not.

Your job is to:
1. Help them identify and rank their Moving-Toward values — the emotional states they seek most.
2. Help them identify their Moving-Away-From values — the emotional states they avoid at all costs.
3. Discover their RULES for the top values — what conditions have they set for experiencing happiness, success, love, etc.?
4. Show them which rules empower them (easy to fulfill, under their control) and which limit them (hard to fulfill, dependent on others).
5. Guide them to see conflicts — for example, if "freedom" is their top value but their rules require financial conditions they haven't met yet.

The key insight: Most people's suffering comes not from their values, but from their RULES. When you change the rules, you change your entire experience of life.

IMPORTANT: Respond in Romanian. Be insightful, help them see patterns they've never noticed. Use "tu" form. This is deep work — be patient and thorough.`,

    aiCoachingPoints: [
      'Identifică și ierarhizează valorile Moving-Toward',
      'Identifică valorile Moving-Away-From',
      'Descoperă regulile pentru valorile tale principale',
      'Vezi care reguli te împuternicesc și care te limitează',
    ],

    aiCoachingReminder: 'Suferința vine rareori din valori — vine din REGULI. Când schimbi regulile, schimbi întreaga experiență a vieții.',

    doListTasks: [
      'Identifică 10 valori Moving-Toward',
      'Ierarhizează valorile în ordinea importanței',
      'Identifică valorile Moving-Away-From',
      'Descoperă regulile pentru top 3 valori',
    ],

    breakthroughPrompt: 'Ce ai descoperit despre ierarhia ta de valori? Există conflicte între valori sau reguli care te limitează?',
    breakthroughPromptEn: 'What did you discover about your values hierarchy? Are there conflicts between values or rules that limit you?',
  },

  {
    day: 10,
    title: 'Cum să Preiei Controlul Complet al Vieții Tale',
    titleEn: 'How to Take Complete Control of Your Life',
    quote: '"Trecutul nu este egal cu viitorul."',
    quoteAuthor: 'Tony Robbins',
    definitions: [
      {
        term: 'Dickens Pattern',
        definition: 'O tehnică puternică de schimbare a credințelor bazată pe vizualizarea consecințelor unei credințe limitante în trecut, prezent și viitor — creând suficientă durere pentru a o elibera și suficientă plăcere pentru a adopta o credință nouă.',
      },
    ],
    lessonContent: `## Ziua 10 — Cum să Preiei Controlul Complet al Vieții Tale

### Cum Să Schimbi o Credință

Credințele sunt ca niște picioare de masă — au nevoie de **referințe** care să le susțină. Cu cât ai mai multe referințe (experiențe, dovezi, argumente) care susțin o credință, cu atât este mai puternică.

Vestea bună: poți **slăbi** o credință limitantă eliminând referințele care o susțin și poți **întări** o credință nouă creând referințe noi.

### Cei 5 Pași pentru Schimbarea unei Credințe

1. **Identifică credința limitantă** pe care vrei să o schimbi.
2. **Conectează durere masivă** la credința veche — ce te-a costat? Ce ai pierdut din cauza ei? Ce vei pierde în continuare dacă o păstrezi?
3. **Creează o credință nouă, împuternicoare** care să o înlocuiască.
4. **Conectează plăcere masivă** la noua credință — cum va fi viața ta cu această credință? Ce vei câștiga? Cum te vei simți?
5. **Condiționează noua credință** — repetă-o, vizualizează-o, trăiește-o în fiecare zi până devine automată.

### Două Credințe de Bază de Adoptat

Există două credințe fundamentale care, odată adoptate, îți pot transforma complet viața:

1. **"Trecutul nu este egal cu viitorul."** — Indiferent de ce s-a întâmplat până acum, asta nu determină ce se va întâmpla de aici înainte. Ai puterea de a crea un viitor diferit, începând ACUM.

2. **"Nu există eșec, doar rezultate."** — Fiecare "eșec" este doar un feedback care te ghidează către o abordare mai bună. Singurul eșec real este să nu mai încerci.

### Dickens Pattern

Dickens Pattern este una dintre cele mai puternice tehnici de schimbare a credințelor. Numele vine de la Charles Dickens și "Un Colind de Crăciun" — în care Scrooge este vizitat de spiritele trecutului, prezentului și viitorului.

Procesul funcționează astfel:

**Pasul 1 — Trecutul**: Gândește-te la credința limitantă. Ce te-a costat în trecut? Ce oportunități ai pierdut? Ce relații au suferit? Ce nu ai reușit din cauza ei? Simte durerea real.

**Pasul 2 — Prezentul**: Cum te afectează această credință ACUM? Cum îți limitează viața în acest moment? Ce nu faci din cauza ei? Cât de mult te costă chiar acum?

**Pasul 3 — Viitorul**: Dacă nu schimbi nimic, cum va fi viața ta peste 1 an? 5 ani? 10 ani? 20 de ani? Vizualizează viitorul cu această credință — simte greutatea ei. Lasă durerea să crească.

**Pasul 4 — Noua Credință**: Acum imaginează-ți viața cu noua credință. Cum va fi peste 1 an? 5 ani? 10 ani? Simte bucuria, libertatea, puterea. Lasă plăcerea să crească.

**Pasul 5 — Condiționare**: Practică noua credință zilnic. Spune-o cu voce tare. Vizualizează-o. Caută dovezi care o susțin. Cu fiecare zi, devine mai puternică.

> **Credințele tale nu sunt "adevărul" — sunt decizii. Și orice decizie poate fi schimbată.**`,

    assignmentSteps: [
      {
        step: 1,
        prompt: 'Identifică o credință limitantă pe care vrei să o schimbi. Scrie-o clar:',
        promptEn: 'Identify a limiting belief you want to change. Write it clearly:',
        type: 'text',
      },
      {
        step: 2,
        prompt: 'Conectează durere la credința actuală: Ce te-a costat în trecut? Ce ai pierdut? Ce oportunități ai ratat din cauza ei?',
        promptEn: 'Connect pain to the current belief: What has it cost you in the past? What have you lost? What opportunities have you missed?',
        type: 'paragraph',
      },
      {
        step: 3,
        prompt: 'Identifică noua credință împuternicoare care va înlocui cea veche:',
        promptEn: 'Identify the new empowering belief that will replace the old one:',
        type: 'text',
      },
      {
        step: 4,
        prompt: 'Conectează plăcere masivă la noua credință: Cum va fi viața ta cu această credință? Ce vei câștiga? Cum te vei simți?',
        promptEn: 'Connect massive pleasure to the new belief: How will your life be with this belief? What will you gain? How will you feel?',
        type: 'paragraph',
      },
      {
        step: 5,
        prompt: 'Condiționează noua credință: Vizualizează cum va fi viața ta peste 1 an, 5 ani, 10 ani cu această credință nouă. Descrie ce vezi:',
        promptEn: 'Condition the new belief: Visualize your life in 1 year, 5 years, 10 years with this new belief. Describe what you see:',
        type: 'paragraph',
      },
    ],

    aiCoachingPrompt: `You are a transformational coach guiding users through Day 10 of Personal Power Plus — How to Take Complete Control of Your Life. Today covers the 5 steps to change a belief, two core beliefs to adopt ("The past does not equal the future" and "There is no failure, only results"), and the Dickens Pattern.

Your job is to:
1. Guide them through identifying a specific limiting belief — make it crystal clear and specific.
2. Walk them through the Dickens Pattern step by step:
   - PAST: What has this belief cost them? What have they missed? Feel the pain deeply.
   - PRESENT: How is it affecting them RIGHT NOW? What are they not doing because of it?
   - FUTURE: If they keep this belief for 10, 20 years — what will their life look like? Make it vivid and painful.
3. Help them articulate a new empowering belief that is the opposite of the old one.
4. Connect massive pleasure to the new belief — visualize life with this belief in 1, 5, 10 years.
5. Create a conditioning plan — how will they reinforce this new belief daily?

This is one of the most powerful exercises in the entire program. Take your time. Don't rush through it. The deeper the emotional experience, the more lasting the change.

IMPORTANT: Respond in Romanian. Be deeply empathetic but also direct. Guide them to FEEL, not just think. Use "tu" form.`,

    aiCoachingPoints: [
      'Identifică credința limitantă specifică',
      'Ghidează prin Dickens Pattern: trecut → prezent → viitor',
      'Ajută să vadă costul real al credinței limitante',
      'Instalează noua credință cu plăcere masivă',
      'Creează un plan de condiționare zilnică',
    ],

    aiCoachingReminder: 'Credințele nu sunt adevărul — sunt decizii. Și orice decizie poate fi schimbată. Dickens Pattern este instrumentul.',

    doListTasks: [
      'Identifică o credință limitantă de schimbat',
      'Parcurge Dickens Pattern complet',
      'Definește noua credință împuternicoare',
      'Vizualizează viața cu noua credință',
    ],

    breakthroughPrompt: 'Ce credință limitantă ai decis să schimbi? Cu ce ai înlocuit-o? Cum te simți acum?',
    breakthroughPromptEn: 'What limiting belief did you decide to change? What did you replace it with? How do you feel now?',
  },
];
