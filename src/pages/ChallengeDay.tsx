import React, { useState, useEffect } from 'react';
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
import { Day1WhyQuestions, Day1VisionDeclaration, Day1PlatformTour, Day1Commitment } from '@/components/challenge/day1';
import { useDay1Responses } from '@/hooks/useDay1Responses';
import { supabase } from '@/integrations/supabase/client';
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
    titleEn: "🚀 PLATFORM TOUR",
    titleRo: "🚀 TOUR PLATFORMĂ",
    principleEn: "Day 1: Discover All Platform Tools",
    principleRo: "Ziua 1: Descoperă Toate Instrumentele Platformei",
    descriptionEn: "Welcome to your 7-day transformation! Today you'll explore the platform and discover all the powerful tools at your disposal. This is your home base for becoming the best version of yourself.",
    descriptionRo: "Bine ai venit la transformarea ta de 7 zile! Astăzi vei explora platforma și vei descoperi toate instrumentele puternice la dispoziția ta. Aceasta este baza ta pentru a deveni cea mai bună versiune a ta.",
    videoPlaceholder: "🎬 Video: Platform Tour - Your Transformation Hub (Coming Soon)",
    icon: Map,
    color: "from-purple-500 to-indigo-500",
    actionPath: "/dashboard",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Explore the Dashboard and understand your progress metrics",
      "Visit the Life Design Blueprint section",
      "Check out the Fitness Hub features",
      "Explore the Champion Routine module",
      "Browse the Stack collection"
    ],
    stepsRo: [
      "Explorează Dashboard-ul și înțelege metricile de progres",
      "Vizitează secțiunea Life Design Blueprint",
      "Verifică funcționalitățile Fitness Hub",
      "Explorează modulul Champion Routine",
      "Răsfoiește colecția de Stack-uri"
    ],
    exercisesEn: [
      { id: "ex1", title: "Explore Dashboard", description: "Visit the main dashboard and familiarize yourself with the layout", link: "/dashboard", linkLabel: "Open Dashboard" },
      { id: "ex2", title: "Annual Objectives", description: "Open the Annual Objectives section and set your goals for Body, Being, Balance & Business", area: "being", link: "/door?tab=annual", linkLabel: "Open Annual Goals" },
      { id: "ex3", title: "Fitness Hub Preview", description: "Check out the workout and nutrition tracking features", area: "body", link: "/fitness", linkLabel: "Open Fitness Hub" },
      { id: "ex4", title: "Champion Routine", description: "Preview the morning routine configuration", area: "being", link: "/champion-routine", linkLabel: "Open Champion Routine" },
      { id: "ex5", title: "Stack Explorer", description: "Browse the AI-powered coaching stacks", area: "business", link: "/stack", linkLabel: "Open Stacks" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Explorează Dashboard", description: "Vizitează dashboard-ul principal și familiarizează-te cu layout-ul", link: "/dashboard", linkLabel: "Deschide Dashboard" },
      { id: "ex2", title: "Obiective Anuale", description: "Deschide secțiunea Obiective Anuale și setează obiectivele pentru Corp, Spirit, Relații & Business", area: "being", link: "/door?tab=annual", linkLabel: "Deschide Obiective Anuale" },
      { id: "ex3", title: "Fitness Hub Preview", description: "Verifică funcționalitățile de tracking pentru workout și nutriție", area: "body", link: "/fitness", linkLabel: "Deschide Fitness Hub" },
      { id: "ex4", title: "Champion Routine", description: "Previzualizează configurarea rutinei matinale", area: "being", link: "/champion-routine", linkLabel: "Deschide Champion Routine" },
      { id: "ex5", title: "Stack Explorer", description: "Răsfoiește stack-urile de coaching cu AI", area: "business", link: "/stack", linkLabel: "Deschide Stack-uri" }
    ]
  },
  {
    day: 2,
    titleEn: "💪✨ BODY + BEING",
    titleRo: "💪✨ CORP + SPIRIT",
    principleEn: "Day 2: Annual Objectives for Body & Spirit",
    principleRo: "Ziua 2: Obiective Anuale pentru Corp și Spirit",
    descriptionEn: "Today you'll set your annual objectives for the first two pillars: BODY (physical health, energy, fitness) and BEING (spirituality, purpose, inner peace). These are the foundations of your transformation.",
    descriptionRo: "Astăzi vei seta obiectivele anuale pentru primii doi piloni: CORP (sănătate fizică, energie, fitness) și SPIRIT (spiritualitate, scop, pace interioară). Acestea sunt fundațiile transformării tale.",
    videoPlaceholder: "🎬 Video: Setting Your Body & Being Goals for 2026 (Coming Soon)",
    icon: Target,
    color: "from-green-500 to-purple-500",
    actionPath: "/door?tab=annual",
    focusAreas: ['body', 'being'],
    stepsEn: [
      "Complete the Body section in Life Design Blueprint",
      "Set your annual fitness and health goals",
      "Complete the Being/Spirituality section",
      "Define your purpose and inner peace objectives",
      "Create specific, measurable goals for each area"
    ],
    stepsRo: [
      "Completează secțiunea Corp în Life Design Blueprint",
      "Setează obiectivele anuale de fitness și sănătate",
      "Completează secțiunea Spirit/Spiritualitate",
      "Definește obiectivele tale de scop și pace interioară",
      "Creează obiective specifice și măsurabile pentru fiecare arie"
    ],
    exercisesEn: [
      { id: "ex1", title: "Body Annual Goal", description: "Set your annual Health & Fitness objectives in the Command Center", area: "body", link: "/door?tab=annual", linkLabel: "Set Body Goals" },
      { id: "ex2", title: "Being Annual Goal", description: "Set your annual Spirituality & Purpose objectives in the Command Center", area: "being", link: "/door?tab=annual", linkLabel: "Set Being Goals" },
      { id: "ex3", title: "Review Progress", description: "Confirm you have set clear and measurable goals for Body and Being", area: "being" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Obiectiv Anual Corp", description: "Setează obiectivele anuale de Sănătate & Fitness în Centrul de Comandă", area: "body", link: "/door?tab=annual", linkLabel: "Setează Obiective Corp" },
      { id: "ex2", title: "Obiectiv Anual Spirit", description: "Setează obiectivele anuale de Spiritualitate & Scop în Centrul de Comandă", area: "being", link: "/door?tab=annual", linkLabel: "Setează Obiective Spirit" },
      { id: "ex3", title: "Verifică Progresul", description: "Confirmă că ai setat obiective clare și măsurabile pentru Corp și Spirit", area: "being" }
    ]
  },
  {
    day: 3,
    titleEn: "💕💰 BALANCE + BUSINESS",
    titleRo: "💕💰 RELAȚII + BUSINESS",
    principleEn: "Day 3: Annual Objectives for Relationships & Business",
    principleRo: "Ziua 3: Obiective Anuale pentru Relații și Business",
    descriptionEn: "Today you complete your annual objectives with the remaining two pillars: BALANCE (relationships, love, family) and BUSINESS (career, finances, professional growth). This completes your Have It All vision.",
    descriptionRo: "Astăzi completezi obiectivele anuale cu ultimii doi piloni: RELAȚII (relații, dragoste, familie) și BUSINESS (carieră, finanțe, creștere profesională). Aceasta completează viziunea ta Have It All.",
    videoPlaceholder: "🎬 Video: Setting Your Balance & Business Goals for 2026 (Coming Soon)",
    icon: Target,
    color: "from-pink-500 to-blue-500",
    actionPath: "/door?tab=annual",
    focusAreas: ['balance', 'business'],
    stepsEn: [
      "Complete the Love & Relationships section in Life Design Blueprint",
      "Set your annual relationship goals",
      "Complete the Career & Business section",
      "Define your financial and career objectives",
      "Review all 4 pillars for completeness"
    ],
    stepsRo: [
      "Completează secțiunea Dragoste & Relații în Life Design Blueprint",
      "Setează obiectivele anuale de relații",
      "Completează secțiunea Carieră & Business",
      "Definește obiectivele financiare și de carieră",
      "Revizuiește toți 4 pilonii pentru completitudine"
    ],
    exercisesEn: [
      { id: "ex1", title: "Balance Annual Goal", description: "Set your annual Relationships & Love objectives in the Command Center", area: "balance", link: "/door?tab=annual", linkLabel: "Set Balance Goals" },
      { id: "ex2", title: "Business Annual Goal", description: "Set your annual Career & Business objectives in the Command Center", area: "business", link: "/door?tab=annual", linkLabel: "Set Business Goals" },
      { id: "ex3", title: "Complete Vision Review", description: "Confirm you have set goals for all 4 pillars: Body, Being, Balance, Business", area: "business", link: "/door?tab=annual", linkLabel: "View All Goals" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Obiectiv Anual Relații", description: "Setează obiectivele anuale de Relații & Dragoste în Centrul de Comandă", area: "balance", link: "/door?tab=annual", linkLabel: "Setează Obiective Relații" },
      { id: "ex2", title: "Obiectiv Anual Business", description: "Setează obiectivele anuale de Carieră & Business în Centrul de Comandă", area: "business", link: "/door?tab=annual", linkLabel: "Setează Obiective Business" },
      { id: "ex3", title: "Verifică Viziunea Completă", description: "Confirmă că ai setat obiective pentru toți 4 pilonii: Corp, Spirit, Relații, Business", area: "business", link: "/door?tab=annual", linkLabel: "Vezi Toate Obiectivele" }
    ]
  },
  {
    day: 4,
    titleEn: "🏆 CHAMPION ROUTINE + PERSONALIZATION",
    titleRo: "🏆 RUTINA CAMPIONULUI + PERSONALIZARE",
    principleEn: "Day 4: Configure Your Routine & Personalize Dashboard",
    principleRo: "Ziua 4: Configurează Rutina și Personalizează Dashboard-ul",
    descriptionEn: "Champions are made in the morning! Today you'll configure your personalized Champion Routine and customize your dashboard with the widgets that matter most to you.",
    descriptionRo: "Campionii se fac dimineața! Astăzi vei configura Rutina Campionului personalizată și vei personaliza dashboard-ul cu widget-urile care contează cel mai mult pentru tine.",
    videoPlaceholder: "🎬 Video: The Champion Morning Routine & Dashboard Setup (Coming Soon)",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    actionPath: "/champion-routine",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Open Champion Routine configuration",
      "Select your morning practice activities",
      "Set durations for each activity",
      "Configure your wake-up time",
      "Personalize your dashboard widgets",
      "Select your goal categories"
    ],
    stepsRo: [
      "Deschide configurarea Champion Routine",
      "Selectează activitățile de practică matinală",
      "Setează duratele pentru fiecare activitate",
      "Configurează ora de trezire",
      "Personalizează widget-urile dashboard-ului",
      "Selectează categoriile de obiective"
    ],
    exercisesEn: [
      { id: "ex1", title: "Open Champion Routine", description: "Navigate to the Champion Routine setup wizard", link: "/champion-routine", linkLabel: "Configure Routine" },
      { id: "ex2", title: "Select Body Activities", description: "Choose morning exercise and movement practices", area: "body" },
      { id: "ex3", title: "Select Being Activities", description: "Choose meditation, journaling, and gratitude practices", area: "being" },
      { id: "ex4", title: "Set Durations", description: "Configure how long each activity should take", area: "being" },
      { id: "ex5", title: "Complete Routine Setup", description: "Finalize and save your personalized morning routine", link: "/champion-routine", linkLabel: "Complete Setup" },
      { id: "ex6", title: "Personalize Dashboard", description: "Choose which widgets to display on your dashboard", link: "/dashboard/settings", linkLabel: "Dashboard Settings" },
      { id: "ex7", title: "Select Goal Categories", description: "Choose between 4 or 12 categories for your objectives", link: "/dashboard/settings", linkLabel: "Category Settings" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Deschide Champion Routine", description: "Navighează la wizardul de configurare Champion Routine", link: "/champion-routine", linkLabel: "Configurează Rutina" },
      { id: "ex2", title: "Selectează Activități Corp", description: "Alege exercițiile de dimineață și practicile de mișcare", area: "body" },
      { id: "ex3", title: "Selectează Activități Spirit", description: "Alege practicile de meditație, jurnalizare și gratitudine", area: "being" },
      { id: "ex4", title: "Setează Duratele", description: "Configurează cât ar trebui să dureze fiecare activitate", area: "being" },
      { id: "ex5", title: "Completează Setup Rutină", description: "Finalizează și salvează rutina matinală personalizată", link: "/champion-routine", linkLabel: "Completează Setup" },
      { id: "ex6", title: "Personalizează Dashboard", description: "Alege ce widget-uri să afișezi pe dashboard", link: "/dashboard/settings", linkLabel: "Setări Dashboard" },
      { id: "ex7", title: "Selectează Categorii Obiective", description: "Alege între 4 sau 12 categorii pentru obiectivele tale", link: "/dashboard/settings", linkLabel: "Setări Categorii" }
    ]
  },
  {
    day: 5,
    titleEn: "✨ AI VISION",
    titleRo: "✨ VIZIUNE AI",
    principleEn: "Day 5: Generate AI-Powered Vision & Meditation",
    principleRo: "Ziua 5: Generează Viziune și Meditație cu AI",
    descriptionEn: "Unlock the power of AI! Today you'll use our AI tools to generate powerful vision board images and create a personalized meditation based on YOUR specific goals and dreams.",
    descriptionRo: "Deblochează puterea AI-ului! Astăzi vei folosi instrumentele noastre AI pentru a genera imagini puternice pentru vision board și a crea o meditație personalizată bazată pe obiectivele și visurile TALE specifice.",
    videoPlaceholder: "🎬 Video: AI-Powered Visualization & Meditation (Coming Soon)",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500",
    actionPath: "/vision-2026/ai-vision-board",
    focusAreas: ['being'],
    stepsEn: [
      "Navigate to AI Vision Board generator",
      "Generate images for your goals",
      "Create a personalized AI meditation",
      "Save your vision board",
      "Listen to your custom meditation"
    ],
    stepsRo: [
      "Navighează la generatorul AI Vision Board",
      "Generează imagini pentru obiectivele tale",
      "Creează o meditație personalizată cu AI",
      "Salvează-ți vision board-ul",
      "Ascultă meditația ta personalizată"
    ],
    exercisesEn: [
      { id: "ex1", title: "AI Vision Board", description: "Open the AI Vision Board generator and create images for your 2026 goals", area: "being", link: "/vision-2026/ai-vision-board", linkLabel: "Generate Vision Board" },
      { id: "ex2", title: "Body Goal Image", description: "Generate an AI image representing your body/fitness goal", area: "being" },
      { id: "ex3", title: "Success Image", description: "Generate an AI image representing your business/career success", area: "being" },
      { id: "ex4", title: "Personalized Meditation", description: "Create an AI-generated meditation script based on your objectives", area: "being", link: "/stack?type=divine-prayer", linkLabel: "Create Meditation" },
      { id: "ex5", title: "Save & Review", description: "Save your vision board and listen to your personalized meditation", area: "being" }
    ],
    exercisesRo: [
      { id: "ex1", title: "AI Vision Board", description: "Deschide generatorul AI Vision Board și creează imagini pentru obiectivele 2026", area: "being", link: "/vision-2026/ai-vision-board", linkLabel: "Generează Vision Board" },
      { id: "ex2", title: "Imagine Obiectiv Corp", description: "Generează o imagine AI reprezentând obiectivul tău de corp/fitness", area: "being" },
      { id: "ex3", title: "Imagine Succes", description: "Generează o imagine AI reprezentând succesul tău în business/carieră", area: "being" },
      { id: "ex4", title: "Meditație Personalizată", description: "Creează un script de meditație generat de AI bazat pe obiectivele tale", area: "being", link: "/stack?type=divine-prayer", linkLabel: "Creează Meditație" },
      { id: "ex5", title: "Salvează & Revizuiește", description: "Salvează vision board-ul și ascultă meditația personalizată", area: "being" }
    ]
  },
  {
    day: 6,
    titleEn: "🔔 ACCOUNTABILITY",
    titleRo: "🔔 ACCOUNTABILITY",
    principleEn: "Day 6: Set Up Your Notification & Accountability System",
    principleRo: "Ziua 6: Configurează Sistemul de Notificări și Accountability",
    descriptionEn: "Consistency beats intensity! Today you'll configure your notification system and accountability measures to ensure you stay on track with your transformation. Set reminders and find your accountability partner.",
    descriptionRo: "Consistența bate intensitatea! Astăzi vei configura sistemul de notificări și măsurile de accountability pentru a te asigura că rămâi pe drumul cel bun cu transformarea ta. Setează reminder-e și găsește-ți partenerul de accountability.",
    videoPlaceholder: "🎬 Video: The Power of Accountability (Coming Soon)",
    icon: Bell,
    color: "from-red-500 to-pink-500",
    actionPath: "/settings",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Configure daily reminder notifications",
      "Set your morning routine reminder time",
      "Enable progress tracking notifications",
      "Identify your accountability partner",
      "Share your commitment with them"
    ],
    stepsRo: [
      "Configurează notificările reminder zilnice",
      "Setează ora reminder-ului pentru rutina matinală",
      "Activează notificările de tracking al progresului",
      "Identifică-ți partenerul de accountability",
      "Împărtășește angajamentul tău cu ei"
    ],
    exercisesEn: [
      { id: "ex1", title: "Daily Reminder", description: "Set a daily reminder for your morning routine", area: "being" },
      { id: "ex2", title: "Weekly Check-in", description: "Configure a weekly progress check-in notification", area: "being" },
      { id: "ex3", title: "Accountability Partner", description: "Identify 1 person who will hold you accountable", area: "balance" },
      { id: "ex4", title: "Share Commitment", description: "Tell your accountability partner about your 2026 goals", area: "balance" },
      { id: "ex5", title: "Calendar Block", description: "Block time in your calendar for your morning routine", area: "being" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Reminder Zilnic", description: "Setează un reminder zilnic pentru rutina ta matinală", area: "being" },
      { id: "ex2", title: "Check-in Săptămânal", description: "Configurează o notificare de check-in săptămânală a progresului", area: "being" },
      { id: "ex3", title: "Partener Accountability", description: "Identifică 1 persoană care te va ține responsabil", area: "balance" },
      { id: "ex4", title: "Împărtășește Angajamentul", description: "Spune partenerului de accountability despre obiectivele tale 2026", area: "balance" },
      { id: "ex5", title: "Blochează Calendar", description: "Blochează timp în calendar pentru rutina ta matinală", area: "being" }
    ]
  },
  {
    day: 7,
    titleEn: "🎯 PUTTING IT ALL TOGETHER",
    titleRo: "🎯 PUNEM TOTUL ÎMPREUNĂ",
    principleEn: "Day 7: Complete Recap + Premium Upgrade",
    principleRo: "Ziua 7: Recapitulare Completă + Upgrade Premium",
    descriptionEn: "Congratulations! You've completed the 7-Day Challenge. Today we review everything you've built, celebrate your progress, and show you how to unlock the full power of the platform.",
    descriptionRo: "Felicitări! Ai completat Challenge-ul de 7 Zile. Astăzi revizuim tot ce ai construit, sărbătorim progresul tău și îți arătăm cum să deblochezi puterea completă a platformei.",
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
    isAuthenticated
  } = useChallengeProgress();

  const [videoWatched, setVideoWatched] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [day1Step, setDay1Step] = useState(0); // 0: Why, 1: Vision, 2: Tour, 3: Commitment
  
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

  // Special render for Day 1 - Napoleon Hill style with 4 steps
  if (dayNumber === 1) {
    const day1Progress = (day1Step / 3) * 100;
    
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
              {language === 'en' ? 'Step' : 'Pasul'} {day1Step + 1} / 4
            </p>
          </div>
          
          {/* Day 1 Steps */}
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
                  // Save with the final data including vision_declaration
                  const saved = await saveDay1Responses({
                    ...day1Responses,
                    ...finalVisionData
                  });

                  if (!saved) return;
                }

                updateDay1Responses(finalVisionData);
                setDay1Step(2);
              }}
              userName={userName}
            />
          )}
          
          {day1Step === 2 && (
            <Day1PlatformTour
              onComplete={() => setDay1Step(3)}
            />
          )}
          
          {day1Step === 3 && (
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
