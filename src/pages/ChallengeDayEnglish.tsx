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
  Dumbbell, Brain, Users, Sparkles, ExternalLink, Map, Bell, Trophy,
  Lightbulb, Rocket
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { ChallengeAnswersHistory } from '@/components/challenge/ChallengeAnswersHistory';
import { ChallengeDay7Complete } from '@/components/challenge/ChallengeDay7Complete';
import { LessonCommunityPost } from '@/components/programs/LessonCommunityPost';
import { ChallengeUpgradeGate } from '@/components/challenge/ChallengeUpgradeGate';
import { 
  Day1WhyQuestions, 
  Day1VisionDeclaration, 
  Day1Commitment, 
  Day1StepsSummary, 
  Day1DeclarationReview,
  Day1RealityCheck,
  Day1InviteFriendsStep
} from '@/components/challenge/day1';
import { ChallengeInviteFriends } from '@/components/challenge/ChallengeInviteFriends';
import { ChallengeAudioPlayer } from '@/components/challenge/ChallengeAudioPlayer';
import { ChallengeScriptCard } from '@/components/challenge/ChallengeScriptCard';
import { ChallengeInlineChat } from '@/components/challenge/ChallengeInlineChat';
import { getDayScript } from '@/data/challengeScripts';
import { useDay1Responses } from '@/hooks/useDay1Responses';
import { supabase } from '@/integrations/supabase/client';
import { trackChallengeDayStarted } from '@/lib/facebook-pixel';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ChallengeLiveChat } from '@/components/challenge/ChallengeLiveChat';

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
  title: string;
  principle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  actionPath: string;
  steps: string[];
  exercises: Exercise[];
  focusAreas: ('body' | 'being' | 'balance' | 'business')[];
}

const areaColors = {
  body: 'bg-green-500 text-white',
  being: 'bg-purple-500 text-white',
  balance: 'bg-pink-500 text-white',
  business: 'bg-blue-500 text-white'
};

const areaLabels = {
  body: '💪 Body',
  being: '✨ Being',
  balance: '💕 Balance',
  business: '💰 Business'
};

// English-only challenge content
const challengeContent: ChallengeDayContent[] = [
  {
    day: 1,
    title: "🔥 VISION + DECLARATION",
    principle: "Day 1: Vision + Declaration (Napoleon Hill)",
    description: "Set your direction: how does your life look in 1 year across all 4 zones. Write your Personal Declaration (in present tense). Read it morning and evening. Join the community and invite 1-3 friends.",
    icon: Flame,
    color: "from-purple-500 to-indigo-500",
    actionPath: "/challenge-en/1",
    focusAreas: ['body', 'being', 'balance', 'business'],
    steps: [
      "Complete the Reality Check (where are you now?)",
      "Discover your BIG WHY (what truly drives you?)",
      "Write your Napoleon Hill Declaration (your future self)",
      "Share with the community (accountability)",
      "Invite 1-3 friends to transform together"
    ],
    exercises: [
      { id: "ex1", title: "Discover Your WHY", description: "Answer the 5 fundamental questions about your desires and purpose", area: "being" },
      { id: "ex2", title: "Vision 2026 (All 4 Areas)", description: "Define your vision for Body, Spirit, Relationships, and Business", area: "being" },
      { id: "ex3", title: "Write Declaration", description: "Create your Napoleon Hill style declaration", area: "being" },
      { id: "ex4", title: "Join Community", description: "Enter the Warrior tribe and introduce yourself", area: "balance", link: "/brotherhood?tab=tribes", linkLabel: "Join Community" },
      { id: "ex5", title: "Invite 1-3 Friends", description: "Share your exclusive invite link with friends who want to transform", area: "balance" }
    ]
  },
  {
    day: 2,
    title: "💪✨💕 BODY + SPIRIT + RELATIONSHIPS",
    principle: "Day 2: Build Your Foundation - Energy + Peace + Connection",
    description: "Set objectives for Body, Spirit, AND Relationships on 3 levels: 2026, 90 days, 30 days. These 3 areas are the foundation for everything else.",
    icon: Target,
    color: "from-green-500 to-purple-500",
    actionPath: "/game-objectives",
    focusAreas: ['body', 'being', 'balance'],
    steps: [
      "Set your Body objectives: 2026 → 90 Days → 30 Days",
      "Set your Spirit objectives: 2026 → 90 Days → 30 Days",
      "Set your Relationship objectives: 2026 → 90 Days → 30 Days",
      "Share in comments your 2-3 key objectives"
    ],
    exercises: [
      { id: "ex1", title: "💪 Body Objectives: 2026 → 90 Days → 30 Days", description: "Set your health and fitness goals on all 3 levels", area: "body", link: "/game-objectives?category=body", linkLabel: "Set Body Goals" },
      { id: "ex2", title: "✨ Spirit Objectives: 2026 → 90 Days → 30 Days", description: "Set your spiritual and purpose goals on all 3 levels", area: "being", link: "/game-objectives?category=being", linkLabel: "Set Spirit Goals" },
      { id: "ex3", title: "💕 Relationship Objectives: 2026 → 90 Days → 30 Days", description: "Set your relationship goals on all 3 levels", area: "balance", link: "/game-objectives?category=balance", linkLabel: "Set Relationship Goals" },
      { id: "ex4", title: "Share in Comments", description: "Post your 2-3 key objectives for Body, Spirit, and Relationships", area: "balance" }
    ]
  },
  {
    day: 3,
    title: "💰🎯 BUSINESS + DOMINO DOOR",
    principle: "Day 3: Business Vision + Weekly Execution System",
    description: "The AI Wizard guides you through a complete flow: Business vision (1 year) → 90-day targets → First month milestone → Weekly Domino Door (1 milestone + 4 keys + WHY for each). This is where the magic happens.",
    icon: Target,
    color: "from-blue-500 to-amber-500",
    actionPath: "/game-objectives?category=business&wizard=full",
    focusAreas: ['business'],
    steps: [
      "Open the Business AI Wizard (ONE GO)",
      "Set Business Vision for 1 year",
      "Define 90-day targets",
      "Set first month milestone",
      "Configure Domino Door: 1 milestone + 4 keys + WHY for each",
      "Share your Domino Door in comments"
    ],
    exercises: [
      { id: "ex1", title: "💰 Complete Business Flow (ONE GO)", description: "AI Wizard: Annual → 90 Days → Monthly → Weekly Door with 4 keys", area: "business", link: "/game-objectives?category=business&wizard=full", linkLabel: "Start AI Wizard" },
      { id: "ex2", title: "Share Your Domino Door", description: "Post a screenshot or copy-paste your Domino Door in comments", area: "business" }
    ]
  },
  {
    day: 4,
    title: "⚡ WARRIOR ROUTINE + VISION AI + MEDITATION",
    principle: "Day 4: Automate Your Daily Execution",
    description: "Generate AI images for all 4 life areas. Create your personalized meditation based on YOUR objectives from Days 2-3. Configure Warrior Routine for daily execution. Start living your transformation.",
    icon: Sparkles,
    color: "from-cyan-500 to-purple-500",
    actionPath: "/vision-board",
    focusAreas: ['body', 'being', 'balance', 'business'],
    steps: [
      "Generate AI images for all 4 vision quadrants",
      "Create personalized meditation with YOUR objectives",
      "Configure Warrior Routine with your habits",
      "Start your first execution",
      "Post your AHA moment in comments"
    ],
    exercises: [
      { id: "ex1", title: "🎨 Vision AI (4 Quadrants)", description: "Generate AI images for Body, Spirit, Relationships, and Business", area: "being", link: "/vision-board", linkLabel: "Open Vision Board" },
      { id: "ex2", title: "⚡ Configure Warrior Routine", description: "Set up your personalized daily routine with habits", area: "body", link: "/daily-flow", linkLabel: "Configure Routine" },
      { id: "ex3", title: "🧘 Personalized Meditation", description: "Create meditation based on YOUR objectives - it knows your goals!", area: "being", link: "/daily-flow", linkLabel: "Create Meditation" },
      { id: "ex4", title: "🚀 Start Execution", description: "Begin your first daily routine execution", area: "body", link: "/daily-flow", linkLabel: "Start Now" },
      { id: "ex5", title: "💬 Share Your AHA Moment", description: "Post your breakthrough insight in comments", area: "balance" }
    ]
  },
  {
    day: 5,
    title: "🧠 ACCOUNTABILITY + MIND COACH",
    principle: "Day 5: Transform Emotions into Power",
    description: "Accountability Coach knows everything: tells you what's done and what's missing. Mind Coach transforms fear, anger, anxiety, procrastination → power. This isn't about suppressing emotions. It's about transforming them into fuel.",
    icon: Brain,
    color: "from-red-500 to-pink-500",
    actionPath: "/accountability-coach",
    focusAreas: ['body', 'being', 'balance', 'business'],
    steps: [
      "Open Accountability Coach - see what's done/missing",
      "Open Mind Coach for emotional transformation",
      "Transform: Angry → Power, Anxious → Calm Action, Stuck → Clarity, Procrastination → Momentum",
      "Commit to a concrete action",
      "Share your breakthrough in comments"
    ],
    exercises: [
      { id: "ex1", title: "📊 Accountability Coach", description: "Check your status: what's done, what's missing, what's next", area: "business", link: "/accountability-coach", linkLabel: "Open Accountability" },
      { id: "ex2", title: "🧠 Mind Coach Session", description: "Transform fear, anger, anxiety, or procrastination into power", area: "being", link: "/mind-coach", linkLabel: "Start Session" },
      { id: "ex3", title: "💬 Share Your Breakthrough", description: "Post in comments: what story did you leave behind / what changed", area: "balance" }
    ]
  },
  {
    day: 6,
    title: "💡 IDEA LIST (STRATEGIC FILTER)",
    principle: "Day 6: Impulse Control - Don't Let Ideas Destroy Execution",
    description: "This section is NOT for execution. It's for getting ideas out of your head without destroying the focus set on Day 3. Classify ideas with Eisenhower Matrix: Important+Urgent, Important+Not Urgent, Not Important+Urgent, Not Important+Not Urgent.",
    icon: Lightbulb,
    color: "from-yellow-500 to-amber-500",
    actionPath: "/notes",
    focusAreas: ['business'],
    steps: [
      "Open the Idea List tool",
      "Dump ALL ideas from your head (no filter)",
      "Classify each with Eisenhower Matrix",
      "Move ONLY Important+Not Urgent to Domino Door (if applicable)",
      "Share one key insight in comments"
    ],
    exercises: [
      { id: "ex1", title: "💡 Open Idea List", description: "Access the strategic idea capture tool", area: "business", link: "/notes", linkLabel: "Open Idea List" },
      { id: "ex2", title: "📝 Brain Dump", description: "Write down ALL ideas without filtering - get them out of your head", area: "business" },
      { id: "ex3", title: "📊 Eisenhower Classification", description: "Classify each idea: Urgent/Important matrix", area: "business" },
      { id: "ex4", title: "💬 Share Key Insight", description: "What idea were you holding that was blocking your execution?", area: "balance" }
    ]
  },
  {
    day: 7,
    title: "🏆 INTEGRATION + CONTINUITY",
    principle: "Day 7: Lock In Permanent Change",
    description: "Review your entire transformation journey. Set up your weekly review ritual. Connect with accountability partners. Commit to the next 90 days of consistent execution.",
    icon: Trophy,
    color: "from-amber-500 to-yellow-500",
    actionPath: "/challenge-en",
    focusAreas: ['body', 'being', 'balance', 'business'],
    steps: [
      "Review all 6 days of transformation",
      "Set up your weekly review ritual",
      "Find 1-2 accountability partners in the community",
      "Commit to 90 days of Warrior Routine execution",
      "Celebrate your transformation! 🎉"
    ],
    exercises: [
      { id: "ex1", title: "📋 Full Review", description: "Review Vision, Goals, Domino Door, Routine - is everything aligned?", area: "being" },
      { id: "ex2", title: "📅 Weekly Review Setup", description: "Schedule your weekly 30-min review session", area: "business", link: "/daily-flow", linkLabel: "Set Reminder" },
      { id: "ex3", title: "👥 Find Accountability Partners", description: "Connect with 1-2 warriors for mutual accountability", area: "balance", link: "/brotherhood", linkLabel: "Find Partners" },
      { id: "ex4", title: "🎯 90-Day Commitment", description: "Sign your 90-day execution commitment", area: "being" },
      { id: "ex5", title: "🎉 Celebrate & Share", description: "Post your transformation story in the community!", area: "balance" }
    ]
  }
];

const ChallengeDayEnglish: React.FC = () => {
  const { day } = useParams();
  const dayNumber = parseInt(day || '1');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setLanguage } = useLanguage();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // Force English
  useEffect(() => {
    setLanguage('en');
  }, [setLanguage]);
  
  const { 
    progress, 
    isDayUnlocked, 
    isDayCompleted, 
    completeDay, 
    completeAction,
    markVideoWatched,
    hasPremiumAccess,
    loading
  } = useChallengeProgress();
  
  const { 
    responses: day1Responses, 
    updateResponses: updateDay1Responses, 
    saveResponses: saveDay1Responses,
    isLoading: day1Loading 
  } = useDay1Responses();
  
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [day1Step, setDay1Step] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userCommentCount, setUserCommentCount] = useState(0);
  // commentsRef removed - posting directly to wall_posts
  
  const content = challengeContent[dayNumber - 1];
  const script = getDayScript(dayNumber);
  const isUnlocked = isDayUnlocked(dayNumber);
  
  // Load completed exercises from progress
  useEffect(() => {
    const dayData = progress.find(p => p.day_number === dayNumber);
    if (dayData?.actions_completed) {
      const actions = dayData.actions_completed;
      if (Array.isArray(actions)) {
        setCompletedExercises(actions as string[]);
      }
    }
  }, [progress, dayNumber]);
  
  // Track day started
  useEffect(() => {
    const sessionKey = `challenge_day_${dayNumber}_tracked`;
    if (!sessionStorage.getItem(sessionKey) && isUnlocked) {
      trackChallengeDayStarted(dayNumber);
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [progress, dayNumber, isUnlocked]);
  
  // Check premium access for Day 3+
  useEffect(() => {
    if (dayNumber >= 3 && isAuthenticated && !loading) {
      if (!hasPremiumAccess) {
        setShowUpgradeModal(true);
      }
    }
  }, [dayNumber, isAuthenticated, hasPremiumAccess, loading]);
  
  // Show upgrade gate for premium days
  if (showUpgradeModal && !hasPremiumAccess) {
    return (
      <Layout>
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/challenge-en')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenge
          </Button>
          <ChallengeUpgradeGate onClose={() => navigate('/challenge-en')} />
        </div>
      </Layout>
    );
  }
  
  // Show locked message
  if (!isUnlocked && !loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Day Locked
          </h1>
          <p className="text-muted-foreground mb-4">
            Complete the previous days to unlock this day.
          </p>
          <Button onClick={() => navigate('/challenge-en')}>
            Back to Challenge
          </Button>
        </div>
      </Layout>
    );
  }
  
  if (!content) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">Day not found</h1>
          <Button onClick={() => navigate('/challenge-en')}>Back to Challenge</Button>
        </div>
      </Layout>
    );
  }
  
  const Icon = content.icon;
  const exercises = content.exercises;
  
  const handleToggleExercise = async (exerciseId: string) => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/challenge-en/${dayNumber}`);
      return;
    }
    if (completedExercises.includes(exerciseId)) return;
    
    const newCompleted = [...completedExercises, exerciseId];
    setCompletedExercises(newCompleted);
    await completeAction(dayNumber, exerciseId);
  };
  
  const handleCompleteDay = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/challenge-en/${dayNumber}&action=complete`);
      return;
    }
    await completeDay(dayNumber);
    if (dayNumber < 7) {
      navigate(`/challenge-en/${dayNumber + 1}`);
    } else {
      navigate('/challenge-en');
    }
  };
  
  const allExercisesCompleted = exercises.every(ex => completedExercises.includes(ex.id));
  const progressValue = (completedExercises.length / exercises.length) * 100;
  
  // Group exercises by area
  const exercisesByArea = exercises.reduce((acc, ex) => {
    const area = ex.area || 'being';
    if (!acc[area]) acc[area] = [];
    acc[area].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);
  
  const handlePostDeclaration = async (declaration: string) => {
    if (!user) return;
    const { error } = await supabase.from('wall_posts').insert({
      user_id: user.id,
      content: declaration,
      category: 'challenge',
      source_context: `challenge-day-${dayNumber}`,
      source_label: `Challenge - Day ${dayNumber}: Vision + Declaration`,
    } as any);
    if (!error) {
      toast({
        title: '🎉 Shared!',
        description: 'Your declaration has been shared with the community!',
      });
    }
  };
  
  const handlePostRealityScore = async (message: string) => {
    if (!user) return;
    await supabase.from('wall_posts').insert({
      user_id: user.id,
      content: message,
      category: 'challenge',
      source_context: `challenge-day-${dayNumber}`,
      source_label: `Challenge - Day ${dayNumber}: Vision + Declaration`,
    } as any);
  };
  
  // Day 1 Special Flow
  if (dayNumber === 1) {
    const hasExistingDeclaration = Boolean(
      day1Responses.vision_declaration && 
      day1Responses.vision_declaration.length > 50
    );
    
    const day1Progress = hasExistingDeclaration ? 100 : ((day1Step + 1) / 4) * 100;
    
    const handleDay1Complete = async () => {
      if (!isAuthenticated) {
        navigate('/auth?redirect=/challenge-en/1');
        return;
      }
      
      const saved = await saveDay1Responses({
        ...day1Responses,
        commitment_confirmed: true
      });
      
      if (saved) {
        await completeDay(1);
        navigate('/challenge-en/2');
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
                  <p className="font-medium text-foreground">🔐 Save Your Progress</p>
                  <p className="text-sm text-muted-foreground">
                    Create a free account to track your challenge progress
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/auth?redirect=/challenge-en/1')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500"
                >
                  Create Free Account
                </Button>
              </div>
            </Card>
          )}
          
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/challenge-en')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenge
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${content.color}`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <Badge variant="outline" className="mb-1">Day 1</Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {content.title}
                </h1>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4">{content.description}</p>
            
            <Progress value={day1Progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {hasExistingDeclaration ? 'Completed ✓' : `Step ${day1Step + 1} / 4`}
            </p>
          </div>
          
          {/* Audio + Script + Chat - Unified Card (replaces video) */}
          <Card className="mb-6 overflow-hidden border-amber-500/20 shadow-lg shadow-amber-500/5">
            <ChallengeAudioPlayer script={script} language="en" />
            <ChallengeScriptCard script={script} maxHeight="300px" />
            <div className="border-t border-border/50">
              <ChallengeInlineChat currentDay={dayNumber} language="en" />
            </div>
          </Card>
          
          {/* Steps Summary */}
          <Day1StepsSummary currentStep={hasExistingDeclaration ? 5 : day1Step} />
          
          {/* Returning user: show declaration review */}
          {hasExistingDeclaration ? (
            <>
              <Day1DeclarationReview
                declaration={day1Responses.vision_declaration || ''}
                onPostToComments={handlePostDeclaration}
                onEdit={() => setDay1Step(2)}
              />
              
              <div className="mt-6">
                <ChallengeInviteFriends dayNumber={1} />
              </div>
              
              <Card className={`p-6 mt-6 ${isDayCompleted(1) ? 'bg-green-500/10 border-green-500/30' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'}`}>
                {isDayCompleted(1) ? (
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-green-500 mb-2">Day 1 Completed!</h3>
                    <p className="text-muted-foreground mb-4">Great work! You can continue to Day 2.</p>
                    <Button 
                      onClick={() => navigate('/challenge-en/2')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                      size="lg"
                    >
                      Continue to Day 2
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Ready to Complete Day 1?</h3>
                    <p className="text-muted-foreground mb-4">
                      You have your vision declaration. Finalize Day 1 to unlock Day 2!
                    </p>
                    <Button 
                      onClick={handleDay1Complete}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                      size="lg"
                    >
                      <Trophy className="h-5 w-5 mr-2" />
                      Complete Day 1
                    </Button>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <>
              {/* New user step-by-step flow */}
              {day1Step === 0 && (
                <Day1RealityCheck
                  onComplete={() => setDay1Step(1)}
                  onPostScore={handlePostRealityScore}
                />
              )}
              
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
                      await saveDay1Responses({
                        ...day1Responses,
                        ...finalVisionData
                      });
                    }
                    setDay1Step(3);
                  }}
                />
              )}
              
              {day1Step === 3 && (
                <Day1InviteFriendsStep
                  onComplete={async () => {
                    if (!isAuthenticated) {
                      navigate('/auth?redirect=/challenge-en/1');
                      return;
                    }
                    
                    const saved = await saveDay1Responses({
                      ...day1Responses,
                      commitment_confirmed: true
                    });
                    
                    if (saved) {
                      await completeDay(1);
                      navigate('/challenge-en/2');
                    }
                  }}
                />
              )}
            </>
          )}
          
          {/* Live Chat */}
          <div className="mt-8">
            <ChallengeLiveChat dayNumber={1} language="en" />
          </div>

          {/* Lesson Community Posts */}
          <div className="mt-8">
            <LessonCommunityPost dayNumber={1} dayTitle="Vision + Declaration" />
          </div>
        </div>
      </Layout>
    );
  }
  
  // Days 2-7: Standard flow with Audio + Text + Exercises
  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        {/* Login Banner */}
        {!isAuthenticated && (
          <Card className="p-4 mb-6 bg-amber-500/10 border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-medium text-foreground">🔐 Save Your Progress</p>
                <p className="text-sm text-muted-foreground">
                  Create a free account to track your challenge progress
                </p>
              </div>
              <Button 
                onClick={() => navigate(`/auth?redirect=/challenge-en/${dayNumber}`)}
                className="bg-gradient-to-r from-amber-500 to-orange-500"
              >
                Create Free Account
              </Button>
            </div>
          </Card>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/challenge-en')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenge
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${content.color}`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1">Day {dayNumber}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {content.title}
              </h1>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-4">{content.description}</p>
          
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {completedExercises.length} / {exercises.length} exercises completed
          </p>
        </div>
        
        {/* Audio + Script + Chat - Unified Card (replaces video) */}
        <Card className="mb-6 overflow-hidden border-amber-500/20 shadow-lg shadow-amber-500/5">
          <ChallengeAudioPlayer script={script} language="en" />
          <ChallengeScriptCard script={script} maxHeight="300px" />
          <div className="border-t border-border/50">
            <ChallengeInlineChat currentDay={dayNumber} language="en" />
          </div>
        </Card>
        
        {/* Today's Steps */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-amber-500" />
            Today's Steps
          </h2>
          <ol className="space-y-2">
            {content.steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 text-sm font-medium flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
        
        {/* Exercises by Area */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-amber-500" />
            Exercises
          </h2>
          
          <div className="space-y-6">
            {Object.entries(exercisesByArea).map(([area, areaExercises]) => (
              <div key={area}>
                <Badge className={`${areaColors[area as keyof typeof areaColors]} mb-3`}>
                  {areaLabels[area as keyof typeof areaLabels]}
                </Badge>
                
                <div className="space-y-3">
                  {areaExercises.map((exercise) => (
                    <div 
                      key={exercise.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        completedExercises.includes(exercise.id)
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-muted/30 border-border hover:border-amber-500/30'
                      }`}
                    >
                      <Checkbox
                        checked={completedExercises.includes(exercise.id)}
                        onCheckedChange={() => handleToggleExercise(exercise.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${completedExercises.includes(exercise.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {exercise.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        {exercise.link && (
                          <Link 
                            to={exercise.link}
                            className="inline-flex items-center gap-1 mt-2 text-sm text-amber-500 hover:text-amber-400"
                          >
                            {exercise.linkLabel}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Invite Friends */}
        <ChallengeInviteFriends dayNumber={dayNumber} />
        
        {/* Live Chat */}
        <div className="mt-8">
          <ChallengeLiveChat dayNumber={dayNumber} language="en" />
        </div>

        {/* Lesson Community Posts */}
        <div className="mt-8">
          <LessonCommunityPost dayNumber={dayNumber} dayTitle={content.title} />
        </div>
        
        {/* Complete Day Button */}
        {dayNumber === 7 && allExercisesCompleted ? (
          <ChallengeDay7Complete />
        ) : (
          <Card className="p-6 mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <div className="text-center">
              {allExercisesCompleted ? (
                <>
                  <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-foreground mb-2">All Exercises Completed!</h3>
                  <p className="text-muted-foreground mb-4">
                    Great work! Complete Day {dayNumber} to unlock the next day.
                  </p>
                  <Button 
                    onClick={handleCompleteDay}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                    size="lg"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Complete Day {dayNumber}
                  </Button>
                </>
              ) : (
                <>
                  <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Complete All Exercises</h3>
                  <p className="text-muted-foreground">
                    {exercises.length - completedExercises.length} exercise(s) remaining
                  </p>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ChallengeDayEnglish;
