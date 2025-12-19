import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Share, Heart, Bookmark, RefreshCw, Star, Download, Facebook, Twitter, Copy } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import quoteService from '@/services/quotes/quoteService';
import { Quote } from '@/services/quotes/types/quoteTypes';
import { EnhancedShareModal } from './EnhancedShareModal';
interface EnhancedQuoteDisplayProps {
  appName?: string;
}
export const EnhancedQuoteDisplay: React.FC<EnhancedQuoteDisplayProps> = ({
  appName = "NAPOLEON HILL ACADEMY"
}) => {
  const {
    toast
  } = useToast();
  const {
    language
  } = useLanguage();
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reflection, setReflection] = useState<string>('');
  const [showReflectionInput, setShowReflectionInput] = useState<boolean>(false);
  const [similarQuotes, setSimilarQuotes] = useState<Quote[]>([]);
  const [showSimilarQuotes, setShowSimilarQuotes] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [quoteImageUrl, setQuoteImageUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load quote on component mount
  useEffect(() => {
    loadDailyQuote();
  }, [language]);

  // Generate quote image whenever quote changes
  useEffect(() => {
    if (currentQuote) {
      generateQuoteImage();
    }
  }, [currentQuote, language, appName]);

  // Load daily quote
  const loadDailyQuote = () => {
    setIsLoading(true);
    const quote = quoteService.getDailyQuote(language === 'en' ? 'en' : 'ro');
    setCurrentQuote(quote);
    if (quote) {
      // Check if user has already rated this quote
      const interactions = quoteService.getQuoteInteractions();
      const rating = interactions.ratings?.[quote.id]?.rating || 0;
      setSelectedRating(rating);

      // Load existing reflection if any
      const existingReflection = quoteService.getQuoteReflection(quote.id);
      if (existingReflection) {
        setReflection(existingReflection.text);
      } else {
        setReflection('');
      }

      // Load similar quotes
      const similar = quoteService.getSimilarQuotes(quote, 3);
      setSimilarQuotes(similar);
    }
    setIsLoading(false);
  };

  // Load personalized quote
  const loadPersonalizedQuote = () => {
    setIsLoading(true);
    const quote = quoteService.getPersonalizedQuoteForUser();
    setCurrentQuote(quote);
    if (quote) {
      // Check if user has already rated this quote
      const interactions = quoteService.getQuoteInteractions();
      const rating = interactions.ratings?.[quote.id]?.rating || 0;
      setSelectedRating(rating);

      // Load existing reflection if any
      const existingReflection = quoteService.getQuoteReflection(quote.id);
      if (existingReflection) {
        setReflection(existingReflection.text);
      } else {
        setReflection('');
      }

      // Load similar quotes
      const similar = quoteService.getSimilarQuotes(quote, 3);
      setSimilarQuotes(similar);
    }
    setIsLoading(false);
  };

  // Load random quote
  const loadRandomQuote = () => {
    setIsLoading(true);
    const quote = quoteService.getRandomQuote();
    setCurrentQuote(quote);
    if (quote) {
      // Check if user has already rated this quote
      const interactions = quoteService.getQuoteInteractions();
      const rating = interactions.ratings?.[quote.id]?.rating || 0;
      setSelectedRating(rating);

      // Load existing reflection if any
      const existingReflection = quoteService.getQuoteReflection(quote.id);
      if (existingReflection) {
        setReflection(existingReflection.text);
      } else {
        setReflection('');
      }

      // Load similar quotes
      const similar = quoteService.getSimilarQuotes(quote, 3);
      setSimilarQuotes(similar);
    }
    setIsLoading(false);
  };

  // Handle like interaction
  const handleLike = () => {
    if (currentQuote) {
      quoteService.recordQuoteInteraction(currentQuote.id, 'likes');
      toast({
        title: language === 'en' ? 'Quote liked!' : 'Citat apreciat!',
        description: language === 'en' ? 'This quote has been added to your favorites.' : 'Acest citat a fost adăugat la favorite.'
      });
      // Force re-render
      setCurrentQuote({
        ...currentQuote
      });
    }
  };

  // Handle save interaction
  const handleSave = () => {
    if (currentQuote) {
      quoteService.recordQuoteInteraction(currentQuote.id, 'saves');
      toast({
        title: language === 'en' ? 'Quote saved!' : 'Citat salvat!',
        description: language === 'en' ? 'This quote has been saved to your collection.' : 'Acest citat a fost salvat în colecția ta.'
      });
      // Force re-render
      setCurrentQuote({
        ...currentQuote
      });
    }
  };

  // Handle rating selection
  const handleRatingSelect = (rating: number) => {
    if (currentQuote) {
      setSelectedRating(rating);
      quoteService.rateQuoteImpact(currentQuote.id, rating);
      toast({
        title: language === 'en' ? 'Rating saved!' : 'Evaluare salvată!',
        description: language === 'en' ? 'Thank you for rating this quote.' : 'Mulțumim pentru evaluarea citatului.'
      });
    }
  };

  // Handle reflection submission
  const handleReflectionSubmit = () => {
    if (currentQuote && reflection.trim()) {
      quoteService.addQuoteReflection(currentQuote.id, reflection);
      setShowReflectionInput(false);
      toast({
        title: language === 'en' ? 'Reflection saved!' : 'Reflecție salvată!',
        description: language === 'en' ? 'Your personal reflection has been saved.' : 'Reflecția ta personală a fost salvată.'
      });
    }
  };

  // Check if quote has been interacted with
  const hasInteracted = (interactionType: 'likes' | 'shares' | 'saves'): boolean => {
    return currentQuote ? quoteService.hasInteractedWithQuote(currentQuote.id, interactionType) : false;
  };

  // Function to generate the quote image
  const generateQuoteImage = () => {
    if (!canvasRef.current || !currentQuote) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 630;

    // Set background
    ctx.fillStyle = '#1A1F2C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // Draw the quote
    ctx.font = 'bold 48px Arial';

    // Word wrap function
    const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let testLine = '';
      let lineArray = [];
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lineArray.push({
            text: line,
            y: currentY
          });
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      lineArray.push({
        text: line,
        y: currentY
      });
      return lineArray;
    };

    // Draw the quote with word wrapping
    const quoteWithQuotationMarks = `"${currentQuote.text}"`;
    const wrappedQuote = wrapText(ctx, quoteWithQuotationMarks, canvas.width / 2, canvas.height / 2 - 100, canvas.width - 200, 60);
    wrappedQuote.forEach(line => {
      ctx.fillText(line.text, canvas.width / 2, line.y);
    });

    // Draw the author
    ctx.font = 'italic 36px Arial';
    ctx.fillText(`- ${currentQuote.author}`, canvas.width / 2, wrappedQuote[wrappedQuote.length - 1].y + 80);

    // Draw the category
    ctx.font = 'bold 24px Arial';
    ctx.fillText(currentQuote.category.toUpperCase(), canvas.width / 2, wrappedQuote[wrappedQuote.length - 1].y + 130);

    // Draw the app name
    ctx.font = '24px Arial';
    ctx.fillText(appName, canvas.width / 2, canvas.height - 50);

    // Store the image URL
    setQuoteImageUrl(canvas.toDataURL('image/png'));
  };

  // Function to copy the quote to clipboard
  const copyToClipboard = () => {
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.text}" - ${currentQuote.author} | ${appName}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: language === 'en' ? "Copied to clipboard" : "Copiat în clipboard",
      description: language === 'en' ? "The quote has been copied to your clipboard" : "Citatul a fost copiat în clipboard"
    });

    // Record the share interaction
    if (currentQuote) {
      quoteService.recordQuoteInteraction(currentQuote.id, 'shares');
    }
  };

  // Function to download the quote as an image
  const downloadQuoteImage = () => {
    if (!quoteImageUrl || !currentQuote) return;
    const link = document.createElement('a');
    link.download = 'warrior-quote.png';
    link.href = quoteImageUrl;
    link.click();
    toast({
      title: language === 'en' ? "Quote downloaded" : "Citat descărcat",
      description: language === 'en' ? "The quote has been downloaded as an image" : "Citatul a fost descărcat ca imagine"
    });

    // Record the share interaction
    if (currentQuote) {
      quoteService.recordQuoteInteraction(currentQuote.id, 'shares');
    }
  };
  const handleOpenShareModal = () => {
    if (currentQuote) {
      setShowShareModal(true);
    }
  };

  // Render loading state
  if (isLoading) {
    return <div className="bg-card p-6 rounded-lg mb-8 shadow-md border border-primary/20 min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>;
  }

  // Render error state if no quote
  if (!currentQuote) {
    return <div className="bg-card p-6 rounded-lg mb-8 shadow-md border border-primary/20 min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{language === 'en' ? 'Could not load quote. Please try again.' : 'Nu s-a putut încărca citatul. Vă rugăm să încercați din nou.'}</p>
        <Button onClick={loadRandomQuote} variant="outline" className="bg-purple-600/20 border-purple-500/50 hover:bg-purple-700/30 text-white">
          {language === 'en' ? 'Try Again' : 'Încercați din nou'}
        </Button>
      </div>;
  }
  return <div className="bg-card p-6 rounded-lg mb-8 shadow-md border border-primary/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2 md:mb-0">
          {language === 'en' ? '📖 Daily Page from Think and Grow Rich' : '📖 Pagina Zilnică din Think and Grow Rich'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadRandomQuote} className="bg-purple-600/20 border-purple-500/50 hover:bg-purple-700/30 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'en' ? 'New Quote' : 'Citat Nou'}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-blue-600/20 border-blue-500/50 hover:bg-blue-700/30 text-white">
                <Share className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Share' : 'Distribuie'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 bg-card border border-primary/20">
              <div className="grid gap-2">
                <h3 className="font-medium text-white mb-2">{language === 'en' ? 'Share Quote' : 'Distribuie Citatul'}</h3>
                <div className="flex gap-2 justify-between">
                  <Button variant="outline" size="sm" className="flex-1 bg-blue-800/30 hover:bg-blue-800/50 text-white" onClick={() => {
                  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`"${currentQuote.text}" - ${currentQuote.author}`)}`;
                  window.open(facebookUrl, '_blank', 'width=600,height=400');
                  if (currentQuote) {
                    quoteService.recordQuoteInteraction(currentQuote.id, 'shares');
                  }
                }}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-blue-500/30 hover:bg-blue-500/50 text-white" onClick={() => {
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${currentQuote.text}" - ${currentQuote.author} | ${appName}`)}&url=${encodeURIComponent(window.location.href)}`;
                  window.open(twitterUrl, '_blank', 'width=600,height=400');
                  if (currentQuote) {
                    quoteService.recordQuoteInteraction(currentQuote.id, 'shares');
                  }
                }}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                </div>
                <div className="flex gap-2 justify-between mt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-gray-600/30 hover:bg-gray-600/50 text-white" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Copy' : 'Copiază'}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-gray-600/30 hover:bg-gray-600/50 text-white" onClick={handleOpenShareModal}>
                    <Share className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'More' : 'Mai mult'}
                  </Button>
                </div>
                <Button variant="default" size="sm" className="mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" onClick={downloadQuoteImage}>
                  <Download className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Download Image' : 'Descarcă Imagine'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card className="relative bg-black/30 p-6 rounded-lg mt-2 min-h-[180px] border-warrior-muted/10">
        <div className="text-center">
          <p className="text-white text-lg md:text-xl italic mb-3">"{currentQuote.text}"</p>
          <p className="text-gray-300 text-sm md:text-base">— {currentQuote.author}</p>
          <div className="mt-3 flex items-center justify-center">
            <span className="px-2 py-1 bg-warrior-accent/20 rounded-full text-xs text-warrior-accent">
              {currentQuote.category}
            </span>
          </div>
        </div>
      </Card>
      
      <div className="flex flex-wrap gap-2 mt-4 justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className={`bg-transparent border-warrior-muted/30 hover:bg-warrior-accent/10 ${hasInteracted('likes') ? 'text-warrior-accent' : 'text-gray-400'}`} onClick={handleLike}>
            <Heart className={`h-4 w-4 mr-2 ${hasInteracted('likes') ? 'fill-warrior-accent' : ''}`} />
            {language === 'en' ? 'Like' : 'Apreciază'}
          </Button>
          
          <Button variant="outline" size="sm" className={`bg-transparent border-warrior-muted/30 hover:bg-warrior-accent/10 ${hasInteracted('saves') ? 'text-warrior-accent' : 'text-gray-400'}`} onClick={handleSave}>
            <Bookmark className={`h-4 w-4 mr-2 ${hasInteracted('saves') ? 'fill-warrior-accent' : ''}`} />
            {language === 'en' ? 'Save' : 'Salvează'}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-transparent border-warrior-muted/30 hover:bg-warrior-accent/10 text-gray-400" onClick={loadDailyQuote}>
            {language === 'en' ? 'Daily' : 'Zilnic'}
          </Button>
          
          <Button variant="outline" size="sm" className="bg-transparent border-warrior-muted/30 hover:bg-warrior-accent/10 text-gray-400" onClick={loadPersonalizedQuote}>
            {language === 'en' ? 'For You' : 'Pentru Tine'}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        
        
        
        
        {similarQuotes.length > 0}
      </div>
      
      {/* Hidden canvas for generating the image */}
      <canvas ref={canvasRef} style={{
      display: 'none'
    }} width="1200" height="630" />
      
      {/* Share Modal */}
      {showShareModal && currentQuote && <EnhancedShareModal quote={currentQuote} appName={appName} onClose={() => setShowShareModal(false)} />}
    </div>;
};
export default EnhancedQuoteDisplay;