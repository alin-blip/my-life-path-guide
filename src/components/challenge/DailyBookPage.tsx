import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, ChevronLeft, ChevronRight, Share2, Check, CheckCircle2, Lightbulb, PenLine } from 'lucide-react';
import { getDailyPage, getPageByNumber, BookPage } from '@/services/napoleonHillBookService';
import { toast } from 'sonner';

interface DailyBookPageProps {
  onShare?: (page: BookPage) => void;
}

export const DailyBookPage: React.FC<DailyBookPageProps> = ({ onShare }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<BookPage | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  
  const { 
    isPageRead, 
    isActionCompleted, 
    markPageAsRead, 
    markActionCompleted,
    addNotes,
    isLoading 
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
      setShowNotes(false);
      setNotes('');
    }
  };

  const goToPreviousPage = () => {
    const prevPageNum = pageNumber > 1 ? pageNumber - 1 : 365;
    const page = getPageByNumber(prevPageNum);
    if (page) {
      setCurrentPage(page);
      setPageNumber(prevPageNum);
      setShowNotes(false);
      setNotes('');
    }
  };

  const handleShare = () => {
    if (currentPage && onShare) {
      onShare(currentPage);
    }
  };

  const handleMarkAsRead = async () => {
    if (!currentPage || !user) {
      toast.error(language === 'en' ? 'Please login to track progress' : 'Te rugăm să te autentifici pentru a urmări progresul');
      return;
    }

    const success = await markPageAsRead(
      pageNumber,
      currentPage.principle,
      currentPage.chapter,
      notes || undefined
    );

    if (success) {
      toast.success(language === 'en' ? 'Page marked as read!' : 'Pagină marcată ca citită!');
    }
  };

  const handleCompleteAction = async () => {
    if (!currentPage || !user) {
      toast.error(language === 'en' ? 'Please login to track progress' : 'Te rugăm să te autentifici pentru a urmări progresul');
      return;
    }

    if (!pageIsRead) {
      // First mark as read, then complete action
      await markPageAsRead(pageNumber, currentPage.principle, currentPage.chapter);
    }

    const success = await markActionCompleted(pageNumber);
    if (success) {
      toast.success(language === 'en' ? 'Action completed! Great work!' : 'Acțiune finalizată! Excelent!');
    }
  };

  const handleSaveNotes = async () => {
    if (!currentPage || !user || !notes.trim()) return;

    const success = await addNotes(pageNumber, notes);
    if (success) {
      toast.success(language === 'en' ? 'Notes saved!' : 'Note salvate!');
      setShowNotes(false);
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
        <div className="flex items-center gap-2">
          {pageIsRead && (
            <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              {language === 'en' ? 'Read' : 'Citit'}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {language === 'en' ? `Page ${pageNumber}/365` : `Pagina ${pageNumber}/365`}
          </span>
        </div>
      </div>

      {/* Chapter Badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="px-3 py-1 bg-primary/20 rounded-full text-xs text-primary font-medium">
          {currentPage.chapter}
        </span>
        <span className="px-3 py-1 bg-amber-500/20 rounded-full text-xs text-amber-500 font-medium">
          {currentPage.principle}
        </span>
      </div>

      {/* Content */}
      <div className="bg-background/50 p-4 rounded-lg border border-border/50 mb-4">
        <p className="text-foreground text-base leading-relaxed italic">
          "{currentPage.content}"
        </p>
      </div>

      {/* Key Insight */}
      {currentPage.keyInsight && (
        <div className="flex items-start gap-2 mb-3 bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
          <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-semibold text-blue-500">
              {language === 'en' ? 'Key Insight:' : 'Perspectivă Cheie:'}
            </span>
            <p className="text-sm text-foreground mt-1">
              {currentPage.keyInsight}
            </p>
          </div>
        </div>
      )}

      {/* Daily Action with Checkbox */}
      <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30 mb-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="action-complete"
            checked={actionIsDone}
            onCheckedChange={() => !actionIsDone && handleCompleteAction()}
            disabled={actionIsDone || isLoading}
            className="mt-1"
          />
          <div className="flex-1">
            <label htmlFor="action-complete" className="text-sm font-medium text-amber-400 cursor-pointer">
              {language === 'en' ? '⚡ Today\'s Action:' : '⚡ Acțiunea de Azi:'}
            </label>
            <p className="text-sm text-foreground mt-1">
              {currentPage.dailyAction}
            </p>
            {actionIsDone && (
              <span className="inline-flex items-center gap-1 text-xs text-green-500 mt-2">
                <Check className="h-3 w-3" />
                {language === 'en' ? 'Completed!' : 'Finalizat!'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {showNotes && (
        <div className="mb-4 space-y-2">
          <Textarea
            placeholder={language === 'en' ? 'Write your notes here...' : 'Scrie notițele tale aici...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowNotes(false)}>
              {language === 'en' ? 'Cancel' : 'Anulează'}
            </Button>
            <Button size="sm" onClick={handleSaveNotes} disabled={!notes.trim()}>
              {language === 'en' ? 'Save Notes' : 'Salvează Note'}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
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

        <div className="flex gap-2">
          {!showNotes && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotes(true)}
              className="border-border/50"
            >
              <PenLine className="h-4 w-4 mr-1" />
              {language === 'en' ? 'Notes' : 'Note'}
            </Button>
          )}

          {!pageIsRead && user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsRead}
              disabled={isLoading}
              className="border-green-500/50 text-green-500 hover:bg-green-500/10"
            >
              <Check className="h-4 w-4 mr-1" />
              {language === 'en' ? 'Mark Read' : 'Marchează Citit'}
            </Button>
          )}
          
          <Button
            variant="default"
            size="sm"
            onClick={handleShare}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Share' : 'Distribuie'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DailyBookPage;
