import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Flame, Heart, Target, Zap, BookOpen, Crown,
  Play, CheckCircle2, ArrowLeft, ArrowRight, Video, ListChecks, BookMarked,
  Dumbbell, Brain, Users, Sparkles, ExternalLink
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { ChallengeAnswersHistory } from '@/components/challenge/ChallengeAnswersHistory';

interface Exercise {
  id: string;
  title: string;
  description: string;
  area?: 'body' | 'being' | 'balance' | 'business';
  link?: string;
  linkLabel?: string;
}

interface ChallengeDayContent {
  day: number;
  titleEn: string;
  titleRo: string;
  principleEn: string;
  principleRo: string;
  descriptionEn: string;
  descriptionRo: string;
  videoPlaceholder: string;
  icon: React.ElementType;
  color: string;
  actionPath: string;
  stepsEn: string[];
  stepsRo: string[];
  exercisesEn: Exercise[];
  exercisesRo: Exercise[];
  focusAreas: ('body' | 'being' | 'balance' | 'business')[];
}

const areaColors = {
  body: 'bg-green-500 text-white',
  being: 'bg-purple-500 text-white',
  balance: 'bg-pink-500 text-white',
  business: 'bg-blue-500 text-white'
};

const areaLabels = {
  body: { en: '💪 Body', ro: '💪 Corp' },
  being: { en: '✨ Being', ro: '✨ Spirit' },
  balance: { en: '💕 Balance', ro: '💕 Relații' },
  business: { en: '💰 Business', ro: '💰 Business' }
};

const challengeContent: ChallengeDayContent[] = [
  {
    day: 1,
    titleEn: "🔥 IGNITE YOUR DESIRE",
    titleRo: "🔥 APRINDE-ȚI DORINȚA",
    principleEn: "Foundation: Define Your 'Have It All' Vision",
    principleRo: "Fundația: Definește-ți Viziunea 'Have It All'",
    descriptionEn: "Today you'll define what 'Having It All' truly means for YOU. Not society's version, not your parents' version — YOUR version of complete success in Body, Being, Balance, and Business.",
    descriptionRo: "Astăzi vei defini ce înseamnă cu adevărat 'Să Ai Totul' pentru TINE. Nu versiunea societății, nu versiunea părinților — VERSIUNEA TA de succes complet în Corp, Spirit, Relații și Business.",
    videoPlaceholder: "🎬 Video: What Does Having It All Mean to You? (Coming Soon)",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    actionPath: "/lifebook",
    focusAreas: ['being'],
    stepsEn: [
      "Watch the video about defining your 'Have It All' vision",
      "Complete the Life Design Blueprint foundation",
      "Write your vision for each of the 4 areas",
      "Set your main goal for the next 90 days",
      "Complete the Principle Coaching Stack"
    ],
    stepsRo: [
      "Privește videoclipul despre definirea viziunii tale 'Have It All'",
      "Completează fundația Life Design Blueprint",
      "Scrie-ți viziunea pentru fiecare din cele 4 arii",
      "Stabilește obiectivul principal pentru următoarele 90 de zile",
      "Completează Stack-ul Principle Coaching"
    ],
    exercisesEn: [
      { id: "ex1", title: "Define Your 'Why'", description: "Write why you want to have it all — what drives you?", area: "being" },
      { id: "ex2", title: "Vision Statement", description: "Create a 1-paragraph vision of your ideal life", area: "being", link: "/lifebook", linkLabel: "Open Life Design Blueprint" },
      { id: "ex3", title: "Complete Principle Coaching", description: "Go through the AI-guided coaching session", area: "being", link: "/stack?type=napoleon-hill-quick&principle=1&challengeDay=1", linkLabel: "Start Stack" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Definește-ți 'De Ce-ul'", description: "Scrie de ce vrei să ai totul — ce te motivează?", area: "being" },
      { id: "ex2", title: "Declarația Viziunii", description: "Creează un paragraf cu viziunea vieții tale ideale", area: "being", link: "/lifebook", linkLabel: "Deschide Life Design Blueprint" },
      { id: "ex3", title: "Completează Principle Coaching", description: "Parcurge sesiunea de coaching ghidată de AI", area: "being", link: "/stack?type=napoleon-hill-quick&principle=1&challengeDay=1", linkLabel: "Începe Stack" }
    ]
  },
  {
    day: 2,
    titleEn: "💪 BODY MASTERY",
    titleRo: "💪 STĂPÂNIREA CORPULUI",
    principleEn: "Area 1: Body — Energy & Peak Performance",
    principleRo: "Aria 1: Corp — Energie și Performanță Maximă",
    descriptionEn: "Your body is the vehicle for your dreams. Today you start building the physical foundation with 30 minutes of movement and nutrient-rich fuel. No excuses — ANY movement counts!",
    descriptionRo: "Corpul tău este vehiculul pentru visurile tale. Astăzi începi să construiești fundația fizică cu 30 de minute de mișcare și combustibil bogat în nutrienți. Fără scuze — ORICE mișcare contează!",
    videoPlaceholder: "🎬 Video: Body Mastery — Your Foundation for Success (Coming Soon)",
    icon: Dumbbell,
    color: "from-green-500 to-emerald-500",
    actionPath: "/fitness",
    focusAreas: ['body'],
    stepsEn: [
      "Watch the video about body mastery",
      "Complete 30 minutes of physical activity (walk, gym, yoga, anything!)",
      "Prepare and drink a green smoothie or healthy meal",
      "Log your activity in the Fitness Hub",
      "Reflect on how your body feels after movement"
    ],
    stepsRo: [
      "Privește videoclipul despre stăpânirea corpului",
      "Completează 30 de minute de activitate fizică (plimbare, sală, yoga, orice!)",
      "Pregătește și bea un smoothie verde sau o masă sănătoasă",
      "Înregistrează activitatea în Fitness Hub",
      "Reflectează cum te simți după mișcare"
    ],
    exercisesEn: [
      { id: "ex1", title: "30 Min Movement", description: "Complete ANY physical activity for 30 minutes", area: "body", link: "/fitness", linkLabel: "Open Fitness Hub" },
      { id: "ex2", title: "Green Fuel", description: "Prepare a green smoothie or healthy meal (leafy greens, fruits, protein)", area: "body" },
      { id: "ex3", title: "Body Reflection", description: "Write 3 sentences about how your body feels after movement", area: "body" }
    ],
    exercisesRo: [
      { id: "ex1", title: "30 Min Mișcare", description: "Completează ORICE activitate fizică timp de 30 de minute", area: "body", link: "/fitness", linkLabel: "Deschide Fitness Hub" },
      { id: "ex2", title: "Combustibil Verde", description: "Pregătește un smoothie verde sau o masă sănătoasă (verdeață, fructe, proteine)", area: "body" },
      { id: "ex3", title: "Reflecție Corporală", description: "Scrie 3 propoziții despre cum te simți după mișcare", area: "body" }
    ]
  },
  {
    day: 3,
    titleEn: "✨ SOUL CONNECTION",
    titleRo: "✨ CONEXIUNE SPIRITUALĂ",
    principleEn: "Area 2: Being — Purpose & Inner Peace",
    principleRo: "Aria 2: Spirit — Scop și Pace Interioară",
    descriptionEn: "Today you add spiritual practices to your Body routine. 10 minutes of meditation plus gratitude journaling will transform your inner world while you maintain your physical momentum.",
    descriptionRo: "Astăzi adaugi practici spirituale la rutina ta de Corp. 10 minute de meditație plus jurnalul gratitudinii îți vor transforma lumea interioară în timp ce menții impulsul fizic.",
    videoPlaceholder: "🎬 Video: Soul Connection — Finding Your Inner Peace (Coming Soon)",
    icon: Brain,
    color: "from-purple-500 to-violet-500",
    actionPath: "/stack?type=divine-prayer",
    focusAreas: ['body', 'being'],
    stepsEn: [
      "Watch the video about soul connection",
      "Complete your 30 min movement (keep Day 2 habit!)",
      "Have your green fuel",
      "Meditate for 10 minutes (guided or silent)",
      "Write 10 things you're grateful for",
      "Complete the Divine Connection Stack"
    ],
    stepsRo: [
      "Privește videoclipul despre conexiunea spirituală",
      "Completează 30 min de mișcare (menține obiceiul din Ziua 2!)",
      "Ia-ți combustibilul verde",
      "Meditează 10 minute (ghidat sau în tăcere)",
      "Scrie 10 lucruri pentru care ești recunoscător",
      "Completează Stack-ul Divine Connection"
    ],
    exercisesEn: [
      { id: "ex1", title: "30 Min Movement", description: "Maintain your body practice from Day 2", area: "body", link: "/fitness", linkLabel: "Fitness Hub" },
      { id: "ex2", title: "Green Fuel", description: "Continue your nutrition practice", area: "body" },
      { id: "ex3", title: "10 Min Meditation", description: "Sit in silence or use guided meditation", area: "being", link: "/stack?type=divine-prayer", linkLabel: "Divine Connection Stack" },
      { id: "ex4", title: "Gratitude Journal", description: "Write 10 things you're grateful for today", area: "being" }
    ],
    exercisesRo: [
      { id: "ex1", title: "30 Min Mișcare", description: "Menține practica corporală din Ziua 2", area: "body", link: "/fitness", linkLabel: "Fitness Hub" },
      { id: "ex2", title: "Combustibil Verde", description: "Continuă practica de nutriție", area: "body" },
      { id: "ex3", title: "10 Min Meditație", description: "Stai în tăcere sau folosește meditație ghidată", area: "being", link: "/stack?type=divine-prayer", linkLabel: "Stack Divine Connection" },
      { id: "ex4", title: "Jurnal Gratitudine", description: "Scrie 10 lucruri pentru care ești recunoscător astăzi", area: "being" }
    ]
  },
  {
    day: 4,
    titleEn: "💕 LOVE & CONNECTION",
    titleRo: "💕 DRAGOSTE ȘI CONEXIUNE",
    principleEn: "Area 3: Balance — Relationships & Love",
    principleRo: "Aria 3: Relații — Conexiuni și Dragoste",
    descriptionEn: "Success without love is empty. Today you add value to the people who matter most — your partner and one other important person (child, parent, friend). Maintain all previous practices!",
    descriptionRo: "Succesul fără dragoste este gol. Astăzi adaugi valoare persoanelor care contează cel mai mult — partenerul tău și altă persoană importantă (copil, părinte, prieten). Menține toate practicile anterioare!",
    videoPlaceholder: "🎬 Video: Love & Connection — Your Relationships Define You (Coming Soon)",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    actionPath: "/lifebook",
    focusAreas: ['body', 'being', 'balance'],
    stepsEn: [
      "Watch the video about love and connection",
      "Complete your 30 min movement",
      "Have your green fuel",
      "Complete your 10 min meditation",
      "Write your gratitude list",
      "Add value to your partner (surprise, help, love note, quality time)",
      "Add value to another person (child, parent, friend)"
    ],
    stepsRo: [
      "Privește videoclipul despre dragoste și conexiune",
      "Completează 30 min de mișcare",
      "Ia-ți combustibilul verde",
      "Completează 10 min de meditație",
      "Scrie lista de gratitudine",
      "Adaugă valoare partenerului (surpriză, ajutor, bilet de dragoste, timp calitativ)",
      "Adaugă valoare altei persoane (copil, părinte, prieten)"
    ],
    exercisesEn: [
      { id: "ex1", title: "30 Min Movement", description: "Maintain your body practice", area: "body" },
      { id: "ex2", title: "Green Fuel", description: "Continue your nutrition practice", area: "body" },
      { id: "ex3", title: "10 Min Meditation", description: "Maintain your spiritual practice", area: "being" },
      { id: "ex4", title: "Gratitude Journal", description: "Write your gratitude list", area: "being" },
      { id: "ex5", title: "Partner Value", description: "Do something special for your partner — surprise, help, love note, quality time", area: "balance" },
      { id: "ex6", title: "Second Person", description: "Add value to child, parent, or friend — call, help, surprise", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "30 Min Mișcare", description: "Menține practica corporală", area: "body" },
      { id: "ex2", title: "Combustibil Verde", description: "Continuă practica de nutriție", area: "body" },
      { id: "ex3", title: "10 Min Meditație", description: "Menține practica spirituală", area: "being" },
      { id: "ex4", title: "Jurnal Gratitudine", description: "Scrie lista de gratitudine", area: "being" },
      { id: "ex5", title: "Valoare Partener", description: "Fă ceva special pentru partener — surpriză, ajutor, bilet de dragoste, timp calitativ", area: "balance" },
      { id: "ex6", title: "A Doua Persoană", description: "Adaugă valoare copilului, părintelui sau prietenului — sună, ajută, surpriză", area: "balance" }
    ]
  },
  {
    day: 5,
    titleEn: "💰 BUSINESS EDGE",
    titleRo: "💰 AVANTAJ DE BUSINESS",
    principleEn: "Area 4: Business — Financial & Career Success",
    principleRo: "Aria 4: Business — Succes Financiar și în Carieră",
    descriptionEn: "Now we add the final piece: Business growth. 30 minutes of reading or learning about marketing, business, or your industry. Then identify 3 ideas and APPLY one today!",
    descriptionRo: "Acum adăugăm piesa finală: Creșterea în Business. 30 de minute de lectură sau învățare despre marketing, business sau industria ta. Apoi identifică 3 idei și APLICĂ una astăzi!",
    videoPlaceholder: "🎬 Video: Business Edge — Learn, Discover, Apply (Coming Soon)",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    actionPath: "/stack?type=hormozi-coaching",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Watch the video about business growth",
      "Maintain all previous practices (Body + Being + Balance)",
      "Read or listen to business content for 30 minutes",
      "Extract 3 key ideas from what you learned",
      "Apply ONE idea immediately (even a small action counts!)"
    ],
    stepsRo: [
      "Privește videoclipul despre creșterea în business",
      "Menține toate practicile anterioare (Corp + Spirit + Relații)",
      "Citește sau ascultă conținut de business timp de 30 de minute",
      "Extrage 3 idei cheie din ce ai învățat",
      "Aplică O idee imediat (chiar și o acțiune mică contează!)"
    ],
    exercisesEn: [
      { id: "ex1", title: "Body: Movement + Fuel", description: "Complete your body practices", area: "body" },
      { id: "ex2", title: "Being: Meditation + Gratitude", description: "Complete your spiritual practices", area: "being" },
      { id: "ex3", title: "Balance: Add Value", description: "Add value to 2 people", area: "balance" },
      { id: "ex4", title: "30 Min Business Learning", description: "Read, listen to podcast, or watch educational content about business/marketing", area: "business" },
      { id: "ex5", title: "3 Key Ideas", description: "Write down 3 ideas you can apply from your learning", area: "business" },
      { id: "ex6", title: "Apply 1 Idea NOW", description: "Take immediate action on ONE idea — send email, post, call, create", area: "business", link: "/stack?type=hormozi-coaching", linkLabel: "Business Empire Stack" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Corp: Mișcare + Combustibil", description: "Completează practicile corporale", area: "body" },
      { id: "ex2", title: "Spirit: Meditație + Gratitudine", description: "Completează practicile spirituale", area: "being" },
      { id: "ex3", title: "Relații: Adaugă Valoare", description: "Adaugă valoare la 2 persoane", area: "balance" },
      { id: "ex4", title: "30 Min Învățare Business", description: "Citește, ascultă podcast sau privește conținut educațional despre business/marketing", area: "business" },
      { id: "ex5", title: "3 Idei Cheie", description: "Notează 3 idei pe care le poți aplica din ce ai învățat", area: "business" },
      { id: "ex6", title: "Aplică 1 Idee ACUM", description: "Acționează imediat pe O idee — trimite email, postează, sună, creează", area: "business", link: "/stack?type=hormozi-coaching", linkLabel: "Stack Business Empire" }
    ]
  },
  {
    day: 6,
    titleEn: "⚡ INTEGRATION DAY",
    titleRo: "⚡ ZIUA INTEGRĂRII",
    principleEn: "Full Practice: All 4 Areas Working Together",
    principleRo: "Practică Completă: Toate 4 Ariile Funcționând Împreună",
    descriptionEn: "Today you practice the COMPLETE Have It All routine. All 4 areas, all activities. This is what your ideal day looks like. Feel the power of alignment!",
    descriptionRo: "Astăzi practici rutina Have It All COMPLETĂ. Toate 4 ariile, toate activitățile. Așa arată ziua ta ideală. Simte puterea alinierii!",
    videoPlaceholder: "🎬 Video: Integration Day — Living the Have It All Lifestyle (Coming Soon)",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    actionPath: "/lifebook",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Watch the video about integration",
      "Complete ALL Body practices",
      "Complete ALL Being practices",
      "Complete ALL Balance practices",
      "Complete ALL Business practices",
      "Celebrate your transformation!"
    ],
    stepsRo: [
      "Privește videoclipul despre integrare",
      "Completează TOATE practicile de Corp",
      "Completează TOATE practicile de Spirit",
      "Completează TOATE practicile de Relații",
      "Completează TOATE practicile de Business",
      "Sărbătorește transformarea ta!"
    ],
    exercisesEn: [
      { id: "ex1", title: "💪 Body Complete", description: "30 min movement + Green fuel", area: "body", link: "/fitness", linkLabel: "Fitness Hub" },
      { id: "ex2", title: "✨ Being Complete", description: "10 min meditation + Gratitude journal", area: "being", link: "/stack?type=divine-prayer", linkLabel: "Divine Connection" },
      { id: "ex3", title: "💕 Balance Complete", description: "Add value to partner + second person", area: "balance" },
      { id: "ex4", title: "💰 Business Complete", description: "30 min learning + 3 ideas + Apply 1", area: "business" },
      { id: "ex5", title: "Celebrate!", description: "Acknowledge your growth — you're living the Have It All lifestyle!", area: "being" }
    ],
    exercisesRo: [
      { id: "ex1", title: "💪 Corp Complet", description: "30 min mișcare + Combustibil verde", area: "body", link: "/fitness", linkLabel: "Fitness Hub" },
      { id: "ex2", title: "✨ Spirit Complet", description: "10 min meditație + Jurnal gratitudine", area: "being", link: "/stack?type=divine-prayer", linkLabel: "Divine Connection" },
      { id: "ex3", title: "💕 Relații Complet", description: "Adaugă valoare partenerului + a doua persoană", area: "balance" },
      { id: "ex4", title: "💰 Business Complet", description: "30 min învățare + 3 idei + Aplică 1", area: "business" },
      { id: "ex5", title: "Sărbătorește!", description: "Recunoaște-ți creșterea — trăiești stilul de viață Have It All!", area: "being" }
    ]
  },
  {
    day: 7,
    titleEn: "🏆 FREEDOM BLUEPRINT",
    titleRo: "🏆 PLANUL LIBERTĂȚII",
    principleEn: "Weekly Planning: Crystalize Your Habits Into Structure",
    principleRo: "Planificare Săptămânală: Cristalizează-ți Obiceiurile în Structură",
    descriptionEn: "The final step: Transform your 6-day experience into a sustainable weekly plan. Use The Door to set your Domino goal, 5 Key Points, and schedule your Have It All activities!",
    descriptionRo: "Pasul final: Transformă experiența de 6 zile într-un plan săptămânal sustenabil. Folosește Door pentru a-ți stabili obiectivul Domino, 5 Puncte Cheie și programează activitățile Have It All!",
    videoPlaceholder: "🎬 Video: Freedom Blueprint — Plan Like a General (Coming Soon)",
    icon: Crown,
    color: "from-amber-500 to-yellow-600",
    actionPath: "/door",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Watch the video about weekly planning",
      "Complete your daily Have It All practices one more time",
      "Open The Door and complete your weekly planning",
      "Set your Domino Goal (THE one thing that matters most)",
      "Define your 5 Key Points for the week",
      "Schedule your Have It All activities in the weekly calendar",
      "🎉 Celebrate completing the challenge!"
    ],
    stepsRo: [
      "Privește videoclipul despre planificarea săptămânală",
      "Completează practicile zilnice Have It All încă o dată",
      "Deschide Door și completează planificarea săptămânală",
      "Stabilește Obiectivul Domino (UNICUL lucru care contează cel mai mult)",
      "Definește 5 Puncte Cheie pentru săptămână",
      "Programează activitățile Have It All în calendarul săptămânal",
      "🎉 Sărbătorește completarea provocării!"
    ],
    exercisesEn: [
      { id: "ex1", title: "Complete Daily Practice", description: "Do your Body + Being + Balance + Business routine", area: "being" },
      { id: "ex2", title: "Weekly Planning Session", description: "Open The Door and answer the planning questions", area: "business", link: "/door", linkLabel: "Open The Door" },
      { id: "ex3", title: "Set Domino Goal", description: "Define the ONE goal that makes everything else easier", area: "business" },
      { id: "ex4", title: "5 Key Points", description: "Identify your 5 non-negotiable tasks for the week", area: "business" },
      { id: "ex5", title: "Schedule Have It All", description: "Block time in your week for Body, Being, Balance, Business", area: "being", link: "/lifebook", linkLabel: "Life Design Blueprint" },
      { id: "ex6", title: "🎉 Challenge Complete!", description: "You did it! You're now a Have It All Achiever!", area: "being" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Completează Practica Zilnică", description: "Fă rutina Corp + Spirit + Relații + Business", area: "being" },
      { id: "ex2", title: "Sesiune Planificare Săptămânală", description: "Deschide Door și răspunde la întrebările de planificare", area: "business", link: "/door", linkLabel: "Deschide Door" },
      { id: "ex3", title: "Stabilește Obiectivul Domino", description: "Definește UN obiectiv care face totul mai ușor", area: "business" },
      { id: "ex4", title: "5 Puncte Cheie", description: "Identifică 5 taskuri non-negociabile pentru săptămână", area: "business" },
      { id: "ex5", title: "Programează Have It All", description: "Blochează timp în săptămână pentru Corp, Spirit, Relații, Business", area: "being", link: "/lifebook", linkLabel: "Life Design Blueprint" },
      { id: "ex6", title: "🎉 Challenge Complet!", description: "Ai reușit! Ești acum un Realizator Have It All!", area: "being" }
    ]
  }
];

const ChallengeDayPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { day } = useParams<{ day: string }>();
  const dayNumber = parseInt(day || '1', 10);
  
  const { 
    isDayUnlocked, 
    isDayCompleted, 
    getDayProgress, 
    markVideoWatched, 
    completeAction, 
    completeDay,
    loading 
  } = useChallengeProgress();

  const [videoWatched, setVideoWatched] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const content = challengeContent.find(c => c.day === dayNumber);
  
  if (!content) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">Day not found</h1>
          <Button onClick={() => navigate('/challenge')}>Back to Challenge</Button>
        </div>
      </Layout>
    );
  }

  const dayProgress = getDayProgress(dayNumber);
  const isUnlocked = isDayUnlocked(dayNumber);
  const isCompleted = isDayCompleted(dayNumber);

  React.useEffect(() => {
    if (dayProgress) {
      setVideoWatched(dayProgress.video_watched);
      setCompletedExercises(dayProgress.actions_completed);
    }
  }, [dayProgress]);

  if (!isUnlocked && !loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === 'en' ? 'Day Locked' : 'Zi Blocată'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {language === 'en' 
              ? 'Complete the previous days to unlock this day.' 
              : 'Completează zilele anterioare pentru a debloca această zi.'}
          </p>
          <Button onClick={() => navigate('/challenge')}>
            {language === 'en' ? 'Back to Challenge' : 'Înapoi la Provocare'}
          </Button>
        </div>
      </Layout>
    );
  }

  const Icon = content.icon;
  const title = language === 'en' ? content.titleEn : content.titleRo;
  const principle = language === 'en' ? content.principleEn : content.principleRo;
  const description = language === 'en' ? content.descriptionEn : content.descriptionRo;
  const steps = language === 'en' ? content.stepsEn : content.stepsRo;
  const exercises = language === 'en' ? content.exercisesEn : content.exercisesRo;

  const handleWatchVideo = async () => {
    setVideoWatched(true);
    await markVideoWatched(dayNumber);
  };

  const handleToggleExercise = async (exerciseId: string) => {
    if (completedExercises.includes(exerciseId)) return;
    
    const newCompleted = [...completedExercises, exerciseId];
    setCompletedExercises(newCompleted);
    await completeAction(dayNumber, exerciseId);
  };

  const handleCompleteDay = async () => {
    await completeDay(dayNumber);
    if (dayNumber < 7) {
      navigate(`/challenge/${dayNumber + 1}`);
    } else {
      navigate('/challenge');
    }
  };

  const allExercisesCompleted = exercises.every(ex => completedExercises.includes(ex.id));
  const canCompleteDay = videoWatched && allExercisesCompleted;
  const progressValue = ((videoWatched ? 1 : 0) + completedExercises.length) / (1 + exercises.length) * 100;

  // Group exercises by area
  const exercisesByArea = exercises.reduce((acc, ex) => {
    const area = ex.area || 'being';
    if (!acc[area]) acc[area] = [];
    acc[area].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/challenge')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Back to Challenge' : 'Înapoi la Provocare'}
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${content.color}`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1">
                {language === 'en' ? `Day ${dayNumber}` : `Ziua ${dayNumber}`}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
            </div>
          </div>
          
          {/* Focus Areas */}
          <div className="flex flex-wrap gap-2 mb-3">
            {content.focusAreas.map((area) => (
              <Badge key={area} className={`${areaColors[area]} text-xs`}>
                {language === 'en' ? areaLabels[area].en : areaLabels[area].ro}
              </Badge>
            ))}
          </div>
          
          <p className="text-primary font-medium mb-2">{principle}</p>
          <p className="text-muted-foreground">{description}</p>
          
          <Progress value={progressValue} className="h-2 mt-4" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(progressValue)}% {language === 'en' ? 'complete' : 'complet'}
          </p>
        </div>

        {/* Video Section */}
        <Card className="p-6 mb-6 bg-card border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              {language === 'en' ? 'Video Lesson' : 'Lecție Video'}
            </h2>
            {videoWatched && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
          
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">{content.videoPlaceholder}</p>
            </div>
          </div>
          
          {!videoWatched && (
            <Button 
              onClick={handleWatchVideo}
              className={`w-full bg-gradient-to-r ${content.color}`}
            >
              <Play className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Mark as Watched' : 'Marchează ca Vizionat'}
            </Button>
          )}
        </Card>

        {/* Steps Section */}
        <Card className="p-6 mb-6 bg-card border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              {language === 'en' ? 'Today\'s Steps' : 'Pașii de Astăzi'}
            </h2>
          </div>
          
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Exercises by Area */}
        <Card className="p-6 mb-6 bg-card border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <BookMarked className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              {language === 'en' ? 'Exercises' : 'Exerciții'}
            </h2>
            <span className="text-sm text-muted-foreground">
              ({completedExercises.length}/{exercises.length})
            </span>
          </div>
          
          <div className="space-y-6">
            {content.focusAreas.map((area) => {
              const areaExercises = exercisesByArea[area] || [];
              if (areaExercises.length === 0) return null;
              
              return (
                <div key={area}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`${areaColors[area]} text-xs`}>
                      {language === 'en' ? areaLabels[area].en : areaLabels[area].ro}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {areaExercises.map((exercise) => {
                      const isExerciseCompleted = completedExercises.includes(exercise.id);
                      return (
                        <div 
                          key={exercise.id}
                          className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                            isExerciseCompleted 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : 'bg-muted/50 border-border hover:border-primary/30'
                          }`}
                        >
                          <Checkbox 
                            checked={isExerciseCompleted}
                            onCheckedChange={() => handleToggleExercise(exercise.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className={`font-medium ${isExerciseCompleted ? 'text-green-500' : 'text-foreground'}`}>
                              {exercise.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{exercise.description}</p>
                            {exercise.link && (
                              <Link to={exercise.link}>
                                <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-primary">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {exercise.linkLabel}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Answers History Section */}
        <div className="mb-6">
          <ChallengeAnswersHistory dayNumber={dayNumber} />
        </div>

        {/* Complete Day Button */}
        <Card className={`p-6 ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'}`}>
          {isCompleted ? (
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-green-500 mb-2">
                {language === 'en' ? 'Day Completed!' : 'Zi Completată!'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'en' 
                  ? 'Great work! You\'re building your Have It All lifestyle!' 
                  : 'Excelent! Îți construiești stilul de viață Have It All!'}
              </p>
              {dayNumber < 7 && (
                <Button onClick={() => navigate(`/challenge/${dayNumber + 1}`)}>
                  {language === 'en' ? 'Continue to Day' : 'Continuă la Ziua'} {dayNumber + 1}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {language === 'en' ? 'Complete Day ' : 'Completează Ziua '}{dayNumber}
              </h3>
              <p className="text-muted-foreground mb-4">
                {canCompleteDay 
                  ? (language === 'en' ? 'You\'re ready to complete this day!' : 'Ești gata să completezi această zi!')
                  : (language === 'en' ? 'Watch the video and complete all exercises' : 'Vizionează videoclipul și completează toate exercițiile')}
              </p>
              <Button 
                size="lg"
                disabled={!canCompleteDay}
                onClick={handleCompleteDay}
                className={`bg-gradient-to-r ${content.color} hover:opacity-90`}
              >
                {language === 'en' ? 'Complete Day' : 'Completează Ziua'}
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ChallengeDayPage;
