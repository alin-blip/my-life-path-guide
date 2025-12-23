import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Lightbulb, Zap, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useXPSystem } from '@/hooks/useXPSystem';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/context/AuthContext';
import { getDailyPage, getPageByNumber, BookPage } from '@/services/napoleonHillBookService';
import { toast } from 'sonner';

export const DailyCompactCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { xpData, isLoading: xpLoading } = useXPSystem();
  const [currentPage, setCurrentPage] = useState<BookPage | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  
  const { 
    isPageRead, 
    isActionCompleted, 
    markPageAsRead, 
    markActionCompleted,
    isLoading: progressLoading 
  } = useReadingProgress();

  useEffect(() => {
    const page = getDailyPage();
    setCurrentPage(page);
    setPageNumber(page.id);
  }, []);

  const pageIsRead = currentPage ? isPageRead(pageNumber) : false;
  const actionIsDone = currentPage ? isActionCompleted(pageNumber) : false;

  const goToNextPage = () => {
    const nextPageNum = pageNumber < 365 ? pageNumber + 1 : 1;
    const page = getPageByNumber(nextPageNum);
    if (page) {
      setCurrentPage(page);
      setPageNumber(nextPageNum);
    }
  };

  const goToPreviousPage = () => {
    const prevPageNum = pageNumber > 1 ? pageNumber - 1 : 365;
    const page = getPageByNumber(prevPageNum);
    if (page) {
      setCurrentPage(page);
      setPageNumber(prevPageNum);
    }
  };

  const handleCompleteAction = async () => {
    if (!currentPage || !user) {
      toast.error(language === 'en' ? 'Please login to track progress' : 'Te rugăm să te autentifici');
      return;
    }

    if (!pageIsRead) {
      await markPageAsRead(pageNumber, currentPage.principle, currentPage.chapter);
    }

    const success = await markActionCompleted(pageNumber);
    if (success) {
      toast.success(language === 'en' ? 'Action completed!' : 'Acțiune finalizată!');
    }
  };

  const xpProgress = xpData ? (xpData.xpInCurrentLevel / xpData.xpToNextLevel) * 100 : 0;
  const currentXP = xpData ? xpData.xpInCurrentLevel : 0;

  if (!currentPage) {
    return (
      <Card className="border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const truncatedQuote = currentPage.content.length > 180 
    ? currentPage.content.substring(0, 180) + '...' 
    : currentPage.content;
  
  const truncatedInsight = currentPage.keyInsight && currentPage.keyInsight.length > 120 
    ? currentPage.keyInsight.substring(0, 120) + '...' 
    : currentPage.keyInsight;
  
  const truncatedAction = currentPage.dailyAction.length > 100 
    ? currentPage.dailyAction.substring(0, 100) + '...' 
    : currentPage.dailyAction;

  return (
    <Card className="border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">
              {language === 'en' ? 'Daily Page' : 'Pagina Zilnică'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={goToPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[60px] text-center">
              {pageNumber}/365
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={goToNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Principle Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-xs text-amber-500 font-medium">
            {currentPage.principle}
          </span>
          {pageIsRead && (
            <span className="text-xs text-green-500">
              ✓ {language === 'en' ? 'Read' : 'Citit'}
            </span>
          )}
        </div>

        {/* Quote */}
        <p className="text-sm italic text-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-3">
          "{truncatedQuote}"
        </p>

        {/* Insight - Compact */}
        {truncatedInsight && (
          <div className="flex items-start gap-2 bg-blue-500/10 p-2 rounded-md">
            <Lightbulb className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-foreground/90">{truncatedInsight}</p>
          </div>
        )}

        {/* Action - Compact */}
        <div className="flex items-start gap-2 bg-amber-500/10 p-2 rounded-md">
          <Checkbox
            id="daily-action"
            checked={actionIsDone}
            onCheckedChange={() => !actionIsDone && handleCompleteAction()}
            disabled={actionIsDone || progressLoading}
            className="mt-0.5"
          />
          <label 
            htmlFor="daily-action" 
            className={`text-xs cursor-pointer flex-1 ${actionIsDone ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}
          >
            <Zap className="h-3 w-3 inline mr-1 text-amber-500" />
            {truncatedAction}
          </label>
        </div>

        {/* XP Progress - Inline */}
        {!xpLoading && xpData && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-primary" />
                <span className="font-medium">{t('level')} {xpData.currentLevel}</span>
              </div>
              <span className="text-muted-foreground">
                {currentXP}/{xpData.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyCompactCard;
