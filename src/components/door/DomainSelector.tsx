import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Briefcase, Heart, Sparkles, Users } from 'lucide-react';

export type DomainCategory = 'business' | 'body' | 'being' | 'balance' | 'minte';

interface DomainConfig {
  id: DomainCategory;
  icon: React.ReactNode;
  labelRo: string;
  labelEn: string;
  descriptionRo: string;
  descriptionEn: string;
  color: string;
  bgColor: string;
}

const DOMAINS: DomainConfig[] = [
  {
    id: 'business',
    icon: <Briefcase className="w-6 h-6" />,
    labelRo: 'Business',
    labelEn: 'Business',
    descriptionRo: 'Carieră, venituri, proiecte profesionale',
    descriptionEn: 'Career, income, professional projects',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
  },
  {
    id: 'body',
    icon: <Heart className="w-6 h-6" />,
    labelRo: 'Corp',
    labelEn: 'Body',
    descriptionRo: 'Sănătate, fitness, energie fizică',
    descriptionEn: 'Health, fitness, physical energy',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
  },
  {
    id: 'being',
    icon: <Sparkles className="w-6 h-6" />,
    labelRo: 'Spiritualitate',
    labelEn: 'Spirituality',
    descriptionRo: 'Mindfulness, meditație, dezvoltare personală',
    descriptionEn: 'Mindfulness, meditation, personal growth',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
  },
  {
    id: 'balance',
    icon: <Users className="w-6 h-6" />,
    labelRo: 'Relații',
    labelEn: 'Relationships',
    descriptionRo: 'Familie, prieteni, conexiuni sociale',
    descriptionEn: 'Family, friends, social connections',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  },
];

interface DomainSelectorProps {
  selectedDomain: DomainCategory | null;
  onSelectDomain: (domain: DomainCategory) => void;
  completedDomains?: DomainCategory[];
}

export const DomainSelector: React.FC<DomainSelectorProps> = ({
  selectedDomain,
  onSelectDomain,
  completedDomains = [],
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {language === 'en' 
            ? 'Choose a domain for your Domino Door' 
            : 'Alege un domeniu pentru Domino Door'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? 'Focus on one area of your life this week'
            : 'Concentrează-te pe o arie a vieții tale săptămâna aceasta'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DOMAINS.map((domain) => {
          const isCompleted = completedDomains.includes(domain.id);
          const isSelected = selectedDomain === domain.id;
          
          return (
            <button
              key={domain.id}
              onClick={() => onSelectDomain(domain.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all text-left",
                isSelected 
                  ? `${domain.bgColor} border-current ${domain.color}` 
                  : isCompleted
                    ? `${domain.bgColor} border-green-500/50 opacity-80`
                    : `${domain.bgColor} border-transparent hover:border-current`
              )}
            >
              {isCompleted && (
                <div className="absolute top-2 right-2 text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full">
                  ✓ {language === 'en' ? 'Done' : 'Gata'}
                </div>
              )}
              
              <div className={cn("mb-2", domain.color)}>
                {domain.icon}
              </div>
              
              <h4 className="font-medium">
                {language === 'en' ? domain.labelEn : domain.labelRo}
              </h4>
              
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' ? domain.descriptionEn : domain.descriptionRo}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { DOMAINS };
