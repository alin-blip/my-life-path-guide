import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Lightbulb, Zap, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useXPSystem } from '@/hooks/useXPSystem';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/context/AuthContext';
import { getDailyPage, getPageByNumber, BookPage } from '@/services/napoleonHillBookService';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
export const DailyCompactCard: React.FC = () => {
  const {
    language,
    t
  } = useLanguage();
  const {
    user
  } = useAuth();
  const {
    xpData,
    isLoading: xpLoading
  } = useXPSystem();
  const [currentPage, setCurrentPage] = useState<BookPage | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState(false);
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
      toast.error(t('pleaseLoginToTrack'));
      return;
    }
    if (!pageIsRead) {
      await markPageAsRead(pageNumber, currentPage.principle, currentPage.chapter);
    }
    const success = await markActionCompleted(pageNumber);
    if (success) {
      toast.success(t('actionCompletedToast'));
    }
  };
  const xpProgress = xpData ? xpData.xpInCurrentLevel / xpData.xpToNextLevel * 100 : 0;
  const currentXP = xpData ? xpData.xpInCurrentLevel : 0;
  if (!currentPage) {
    return <Card className="border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>;
  }

  // Show truncated in compact mode, full in expanded mode
  const displayQuote = isExpanded ? currentPage.content : currentPage.content.length > 180 ? currentPage.content.substring(0, 180) + '...' : currentPage.content;
  const displayInsight = isExpanded ? currentPage.keyInsight : currentPage.keyInsight && currentPage.keyInsight.length > 120 ? currentPage.keyInsight.substring(0, 120) + '...' : currentPage.keyInsight;
  const displayAction = isExpanded ? currentPage.dailyAction : currentPage.dailyAction.length > 100 ? currentPage.dailyAction.substring(0, 100) + '...' : currentPage.dailyAction;
  const hasMoreContent = currentPage.content.length > 180 || currentPage.keyInsight && currentPage.keyInsight.length > 120 || currentPage.dailyAction.length > 100;
  return <Card className="border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        
      </Collapsible>
    </Card>;
};
export default DailyCompactCard;