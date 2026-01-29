import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Flame, Heart, Target, Zap, BookOpen, Crown,
  CheckCircle2, ArrowLeft, ArrowRight, ListChecks, BookMarked,
  Dumbbell, Brain, Users, Sparkles, ExternalLink, Map, Bell, Trophy
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { ChallengeAnswersHistory } from '@/components/challenge/ChallengeAnswersHistory';
import { ChallengeDay7Complete } from '@/components/challenge/ChallengeDay7Complete';
import { ChallengeComments, ChallengeCommentsRef } from '@/components/challenge/ChallengeComments';
import { ChallengeUpgradeGate } from '@/components/challenge/ChallengeUpgradeGate';
import { 
  Day1WhyQuestions, 
  Day1VisionDeclaration, 
  Day1Commitment, 
  Day1StepsSummary, 
  Day1DeclarationReview, 
  Day1VideoPlaceholder 
} from '@/components/challenge/day1';
import { useDay1Responses } from '@/hooks/useDay1Responses';
import { supabase } from '@/integrations/supabase/client';
import { trackChallengeDayStarted } from '@/lib/facebook-pixel';
import { useToast } from '@/hooks/use-toast';
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
    titleEn: "🔥 VIZIUNE + DECLARAȚIE",
    titleRo: "🔥 VIZIUNE + DECLARAȚIE",
    principleEn: "Day 1: Vision + Declaration (Napoleon Hill)",
    principleRo: "Ziua 1: Viziune + Declarație (Napoleon Hill)",
    descriptionEn: "Set your direction: how does your life look in 1 year across all 4 zones. Write your Personal Declaration (in present tense). Read it morning and evening. Share your declaration with the community.",
    descriptionRo: "Setează direcția: cum arată viața ta peste 1 an în cele 4 zone. Scrie Declarația Personală (la prezent). Citește-o dimineața și seara. Publică declarația în comunitate.",
    videoPlaceholder: "🎬 Video: Vision + Declaration - Napoleon Hill Style",
    icon: Flame,
    color: "from-purple-500 to-indigo-500",
    actionPath: "/challenge/1",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Set your direction for all 4 life zones",
      "Write your Personal Declaration at present tense",
      "Commit to reading it every morning and evening",
      "Share your declaration with the community"
    ],
    stepsRo: [
      "Setează direcția pentru toate cele 4 zone ale vieții",
      "Scrie Declarația Personală la timpul prezent",
      "Angajează-te să o citești în fiecare dimineață și seară",
      "Publică declarația în comunitate"
    ],
    exercisesEn: [
      { id: "ex1", title: "Discover Your WHY", description: "Answer the 5 fundamental questions about your desires and purpose", area: "being" },
      { id: "ex2", title: "Vision Body 2026", description: "Define how your body and health will look in 1 year", area: "body" },
      { id: "ex3", title: "Vision Being 2026", description: "Define your spiritual and purpose goals for 1 year", area: "being" },
      { id: "ex4", title: "Vision Balance 2026", description: "Define your relationship goals for 1 year", area: "balance" },
      { id: "ex5", title: "Vision Business 2026", description: "Define your career and financial goals for 1 year", area: "business" },
      { id: "ex6", title: "Write Declaration", description: "Create your Napoleon Hill style declaration", area: "being" },
      { id: "ex7", title: "Share in Comments", description: "Post your declaration to the community for accountability", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Descoperă DE CE-ul Tău", description: "Răspunde la cele 5 întrebări fundamentale despre dorințele și scopul tău", area: "being" },
      { id: "ex2", title: "Viziune Corp 2026", description: "Definește cum va arăta corpul și sănătatea ta peste 1 an", area: "body" },
      { id: "ex3", title: "Viziune Spirit 2026", description: "Definește obiectivele tale spirituale și de scop pentru 1 an", area: "being" },
      { id: "ex4", title: "Viziune Relații 2026", description: "Definește obiectivele tale de relații pentru 1 an", area: "balance" },
      { id: "ex5", title: "Viziune Business 2026", description: "Definește obiectivele tale de carieră și financiare pentru 1 an", area: "business" },
      { id: "ex6", title: "Scrie Declarația", description: "Creează declarația ta în stilul Napoleon Hill", area: "being" },
      { id: "ex7", title: "Postează în Comentarii", description: "Publică declarația ta în comunitate pentru accountability", area: "balance" }
    ]
  },
  {
    day: 2,
    titleEn: "💪✨ CORP + SPIRIT (Fundația)",
    titleRo: "💪✨ CORP + SPIRIT (Fundația)",
    principleEn: "Day 2: Build Your Foundation - Energy + Peace + Focus",
    principleRo: "Ziua 2: Construiește Fundația - Energie + Pace + Focus",
    descriptionEn: "Understand why Body and Spirit are the foundation (energy + peace + focus). Set objectives on 3 levels: 2026, 90 days, 30 days + simple sustainable daily rituals.",
    descriptionRo: "Înțelege de ce Corpul și Spiritul sunt baza (energie + pace + focus). Setează obiective pe 3 nivele: 2026, 90 zile, 30 zile + câteva ritualuri zilnice simple și sustenabile.",
    videoPlaceholder: "🎬 Video: Body + Spirit - Your Foundation",
    icon: Target,
    color: "from-green-500 to-purple-500",
    actionPath: "/game-objectives",
    focusAreas: ['body', 'being'],
    stepsEn: [
      "Understand why body and spirit are the foundation",
      "Set your Body objectives: 2026 → 90 Days → 30 Days",
      "Set your Spirit objectives: 2026 → 90 Days → 30 Days",
      "Define simple sustainable daily rituals",
      "Share in comments your declaration + 2-3 key objectives"
    ],
    stepsRo: [
      "Înțelege de ce corpul și spiritul sunt fundația",
      "Setează obiectivele Corp: 2026 → 90 Zile → 30 Zile",
      "Setează obiectivele Spirit: 2026 → 90 Zile → 30 Zile",
      "Definește ritualuri zilnice simple și sustenabile",
      "Scrie în comentarii declarația + 2-3 obiective cheie"
    ],
    exercisesEn: [
      { id: "ex1", title: "Body Objectives: 2026 → 90 Days → 30 Days", description: "Set your health and fitness goals on all 3 levels: annual vision, 90-day milestone, monthly focus", area: "body", link: "/game-objectives", linkLabel: "Set Body Goals" },
      { id: "ex2", title: "Spirit Objectives: 2026 → 90 Days → 30 Days", description: "Set your spiritual and purpose goals on all 3 levels: annual vision, 90-day milestone, monthly focus", area: "being", link: "/game-objectives", linkLabel: "Set Spirit Goals" },
      { id: "ex3", title: "Set Daily Rituals", description: "Choose 2-3 simple sustainable daily habits for body & spirit", area: "being" },
      { id: "ex4", title: "Share in Comments", description: "Post your declaration + 2-3 key objectives for Body/Spirit", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Obiective Corp: 2026 → 90 Zile → 30 Zile", description: "Setează obiectivele de sănătate și fitness pe toate cele 3 nivele: viziune anuală, milestone 90 zile, focus lunar", area: "body", link: "/game-objectives", linkLabel: "Setează Obiective Corp" },
      { id: "ex2", title: "Obiective Spirit: 2026 → 90 Zile → 30 Zile", description: "Setează obiectivele spirituale pe toate cele 3 nivele: viziune anuală, milestone 90 zile, focus lunar", area: "being", link: "/game-objectives", linkLabel: "Setează Obiective Spirit" },
      { id: "ex3", title: "Setează Ritualuri Zilnice", description: "Alege 2-3 obiceiuri zilnice simple și sustenabile pentru corp & spirit", area: "being" },
      { id: "ex4", title: "Postează în Comentarii", description: "Postează declarația + 2-3 obiective cheie pentru Corp/Spirit", area: "balance" }
    ]
  },
  {
    day: 3,
    titleEn: "💰💕 BUSINESS + RELAȚII",
    titleRo: "💰💕 BUSINESS + RELAȚII",
    principleEn: "Day 3: Connection & Contribution",
    principleRo: "Ziua 3: Conexiune și Contribuție",
    descriptionEn: "See how Business and Relationships are interconnected. Set objectives and milestones on 3 levels: 2026, 90 days, 30 days + weekly action steps.",
    descriptionRo: "Vezi cum Business-ul și Relațiile sunt interconectate. Setează obiective și etape pe 3 nivele: 2026, 90 zile, 30 zile + pași săptămânali.",
    videoPlaceholder: "🎬 Video: Business + Relationships - Connection & Contribution",
    icon: Target,
    color: "from-pink-500 to-blue-500",
    actionPath: "/game-objectives",
    focusAreas: ['balance', 'business'],
    stepsEn: [
      "Understand the connection between business and relationships",
      "Set your Business objectives: 2026 → 90 Days → 30 Days",
      "Set your Relationship objectives: 2026 → 90 Days → 30 Days",
      "Define weekly action steps",
      "Share in comments: 1 business objective + 1 relationship intention"
    ],
    stepsRo: [
      "Înțelege conexiunea dintre business și relații",
      "Setează obiectivele Business: 2026 → 90 Zile → 30 Zile",
      "Setează obiectivele Relații: 2026 → 90 Zile → 30 Zile",
      "Definește pașii de acțiune săptămânali",
      "Scrie în comentarii: 1 obiectiv business + 1 intenție pentru o relație importantă"
    ],
    exercisesEn: [
      { id: "ex1", title: "Business Objectives: 2026 → 90 Days → 30 Days", description: "Set your career and financial goals on all 3 levels: annual vision, 90-day milestone, monthly focus", area: "business", link: "/game-objectives", linkLabel: "Set Business Goals" },
      { id: "ex2", title: "Relationship Objectives: 2026 → 90 Days → 30 Days", description: "Set your relationship goals on all 3 levels: annual vision, 90-day milestone, monthly focus", area: "balance", link: "/game-objectives", linkLabel: "Set Relationship Goals" },
      { id: "ex3", title: "Weekly Action Steps", description: "Define specific weekly actions for business & relationships", area: "business" },
      { id: "ex4", title: "Share in Comments", description: "Post 1 business objective + 1 intention for an important relationship", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Obiective Business: 2026 → 90 Zile → 30 Zile", description: "Setează obiectivele de carieră și financiare pe toate cele 3 nivele: viziune anuală, milestone 90 zile, focus lunar", area: "business", link: "/game-objectives", linkLabel: "Setează Obiective Business" },
      { id: "ex2", title: "Obiective Relații: 2026 → 90 Zile → 30 Zile", description: "Setează obiectivele de relații pe toate cele 3 nivele: viziune anuală, milestone 90 zile, focus lunar", area: "balance", link: "/game-objectives", linkLabel: "Setează Obiective Relații" },
      { id: "ex3", title: "Pași Săptămânali", description: "Definește acțiuni săptămânale specifice pentru business & relații", area: "business" },
      { id: "ex4", title: "Postează în Comentarii", description: "Postează 1 obiectiv business + 1 intenție pentru o relație importantă", area: "balance" }
    ]
  },
  {
    day: 4,
    titleEn: "🎯 DOMINO DOOR (Plan Săptămânal)",
    titleRo: "🎯 DOMINO DOOR (Planul Săptămânii)",
    principleEn: "Day 4: The Vital Few - Maximum Impact Actions",
    principleRo: "Ziua 4: Puținele Vitale - Acțiuni cu Impact Maxim",
    descriptionEn: "Choose the 'vital few' - few actions with big impact. Use the AI Wizard Domino Door to define your weekly milestone, 4 keys, and connect each action to your WHY. This becomes your Sunday ritual: planning + recap for the next week.",
    descriptionRo: "Alege 'puținele vitale' - acțiuni puține cu impact mare. Folosește AI Wizard Domino Door pentru a defini milestone-ul săptămânii, 4 chei, și conectează fiecare acțiune la DE CE-ul tău. Acesta devine ritualul de duminică: planificare + recap pentru săptămâna următoare.",
    videoPlaceholder: "🎬 Video: Domino Door - Weekly Planning System",
    icon: Target,
    color: "from-amber-500 to-orange-500",
    actionPath: "/door",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Open Domino Door system",
      "Define your weekly milestone - the ONE thing that makes this week a success",
      "Use AI Wizard to create 4 measurable key points",
      "Set concrete actions for each key",
      "Connect each action to your WHY from Day 1",
      "Make this your Sunday ritual",
      "Share milestone + tasks in comments"
    ],
    stepsRo: [
      "Deschide sistemul Domino Door",
      "Definește milestone-ul săptămânii - UN lucru care face săptămâna un succes",
      "Folosește AI Wizard pentru a crea 4 puncte cheie măsurabile",
      "Setează acțiuni concrete pentru fiecare cheie",
      "Conectează fiecare acțiune la DE CE-ul tău din Ziua 1",
      "Transformă asta în ritualul de duminică",
      "Postează milestone + task-uri în comentarii"
    ],
    exercisesEn: [
      { id: "ex1", title: "Open Domino Door", description: "Navigate to the weekly planning system", area: "business", link: "/door", linkLabel: "Open Door" },
      { id: "ex2", title: "Set Weekly Milestone", description: "Define the ONE thing that would make this week a success", area: "business" },
      { id: "ex3", title: "AI Wizard - Key 1", description: "Use AI to create your first measurable key point", area: "business" },
      { id: "ex4", title: "AI Wizard - Key 2", description: "Create your second key point with specific actions", area: "business" },
      { id: "ex5", title: "AI Wizard - Key 3", description: "Create your third key point with responsible person", area: "balance" },
      { id: "ex6", title: "AI Wizard - Key 4", description: "Create your fourth key point with deadline", area: "being" },
      { id: "ex7", title: "Connect to Your WHY", description: "Link each key to your vision declaration from Day 1", area: "being" },
      { id: "ex8", title: "Share in Comments", description: "Post your milestone + Domino Door tasks to the community", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Deschide Domino Door", description: "Navighează la sistemul de planificare săptămânală", area: "business", link: "/door", linkLabel: "Deschide Door" },
      { id: "ex2", title: "Setează Milestone-ul Săptămânii", description: "Definește UN lucru care ar face săptămâna aceasta un succes", area: "business" },
      { id: "ex3", title: "AI Wizard - Cheie 1", description: "Folosește AI pentru a crea primul punct cheie măsurabil", area: "business" },
      { id: "ex4", title: "AI Wizard - Cheie 2", description: "Creează al doilea punct cheie cu acțiuni specifice", area: "business" },
      { id: "ex5", title: "AI Wizard - Cheie 3", description: "Creează al treilea punct cheie cu persoana responsabilă", area: "balance" },
      { id: "ex6", title: "AI Wizard - Cheie 4", description: "Creează al patrulea punct cheie cu deadline", area: "being" },
      { id: "ex7", title: "Conectează la DE CE-ul Tău", description: "Leagă fiecare cheie de declarația ta din Ziua 1", area: "being" },
      { id: "ex8", title: "Postează în Comentarii", description: "Publică milestone + task-urile Domino Door în comunitate", area: "balance" }
    ]
  },
  {
    day: 5,
    titleEn: "✨ VISION AI + WARRIOR ROUTINE",
    titleRo: "✨ VIZIUNE AI + WARRIOR ROUTINE",
    principleEn: "Day 5: One-Click Execution",
    principleRo: "Ziua 5: Execuție cu Un Click",
    descriptionEn: "Generate your Vision AI board on 4 quadrants: Body/Being/Balance/Business (daily visual). Set up your personalized Warrior Routine with actions/habits in each category. After setup: start daily with 'Start Routine' - no mental negotiation.",
    descriptionRo: "Generează Vision AI pe 4 cadrane: Corp/Spirit/Relații/Business (vizual zilnic). Setează Warrior Routine personalizată cu acțiuni/obiceiuri în fiecare categorie. După setare: începi zilnic cu 'Start Routine' - fără negociere mentală.",
    videoPlaceholder: "🎬 Video: Vision AI + Warrior Routine - One-Click Execution",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500",
    actionPath: "/vision-board",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Open Vision AI generator",
      "Generate Body quadrant image",
      "Generate Being quadrant image",
      "Generate Balance quadrant image",
      "Generate Business quadrant image",
      "Configure Warrior Routine with habits in each category",
      "Test 'Start Routine' button",
      "Share daily action in comments"
    ],
    stepsRo: [
      "Deschide generatorul Vision AI",
      "Generează imaginea pentru cadranul Corp",
      "Generează imaginea pentru cadranul Spirit",
      "Generează imaginea pentru cadranul Relații",
      "Generează imaginea pentru cadranul Business",
      "Configurează Warrior Routine cu obiceiuri în fiecare categorie",
      "Testează butonul 'Start Routine'",
      "Postează acțiunea zilnică în comentarii"
    ],
    exercisesEn: [
      { id: "ex1", title: "Vision AI - Body", description: "Generate an AI image for your body/fitness goals", area: "body", link: "/vision-board", linkLabel: "Generate Vision" },
      { id: "ex2", title: "Vision AI - Being", description: "Generate an AI image for your spiritual/purpose goals", area: "being", link: "/vision-board", linkLabel: "Generate Vision" },
      { id: "ex3", title: "Vision AI - Balance", description: "Generate an AI image for your relationship goals", area: "balance", link: "/vision-board", linkLabel: "Generate Vision" },
      { id: "ex4", title: "Vision AI - Business", description: "Generate an AI image for your career/business goals", area: "business", link: "/vision-board", linkLabel: "Generate Vision" },
      { id: "ex5", title: "Configure Warrior Routine", description: "Set up your personalized morning routine with habits", area: "being", link: "/daily-flow", linkLabel: "Configure Routine" },
      { id: "ex6", title: "Test Start Routine", description: "Click 'Start Routine' to experience the flow", area: "being", link: "/daily-flow", linkLabel: "Start Routine" },
      { id: "ex7", title: "Share Daily Action", description: "Post 1 daily action from your routine that brings you closest to your vision", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Vision AI - Corp", description: "Generează o imagine AI pentru obiectivele tale de corp/fitness", area: "body", link: "/vision-board", linkLabel: "Generează Viziune" },
      { id: "ex2", title: "Vision AI - Spirit", description: "Generează o imagine AI pentru obiectivele tale spirituale/de scop", area: "being", link: "/vision-board", linkLabel: "Generează Viziune" },
      { id: "ex3", title: "Vision AI - Relații", description: "Generează o imagine AI pentru obiectivele tale de relații", area: "balance", link: "/vision-board", linkLabel: "Generează Viziune" },
      { id: "ex4", title: "Vision AI - Business", description: "Generează o imagine AI pentru obiectivele tale de carieră/business", area: "business", link: "/vision-board", linkLabel: "Generează Viziune" },
      { id: "ex5", title: "Configurează Warrior Routine", description: "Setează rutina ta matinală personalizată cu obiceiuri", area: "being", link: "/daily-flow", linkLabel: "Configurează Rutina" },
      { id: "ex6", title: "Testează Start Routine", description: "Apasă 'Start Routine' pentru a experimenta flow-ul", area: "being", link: "/daily-flow", linkLabel: "Începe Rutina" },
      { id: "ex7", title: "Postează Acțiunea Zilnică", description: "Postează 1 acțiune zilnică din rutina ta care te apropie cel mai mult de viziune", area: "balance" }
    ]
  },
  {
    day: 6,
    titleEn: "🧠 ACCOUNTABILITY COACH + MIND COACH (STACK)",
    titleRo: "🧠 ACCOUNTABILITY COACH + MIND COACH (STACK)",
    principleEn: "Day 6: Transform Fear, Anger, Doubt into Power",
    principleRo: "Ziua 6: Transformă Frica, Furia, Îndoiala în Putere",
    descriptionEn: "The Accountability Coach knows everything: tells you what's missing and what's next. If no routine → 'Start routine'. If no Domino Door → 'Create Domino Door'. It brings you back on track. Mind Coach / STACK (daily, at the start of routine): transform fear, anger, sadness, doubt, procrastination → power. Identify the emotion + the story behind it + what you want + why + next step.",
    descriptionRo: "Accountability Coach știe tot: îți spune ce lipsește și ce urmează. Dacă nu ai routine → 'Start routine'. Dacă nu ai Domino Door → 'Create Domino Door'. Te readuce pe traseu. Mind Coach / STACK (zilnic, la începutul rutinei): transformă frica, furia, tristețea, îndoiala, procrastinarea → putere. Identifică emoția + povestea din spate + ce vrei + de ce + următorul pas.",
    videoPlaceholder: "🎬 Video: Accountability Coach + STACK Mind Transformation",
    icon: Brain,
    color: "from-red-500 to-pink-500",
    actionPath: "/stack",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Open Accountability Coach widget on Dashboard",
      "See what's missing (routine, door, goals)",
      "Follow the Coach's recommendations",
      "Open STACK for emotional transformation",
      "Identify the limiting emotion",
      "Discover the story behind it",
      "Define what you really want + why",
      "Set your next step",
      "Share your breakthrough in comments"
    ],
    stepsRo: [
      "Deschide widget-ul Accountability Coach pe Dashboard",
      "Vezi ce lipsește (rutină, door, obiective)",
      "Urmează recomandările Coach-ului",
      "Deschide STACK pentru transformare emoțională",
      "Identifică emoția limitatoare",
      "Descoperă povestea din spate",
      "Definește ce vrei de fapt + de ce",
      "Setează următorul pas",
      "Postează breakthrough-ul în comentarii"
    ],
    exercisesEn: [
      { id: "ex1", title: "Meet Accountability Coach", description: "Open the Accountability Coach widget and see your status", area: "being", link: "/dashboard", linkLabel: "Open Dashboard" },
      { id: "ex2", title: "Check Missing Items", description: "Let the Coach tell you what's incomplete (routine, door, goals)", area: "business" },
      { id: "ex3", title: "Follow Recommendations", description: "Complete 1 item the Coach recommends", area: "being" },
      { id: "ex4", title: "Open STACK", description: "Navigate to the STACK emotional transformation system", area: "being", link: "/stack", linkLabel: "Open STACK" },
      { id: "ex5", title: "Identify the Emotion", description: "Name the limiting emotion (fear, anger, sadness, doubt, procrastination)", area: "being" },
      { id: "ex6", title: "Discover the Story", description: "Uncover the story behind this emotion", area: "being" },
      { id: "ex7", title: "Transform to Power", description: "Define what you want + why + your next step", area: "being" },
      { id: "ex8", title: "Share Your Breakthrough", description: "Post in comments: what story are you leaving behind / what changed", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Întâlnește Accountability Coach", description: "Deschide widget-ul Accountability Coach și vezi statusul tău", area: "being", link: "/dashboard", linkLabel: "Deschide Dashboard" },
      { id: "ex2", title: "Verifică Ce Lipsește", description: "Lasă Coach-ul să-ți spună ce e incomplet (rutină, door, obiective)", area: "business" },
      { id: "ex3", title: "Urmează Recomandările", description: "Completează 1 item pe care Coach-ul îl recomandă", area: "being" },
      { id: "ex4", title: "Deschide STACK", description: "Navighează la sistemul de transformare emoțională STACK", area: "being", link: "/stack", linkLabel: "Deschide STACK" },
      { id: "ex5", title: "Identifică Emoția", description: "Denumește emoția limitatoare (frică, furie, tristețe, îndoială, procrastinare)", area: "being" },
      { id: "ex6", title: "Descoperă Povestea", description: "Descoperă povestea din spatele acestei emoții", area: "being" },
      { id: "ex7", title: "Transformă în Putere", description: "Definește ce vrei + de ce + următorul pas", area: "being" },
      { id: "ex8", title: "Postează Breakthrough-ul", description: "Postează în comentarii: ce poveste lași în urmă / ce s-a schimbat", area: "balance" }
    ]
  },
  {
    day: 7,
    titleEn: "🏆 INTEGRARE + CONTINUARE",
    titleRo: "🏆 INTEGRARE + CONTINUARE",
    principleEn: "Day 7: Full System Integration + Membership",
    principleRo: "Ziua 7: Integrare Completă a Sistemului + Membership",
    descriptionEn: "Put the whole system together: vision + domino door + routine + stack + accountability. Decision: how do you continue to keep the momentum? Early bird membership plans available.",
    descriptionRo: "Pui tot sistemul împreună: viziune + domino door + rutină + stack + accountability. Decizia: cum continui ca să nu se stingă momentum-ul? Planuri early bird disponibile.",
    videoPlaceholder: "",
    icon: Trophy,
    color: "from-amber-500 to-yellow-600",
    actionPath: "/challenge/7",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [],
    stepsRo: [],
    exercisesEn: [],
    exercisesRo: []
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
    loading,
    isAuthenticated,
    hasPremiumAccess
  } = useChallengeProgress();
  
  const { toast } = useToast();

  const [videoWatched, setVideoWatched] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [day1Step, setDay1Step] = useState(0); // 0: Why, 1: Vision, 2: Tour, 3: Commitment
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [declarationSaved, setDeclarationSaved] = useState(false);
  
  // Ref for comments to post declaration
  const commentsRef = useRef<ChallengeCommentsRef>(null);
  
  // Day 1 responses hook
  const { 
    responses: day1Responses, 
    isLoading: day1Loading, 
    isSaving: day1Saving,
    saveResponses: saveDay1Responses,
    updateResponses: updateDay1Responses 
  } = useDay1Responses();

  const content = challengeContent.find(c => c.day === dayNumber);
  
  // Special render for Day 7
  if (dayNumber === 7) {
    return <ChallengeDay7Complete />;
  }
  
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

  // Track challenge day started and restore progress
  React.useEffect(() => {
    if (dayProgress) {
      setVideoWatched(dayProgress.video_watched);
      setCompletedExercises(dayProgress.actions_completed);
    }
    // Track that user started this challenge day (only once per session)
    const sessionKey = `challenge_day_${dayNumber}_tracked`;
    if (!sessionStorage.getItem(sessionKey) && isUnlocked) {
      trackChallengeDayStarted(dayNumber);
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [dayProgress, dayNumber, isUnlocked]);

  // Check access for Day 3+ (requires premium or trial)
  useEffect(() => {
    if (dayNumber >= 3 && isAuthenticated && !loading) {
      if (!hasPremiumAccess) {
        setShowUpgradeModal(true);
      }
    }
  }, [dayNumber, isAuthenticated, hasPremiumAccess, loading]);

  // Show upgrade modal for premium days
  if (showUpgradeModal && !hasPremiumAccess) {
    return (
      <Layout>
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/challenge')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Back to Challenge' : 'Înapoi la Provocare'}
          </Button>
          <ChallengeUpgradeGate onClose={() => navigate('/challenge')} />
        </div>
      </Layout>
    );
  }

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
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/challenge/${dayNumber}`);
      return;
    }
    setVideoWatched(true);
    await markVideoWatched(dayNumber);
  };

  const handleToggleExercise = async (exerciseId: string) => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/challenge/${dayNumber}`);
      return;
    }
    if (completedExercises.includes(exerciseId)) return;
    
    const newCompleted = [...completedExercises, exerciseId];
    setCompletedExercises(newCompleted);
    await completeAction(dayNumber, exerciseId);
  };

  const handleCompleteDay = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/challenge/${dayNumber}&action=complete`);
      return;
    }
    await completeDay(dayNumber);
    if (dayNumber < 7) {
      navigate(`/challenge/${dayNumber + 1}`);
    } else {
      navigate('/challenge');
    }
  };

  const allExercisesCompleted = exercises.every(ex => completedExercises.includes(ex.id));
  const canCompleteDay = allExercisesCompleted;
  const progressValue = (completedExercises.length / exercises.length) * 100;

  // Group exercises by area
  const exercisesByArea = exercises.reduce((acc, ex) => {
    const area = ex.area || 'being';
    if (!acc[area]) acc[area] = [];
    acc[area].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  // State for user's name
  const [userName, setUserName] = useState('');

  // Fetch user name for vision declaration
  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        // Extract name from email and capitalize
        const namePart = user.email.split('@')[0];
        // Remove numbers and special chars, capitalize first letter
        const cleanName = namePart.replace(/[0-9._-]/g, ' ').trim().split(' ')[0];
        setUserName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase());
      }
    };
    fetchUserName();
  }, []);

  // Special render for Day 1 - Simplified 3-step flow
  if (dayNumber === 1) {
    // Check if user already has a declaration (returning user)
    const hasExistingDeclaration = Boolean(
      day1Responses.vision_declaration && 
      day1Responses.vision_declaration.length > 50
    );
    
    const day1Progress = hasExistingDeclaration ? 100 : ((day1Step + 1) / 3) * 100;
    
    const handleDay1Complete = async () => {
      if (!isAuthenticated) {
        navigate('/auth?redirect=/challenge/1');
        return;
      }
      
      const saved = await saveDay1Responses({
        ...day1Responses,
        commitment_confirmed: true
      });
      
      if (saved) {
        await completeDay(1);
        navigate('/challenge/2');
      }
    };

    const handlePostDeclaration = async (declaration: string) => {
      if (!commentsRef.current) return;
      const success = await commentsRef.current.postComment(declaration);
      if (success) {
        toast({
          title: language === 'en' ? '🎉 Shared!' : '🎉 Distribuit!',
          description: language === 'en' 
            ? 'Your declaration has been shared with the community!' 
            : 'Declarația ta a fost distribuită în comunitate!',
        });
      }
    };

    return (
      <Layout>
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
          {/* Login Banner */}
          {!isAuthenticated && (
            <Card className="p-4 mb-6 bg-amber-500/10 border-amber-500/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-medium text-foreground">
                    {language === 'en' ? '🔐 Save Your Progress' : '🔐 Salvează-ți Progresul'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'Create a free account to track your challenge progress' 
                      : 'Creează un cont gratuit pentru a-ți urmări progresul'}
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/auth?redirect=/challenge/1')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500"
                >
                  {language === 'en' ? 'Create Free Account' : 'Creează Cont Gratuit'}
                </Button>
              </div>
            </Card>
          )}
          
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
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
                <Flame className="h-8 w-8 text-white" />
              </div>
              <div>
                <Badge variant="outline" className="mb-1">
                  {language === 'en' ? 'Day 1' : 'Ziua 1'}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {language === 'en' ? '🔥 THE FOUNDATION' : '🔥 FUNDAȚIA TRANSFORMĂRII'}
                </h1>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Discover your BIG WHY and create your vision declaration in Napoleon Hill style.' 
                : 'Descoperă-ți MARELE DE CE și creează declarația ta de viziune în stilul Napoleon Hill.'}
            </p>
            
            <Progress value={day1Progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {hasExistingDeclaration 
                ? (language === 'en' ? 'Completed ✓' : 'Completat ✓')
                : `${language === 'en' ? 'Step' : 'Pasul'} ${day1Step + 1} / 3`
              }
            </p>
          </div>
          
          {/* Video Placeholder */}
          <Day1VideoPlaceholder />
          
          {/* Steps Summary */}
          <Day1StepsSummary currentStep={hasExistingDeclaration ? 3 : day1Step} />
          
          {/* RETURNING USER: Show declaration review */}
          {hasExistingDeclaration ? (
            <>
              <Day1DeclarationReview
                declaration={day1Responses.vision_declaration || ''}
                onPostToComments={handlePostDeclaration}
                onEdit={() => setDay1Step(1)}
              />
            </>
          ) : (
            <>
              {/* NEW USER: Step-by-step flow */}
              {day1Step === 0 && (
                <Day1WhyQuestions
                  responses={{
                    question_1: day1Responses.question_1 || '',
                    question_2: day1Responses.question_2 || '',
                    question_3: day1Responses.question_3 || '',
                    question_4: day1Responses.question_4 || '',
                    question_5: day1Responses.question_5 || ''
                  }}
                  onResponsesChange={(data) => updateDay1Responses(data)}
                  onComplete={async () => {
                    if (isAuthenticated) {
                      await saveDay1Responses(day1Responses);
                    }
                    setDay1Step(1);
                  }}
                />
              )}
              
              {day1Step === 1 && (
                <Day1VisionDeclaration
                  visionData={{
                    vision_body: day1Responses.vision_body || '',
                    vision_spirit: day1Responses.vision_spirit || '',
                    vision_relationships: day1Responses.vision_relationships || '',
                    vision_business: day1Responses.vision_business || '',
                    vision_declaration: day1Responses.vision_declaration || '',
                    target_date: day1Responses.target_date || '',
                    what_i_will_give: day1Responses.what_i_will_give || ''
                  }}
                  onVisionChange={(data) => updateDay1Responses(data)}
                  onComplete={async (finalVisionData) => {
                    if (isAuthenticated) {
                      const saved = await saveDay1Responses({
                        ...day1Responses,
                        ...finalVisionData
                      });
                      if (!saved) return;
                    }
                    updateDay1Responses(finalVisionData);
                    setDeclarationSaved(true);
                    setDay1Step(2);
                  }}
                  userName={userName}
                  declarationSaved={declarationSaved}
                  onPostToComments={handlePostDeclaration}
                />
              )}
              
              {day1Step === 2 && (
                <Day1Commitment
                  isCommitted={day1Responses.commitment_confirmed || false}
                  onCommitmentChange={(committed) => updateDay1Responses({ commitment_confirmed: committed })}
                  onComplete={handleDay1Complete}
                  isLoading={day1Saving}
                />
              )}
              
              {/* Step Navigation */}
              {day1Step > 0 && (
                <div className="mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setDay1Step(day1Step - 1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Previous Step' : 'Pasul Anterior'}
                  </Button>
                </div>
              )}
            </>
          )}
          
          {/* Comments Section - ALWAYS visible */}
          <div className="mt-6">
            <ChallengeComments ref={commentsRef} dayNumber={1} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Login Banner for Unauthenticated Users */}
        {!isAuthenticated && (
          <Card className="p-4 mb-6 bg-amber-500/10 border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-medium text-foreground">
                  {language === 'en' ? '🔐 Save Your Progress' : '🔐 Salvează-ți Progresul'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Create a free account to track your challenge progress' 
                    : 'Creează un cont gratuit pentru a-ți urmări progresul'}
                </p>
              </div>
              <Button 
                onClick={() => navigate(`/auth?redirect=/challenge/${dayNumber}`)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 whitespace-nowrap"
              >
                {language === 'en' ? 'Create Free Account' : 'Creează Cont Gratuit'}
              </Button>
            </div>
          </Card>
        )}
        
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

        {/* Challenge Comments Section */}
        <div className="mb-6">
          <ChallengeComments dayNumber={dayNumber} />
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
                  : (language === 'en' ? 'Complete all exercises to finish this day' : 'Completează toate exercițiile pentru a finaliza această zi')}
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
