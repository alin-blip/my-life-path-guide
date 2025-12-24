import React, { useEffect, useState } from 'react';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { AiGuidedStack } from '../AiGuidedStack';
import { getDailyMasterQuestions, getDailyMasterSections, getDivinePrayerText } from './questions';
import { dailyMasterService } from '@/services/dailyMasterService';
import { useDailyMasterReminder } from '@/hooks/useDailyMasterReminder';
import { Card } from '@/components/ui/card';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface DailyMasterStackProps {
  onAddToHitList?: (action: string) => void;
}

export const DailyMasterStack: React.FC<DailyMasterStackProps> = ({ onAddToHitList }) => {
  const {
    isIdeaModalOpen,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const { stats, refreshStats } = useDailyMasterReminder({ enabled: true });
  const [todaysTasks, setTodaysTasks] = useState<{ text: string; priority: string }[]>([]);
  const [systemPromptWithTasks, setSystemPromptWithTasks] = useState('');

  const questions = getDailyMasterQuestions();
  const sections = getDailyMasterSections();

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
    const tasksContext = todaysTasks.length > 0 
      ? `\n\n📋 SARCINI PROGRAMATE PENTRU AZI (din To-Do list):\n${dailyMasterService.formatTasksForPrompt(todaysTasks)}\n\nCând ajungi la secțiunea de obiective, menționează aceste sarcini și întreabă dacă vrea să le includă în planul zilei.`
      : '\n\n📋 Nu are sarcini programate pentru azi în To-Do list. Întreabă ce obiective noi vrea să seteze.';

    const prompt = buildSystemPrompt(tasksContext);
    setSystemPromptWithTasks(prompt);
  }, [todaysTasks]);

  const buildSystemPrompt = (tasksContext: string) => `Ești un coach de dimineață cald, energizant și înțelept. Rolul tău este să ghidezi utilizatorul prin Daily Master Stack - un ritual matinal complet pentru productivitate, claritate și pace sufletească.

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
- Ghidezi rugăciunea: "${getDivinePrayerText()}"
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

  const welcomeMessage = `Bună dimineața! 🌅 

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

  // Handle completion - mark as done and refresh stats
  const handleComplete = () => {
    dailyMasterService.markCompleted();
    refreshStats();
  };

  return (
    <>
      {/* Streak indicator */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex gap-3 mb-4">
          <Card className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-orange-500">{stats.currentStreak}</span>
            <span className="text-sm text-muted-foreground">zile streak</span>
          </Card>
          
          <Card className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-yellow-500">{stats.longestStreak}</span>
            <span className="text-sm text-muted-foreground">record</span>
          </Card>
          
          <Card className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-blue-500">{stats.totalCompletions}</span>
            <span className="text-sm text-muted-foreground">total</span>
          </Card>
          
          {stats.completedToday && (
            <Card className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
              <span className="text-green-500">✅ Completat azi!</span>
            </Card>
          )}
        </div>
      </div>

      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="daily-master"
        questions={allQuestions}
        voiceOnlyMode={false}
        audioMode={false}
        systemPrompt={systemPromptWithTasks || buildSystemPrompt('')}
        welcomeMessage={welcomeMessage}
      />

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};
