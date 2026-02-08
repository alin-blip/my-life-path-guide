import React from 'react';
import { ProgramGrid } from './ProgramGrid';
import { ProgramCardProps } from './ProgramCard';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ClassroomTabProps {
  programs: ProgramCardProps[];
}

export const ClassroomTab: React.FC<ClassroomTabProps> = ({ programs }) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';

  return (
    <div className="space-y-8">
      <ProgramGrid programs={programs} />

      {/* Coming Soon */}
      <div className="p-6 rounded-2xl border border-dashed border-border/60 bg-muted/30 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-1">
          {isRo ? 'Mai multe programe în curând' : 'More programs coming soon'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isRo
            ? 'Suntem în lucru la noi cursuri și programe pentru tine.'
            : "We're working on new courses and programs for you."}
        </p>
      </div>
    </div>
  );
};
