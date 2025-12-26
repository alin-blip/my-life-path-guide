
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Trash2, History as HistoryIcon, Undo, Redo, Copy } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DoorHeaderProps {
  currentDateRange: string;
  currentDate?: Date;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  isMobile?: boolean;
  onOpenHistory?: () => void;
  onClearWeek?: () => void;
  onClearHistory?: () => void;
  onCleanDuplicates?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
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
  onCleanDuplicates,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const { t } = useLanguage();
  const today = format(new Date(), 'EEE');

  if (isMobile) {
    // Compact mobile header
    return (
      <div className="bg-card border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="p-1">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handlePreviousWeek} className="p-1">
              <ArrowLeft className="w-3 h-3" />
            </Button>
            <span className="text-xs font-medium text-foreground px-2 py-1 bg-muted rounded min-w-[90px] text-center">
              {currentDateRange}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNextWeek} className="p-1">
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded">
            {today}
          </span>
        </div>
      </div>
    );
  }

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
              {t('backToDashboard')}
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

        {/* Right: Undo/Redo + Actions + Today + Profile */}
        <div className="flex items-center space-x-3">
          {/* Undo/Redo Buttons */}
          <TooltipProvider>
            <div className="flex items-center gap-1 bg-accent/20 rounded-lg p-1 border border-border/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="h-8 px-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/50 transition-all"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('undoCtrl')}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="h-8 px-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/50 transition-all"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('redoCtrl')}</p>
                  </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Action Buttons */}
          {onOpenHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHistory}
              className="gap-2 border-border/50 hover:border-border hover:bg-accent/50 transition-all rounded-lg shadow-sm"
            >
              <HistoryIcon className="w-4 h-4" />
              <span>{t('history')}</span>
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
                  <span>{t('deleteBtn')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover border-border shadow-lg z-50">
                {onCleanDuplicates && (
                  <DropdownMenuItem 
                    onClick={onCleanDuplicates}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t('cleanDuplicates')}
                  </DropdownMenuItem>
                )}
                {onClearWeek && (
                  <>
                    {onCleanDuplicates && <DropdownMenuSeparator className="bg-border" />}
                    <DropdownMenuItem 
                      onClick={onClearWeek}
                      className="cursor-pointer hover:bg-accent focus:bg-accent"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {t('clearWeek')}
                    </DropdownMenuItem>
                  </>
                )}
                {onClearHistory && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={onClearHistory}
                      className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('deleteHistory')}
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
