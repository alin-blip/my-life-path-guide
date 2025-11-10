
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Trash2, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DoorHeaderProps {
  currentDateRange: string;
  currentDate?: Date;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  isMobile?: boolean;
  onOpenHistory?: () => void;
  onClearWeek?: () => void;
  onClearHistory?: () => void;
}

export const DoorHeader: React.FC<DoorHeaderProps> = ({
  currentDateRange,
  currentDate = new Date(),
  handlePreviousWeek,
  handleNextWeek,
  isMobile = false,
  onOpenHistory,
  onClearWeek,
  onClearHistory,
}) => {
  const { t } = useLanguage();
  const today = format(new Date(), 'EEE');

  return (
    <div className="bg-card border-b border-border px-4 py-3 shadow-md">
      <div className="flex items-center justify-between">
        {/* Left: Back + Title */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isMobile ? 'Back' : t('backToDashboard')}
            </Link>
          </Button>
          <h1 className="text-lg font-bold text-foreground">
            📋 {t('commandCenter')}
          </h1>
        </div>

        {/* Center: Week Navigation */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handlePreviousWeek}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-sm font-semibold text-foreground min-w-[140px] text-center px-3 py-1.5 bg-accent/20 rounded-lg border border-border/50">
            {currentDateRange}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleNextWeek}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all rounded-lg"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Right: Actions + Today + Profile */}
        <div className="flex items-center space-x-3">
          {/* Action Buttons */}
          {onOpenHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHistory}
              className="gap-2 border-border/50 hover:border-border hover:bg-accent/50 transition-all rounded-lg shadow-sm"
            >
              <HistoryIcon className="w-4 h-4" />
              {!isMobile && <span>Istoric</span>}
            </Button>
          )}
          
          {(onClearWeek || onClearHistory) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/50 hover:border-border hover:bg-accent/50 transition-all rounded-lg shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  {!isMobile && <span>Șterge</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border shadow-lg z-50">
                {onClearWeek && (
                  <DropdownMenuItem 
                    onClick={onClearWeek}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Clear Săptămână
                  </DropdownMenuItem>
                )}
                {onClearHistory && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={onClearHistory}
                      className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Șterge Istoric
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <span className="text-sm font-medium text-foreground px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
            {today}
          </span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">JD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
