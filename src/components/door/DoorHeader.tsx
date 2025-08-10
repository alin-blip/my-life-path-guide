
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Info } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { DoorDiagnostics } from './DoorDiagnostics';

interface DoorHeaderProps {
  currentDateRange: string;
  currentDate?: Date;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  isMobile?: boolean;
}

export const DoorHeader: React.FC<DoorHeaderProps> = ({
  currentDateRange,
  currentDate = new Date(),
  handlePreviousWeek,
  handleNextWeek,
  isMobile = false
}) => {
  const { t } = useLanguage();
  const today = format(new Date(), 'EEE');

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Back + Title */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:bg-accent">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isMobile ? 'Back' : t('backToDashboard')}
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            📋 {t('commandCenter')}
          </h1>
        </div>

        {/* Center: Week Navigation */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handlePreviousWeek}
            className="text-muted-foreground hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {currentDateRange}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleNextWeek}
            className="text-muted-foreground hover:bg-accent"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Right: Today + Profile */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-foreground px-2 py-1 bg-muted rounded">
            {today}
          </span>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
