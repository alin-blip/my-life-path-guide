import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Flame, Heart, Target, Zap, Gift, BookOpen, Crown,
  Play, CheckCircle2, ArrowLeft, ArrowRight, Video, ListChecks, BookMarked
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';

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
  exercisesEn: { id: string; title: string; description: string }[];
  exercisesRo: { id: string; title: string; description: string }[];
}

const challengeContent: ChallengeDayContent[] = [
  {
    day: 1,
    titleEn: "DESIRE ENGINE",
    titleRo: "MOTORUL DORINȚEI",
    principleEn: "Principle 1: DESIRE - The Starting Point of All Achievement",
    principleRo: "Principiul 1: DORINȚA - Punctul de Plecare al Tuturor Realizărilor",
    descriptionEn: "Every achievement begins with a burning desire. Today you'll define exactly what you want and program your subconscious mind for success.",
    descriptionRo: "Fiecare realizare începe cu o dorință arzătoare. Astăzi vei defini exact ce vrei și îți vei programa subconștientul pentru succes.",
    videoPlaceholder: "🎬 Video: Definește-ți Dorința Arzătoare (Coming Soon)",
    icon: Flame,
    color: "from-red-500 to-orange-500",
    actionPath: "/napoleon-hill-system",
    stepsEn: [
      "Watch the video about the power of burning desire",
      "Write down your definite major purpose",
      "Set a specific deadline for achieving it",
      "Determine what you will give in return",
      "Complete the Napoleon Hill Stack"
    ],
    stepsRo: [
      "Privește videoclipul despre puterea dorinței arzătoare",
      "Scrie-ți scopul major definit",
      "Stabilește un termen limită specific pentru realizarea lui",
      "Determină ce vei oferi în schimb",
      "Completează Stack-ul Napoleon Hill"
    ],
    exercisesEn: [
      { id: "ex1", title: "Define Your Goal", description: "Write your main goal with exact amount and deadline" },
      { id: "ex2", title: "Create Your Statement", description: "Write a 2-paragraph statement of your goal" },
      { id: "ex3", title: "Read Aloud", description: "Read your statement aloud with emotion" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Definește-ți Obiectivul", description: "Scrie obiectivul principal cu suma exactă și termenul" },
      { id: "ex2", title: "Creează-ți Declarația", description: "Scrie o declarație de 2 paragrafe despre obiectivul tău" },
      { id: "ex3", title: "Citește cu Voce Tare", description: "Citește-ți declarația cu voce tare, cu emoție" }
    ]
  },
  {
    day: 2,
    titleEn: "FAITH INSTALL",
    titleRo: "INSTALEAZĂ CREDINȚA",
    principleEn: "Principle 2: FAITH - Visualization and Belief in Attainment of Desire",
    principleRo: "Principiul 2: CREDINȚA - Vizualizarea și Convingerea în Realizarea Dorinței",
    descriptionEn: "Faith is the head chemist of the mind. When mixed with thought, the subconscious instantly picks up the vibration and translates it into spiritual equivalent.",
    descriptionRo: "Credința este chimistul șef al minții. Când este amestecată cu gândul, subconștientul preia instantaneu vibrația și o traduce în echivalent spiritual.",
    videoPlaceholder: "🎬 Video: Cum să Instalezi Credința (Coming Soon)",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    actionPath: "/journal",
    stepsEn: [
      "Watch the video about installing faith",
      "Practice the autosuggestion technique",
      "Write in your journal about your vision",
      "Meditate for 10 minutes visualizing success",
      "Complete your daily meditation"
    ],
    stepsRo: [
      "Privește videoclipul despre instalarea credinței",
      "Practică tehnica de autosugestie",
      "Scrie în jurnal despre viziunea ta",
      "Meditează 10 minute vizualizând succesul",
      "Completează meditația zilnică"
    ],
    exercisesEn: [
      { id: "ex1", title: "Morning Affirmation", description: "Read your goal statement upon waking" },
      { id: "ex2", title: "Visualization Session", description: "Close your eyes and see yourself achieving your goal" },
      { id: "ex3", title: "Journal Entry", description: "Write about how it feels to have achieved your goal" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Afirmație Matinală", description: "Citește-ți declarația obiectivului la trezire" },
      { id: "ex2", title: "Sesiune de Vizualizare", description: "Închide ochii și vezi-te atingându-ți obiectivul" },
      { id: "ex3", title: "Intrare în Jurnal", description: "Scrie despre cum te simți când ți-ai atins obiectivul" }
    ]
  },
  {
    day: 3,
    titleEn: "DECISION DAY",
    titleRo: "ZIUA DECIZIEI",
    principleEn: "Principle 7: DECISION - Mastery of Procrastination",
    principleRo: "Principiul 7: DECIZIA - Stăpânirea Procrastinării",
    descriptionEn: "Accurate analysis of over 25,000 people revealed that lack of decision was near the head of 30 major causes of failure.",
    descriptionRo: "Analiza precisă a peste 25.000 de persoane a dezvăluit că lipsa deciziei era aproape în fruntea celor 30 de cauze majore ale eșecului.",
    videoPlaceholder: "🎬 Video: Puterea Deciziei Ireversibile (Coming Soon)",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    actionPath: "/door",
    stepsEn: [
      "Watch the video about the power of decision",
      "Make 3 definite decisions today",
      "Plan your week in the Door system",
      "Set your weekly Domino goal",
      "Commit to your key points"
    ],
    stepsRo: [
      "Privește videoclipul despre puterea deciziei",
      "Ia 3 decizii definitive astăzi",
      "Planifică-ți săptămâna în sistemul Door",
      "Stabilește-ți obiectivul Domino săptămânal",
      "Angajează-te la punctele tale cheie"
    ],
    exercisesEn: [
      { id: "ex1", title: "The 3 Decisions", description: "Make 3 decisions you've been postponing" },
      { id: "ex2", title: "Weekly Planning", description: "Complete your weekly planning in Door" },
      { id: "ex3", title: "Burn the Boats", description: "Write down one thing you're fully committed to" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Cele 3 Decizii", description: "Ia 3 decizii pe care le-ai amânat" },
      { id: "ex2", title: "Planificare Săptămânală", description: "Completează planificarea săptămânală în Door" },
      { id: "ex3", title: "Arde Podurile", description: "Scrie un lucru la care te angajezi complet" }
    ]
  },
  {
    day: 4,
    titleEn: "ENERGY & DISCIPLINE",
    titleRo: "ENERGIE ȘI DISCIPLINĂ",
    principleEn: "Principle 13: THE BRAIN - A Broadcasting and Receiving Station for Thought",
    principleRo: "Principiul 13: CREIERUL - O Stație de Emisie și Recepție pentru Gânduri",
    descriptionEn: "Your physical health directly impacts your mental faculties. Master your body to master your mind.",
    descriptionRo: "Sănătatea ta fizică afectează direct facultățile mentale. Stăpânește-ți corpul pentru a-ți stăpâni mintea.",
    videoPlaceholder: "🎬 Video: Disciplina Corpului și a Minții (Coming Soon)",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    actionPath: "/core",
    stepsEn: [
      "Watch the video about body-mind connection",
      "Complete your fitness activity",
      "Track your nutrition (Fuel)",
      "Complete your meditation session",
      "Log your Core 4 activities"
    ],
    stepsRo: [
      "Privește videoclipul despre conexiunea corp-minte",
      "Completează activitatea de fitness",
      "Urmărește-ți nutriția (Combustibil)",
      "Completează sesiunea de meditație",
      "Înregistrează activitățile Core 4"
    ],
    exercisesEn: [
      { id: "ex1", title: "Morning Workout", description: "Complete a 20-minute workout" },
      { id: "ex2", title: "Fuel Tracking", description: "Log all meals and hydration" },
      { id: "ex3", title: "Evening Meditation", description: "10-minute meditation before bed" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Antrenament Matinal", description: "Completează un antrenament de 20 de minute" },
      { id: "ex2", title: "Urmărire Nutriție", description: "Înregistrează toate mesele și hidratarea" },
      { id: "ex3", title: "Meditație Seara", description: "10 minute de meditație înainte de culcare" }
    ]
  },
  {
    day: 5,
    titleEn: "VALUE & SERVICE",
    titleRo: "VALOARE ȘI SERVIRE",
    principleEn: "Principle 10: THE MASTER MIND - The Driving Force",
    principleRo: "Principiul 10: MINTEA MAESTRĂ - Forța Motrice",
    descriptionEn: "No individual has sufficient experience, education, native ability, and knowledge to achieve success without the cooperation of others.",
    descriptionRo: "Niciun individ nu are suficientă experiență, educație, abilitate nativă și cunoștințe pentru a atinge succesul fără cooperarea altora.",
    videoPlaceholder: "🎬 Video: Legea Servirii și a Valorii (Coming Soon)",
    icon: Gift,
    color: "from-green-500 to-emerald-500",
    actionPath: "/core",
    stepsEn: [
      "Watch the video about value and service",
      "Reach out to 2 people in your network",
      "Complete your Person 1 activity",
      "Complete your Person 2 activity",
      "Write about how you provided value today"
    ],
    stepsRo: [
      "Privește videoclipul despre valoare și servire",
      "Contactează 2 persoane din rețeaua ta",
      "Completează activitatea Persoana 1",
      "Completează activitatea Persoana 2",
      "Scrie despre cum ai oferit valoare astăzi"
    ],
    exercisesEn: [
      { id: "ex1", title: "Value Outreach", description: "Help 2 people without expecting anything" },
      { id: "ex2", title: "Gratitude List", description: "Write 10 things you're grateful for" },
      { id: "ex3", title: "Service Reflection", description: "Journal about how you served others" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Oferă Valoare", description: "Ajută 2 persoane fără să aștepți nimic" },
      { id: "ex2", title: "Lista Gratitudinii", description: "Scrie 10 lucruri pentru care ești recunoscător" },
      { id: "ex3", title: "Reflecție asupra Servirii", description: "Scrie în jurnal cum i-ai servit pe alții" }
    ]
  },
  {
    day: 6,
    titleEn: "SPECIALIZED KNOWLEDGE",
    titleRo: "CUNOȘTINȚE SPECIALIZATE",
    principleEn: "Principle 4: SPECIALIZED KNOWLEDGE - Personal Experience or Observations",
    principleRo: "Principiul 4: CUNOȘTINȚE SPECIALIZATE - Experiență Personală sau Observații",
    descriptionEn: "General knowledge, no matter how great in quantity, is of little use in accumulation of money. Knowledge is only potential power.",
    descriptionRo: "Cunoștințele generale, oricât de mari în cantitate, sunt de puțin folos în acumularea banilor. Cunoașterea este doar putere potențială.",
    videoPlaceholder: "🎬 Video: Puterea Cunoștințelor Specializate (Coming Soon)",
    icon: BookOpen,
    color: "from-purple-500 to-violet-500",
    actionPath: "/napoleon-hill-system",
    stepsEn: [
      "Watch the video about specialized knowledge",
      "Identify gaps in your knowledge for your goal",
      "Read for 30 minutes on your chosen topic",
      "Take notes on 3 key insights",
      "Plan how you'll apply this knowledge"
    ],
    stepsRo: [
      "Privește videoclipul despre cunoștințe specializate",
      "Identifică lacunele în cunoștințele tale pentru obiectivul tău",
      "Citește 30 de minute pe tema aleasă",
      "Notează 3 perspective cheie",
      "Planifică cum vei aplica aceste cunoștințe"
    ],
    exercisesEn: [
      { id: "ex1", title: "Knowledge Gap Analysis", description: "List 5 things you need to learn" },
      { id: "ex2", title: "Focused Reading", description: "Read 30 minutes and take notes" },
      { id: "ex3", title: "Application Plan", description: "Write how you'll use what you learned" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Analiza Lacunelor", description: "Listează 5 lucruri pe care trebuie să le înveți" },
      { id: "ex2", title: "Lectură Concentrată", description: "Citește 30 de minute și ia notițe" },
      { id: "ex3", title: "Plan de Aplicare", description: "Scrie cum vei folosi ce ai învățat" }
    ]
  },
  {
    day: 7,
    titleEn: "DOMINO DOOR",
    titleRo: "UȘA DOMINO",
    principleEn: "Principle 8: ORGANIZED PLANNING - The Crystallization of Desire Into Action",
    principleRo: "Principiul 8: PLANIFICARE ORGANIZATĂ - Cristalizarea Dorinței în Acțiune",
    descriptionEn: "You have learned the importance of desire, faith, decision, discipline, service, and knowledge. Now it's time to organize it all into a weekly battle plan.",
    descriptionRo: "Ai învățat importanța dorinței, credinței, deciziei, disciplinei, servirii și cunoașterii. Acum e timpul să organizezi totul într-un plan de luptă săptămânal.",
    videoPlaceholder: "🎬 Video: Planificarea Săptămânală ca un General (Coming Soon)",
    icon: Crown,
    color: "from-amber-500 to-yellow-600",
    actionPath: "/door",
    stepsEn: [
      "Watch the video about organized weekly planning",
      "Complete your weekly planning session",
      "Set your Domino goal for the week",
      "Identify your 5 Key Points",
      "Celebrate completing the 7-day challenge!"
    ],
    stepsRo: [
      "Privește videoclipul despre planificarea săptămânală organizată",
      "Completează sesiunea de planificare săptămânală",
      "Stabilește obiectivul Domino pentru săptămână",
      "Identifică cele 5 Puncte Cheie",
      "Sărbătorește completarea provocării de 7 zile!"
    ],
    exercisesEn: [
      { id: "ex1", title: "Weekly Review", description: "Review the past week's accomplishments" },
      { id: "ex2", title: "Domino Goal", description: "Set the ONE goal that makes everything else easier" },
      { id: "ex3", title: "Key Points", description: "Define your 5 non-negotiable weekly tasks" }
    ],
    exercisesRo: [
      { id: "ex1", title: "Review Săptămânal", description: "Revizuiește realizările săptămânii trecute" },
      { id: "ex2", title: "Obiectiv Domino", description: "Stabilește UN obiectiv care face totul mai ușor" },
      { id: "ex3", title: "Puncte Cheie", description: "Definește 5 taskuri săptămânale non-negociabile" }
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
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate(content.actionPath)}
          >
            {language === 'en' ? 'Go to Activity' : 'Mergi la Activitate'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Card>

        {/* Exercises Section */}
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
          
          <div className="space-y-4">
            {exercises.map((exercise) => {
              const isExerciseCompleted = completedExercises.includes(exercise.id);
              return (
                <div 
                  key={exercise.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                    isExerciseCompleted 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-muted/50 border-border hover:border-primary/30'
                  }`}
                  onClick={() => handleToggleExercise(exercise.id)}
                >
                  <Checkbox 
                    checked={isExerciseCompleted}
                    onCheckedChange={() => handleToggleExercise(exercise.id)}
                  />
                  <div>
                    <h3 className={`font-medium ${isExerciseCompleted ? 'text-green-500' : 'text-foreground'}`}>
                      {exercise.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

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
                  ? 'Great work! You\'ve mastered this day\'s lesson.' 
                  : 'Excelent! Ai stăpânit lecția acestei zile.'}
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
