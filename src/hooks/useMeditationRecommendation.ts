import { useMemo } from 'react';

interface Meditation {
  id: string;
  title: string;
  is_favorite: boolean;
  objectives_snapshot?: Record<string, string> | null;
  created_at: string;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const TIME_KEYWORDS: Record<TimeOfDay, string[]> = {
  morning: ['energie', 'energy', 'focus', 'productiv', 'corp', 'body', 'power', 'daily', 'zilnic'],
  afternoon: ['focus', 'productiv', 'stress', 'balance', 'echilibru'],
  evening: ['relaxa', 'pace', 'gratitud', 'inner', 'interior', 'calm'],
  night: ['somn', 'sleep', 'deep', 'profund', 'relaxa', 'pace']
};

const TIME_REASONS: Record<TimeOfDay, string> = {
  morning: 'Energie și focusare pentru început de zi',
  afternoon: 'Menține focusul și productivitatea',
  evening: 'Relaxare și reflecție pentru seară',
  night: 'Pregătire pentru somn liniștit'
};

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function matchesMeditationType(meditation: Meditation, keywords: string[]): boolean {
  const title = meditation.title.toLowerCase();
  const templateId = meditation.objectives_snapshot?.templateId?.toLowerCase() || '';
  
  return keywords.some(keyword => 
    title.includes(keyword) || templateId.includes(keyword)
  );
}

export function useMeditationRecommendation(meditations: Meditation[]) {
  const recommendation = useMemo(() => {
    if (meditations.length === 0) {
      return null;
    }

    const timeOfDay = getTimeOfDay();
    const keywords = TIME_KEYWORDS[timeOfDay];
    const reason = TIME_REASONS[timeOfDay];

    // First, try to find a matching meditation from favorites
    const favoriteMatch = meditations.find(m => 
      m.is_favorite && matchesMeditationType(m, keywords)
    );

    if (favoriteMatch) {
      return { meditation: favoriteMatch, reason, timeOfDay };
    }

    // Then try to find any matching meditation
    const anyMatch = meditations.find(m => matchesMeditationType(m, keywords));

    if (anyMatch) {
      return { meditation: anyMatch, reason, timeOfDay };
    }

    // Fallback to first favorite or first meditation
    const fallback = meditations.find(m => m.is_favorite) || meditations[0];
    return { 
      meditation: fallback, 
      reason: 'Meditația ta recentă',
      timeOfDay 
    };
  }, [meditations]);

  return { recommendation };
}
