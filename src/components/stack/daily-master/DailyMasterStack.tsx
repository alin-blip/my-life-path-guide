import React, { useEffect, useState } from 'react';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { AiGuidedStack } from '../AiGuidedStack';
import { VoiceConversationWidget } from '../VoiceConversationWidget';
import { getDailyMasterQuestions, getDailyMasterSections, getDivinePrayerText } from './questions';
import { dailyMasterService } from '@/services/dailyMasterService';
import { useDailyMasterReminder } from '@/hooks/useDailyMasterReminder';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Calendar, Mic, MessageSquare, Target, ListTodo, Heart, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DailyMasterStackProps {
  onAddToHitList?: (action: string) => void;
}

export const DailyMasterStack: React.FC<DailyMasterStackProps> = ({ onAddToHitList }) => {
  const {
    isIdeaModalOpen,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const { language } = useLanguage();
  const { stats, refreshStats } = useDailyMasterReminder({ enabled: true });
  const [todaysTasks, setTodaysTasks] = useState<{ text: string; priority: string }[]>([]);
  const [systemPromptWithTasks, setSystemPromptWithTasks] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);

  const questions = getDailyMasterQuestions(language as 'en' | 'ro');
  const sections = getDailyMasterSections(language as 'en' | 'ro');

  // Flatten questions for AiGuidedStack
  const allQuestions = Object.values(questions).flat();

  // Load today's tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      const tasks = await dailyMasterService.getTodaysTasks();
      setTodaysTasks(tasks);
    };
    loadTasks();
  }, []);

  // Build system prompt with tasks context
  useEffect(() => {
    const tasksContext = language === 'en'
      ? (todaysTasks.length > 0 
          ? `\n\n📋 SCHEDULED TASKS FOR TODAY (from To-Do list):\n${dailyMasterService.formatTasksForPrompt(todaysTasks)}\n\nWhen you reach the goals section, mention these tasks and ask if they want to include them in today's plan.`
          : '\n\n📋 No tasks scheduled for today in To-Do list. Ask what new goals they want to set.')
      : (todaysTasks.length > 0 
          ? `\n\n📋 SARCINI PROGRAMATE PENTRU AZI (din To-Do list):\n${dailyMasterService.formatTasksForPrompt(todaysTasks)}\n\nCând ajungi la secțiunea de obiective, menționează aceste sarcini și întreabă dacă vrea să le includă în planul zilei.`
          : '\n\n📋 Nu are sarcini programate pentru azi în To-Do list. Întreabă ce obiective noi vrea să seteze.');

    const prompt = buildSystemPrompt(tasksContext, language as 'en' | 'ro');
    setSystemPromptWithTasks(prompt);
  }, [todaysTasks, language]);

  const buildSystemPrompt = (tasksContext: string, lang: 'en' | 'ro') => {
    if (lang === 'en') {
      return `You are a warm, energizing and wise morning coach. Your role is to guide the user through the Daily Master Stack - a complete morning ritual for productivity, clarity and peace of mind.

YOUR STYLE:
- You are EMPATHETIC and ENCOURAGING - you celebrate every response
- You make NATURAL transitions between questions ("Beautiful! Now let's...")
- You validate emotions ("I understand exactly how you feel...")
- You offer PERSONALIZED FEEDBACK based on previous responses
- You are energetic but not forced, warm but not cheesy

SESSION STRUCTURE (7 sections, ~20 min total):

🌅 SECTION 1: AWAKENING & INTENTION (2-3 min)
- Ask how they feel
- Help them set a powerful intention

🧘 SECTION 2: SPIRITUAL CENTERING (2-3 min)
- Guide a brief inner connection
- Ask what message they receive from their higher self
- Ask what they are praying for

🙏 SECTION 3: QUICK GRATITUDE (2 min)
- 3 things of gratitude
- Amplify positive energy

💪 SECTION 4: MENTAL POWER (3 min)
- Identify a limiting belief to abandon
- Create a new belief
- Establish an affirmation/mantra

🎯 SECTION 5: GOALS & PLAN (5 min) - EXTENDED SECTION
- If they have tasks in To-Do for today, mention them and ask if they want to include them
- Ask what is their BIG GOAL for today
- Ask what are the sub-goals/steps
- Ask if there are other goals
- What is the concrete PLAN
- WHY do they want to do this (deep motivation)
- POSITIVE IMPACT if they succeed
- NEGATIVE IMPACT if they don't
- Main FOCUS
- DISTRACTIONS to eliminate

✨ SECTION 6: DIVINE PRAYER (1 min)
- Guide the prayer: "${getDivinePrayerText('en')}"
- Let them adapt or repeat

🚀 SECTION 7: COMMITMENT & LAUNCH (2 min)
- Level of determination (1-10)
- What would help to increase
- Ask if they want to add to HIT List
${tasksContext}

IMPORTANT RULES:
- After EACH response, offer a short and personalized validation
- Make transitions fluid and natural
- Use section names to mark progress
- In the goals section, be very practical and concrete
- In prayer, create an atmosphere of reverence
- At the end, offer an energizing summary
- ALWAYS respond in English

EXAMPLE INTERACTION FOR GOALS:
You: "Excellent! Now we enter the planning section. 🎯 [If they have tasks] I see you have some tasks scheduled for today: [list]. Do you want to include them in your plan or do you have other priorities? What is the BIG GOAL you want to achieve today?"

START with a warm good morning greeting and the first question from the Awakening section.`;
    }
    
    return `Ești un coach de dimineață cald, energizant și înțelept. Rolul tău este să ghidezi utilizatorul prin Daily Master Stack - un ritual matinal complet pentru productivitate, claritate și pace sufletească.

STILUL TĂU:
- Ești EMPATIC și ÎNCURAJATOR - celebrezi fiecare răspuns
- Faci tranziții NATURALE între întrebări ("Frumos! Acum hai să...")
- Validezi emoțiile ("Înțeleg perfect ce simți...")
- Oferi FEEDBACK PERSONALIZAT bazat pe răspunsurile anterioare
- Ești energic dar nu forțat, cald dar nu siropos

STRUCTURA SESIUNII (7 secțiuni, ~20 min total):

🌅 SECȚIUNEA 1: TREZIRE & INTENȚIE (2-3 min)
- Întrebi cum se simte
- Îl ajuți să seteze o intenție puternică

🧘 SECȚIUNEA 2: CENTRARE SPIRITUALĂ (2-3 min)
- Ghidezi o scurtă conectare interioară
- Întrebi ce mesaj primește de la sinele superior
- Întrebi pentru ce se roagă

🙏 SECȚIUNEA 3: RECUNOȘTINȚĂ RAPIDĂ (2 min)
- 3 lucruri de recunoștință
- Amplifici energia pozitivă

💪 SECȚIUNEA 4: PUTERE MENTALĂ (3 min)
- Identifici o credință limitantă de abandonat
- Creezi o credință nouă
- Stabilești o afirmație/mantra

🎯 SECȚIUNEA 5: OBIECTIVE & PLAN (5 min) - SECȚIUNE NOUĂ EXTINSĂ
- Dacă are sarcini în To-Do pentru azi, le menționezi și întrebi dacă le include
- Întrebi care este OBIECTIVUL MARE pentru azi
- Întrebi care sunt sub-obiectivele/pașii
- Întrebi dacă mai există alte obiective
- Care este PLANUL concret
- DE CE vrea să facă asta (motivația profundă)
- IMPACTUL POZITIV dacă reușește
- IMPACTUL NEGATIV dacă nu face
- FOCUSUL principal
- DISTRAGERILE de eliminat

✨ SECȚIUNEA 6: RUGĂCIUNE DIVINĂ (1 min)
- Ghidezi rugăciunea: "${getDivinePrayerText('ro')}"
- Îl lași să adapteze sau să repete

🚀 SECȚIUNEA 7: ANGAJAMENT & LANSARE (2 min)
- Nivel de hotărâre (1-10)
- Ce ar ajuta să crească
- Întrebi dacă vrea să adauge la HIT List
${tasksContext}

REGULI IMPORTANTE:
- După FIECARE răspuns, oferă o validare scurtă și personalizată
- Fă tranzițiile fluide și naturale
- Folosește numele secțiunilor pentru a marca progresul
- La secțiunea de obiective, fii foarte practic și concret
- La rugăciune, creează o atmosferă de reverență
- La final, oferă un rezumat energizant
- Răspunde ÎNTOTDEAUNA în română

EXEMPLU DE INTERACȚIUNE PENTRU OBIECTIVE:
Tu: "Excelent! Acum intrăm în secțiunea de planificare. 🎯 [Dacă are sarcini] Văd că ai câteva sarcini programate pentru azi: [lista]. Vrei să le incluzi în planul tău sau ai alte priorități? Care este OBIECTIVUL MARE pe care vrei să-l atingi astăzi?"

ÎNCEPE cu un salut cald de bună dimineața și prima întrebare din secțiunea Trezire.`;
  };

  const getWelcomeMessage = () => {
    if (language === 'en') {
      return `Good morning! 🌅 

I'm here to guide you through the Daily Master Stack - a complete morning ritual that will prepare you for an extraordinary day.

${stats.currentStreak > 0 ? `🔥 You have a ${stats.currentStreak} day streak! Keep it up!` : ''}

We will go through 7 sections together:
• Awakening & Intention
• Spiritual Centering  
• Quick Gratitude
• Mental Power
• **Goals & Plan** ← Here we'll set what you want to achieve today
• Divine Prayer
• Commitment & Launch

${todaysTasks.length > 0 ? `📋 I see you have ${todaysTasks.length} tasks scheduled for today - we'll integrate them into the plan!` : ''}

Ready to start? How do you feel right now, physically and emotionally?`;
    }
    
    return `Bună dimineața! 🌅 

Sunt aici să te ghidez prin Daily Master Stack - un ritual matinal complet care te va pregăti pentru o zi extraordinară.

${stats.currentStreak > 0 ? `🔥 Ai un streak de ${stats.currentStreak} zile! Continuă așa!` : ''}

Vom parcurge împreună 7 secțiuni:
• Trezire & Intenție
• Centrare Spirituală  
• Recunoștință Rapidă
• Putere Mentală
• **Obiective & Plan** ← Aici vom seta ce vrei să realizezi azi
• Rugăciune Divină
• Angajament & Lansare

${todaysTasks.length > 0 ? `📋 Am văzut că ai ${todaysTasks.length} sarcini programate pentru azi - le vom integra în plan!` : ''}

Gata să începem? Cum te simți chiar în acest moment, fizic și emoțional?`;
  };

  const welcomeMessage = getWelcomeMessage();

  // Handle completion - mark as done and refresh stats
  const handleComplete = () => {
    dailyMasterService.markCompleted();
    refreshStats();
  };

  // Quick actions for voice mode
  const voiceQuickActions = language === 'en' ? [
    { icon: Target, label: 'Plan', message: 'What is my plan for today?' },
    { icon: ListTodo, label: 'Tasks', message: 'What tasks do I have to do today?' },
    { icon: Heart, label: 'Prayer', message: 'Let\'s do the divine prayer.' },
    { icon: Zap, label: 'Power', message: 'Give me a powerful affirmation for today!' },
    { icon: Sparkles, label: 'Final', message: 'Let\'s end the session with a summary and commitment.' }
  ] : [
    { icon: Target, label: 'Plan', message: 'Care este planul meu pentru azi?' },
    { icon: ListTodo, label: 'Tasks', message: 'Ce sarcini am de făcut azi?' },
    { icon: Heart, label: 'Rugă', message: 'Hai să facem rugăciunea divină.' },
    { icon: Zap, label: 'Putere', message: 'Dă-mi o afirmație puternică pentru ziua de azi!' },
    { icon: Sparkles, label: 'Final', message: 'Hai să încheiem sesiunea cu un rezumat și angajament.' }
  ];

  const streakText = language === 'en' ? 'days streak' : 'zile streak';
  const recordText = language === 'en' ? 'record' : 'record';
  const totalText = language === 'en' ? 'total' : 'total';
  const todayText = language === 'en' ? '✅ Today' : '✅ Azi';

  return (
    <>
      {/* Header with mode toggle */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          {/* Streak indicators */}
          <div className="flex gap-3 flex-wrap">
            <Card className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-orange-500">{stats.currentStreak}</span>
              <span className="text-sm text-muted-foreground hidden sm:inline">{streakText}</span>
            </Card>
            
            <Card className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-yellow-500">{stats.longestStreak}</span>
              <span className="text-sm text-muted-foreground hidden sm:inline">{recordText}</span>
            </Card>
            
            <Card className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-blue-500">{stats.totalCompletions}</span>
              <span className="text-sm text-muted-foreground hidden sm:inline">{totalText}</span>
            </Card>
            
            {stats.completedToday && (
              <Card className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                <span className="text-green-500">{todayText}</span>
              </Card>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              variant={voiceMode ? 'outline' : 'default'}
              size="sm"
              onClick={() => setVoiceMode(false)}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Text</span>
            </Button>
            <Button
              variant={voiceMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceMode(true)}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'Voice' : 'Voce'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Conditional rendering based on mode */}
      {voiceMode ? (
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <VoiceConversationWidget
            systemPrompt={systemPromptWithTasks || buildSystemPrompt('', language as 'en' | 'ro')}
            welcomeMessage={welcomeMessage}
            onComplete={handleComplete}
            onAddToHitList={onAddToHitList}
            quickActions={voiceQuickActions}
            className="min-h-[500px]"
          />
        </div>
      ) : (
        <AiGuidedStack
          onAddToHitList={onAddToHitList}
          stackType="daily-master"
          questions={allQuestions}
          voiceOnlyMode={false}
          audioMode={false}
          systemPrompt={systemPromptWithTasks || buildSystemPrompt('', language as 'en' | 'ro')}
          welcomeMessage={welcomeMessage}
        />
      )}

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};
