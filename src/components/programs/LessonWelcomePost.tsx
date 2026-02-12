import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Pin, CheckCircle2 } from 'lucide-react';

interface DayContent {
  titleRo: string;
  titleEn: string;
  tasksRo: string[];
  tasksEn: string[];
  ctaRo: string;
  ctaEn: string;
}

const dayContents: Record<number, DayContent> = {
  1: {
    titleRo: '🔥 Bine ai venit în Ziua 1: Viziune + Declarație!',
    titleEn: '🔥 Welcome to Day 1: Vision + Declaration!',
    tasksRo: [
      'Completează Harta Realității (scoruri pe 4 arii)',
      'Răspunde la cele 5 întrebări de viziune',
      'Scrie Declarația ta Anti-Burnout',
    ],
    tasksEn: [
      'Complete the Reality Map (scores on 4 areas)',
      'Answer the 5 vision questions',
      'Write your Anti-Burnout Declaration',
    ],
    ctaRo: '👇 Postează declarația ta și momentul AHA mai jos!',
    ctaEn: '👇 Post your declaration and AHA moment below!',
  },
  2: {
    titleRo: '💪 Ziua 2: Corp + Spirit + Relații',
    titleEn: '💪 Day 2: Body + Spirit + Relationships',
    tasksRo: [
      'Setează obiective pe 3 nivele: 1 an, 90 zile, 30 zile',
      'Definește acțiuni concrete pentru Corp, Spirit și Relații',
      'Alege 1 obiectiv prioritar din fiecare arie',
    ],
    tasksEn: [
      'Set goals on 3 levels: 1 year, 90 days, 30 days',
      'Define concrete actions for Body, Spirit, Relationships',
      'Choose 1 priority goal from each area',
    ],
    ctaRo: '👇 Postează 2-3 obiective cheie aici!',
    ctaEn: '👇 Post your 2-3 key goals below!',
  },
  3: {
    titleRo: '🎯 Ziua 3: Business + Domino Door',
    titleEn: '🎯 Day 3: Business + Domino Door',
    tasksRo: [
      'Deschide AI Wizard-ul și setează viziunea de business',
      'Definește targetele și milestone-urile',
      'Configurează Domino Door-ul cu cele 4 chei',
    ],
    tasksEn: [
      'Open the AI Wizard and set your business vision',
      'Define targets and milestones',
      'Configure your Domino Door with the 4 keys',
    ],
    ctaRo: '👇 Postează Domino Door-ul și milestone-ul tău!',
    ctaEn: '👇 Post your Domino Door and milestone below!',
  },
  4: {
    titleRo: '⚡ Ziua 4: Warrior Routine',
    titleEn: '⚡ Day 4: Warrior Routine',
    tasksRo: [
      'Generează imagini AI pentru vizualizare',
      'Creează meditația personalizată',
      'Configurează rutina ta de campion',
    ],
    tasksEn: [
      'Generate AI images for visualization',
      'Create your personalized meditation',
      'Configure your champion routine',
    ],
    ctaRo: '👇 Postează rutina ta și momentul AHA!',
    ctaEn: '👇 Post your routine and AHA moment below!',
  },
  5: {
    titleRo: '🧠 Ziua 5: Accountability + Mind Coach',
    titleEn: '🧠 Day 5: Accountability + Mind Coach',
    tasksRo: [
      'Verifică progresul: ce ai făcut, ce ai rămas dator',
      'Identifică emoțiile blocante',
      'Transformă-le cu Mind Coach în energie productivă',
    ],
    tasksEn: [
      'Check progress: what you did, what is left',
      'Identify blocking emotions',
      'Transform them with Mind Coach into productive energy',
    ],
    ctaRo: '👇 Postează breakthrough-ul tău!',
    ctaEn: '👇 Post your breakthrough below!',
  },
  6: {
    titleRo: '💡 Ziua 6: Idea List',
    titleEn: '💡 Day 6: Idea List',
    tasksRo: [
      'Parcheză toate ideile care îți distrag focusul',
      'Clasifică-le: acum, curând, mai târziu',
      'Protejează-ți focusul pe Domino Door',
    ],
    tasksEn: [
      'Park all ideas distracting your focus',
      'Classify them: now, soon, later',
      'Protect your focus on Domino Door',
    ],
    ctaRo: '👇 Postează top 3 idei parcate și lecția învățată!',
    ctaEn: '👇 Post your top 3 parked ideas and lesson learned!',
  },
  7: {
    titleRo: '🏆 Ziua 7: Integrare & Momentum',
    titleEn: '🏆 Day 7: Integration & Momentum',
    tasksRo: [
      'Revizuiește scorurile finale vs. Ziua 1',
      'Confirmă planul de continuitate pe 30 zile',
      'Celebrează: ai spart ciclul burnout-ului!',
    ],
    tasksEn: [
      'Review final scores vs. Day 1',
      'Confirm your 30-day continuation plan',
      'Celebrate: you broke the burnout cycle!',
    ],
    ctaRo: '👇 Postează scorurile finale și planul tău!',
    ctaEn: '👇 Post your final scores and plan below!',
  },
};

interface LessonWelcomePostProps {
  dayNumber: number;
  sourcePrefix?: string;
  dayTitle?: string;
  courseName?: string;
}

export const LessonWelcomePost: React.FC<LessonWelcomePostProps> = ({ dayNumber, sourcePrefix, dayTitle, courseName }) => {
  const { language } = useLanguage();

  const isChallenge = !sourcePrefix || sourcePrefix === 'challenge';
  const content = isChallenge ? dayContents[dayNumber] : null;

  if (isChallenge && !content) return null;

  const title = isChallenge && content
    ? (language === 'ro' ? content.titleRo : content.titleEn)
    : (language === 'ro' ? `🔥 Ziua ${dayNumber}: ${dayTitle || ''}` : `🔥 Day ${dayNumber}: ${dayTitle || ''}`);
  const tasks = isChallenge && content
    ? (language === 'ro' ? content.tasksRo : content.tasksEn)
    : null;
  const cta = isChallenge && content
    ? (language === 'ro' ? content.ctaRo : content.ctaEn)
    : (language === 'ro'
      ? '👇 Împărtășește insight-urile și breakthrough-urile tale mai jos!'
      : '👇 Share your insights and breakthroughs below!');

  return (
    <div className="bg-card border border-amber-500/20 rounded-xl p-4 relative">
      <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 mb-3">
        <Pin className="h-3.5 w-3.5" />
        <span>{language === 'ro' ? 'Instrucțiuni lecție' : 'Lesson Instructions'}</span>
      </div>

      <h4 className="font-bold text-base mb-3">{title}</h4>

      {tasks && tasks.length > 0 && (
        <ul className="space-y-2 mb-4">
          {tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span>{task}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
        {cta}
      </p>
    </div>
  );
};
