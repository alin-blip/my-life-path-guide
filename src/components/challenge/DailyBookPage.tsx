import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { BookOpen, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { getDailyPage, getPageByNumber, BookPage } from '@/services/napoleonHillBookService';

interface DailyBookPageProps {
  onShare?: (page: BookPage) => void;
}

export const DailyBookPage: React.FC<DailyBookPageProps> = ({ onShare }) => {
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState<BookPage | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    const page = getDailyPage();
    setCurrentPage(page);
    setPageNumber(page.id);
  }, []);

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

  const handleShare = () => {
    if (currentPage && onShare) {
      onShare(currentPage);
    }
  };

  if (!currentPage) {
    return (
      <Card className="p-6 bg-card border-primary/20">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-primary/20 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            {language === 'en' ? '📖 Daily Page from Think and Grow Rich' : '📖 Pagina Zilnică din Think and Grow Rich'}
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {language === 'en' ? `Page ${pageNumber}/365` : `Pagina ${pageNumber}/365`}
        </span>
      </div>

      {/* Chapter Badge */}
      <div className="mb-4">
        <span className="px-3 py-1 bg-primary/20 rounded-full text-xs text-primary font-medium">
          {currentPage.chapter}
        </span>
      </div>

      {/* Content */}
      <div className="bg-background/50 p-4 rounded-lg border border-border/50 mb-4">
        <p className="text-foreground text-base leading-relaxed italic">
          "{currentPage.content}"
        </p>
      </div>

      {/* Principle */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-amber-500">
          {language === 'en' ? 'Principle:' : 'Principiu:'}
        </span>
        <span className="text-sm text-muted-foreground">
          {currentPage.principle}
        </span>
      </div>

      {/* Daily Action */}
      <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30 mb-4">
        <p className="text-sm font-medium text-amber-400 mb-1">
          {language === 'en' ? '⚡ Today\'s Action:' : '⚡ Acțiunea de Azi:'}
        </p>
        <p className="text-sm text-foreground">
          {currentPage.dailyAction}
        </p>
      </div>

      {/* Navigation and Share */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            className="border-border/50 hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            className="border-border/50 hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleShare}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Share2 className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Share & Start Challenge' : 'Distribuie & Începe Challenge'}
        </Button>
      </div>
    </Card>
  );
};

export default DailyBookPage;
