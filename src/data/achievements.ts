// Achievement definitions for warrior progression system
export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string; // emoji
  category: 'streak' | 'action' | 'milestone';
  reward?: string; // human readable unlock (informative)
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: 'first_step',
    title: 'Primul Pas',
    description: 'Ai finalizat primul task din rutină.',
    icon: '🌱',
    category: 'action',
  },
  {
    key: 'quiz_completed',
    title: 'Războinicul Descoperit',
    description: 'Ți-ai aflat tipul de războinic.',
    icon: '🧭',
    category: 'action',
    reward: 'Badge Warrior Type',
  },
  {
    key: 'streak_3',
    title: '3 Zile Consecutive',
    description: 'Ai executat rutina 3 zile la rând.',
    icon: '🔥',
    category: 'streak',
  },
  {
    key: 'streak_7',
    title: 'O Săptămână de Disciplină',
    description: '7 zile consecutive. Mind Coach avansat deblocat.',
    icon: '⚡',
    category: 'streak',
    reward: '+2 sesiuni Mind Coach / lună',
  },
  {
    key: 'streak_14',
    title: 'Două Săptămâni Fără Compromis',
    description: '14 zile consecutive. Brotherhood nelimitat deblocat.',
    icon: '💎',
    category: 'streak',
    reward: 'Postări nelimitate în Brotherhood',
  },
  {
    key: 'streak_30',
    title: 'Războinic Consacrat',
    description: '30 zile. Ai construit obiceiul.',
    icon: '👑',
    category: 'streak',
    reward: 'Badge Elite + Master Plan bonus',
  },
  {
    key: 'first_master_plan',
    title: 'Primul Plan Strategic',
    description: 'Ai creat primul tău Master Plan.',
    icon: '🗺️',
    category: 'action',
  },
  {
    key: 'first_brotherhood_post',
    title: 'Voce în Trib',
    description: 'Prima postare în Brotherhood.',
    icon: '🗣️',
    category: 'action',
  },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.key, a])
);

// Bonus feature limits when achievement is unlocked
export const ACHIEVEMENT_BONUSES: Record<string, Partial<Record<'mind_coach' | 'brotherhood_post' | 'master_plan', number | 'unlimited'>>> = {
  streak_7: { mind_coach: 2 },
  streak_14: { brotherhood_post: 'unlimited' },
  streak_30: { master_plan: 3 },
};
