import React, { useState, useEffect, useRef } from 'react';
import { ProgramsLayout } from '@/components/programs/ProgramsLayout';
import { ChallengeSidebar } from '@/components/programs/ChallengeSidebar';
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
import { COMMUNITY_URL } from '@/config/socialLinks';
import { ChallengeUpgradeGate } from '@/components/challenge/ChallengeUpgradeGate';
import { 
  Day1WhyQuestions, 
  Day1VisionDeclaration, 
  Day1Commitment, 
  Day1StepsSummary, 
  Day1DeclarationReview, 
  Day1VideoPlaceholder,
  Day1RealityCheck,
  Day1InviteFriendsStep
} from '@/components/challenge/day1';
import { ChallengeInviteFriends } from '@/components/challenge/ChallengeInviteFriends';
import { Day1InviteFriends } from '@/components/challenge/day1/Day1InviteFriends';
import { ChallengeAudioPlayer } from '@/components/challenge/ChallengeAudioPlayer';
import { ChallengeScriptCard } from '@/components/challenge/ChallengeScriptCard';
import { ChallengeInlineChat } from '@/components/challenge/ChallengeInlineChat';
import { getDayScriptRo } from '@/data/challengeScriptsRo';
import { getDayScript } from '@/data/challengeScripts';
import { useDay1Responses } from '@/hooks/useDay1Responses';
import { supabase } from '@/integrations/supabase/client';
import { trackChallengeDayStarted } from '@/lib/facebook-pixel';
import { useToast } from '@/hooks/use-toast';
import { ChallengeCoachWidget } from '@/components/challenge/ChallengeCoachWidget';
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
    titleEn: "🔥 VISION + DECLARATION",
    titleRo: "🔥 VIZIUNE + DECLARAȚIE",
    principleEn: "Day 1: Break the Fog — Set Your Direction",
    principleRo: "Ziua 1: Sparge Ceața — Setează Direcția",
    descriptionEn: "Stop drifting. Map where you are today, discover WHY you're stuck, and write your anti-burnout declaration. This is where clarity replaces confusion.",
    descriptionRo: "Oprește deriva. Evaluează unde ești azi, descoperă DE CE ești blocat și scrie declarația ta anti-burnout. Aici claritatea înlocuiește confuzia.",
    videoPlaceholder: "🎬 Video: Vision + Declaration - Napoleon Hill Style",
    icon: Flame,
    color: "from-purple-500 to-indigo-500",
    actionPath: "/challenge/1",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Set your vision for all 4 life zones (1 year)",
      "Write your Personal Declaration at present tense",
      "Commit to reading it every morning and evening"
    ],
    stepsRo: [
      "Setează viziunea pentru toate cele 4 zone ale vieții (1 an)",
      "Scrie Declarația Personală la timpul prezent",
      "Angajează-te să o citești în fiecare dimineață și seară"
    ],
    exercisesEn: [
      { id: "ex1", title: "Discover Your WHY", description: "Answer the 5 fundamental questions about your desires and purpose", area: "being" },
      { id: "ex2", title: "Vision 2026 (All 4 Areas)", description: "Define your vision for Body, Spirit, Relationships, and Business", area: "being" },
      { id: "ex3", title: "Write Declaration", description: "Create your Napoleon Hill style declaration", area: "being" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Descoperă DE CE-ul Tău", description: "Răspunde la cele 5 întrebări fundamentale despre dorințele și scopul tău", area: "being" },
      { id: "ex2", title: "Viziune 2026 (Toate 4 Ariile)", description: "Definește viziunea pentru Corp, Spirit, Relații și Business", area: "being" },
      { id: "ex3", title: "Scrie Declarația", description: "Creează declarația ta în stilul Napoleon Hill", area: "being" }
    ]
  },
  {
    day: 2,
    titleEn: "💪✨💕 BODY + SPIRIT + RELATIONSHIPS",
    titleRo: "💪✨💕 CORP + SPIRIT + RELAȚII",
    principleEn: "Day 2: Rebuild Energy — Body, Spirit & Relationships",
    principleRo: "Ziua 2: Reconstruiește Energia — Corp, Spirit & Relații",
    descriptionEn: "Burnout drained your energy across 3 areas. Today you rebuild: set concrete goals for Body, Spirit, and Relationships. These 3 areas are the anti-burnout foundation.",
    descriptionRo: "Burnout-ul ți-a epuizat energia în 3 arii. Azi reconstruiești: setează obiective concrete pentru Corp, Spirit și Relații. Aceste 3 arii sunt fundația anti-burnout.",
    videoPlaceholder: "🎬 Video: Body + Spirit + Relationships Foundation",
    icon: Target,
    color: "from-green-500 to-purple-500",
    actionPath: "/game-objectives",
    focusAreas: ['body', 'being', 'balance'],
    stepsEn: [
      "Set your Body objectives: 2026 → 90 Days → 30 Days",
      "Set your Spirit objectives: 2026 → 90 Days → 30 Days",
      "Set your Relationship objectives: 2026 → 90 Days → 30 Days",
      "Share in comments your 2-3 key objectives"
    ],
    stepsRo: [
      "Setează obiectivele Corp: 2026 → 90 Zile → 30 Zile",
      "Setează obiectivele Spirit: 2026 → 90 Zile → 30 Zile",
      "Setează obiectivele Relații: 2026 → 90 Zile → 30 Zile",
      "Scrie în comentarii 2-3 obiective cheie"
    ],
    exercisesEn: [
      { id: "ex1", title: "💪 Body Objectives: 2026 → 90 Days → 30 Days", description: "Set your health and fitness goals on all 3 levels", area: "body", link: "/game-objectives?category=body", linkLabel: "Set Body Goals" },
      { id: "ex2", title: "✨ Spirit Objectives: 2026 → 90 Days → 30 Days", description: "Set your spiritual and purpose goals on all 3 levels", area: "being", link: "/game-objectives?category=being", linkLabel: "Set Spirit Goals" },
      { id: "ex3", title: "💕 Relationship Objectives: 2026 → 90 Days → 30 Days", description: "Set your relationship goals on all 3 levels", area: "balance", link: "/game-objectives?category=balance", linkLabel: "Set Relationship Goals" },
      { id: "ex4", title: "Share in Comments", description: "Post your 2-3 key objectives for Body, Spirit, and Relationships", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "💪 Obiective Corp: 2026 → 90 Zile → 30 Zile", description: "Setează obiectivele de sănătate și fitness pe toate cele 3 nivele", area: "body", link: "/game-objectives?category=body", linkLabel: "Setează Obiective Corp" },
      { id: "ex2", title: "✨ Obiective Spirit: 2026 → 90 Zile → 30 Zile", description: "Setează obiectivele spirituale pe toate cele 3 nivele", area: "being", link: "/game-objectives?category=being", linkLabel: "Setează Obiective Spirit" },
      { id: "ex3", title: "💕 Obiective Relații: 2026 → 90 Zile → 30 Zile", description: "Setează obiectivele de relații pe toate cele 3 nivele", area: "balance", link: "/game-objectives?category=balance", linkLabel: "Setează Obiective Relații" },
      { id: "ex4", title: "Postează în Comentarii", description: "Postează 2-3 obiective cheie pentru Corp, Spirit și Relații", area: "balance" }
    ]
  },
  {
    day: 3,
    titleEn: "💰🎯 BUSINESS + DOMINO DOOR",
    titleRo: "💰🎯 BUSINESS + DOMINO DOOR",
    principleEn: "Day 3: Stop Planning, Start Executing — The Domino System",
    principleRo: "Ziua 3: Nu Mai Planifica, Execută — Sistemul Domino",
    descriptionEn: "The #1 burnout trigger: endless planning without executing. Today, the AI Wizard builds your execution machine: Vision to 90-day targets to Weekly Domino Door. No more procrastination loops.",
    descriptionRo: "Cauza #1 a burnout-ului: planificare fără execuție. Azi, Wizard-ul AI îți construiește mașina de execuție: de la Viziune la ținte pe 90 zile la Domino Door săptămânal. Fără cicluri de procrastinare.",
    videoPlaceholder: "🎬 Video: Business + Domino Door - ONE GO",
    icon: Target,
    color: "from-blue-500 to-amber-500",
    actionPath: "/game-objectives?category=business&wizard=full",
    focusAreas: ['business'],
    stepsEn: [
      "Open the Business AI Wizard (ONE GO)",
      "Set Business Vision for 1 year",
      "Define 90-day targets",
      "Set first month milestone",
      "Configure Domino Door: 1 milestone + 4 keys + WHY for each",
      "Share your Domino Door in comments"
    ],
    stepsRo: [
      "Deschide Wizard-ul AI Business (ONE GO)",
      "Setează Viziunea Business pentru 1 an",
      "Definește țintele pe 90 zile",
      "Setează milestone-ul primei luni",
      "Configurează Domino Door: 1 milestone + 4 chei + WHY pentru fiecare",
      "Postează Domino Door-ul în comentarii"
    ],
    exercisesEn: [
      { id: "ex1", title: "💰 Complete Business Flow (ONE GO)", description: "AI Wizard: Annual → 90 Days → Monthly → Weekly Door with 4 keys", area: "business", link: "/game-objectives?category=business&wizard=full", linkLabel: "Start AI Wizard" },
      { id: "ex2", title: "Share Your Domino Door", description: "Post a screenshot or copy-paste your Domino Door in comments", area: "business" }
    ],
    exercisesRo: [
      { id: "ex1", title: "💰 Flow Business Complet (ONE GO)", description: "AI Wizard: Anual → 90 Zile → Lunar → Door Săptămânal cu 4 chei", area: "business", link: "/game-objectives?category=business&wizard=full", linkLabel: "Începe AI Wizard" },
      { id: "ex2", title: "Distribuie Domino Door-ul", description: "Postează un screenshot sau copy-paste cu Domino Door-ul în comentarii", area: "business" }
    ]
  },
  {
    day: 4,
    titleEn: "⚡ WARRIOR ROUTINE + VISION AI + MEDITATION",
    titleRo: "⚡ WARRIOR ROUTINE + VISION AI + MEDITAȚIE",
    principleEn: "Day 4: Build Your Anti-Burnout Routine",
    principleRo: "Ziua 4: Construiește Rutina Ta Anti-Burnout",
    descriptionEn: "A routine that energizes instead of exhausting. Generate AI vision images, create your personalized anti-burnout meditation, and configure a daily flow that builds momentum without draining you.",
    descriptionRo: "O rutină care te energizează în loc să te epuizeze. Generează imagini AI de viziune, creează meditația ta anti-burnout personalizată și configurează un flux zilnic care construiește momentum fără să te consume.",
    videoPlaceholder: "🎬 Video: Vision AI + Personalized Meditation + Warrior Routine",
    icon: Sparkles,
    color: "from-cyan-500 to-purple-500",
    actionPath: "/vision-board",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Generate AI images for all 4 vision quadrants",
      "Create personalized meditation with YOUR objectives",
      "Configure Warrior Routine with your habits",
      "Start your first execution",
      "Post your AHA moment in comments"
    ],
    stepsRo: [
      "Generează imagini AI pentru toate 4 cadranele",
      "Creează meditația personalizată cu obiectivele TALE",
      "Configurează Warrior Routine cu obiceiurile tale",
      "Începe prima ta execuție",
      "Postează momentul tău AHA în comentarii"
    ],
    exercisesEn: [
      { id: "ex1", title: "🎨 Vision AI (4 Quadrants)", description: "Generate AI images for Body, Spirit, Relationships, and Business", area: "being", link: "/vision-board", linkLabel: "Open Vision Board" },
      { id: "ex2", title: "⚡ Configure Warrior Routine", description: "Set up your personalized daily routine with habits", area: "body", link: "/daily-flow", linkLabel: "Configure Routine" },
      { id: "ex3", title: "🧘 Personalized Meditation", description: "Create meditation based on YOUR objectives - it knows your goals!", area: "being", link: "/daily-flow", linkLabel: "Create Meditation" },
      { id: "ex4", title: "🚀 Start Execution", description: "Begin your first daily routine execution", area: "body", link: "/daily-flow", linkLabel: "Start Now" },
      { id: "ex5", title: "💬 Share Your AHA Moment", description: "Post your breakthrough insight in comments", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "🎨 Vision AI (4 Cadrane)", description: "Generează imagini AI pentru Corp, Spirit, Relații și Business", area: "being", link: "/vision-board", linkLabel: "Deschide Vision Board" },
      { id: "ex2", title: "⚡ Configurează Warrior Routine", description: "Setează rutina ta zilnică personalizată cu obiceiuri", area: "body", link: "/daily-flow", linkLabel: "Configurează Rutina" },
      { id: "ex3", title: "🧘 Meditație Personalizată", description: "Creează meditație bazată pe obiectivele TALE - știe goal-urile tale!", area: "being", link: "/daily-flow", linkLabel: "Creează Meditație" },
      { id: "ex4", title: "🚀 Începe Execuția", description: "Începe prima ta execuție a rutinei zilnice", area: "body", link: "/daily-flow", linkLabel: "Începe Acum" },
      { id: "ex5", title: "💬 Postează Momentul AHA", description: "Postează insight-ul tău de breakthrough în comentarii", area: "balance" }
    ]
  },
  {
    day: 5,
    titleEn: "🧠 ACCOUNTABILITY + MIND COACH",
    titleRo: "🧠 ACCOUNTABILITY + MIND COACH",
    principleEn: "Day 5: Break Emotional Resistance — From Stuck to Clarity",
    principleRo: "Ziua 5: Sparge Rezistența Emoțională — De la Blocat la Claritate",
    descriptionEn: "Procrastination isn't laziness — it's emotional resistance. Accountability Coach shows what's done and what's missing. Mind Coach transforms fear, anger, anxiety into momentum. This is where you break the inner burnout cycle.",
    descriptionRo: "Procrastinarea nu e lene — e rezistență emoțională. Accountability Coach arată ce e făcut și ce lipsește. Mind Coach transformă frica, furia, anxietatea în momentum. Aici spargi ciclul interior al burnout-ului.",
    videoPlaceholder: "🎬 Video: Accountability Coach + Mind Coach Transformation",
    icon: Brain,
    color: "from-red-500 to-pink-500",
    actionPath: "/accountability-coach",
    focusAreas: ['body', 'being', 'balance', 'business'],
    stepsEn: [
      "Open Accountability Coach - see what's done/missing",
      "Open Mind Coach for emotional transformation",
      "Transform: Angry → Power, Anxious → Calm Action, Stuck → Clarity, Procrastination → Momentum",
      "Commit to a concrete action",
      "Share your breakthrough in comments"
    ],
    stepsRo: [
      "Deschide Accountability Coach - vezi ce e făcut/lipsește",
      "Deschide Mind Coach pentru transformare emoțională",
      "Transformă: Furie → Putere, Anxietate → Acțiune Calmă, Blocat → Claritate, Procrastinare → Momentum",
      "Angajează-te la o acțiune concretă",
      "Postează breakthrough-ul în comentarii"
    ],
    exercisesEn: [
      { id: "ex1", title: "📊 Accountability Coach", description: "Check your status: what's done, what's missing, what's next", area: "business", link: "/accountability-coach", linkLabel: "Open Accountability" },
      { id: "ex2", title: "🧠 Mind Coach Session", description: "Transform fear, anger, anxiety, or procrastination into power", area: "being", link: "/mind-coach", linkLabel: "Start Session" },
      { id: "ex3", title: "💬 Share Your Breakthrough", description: "Post in comments: what story did you leave behind / what changed", area: "balance" }
    ],
    exercisesRo: [
      { id: "ex1", title: "📊 Accountability Coach", description: "Verifică statusul: ce e făcut, ce lipsește, ce urmează", area: "business", link: "/accountability-coach", linkLabel: "Deschide Accountability" },
      { id: "ex2", title: "🧠 Sesiune Mind Coach", description: "Transformă frica, furia, anxietatea sau procrastinarea în putere", area: "being", link: "/mind-coach", linkLabel: "Începe Sesiunea" },
      { id: "ex3", title: "💬 Postează Breakthrough-ul", description: "Postează în comentarii: ce poveste ai lăsat în urmă / ce s-a schimbat", area: "balance" }
    ]
  },
  {
    day: 6,
    titleEn: "💡 IDEA LIST (STRATEGIC FILTER)",
    titleRo: "💡 IDEA LIST (FILTRU STRATEGIC)",
    principleEn: "Day 6: Protect Your Focus — Strategic Impulse Control",
    principleRo: "Ziua 6: Protejează-ți Focusul — Control Strategic al Impulsurilor",
    descriptionEn: "The biggest threat to momentum: shiny new ideas. This section teaches you to park ideas without losing focus. Classify with Eisenhower Matrix. Protect the execution system built on Day 3.",
    descriptionRo: "Cea mai mare amenințare pentru momentum: ideile noi strălucitoare. Această secțiune te învață să parchezi ideile fără să pierzi focusul. Clasifică cu Matricea Eisenhower. Protejează sistemul de execuție construit în Ziua 3.",
    videoPlaceholder: "🎬 Video: Idea List - Strategic Filter",
    icon: Target,
    color: "from-amber-500 to-yellow-500",
    actionPath: "/door?tab=weekly",
    focusAreas: ['business'],
    stepsEn: [
      "Understand why impulse control is critical",
      "Create your Idea List (Idea Parking Lot)",
      "Classify ideas with Eisenhower Matrix",
      "Remember: Ideas don't build freedom. Execution over time does."
    ],
    stepsRo: [
      "Înțelege de ce controlul impulsului este critic",
      "Creează Idea List (Parking Lot pentru idei)",
      "Clasifică ideile cu Matricea Eisenhower",
      "Amintește-ți: Ideile nu construiesc libertatea. Execuția în timp construiește."
    ],
    exercisesEn: [
      { id: "ex1", title: "💡 Learn About Idea List", description: "Understand the Eisenhower Matrix and impulse control", area: "business" },
      { id: "ex2", title: "📝 Open Idea List", description: "Add your ideas and classify them strategically", area: "business", link: "/door?tab=weekly", linkLabel: "Open Ideas" }
    ],
    exercisesRo: [
      { id: "ex1", title: "💡 Învață Despre Idea List", description: "Înțelege Matricea Eisenhower și controlul impulsului", area: "business" },
      { id: "ex2", title: "📝 Deschide Idea List", description: "Adaugă ideile și clasifică-le strategic", area: "business", link: "/door?tab=weekly", linkLabel: "Deschide Idei" }
    ]
  },
  {
    day: 7,
    titleEn: "🏆 MEMBERSHIP + CONTINUITY",
    titleRo: "🏆 MEMBERSHIP + CONTINUITATE",
    principleEn: "Day 7: From Burnout to Momentum — Make It Permanent",
    principleRo: "Ziua 7: De la Burnout la Momentum — Fă-l Permanent",
    descriptionEn: "You broke the burnout cycle. You built clarity, energy, execution, and control. Now the question: do you let momentum fade, or do you make it permanent?",
    descriptionRo: "Ai spart ciclul burnout-ului. Ai construit claritate, energie, execuție și control. Acum întrebarea: lași momentum-ul să se stingă, sau îl faci permanent?",
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
  const [day1Step, setDay1Step] = useState(0); // 0: Why, 1: Reality, 2: Vision, 3: Commitment
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [declarationSaved, setDeclarationSaved] = useState(false);
  
  // commentsRef removed - posting directly to wall_posts
  
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
      <ProgramsLayout activeTab="classroom" showNavBar={false} sidebar={<ChallengeSidebar currentDay={dayNumber} />}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">Day not found</h1>
          <Button onClick={() => navigate('/challenge')}>Back to Challenge</Button>
        </div>
      </ProgramsLayout>
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

      // Ensure a challenge_progress row exists as soon as the user LANDS on the day,
      // so funnel analytics see the visit even if they don't interact yet.
      if (isAuthenticated && !dayProgress) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user?.id) return;
          supabase.from('challenge_progress').insert({
            user_id: user.id,
            day_number: dayNumber,
            video_watched: false,
            completed: false,
            actions_completed: [],
          }).then(() => {});
        });
      }
    }
  }, [dayProgress, dayNumber, isUnlocked, isAuthenticated]);

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
      <ProgramsLayout activeTab="classroom" showNavBar={false} sidebar={<ChallengeSidebar currentDay={dayNumber} />}>
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
      </ProgramsLayout>
    );
  }

  if (!isUnlocked && !loading) {
    return (
      <ProgramsLayout activeTab="classroom" showNavBar={false} sidebar={<ChallengeSidebar currentDay={dayNumber} />}>
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
      </ProgramsLayout>
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


  // Special render for Day 1 - Simplified 4-step flow
  if (dayNumber === 1) {
    // Check if user already has a declaration (returning user)
    const hasExistingDeclaration = Boolean(
      day1Responses.vision_declaration && 
      day1Responses.vision_declaration.length > 50
    );
    
    const totalDay1Steps = 4; // Reality Check, WHY, Vision, Commitment
    const day1Progress = hasExistingDeclaration ? 100 : ((day1Step + 1) / totalDay1Steps) * 100;
    
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
      <>
        <ChallengeCoachWidget currentDay={dayNumber} />
        <ProgramsLayout activeTab="classroom" showNavBar={false} sidebar={<ChallengeSidebar currentDay={1} />}>
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
                  {language === 'en' ? '🔥 BREAK THE FOG' : '🔥 SPARGE CEAȚA'}
                </h1>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Map your reality, discover WHY you\'re stuck, and write your anti-burnout declaration.' 
                : 'Evaluează-ți realitatea, descoperă DE CE ești blocat și scrie declarația ta anti-burnout.'}
            </p>
            
            <Progress value={day1Progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {hasExistingDeclaration 
                ? (language === 'en' ? 'Completed ✓' : 'Completat ✓')
                : `${language === 'en' ? 'Step' : 'Pasul'} ${day1Step + 1} / 4`
              }
            </p>
          </div>
          
          {/* Audio + Script + Chat - Unified Card */}
          <Card className="mb-6 overflow-hidden border-amber-500/20 shadow-lg shadow-amber-500/5">
            <ChallengeAudioPlayer 
              script={language === 'en' ? getDayScript(1) : getDayScriptRo(1)} 
              language={language === 'en' ? 'en' : 'ro'} 
            />
            <ChallengeScriptCard 
              script={language === 'en' ? getDayScript(1) : getDayScriptRo(1)} 
              maxHeight="250px" 
            />
            <div className="border-t border-border/50">
              <ChallengeInlineChat 
                currentDay={1} 
                language={language === 'en' ? 'en' : 'ro'} 
              />
            </div>
          </Card>
          
          {/* Steps Summary */}
          <Day1StepsSummary currentStep={hasExistingDeclaration ? 5 : day1Step} />
          
          {/* RETURNING USER: Show declaration review */}
          {hasExistingDeclaration ? (
            <>
              <Day1DeclarationReview
                declaration={day1Responses.vision_declaration || ''}
                onEdit={() => setDay1Step(2)}
              />
              
              {/* Invite Friends section for returning users */}
              <div className="mt-6">
                <ChallengeInviteFriends dayNumber={1} />
              </div>
              
              {/* Navigation/Completion Card for returning users */}
              <Card className={`p-6 mt-6 ${isDayCompleted(1) ? 'bg-green-500/10 border-green-500/30' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'}`}>
                {isDayCompleted(1) ? (
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-green-500 mb-2">
                      {language === 'en' ? 'Day 1 Completed!' : 'Ziua 1 Completată!'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {language === 'en' 
                        ? 'Great work! You can continue to Day 2.' 
                        : 'Excelent! Poți continua la Ziua 2.'}
                    </p>
                    <Button 
                      onClick={() => navigate('/challenge/2')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                      size="lg"
                    >
                      {language === 'en' ? 'Continue to Day 2' : 'Continuă la Ziua 2'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {language === 'en' ? 'Ready to Complete Day 1?' : 'Gata să Finalizezi Ziua 1?'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {language === 'en' 
                        ? 'You have your vision declaration. Finalize Day 1 to unlock Day 2!' 
                        : 'Ai declarația de viziune. Finalizează Ziua 1 pentru a debloca Ziua 2!'}
                    </p>
                    <Button 
                      onClick={handleDay1Complete}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                      size="lg"
                    >
                      <Trophy className="h-5 w-5 mr-2" />
                      {language === 'en' ? 'Complete Day 1' : 'Finalizează Ziua 1'}
                    </Button>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <>
              {/* NEW USER: Step-by-step flow - 5 STEPS */}
              
              {/* Step 0: Reality Check (FIRST NOW) */}
              {day1Step === 0 && (
                <Day1RealityCheck
                  onComplete={(scores) => {
                    // Scores are saved inside the component
                    setDay1Step(1);
                  }}
                />
              )}
              
              {/* Step 1: WHY Questions (MOVED FROM 0) */}
              {day1Step === 1 && (
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
                    setDay1Step(2);
                  }}
                />
              )}
              
              {/* Step 2: Vision Declaration */}
              {day1Step === 2 && (
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
                    setDay1Step(3);
                  }}
                  userName={userName}
                  declarationSaved={declarationSaved}
                />
              )}
              
              {/* Step 3: Commitment + Engagement + Invite Friends (optional) */}
              {day1Step === 3 && (
                <>
                  <Day1Commitment
                    isCommitted={day1Responses.commitment_confirmed || false}
                    onCommitmentChange={(committed) => updateDay1Responses({ commitment_confirmed: committed })}
                    onComplete={handleDay1Complete}
                    isLoading={day1Saving}
                  />
                  {/* Optional: Invite Friends */}
                  <div className="mt-6">
                    <Day1InviteFriends />
                  </div>
                </>
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

          </div>
        </ProgramsLayout>
      </>
    );
  }

  return (
    <>
      <ChallengeCoachWidget currentDay={dayNumber} />
      <ProgramsLayout activeTab="classroom" showNavBar={false} sidebar={<ChallengeSidebar currentDay={dayNumber} />}>
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


        {/* Audio + Script + Chat - Unified Card */}
        <Card className="mb-6 overflow-hidden border-amber-500/20 shadow-lg shadow-amber-500/5">
          <ChallengeAudioPlayer 
            script={language === 'en' ? getDayScript(dayNumber) : getDayScriptRo(dayNumber)} 
            language={language === 'en' ? 'en' : 'ro'} 
          />
          <ChallengeScriptCard 
            script={language === 'en' ? getDayScript(dayNumber) : getDayScriptRo(dayNumber)} 
            maxHeight="250px" 
          />
          <div className="border-t border-border/50">
            <ChallengeInlineChat 
              currentDay={dayNumber} 
              language={language === 'en' ? 'en' : 'ro'} 
            />
          </div>
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
            {/* Render exercises without areas (for days like Day 4 Domino Door) */}
            {content.focusAreas.length === 0 && (
              <div className="space-y-3">
                {exercises.map((exercise) => {
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
            )}
            
            {/* Render exercises by area for days with focus areas */}
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

        {/* Invite Friends Section - All Days */}
        {isAuthenticated && (
          <div className="mb-6">
            <ChallengeInviteFriends dayNumber={dayNumber} />
          </div>
        )}


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
                  ? 'Great work! You\'re building momentum!' 
                  : 'Excelent! Construiești momentum!'}
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
    </ProgramsLayout>
    </>
  );
};

export default ChallengeDayPage;
