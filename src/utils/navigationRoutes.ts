import {
  Map,
  Zap,
  Target,
  LayoutDashboard,
  Swords,
  Sparkles,
  BookOpen,
  Flame,
  Users,
  Timer,
  Palette,
  Trophy,
  Calendar,
  Settings,
  GraduationCap,
  Brain,
  Heart,
  Dumbbell,
  Briefcase,
  TrendingUp,
  FileText,
  MessageSquare,
  Compass,
  Star,
  type LucideIcon
} from 'lucide-react';

export interface RouteInfo {
  labelRo: string;
  labelEn: string;
  icon: LucideIcon;
  description?: string;
}

export const navigationRoutes: Record<string, RouteInfo> = {
  // Reality Map & Assessment
  '/fact-maps': {
    labelRo: 'Harta Realității',
    labelEn: 'Reality Map',
    icon: Map,
    description: 'Evaluare completă a situației actuale'
  },
  '/warrior-power': {
    labelRo: 'Test Warrior Power',
    labelEn: 'Warrior Power Test',
    icon: Zap,
    description: 'Descoperă puterea ta interioară'
  },
  '/life-score': {
    labelRo: 'Scorul Vieții',
    labelEn: 'Life Score',
    icon: Star,
    description: 'Evaluează-ți viața pe toate dimensiunile'
  },

  // Planning & Goals
  '/game-objectives': {
    labelRo: 'Obiective Anuale',
    labelEn: 'Annual Goals',
    icon: Target,
    description: 'Setează obiectivele tale pe termen lung'
  },
  '/door': {
    labelRo: 'Centru de Comandă',
    labelEn: 'Command Center',
    icon: LayoutDashboard,
    description: 'Planifică și urmărește task-urile zilnice'
  },
  '/domino-door': {
    labelRo: 'Planificare Domino',
    labelEn: 'Domino Planning',
    icon: Compass,
    description: 'Strategia de acțiune în cascadă'
  },

  // Daily Routines
  '/daily-flow': {
    labelRo: 'Rutina Zilnică',
    labelEn: 'Daily Routine',
    icon: Swords,
    description: 'Rutina ta de campion'
  },
  '/champion-routine': {
    labelRo: 'Rutina Campionului',
    labelEn: 'Champion Routine',
    icon: Trophy,
    description: 'Rutina completă de dimineață'
  },

  // AI Coaches & Stacks
  '/stack': {
    labelRo: 'Antrenori AI',
    labelEn: 'AI Coaches',
    icon: Sparkles,
    description: 'Sesiuni ghidate cu AI'
  },
  '/accountability-coach': {
    labelRo: 'Coach Responsabilitate',
    labelEn: 'Accountability Coach',
    icon: MessageSquare,
    description: 'Asistentul tău personal'
  },

  // Life Vision
  '/lifebook': {
    labelRo: 'Viziune Viață',
    labelEn: 'Life Vision',
    icon: BookOpen,
    description: 'Designul complet al vieții tale'
  },
  '/vision-2026': {
    labelRo: 'Viziune 2026',
    labelEn: 'Vision 2026',
    icon: Star,
    description: 'Viziunea ta pentru următorul an'
  },

  // Challenge & Growth
  '/challenge': {
    labelRo: 'Challenge 7 Zile',
    labelEn: '7-Day Challenge',
    icon: Flame,
    description: 'Transformare accelerată'
  },

  // Community
  '/brotherhood': {
    labelRo: 'Comunitate',
    labelEn: 'Brotherhood',
    icon: Users,
    description: 'Conectează-te cu alți războinici'
  },

  // Focus & Productivity
  '/focus': {
    labelRo: 'Focus Room',
    labelEn: 'Focus Room',
    icon: Timer,
    description: 'Sesiuni de concentrare intensă'
  },

  // Creative
  '/vibe-canvas': {
    labelRo: 'Vibe Canvas',
    labelEn: 'Creative Canvas',
    icon: Palette,
    description: 'Exprimă-ți viziunea creativ'
  },

  // Learning
  '/courses': {
    labelRo: 'Cursuri',
    labelEn: 'Courses',
    icon: GraduationCap,
    description: 'Învață și crește'
  },

  // Core 4 Areas
  '/core/body': {
    labelRo: 'Corp',
    labelEn: 'Body',
    icon: Dumbbell,
    description: 'Sănătate și fitness'
  },
  '/core/being': {
    labelRo: 'Suflet',
    labelEn: 'Being',
    icon: Heart,
    description: 'Dezvoltare spirituală'
  },
  '/core/balance': {
    labelRo: 'Echilibru',
    labelEn: 'Balance',
    icon: Brain,
    description: 'Relații și emoții'
  },
  '/core/business': {
    labelRo: 'Business',
    labelEn: 'Business',
    icon: Briefcase,
    description: 'Carieră și finanțe'
  },

  // Dashboard & Settings
  '/dashboard': {
    labelRo: 'Tablou de Bord',
    labelEn: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Privire de ansamblu'
  },
  '/settings': {
    labelRo: 'Setări',
    labelEn: 'Settings',
    icon: Settings,
    description: 'Configurări cont'
  },
  '/progress': {
    labelRo: 'Progres',
    labelEn: 'Progress',
    icon: TrendingUp,
    description: 'Urmărește evoluția ta'
  },
  '/journal': {
    labelRo: 'Jurnal',
    labelEn: 'Journal',
    icon: FileText,
    description: 'Reflecții și gânduri'
  },
};

export const getRouteInfo = (path: string, language: 'en' | 'ro' = 'ro'): RouteInfo | null => {
  // Normalize path (remove query params)
  const normalizedPath = path.split('?')[0];
  const routeInfo = navigationRoutes[normalizedPath];
  return routeInfo || null;
};

export const getRouteLabel = (path: string, language: 'en' | 'ro' = 'ro'): string => {
  const info = getRouteInfo(path, language);
  if (!info) return path;
  return language === 'ro' ? info.labelRo : info.labelEn;
};

export const extractPathsFromText = (text: string): string[] => {
  const pathRegex = /\/[a-z0-9-]+(?:\/[a-z0-9-]+)?(?:\?[a-z0-9=&-]+)?/gi;
  const matches = text.match(pathRegex) || [];
  // Filter to only known routes
  return [...new Set(matches)].filter(path => {
    const normalizedPath = path.split('?')[0];
    return navigationRoutes[normalizedPath] !== undefined;
  });
};
