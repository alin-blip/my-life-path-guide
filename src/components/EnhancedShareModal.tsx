import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Quote } from '@/services/quotes/types/quoteTypes';
import quoteService from '@/services/quotes/quoteService';
import { Facebook, Twitter, Linkedin, Mail, Copy, Download, Share2, X, Instagram, Check, Smartphone, Award } from 'lucide-react';

interface EnhancedShareModalProps {
  quote: Quote;
  appName?: string;
  onClose: () => void;
}

interface QuoteInteractionStats {
  shares: number;
  likes: number;
  saves: number;
}

export const EnhancedShareModal: React.FC<EnhancedShareModalProps> = ({ 
  quote, 
  appName = "JUMP TO FREEDOM", 
  onClose
}) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('social');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedFont, setSelectedFont] = useState('serif');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [shareStats, setShareStats] = useState<QuoteInteractionStats | null>(null);
  const [quoteImageUrl, setQuoteImageUrl] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Templates for quote display
  const templates = {
    classic: 'Simple elegant design with quote and author',
    modern: 'Clean minimalist design with accent colors',
    nature: 'Nature-inspired background with organic elements',
    bold: 'Strong typography with high contrast',
    minimal: 'Understated design with focus on the words'
  };

  // Color schemes
  const colorSchemes = {
    blue: { primary: '#1a73e8', secondary: '#e8f0fe', text: '#202124' },
    dark: { primary: '#202124', secondary: '#303134', text: '#ffffff' },
    green: { primary: '#0f9d58', secondary: '#e6f4ea', text: '#202124' },
    purple: { primary: '#9c27b0', secondary: '#f3e5f5', text: '#202124' },
    orange: { primary: '#fa7b17', secondary: '#fff7e6', text: '#202124' }
  };

  // Font options
  const fontOptions = {
    serif: '"Georgia", serif',
    sans: '"Helvetica Neue", sans-serif',
    display: '"Playfair Display", serif',
    handwriting: '"Dancing Script", cursive',
    monospace: '"Roboto Mono", monospace'
  };

  // Load share statistics on mount
  useEffect(() => {
    if (quote) {
      const interactions = quoteService.getQuoteInteractions();
      const stats = {
        shares: interactions.shares?.[quote.id]?.count || 0,
        likes: interactions.likes?.[quote.id]?.count || 0,
        saves: interactions.saves?.[quote.id]?.count || 0
      };
      setShareStats(stats);
      generateQuoteImage();
    }
  }, [quote, selectedTemplate, selectedColor, selectedFont]);

  // Generate quote image for preview and download
  const generateQuoteImage = () => {
    if (!canvasRef.current || !quote) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 630;
    
    const colors = colorSchemes[selectedColor as keyof typeof colorSchemes];

    // Set background based on template
    if (selectedTemplate === 'classic') {
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add decorative elements
      ctx.fillStyle = colors.primary;
      ctx.fillRect(0, 0, canvas.width, 10);
      ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    } else if (selectedTemplate === 'modern') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add accent color block
      ctx.fillStyle = colors.primary;
      ctx.fillRect(0, 0, 200, canvas.height);
    } else if (selectedTemplate === 'nature') {
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#3CB371');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add "nature" elements
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(150, canvas.height - 200, 100, 200); // tree trunk
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(200, canvas.height - 250, 150, 0, Math.PI * 2);
      ctx.fill(); // tree top
    } else if (selectedTemplate === 'bold') {
      // High contrast background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Minimal template
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle border
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 20;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    }

    // Set font based on template and user selection
    let fontFamily;
    let quoteSize;
    let authorSize;
    
    switch (selectedFont) {
      case 'serif':
        fontFamily = 'Georgia, serif';
        break;
      case 'sans':
        fontFamily = 'Helvetica Neue, Arial, sans-serif';
        break;
      case 'display':
        fontFamily = 'Playfair Display, Georgia, serif';
        break;
      case 'handwriting':
        fontFamily = 'Dancing Script, cursive';
        break;
      case 'monospace':
        fontFamily = 'Roboto Mono, monospace';
        break;
      default:
        fontFamily = 'Georgia, serif';
    }
    
    if (selectedTemplate === 'bold') {
      quoteSize = 52;
      authorSize = 32;
    } else if (selectedTemplate === 'minimal') {
      quoteSize = 42;
      authorSize = 26;
    } else {
      quoteSize = 48;
      authorSize = 28;
    }

    // Set text color based on template and color scheme
    if (selectedTemplate === 'bold') {
      ctx.fillStyle = '#ffffff';
    } else if (selectedTemplate === 'modern' && selectedColor === 'dark') {
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = colors.text;
    }

    ctx.textAlign = 'center';
    
    // Draw the quote
    ctx.font = `bold ${quoteSize}px ${fontFamily}`;
    
    // Word wrap function
    const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let testLine = '';
      let lineArray = [];
      let currentY = y;

      for(let n = 0; n < words.length; n++) {
        testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          lineArray.push({text: line, y: currentY});
          line = words[n] + ' ';
          currentY += lineHeight;
        }
        else {
          line = testLine;
        }
      }
      
      lineArray.push({text: line, y: currentY});
      return lineArray;
    };

    // Draw the quote with word wrapping
    const quoteWithQuotationMarks = `"${quote.text}"`;
    const wrappedQuote = wrapText(ctx, quoteWithQuotationMarks, canvas.width/2, canvas.height/2 - 100, canvas.width - 300, 60);
    wrappedQuote.forEach(line => {
      ctx.fillText(line.text, canvas.width/2, line.y);
    });

    // Draw the author
    ctx.font = `italic ${authorSize}px ${fontFamily}`;
    ctx.fillText(`- ${quote.author}`, canvas.width/2, wrappedQuote[wrappedQuote.length-1].y + 80);
    
    // Draw app name watermark
    ctx.font = `16px ${fontFamily}`;
    ctx.globalAlpha = 0.7;
    ctx.fillText(appName, canvas.width/2, canvas.height - 30);
    ctx.globalAlpha = 1.0;

    // Store the image URL
    setQuoteImageUrl(canvas.toDataURL('image/png'));
  };

  // Challenge CTA constants
  const CHALLENGE_CTA = "🚀 Start your FREE 7-day transformation challenge";
  const CHALLENGE_URL = "napoleonhill.academy/challenge";
  const CHALLENGE_HASHTAGS = "ThinkAndGrowRich,NapoleonHill,Success,Transformation";

  // Handle social media sharing
  const handleSocialShare = (platform: string) => {
    if (!quote) return;

    // Record the share interaction
    quoteService.recordQuoteInteraction(quote.id, 'shares');

    // Prepare the quote text with Challenge CTA
    const quoteText = `"${quote.text}" — ${quote.author}`;
    const textWithCTA = `${quoteText}\n\n${CHALLENGE_CTA}\n${CHALLENGE_URL}`;
    const text = encodeURIComponent(textWithCTA);
    const hashtags = encodeURIComponent(CHALLENGE_HASHTAGS);
    const url = encodeURIComponent(window.location.origin + '/challenge');

    // Open the appropriate share dialog based on platform
    let shareUrl;
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=Daily%20Inspiration&summary=${text}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Daily%20Inspiration&body=${text}%0A%0A${url}`;
        break;
      case 'instagram':
        toast({
          title: language === 'en' ? "Instagram sharing" : "Partajare pe Instagram",
          description: language === 'en' ? "Please use the download option and share the image on Instagram manually" : "Vă rugăm să folosiți opțiunea de descărcare și să partajați imaginea pe Instagram manual"
        });
        downloadImage();
        return;
      default:
        return;
    }

    // Open share dialog in a new window
    window.open(shareUrl, '_blank', 'width=600,height=400');

    // Show success message
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 3000);
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    if (!quote) return;
    
    // Create formatted text with quote, attribution, and Challenge CTA
    const textToCopy = `"${quote.text}"\n— ${quote.author}\n\n🚀 Start your FREE 7-day transformation challenge\n${window.location.origin}/challenge\n\n#ThinkAndGrowRich #NapoleonHill`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 3000);
        quoteService.recordQuoteInteraction(quote.id, 'shares');
        
        toast({
          title: language === 'en' ? "Copied to clipboard" : "Copiat în clipboard",
          description: language === 'en' ? "The quote has been copied to your clipboard" : "Citatul a fost copiat în clipboard"
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: language === 'en' ? "Error" : "Eroare",
          description: language === 'en' ? "Failed to copy to clipboard" : "Nu s-a putut copia în clipboard",
          variant: "destructive"
        });
      });
  };

  // Handle download as image
  const downloadImage = () => {
    if (!quoteImageUrl || !quote) return;

    const link = document.createElement('a');
    link.download = 'napoleon-hill-quote.png';
    link.href = quoteImageUrl;
    link.click();

    quoteService.recordQuoteInteraction(quote.id, 'shares');
    
    toast({
      title: language === 'en' ? "Quote downloaded" : "Citat descărcat",
      description: language === 'en' ? "The quote has been downloaded as an image" : "Citatul a fost descărcat ca imagine"
    });
  };

  // Generate preview style based on selected options
  const getPreviewStyle = () => {
    const colors = colorSchemes[selectedColor as keyof typeof colorSchemes];
    
    let style: React.CSSProperties = {
      fontFamily: fontOptions[selectedFont as keyof typeof fontOptions],
      padding: '2rem',
      maxWidth: '100%',
      margin: '0 auto',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      borderRadius: '0.5rem',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '200px'
    };
    
    if (selectedTemplate === 'classic') {
      style = {
        ...style,
        backgroundColor: colors.secondary,
        color: colors.text,
        borderColor: colors.primary,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderTop: `10px solid ${colors.primary}`,
        borderBottom: `10px solid ${colors.primary}`
      };
    } else if (selectedTemplate === 'modern') {
      style = {
        ...style,
        backgroundColor: '#ffffff',
        color: colors.text,
        borderLeft: `20px solid ${colors.primary}`
      };
    } else if (selectedTemplate === 'nature') {
      style = {
        ...style,
        background: 'linear-gradient(to bottom, #87CEEB, #3CB371)',
        color: '#202124',
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.7)'
      };
    } else if (selectedTemplate === 'bold') {
      style = {
        ...style,
        backgroundColor: '#000000',
        color: '#ffffff',
        fontWeight: 700
      };
    } else { // minimal
      style = {
        ...style,
        backgroundColor: '#ffffff',
        color: '#202124',
        border: '20px solid #eeeeee'
      };
    }
    
    return style;
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border border-primary/20 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {language === 'en' ? 'Share Inspiration' : 'Distribuie Inspirația'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Preview */}
        <div className="my-4">
          <div ref={previewRef} style={getPreviewStyle()} className="preview-container">
            <blockquote>
              <p className="quote-text text-lg font-medium mb-2">"{quote.text}"</p>
              <footer className="quote-author text-sm italic">— {quote.author}</footer>
            </blockquote>
            <div className="branding text-xs mt-4 opacity-70">{appName}</div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="social" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-card">
            <TabsTrigger value="social">{language === 'en' ? 'Social Media' : 'Social Media'}</TabsTrigger>
            <TabsTrigger value="customize">{language === 'en' ? 'Customize' : 'Personalizează'}</TabsTrigger>
            <TabsTrigger value="copy">{language === 'en' ? 'Copy & Download' : 'Copiază & Descarcă'}</TabsTrigger>
            <TabsTrigger value="stats">{language === 'en' ? 'Stats' : 'Statistici'}</TabsTrigger>
          </TabsList>
          
          {/* Social Media Tab */}
          <TabsContent value="social" className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto bg-blue-900/20 hover:bg-blue-900/40 border-blue-800/40"
                onClick={() => handleSocialShare('facebook')}
              >
                <Facebook className="h-6 w-6 mb-1 text-blue-400" />
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto bg-sky-900/20 hover:bg-sky-900/40 border-sky-800/40"
                onClick={() => handleSocialShare('twitter')}
              >
                <Twitter className="h-6 w-6 mb-1 text-sky-400" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto bg-blue-900/20 hover:bg-blue-900/40 border-blue-800/40"
                onClick={() => handleSocialShare('linkedin')}
              >
                <Linkedin className="h-6 w-6 mb-1 text-blue-400" />
                <span className="text-xs">LinkedIn</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto bg-red-900/20 hover:bg-red-900/40 border-red-800/40"
                onClick={() => handleSocialShare('email')}
              >
                <Mail className="h-6 w-6 mb-1 text-red-400" />
                <span className="text-xs">Email</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto bg-pink-900/20 hover:bg-pink-900/40 border-pink-800/40"
                onClick={() => handleSocialShare('instagram')}
              >
                <Instagram className="h-6 w-6 mb-1 text-pink-400" />
                <span className="text-xs">Instagram</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto bg-purple-900/20 hover:bg-purple-900/40 border-purple-800/40"
                onClick={() => handleCopyToClipboard()}
              >
                <Copy className="h-6 w-6 mb-1 text-purple-400" />
                <span className="text-xs">{language === 'en' ? 'Copy' : 'Copiază'}</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto bg-purple-900/20 hover:bg-purple-900/40 border-purple-800/40"
                onClick={() => downloadImage()}
              >
                <Download className="h-6 w-6 mb-1 text-purple-400" />
                <span className="text-xs">{language === 'en' ? 'Download' : 'Descarcă'}</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-4 h-auto bg-green-900/20 hover:bg-green-900/40 border-green-800/40"
                onClick={() => {
                  navigator.share?.({
                    title: 'Inspirational Quote',
                    text: `"${quote.text}" - ${quote.author}`,
                    url: window.location.href
                  }).catch(err => console.error('Error sharing:', err));
                  
                  quoteService.recordQuoteInteraction(quote.id, 'shares');
                }}
              >
                <Share2 className="h-6 w-6 mb-1 text-green-400" />
                <span className="text-xs">{language === 'en' ? 'Native Share' : 'Distribuie'}</span>
              </Button>
            </div>
            
            {showShareSuccess && (
              <div className="mt-4 p-2 bg-green-900/20 border border-green-800/40 rounded-md flex items-center justify-center text-sm text-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                {language === 'en' 
                  ? 'Successfully shared! Thank you for spreading inspiration.' 
                  : 'Distribuit cu succes! Mulțumim pentru răspândirea inspirației.'
                }
              </div>
            )}
          </TabsContent>
          
          {/* Customize Tab */}
          <TabsContent value="customize" className="pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  {language === 'en' ? 'Template' : 'Șablon'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(templates).map(([key, description]) => (
                    <Button
                      key={key}
                      variant={selectedTemplate === key ? "default" : "outline"}
                      className={`h-auto py-2 text-xs ${
                        selectedTemplate === key 
                          ? "bg-primary hover:bg-primary/80" 
                          : "bg-background/50 hover:bg-background"
                      }`}
                      title={description}
                      onClick={() => setSelectedTemplate(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  {language === 'en' ? 'Color Scheme' : 'Schemă de Culori'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(colorSchemes).map(([color, scheme]) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color 
                          ? "border-primary" 
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: scheme.primary }}
                      onClick={() => setSelectedColor(color)}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                      aria-label={`${color} color scheme`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  {language === 'en' ? 'Font Style' : 'Stil Font'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <Button
                    variant={selectedFont === "serif" ? "default" : "outline"}
                    className={`h-auto py-2 ${
                      selectedFont === "serif" 
                        ? "bg-primary hover:bg-primary/80" 
                        : "bg-background/50 hover:bg-background"
                    }`}
                    style={{ fontFamily: fontOptions.serif }}
                    onClick={() => setSelectedFont("serif")}
                  >
                    Serif
                  </Button>
                  <Button
                    variant={selectedFont === "sans" ? "default" : "outline"}
                    className={`h-auto py-2 ${
                      selectedFont === "sans" 
                        ? "bg-primary hover:bg-primary/80" 
                        : "bg-background/50 hover:bg-background"
                    }`}
                    style={{ fontFamily: fontOptions.sans }}
                    onClick={() => setSelectedFont("sans")}
                  >
                    Sans
                  </Button>
                  <Button
                    variant={selectedFont === "display" ? "default" : "outline"}
                    className={`h-auto py-2 ${
                      selectedFont === "display" 
                        ? "bg-primary hover:bg-primary/80" 
                        : "bg-background/50 hover:bg-background"
                    }`}
                    style={{ fontFamily: fontOptions.display }}
                    onClick={() => setSelectedFont("display")}
                  >
                    Display
                  </Button>
                  <Button
                    variant={selectedFont === "handwriting" ? "default" : "outline"}
                    className={`h-auto py-2 ${
                      selectedFont === "handwriting" 
                        ? "bg-primary hover:bg-primary/80" 
                        : "bg-background/50 hover:bg-background"
                    }`}
                    style={{ fontFamily: fontOptions.handwriting }}
                    onClick={() => setSelectedFont("handwriting")}
                  >
                    Script
                  </Button>
                  <Button
                    variant={selectedFont === "monospace" ? "default" : "outline"}
                    className={`h-auto py-2 ${
                      selectedFont === "monospace" 
                        ? "bg-primary hover:bg-primary/80" 
                        : "bg-background/50 hover:bg-background"
                    }`}
                    style={{ fontFamily: fontOptions.monospace }}
                    onClick={() => setSelectedFont("monospace")}
                  >
                    Mono
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/80"
                onClick={downloadImage}
              >
                <Download className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Download with these settings' : 'Descarcă cu aceste setări'}
              </Button>
            </div>
          </TabsContent>
          
          {/* Copy & Download Tab */}
          <TabsContent value="copy" className="pt-4">
            <div className="space-y-4">
              <div className="p-4 bg-background/50 border border-border/10 rounded-md">
                <p className="text-center italic mb-4">"{quote.text}"</p>
                <p className="text-center text-sm">— {quote.author}</p>
              </div>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center bg-background/50 hover:bg-background border-border/30"
                onClick={handleCopyToClipboard}
              >
                <Copy className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Copy to Clipboard' : 'Copiază în Clipboard'}
              </Button>
              
              {showCopiedMessage && (
                <div className="p-2 bg-green-900/20 border border-green-800/40 rounded-md flex items-center justify-center text-sm">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  {language === 'en' ? 'Copied to clipboard!' : 'Copiat în clipboard!'}
                </div>
              )}
              
              <div className="border-t border-border/10 pt-4">
                <p className="text-sm mb-3">
                  {language === 'en'
                    ? 'Download as image to share on social media or print:' 
                    : 'Descarcă ca imagine pentru a distribui pe social media sau pentru printare:'
                  }
                </p>
                
                <Button
                  className="w-full bg-primary hover:bg-primary/80"
                  onClick={downloadImage}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Download Image' : 'Descarcă Imagine'}
                </Button>
                
                <p className="text-xs text-center mt-2 text-gray-400">
                  {language === 'en'
                    ? 'Perfect for sharing on Instagram or printing!'
                    : 'Perfect pentru distribuire pe Instagram sau printare!'
                  }
                </p>
              </div>
              
              <div className="border-t border-border/10 pt-4">
                <p className="text-sm mb-3">
                  {language === 'en'
                    ? 'Share directly to your phone:'
                    : 'Distribuie direct pe telefonul tău:'
                  }
                </p>
                
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center bg-background/50 hover:bg-background border-border/30"
                  onClick={() => {
                    // Generate a shareable URL with the quote text encoded
                    const shareableUrl = `${window.location.origin}${window.location.pathname}?quote=${encodeURIComponent(quote.text)}&author=${encodeURIComponent(quote.author)}`;
                    
                    // Create a QR code URL using an external service
                    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableUrl)}`;
                    
                    // Open the QR code in a new window
                    window.open(qrCodeUrl, '_blank', 'width=300,height=300');
                    
                    quoteService.recordQuoteInteraction(quote.id, 'shares');
                  }}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Generate QR Code' : 'Generează Cod QR'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="pt-4">
            {shareStats && (
              <div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-background/50 p-4 rounded-md border border-border/10 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{shareStats.shares}</span>
                    <span className="text-xs text-gray-400">{language === 'en' ? 'Shares' : 'Distribuiri'}</span>
                  </div>
                  
                  <div className="bg-background/50 p-4 rounded-md border border-border/10 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{shareStats.likes}</span>
                    <span className="text-xs text-gray-400">{language === 'en' ? 'Likes' : 'Aprecieri'}</span>
                  </div>
                  
                  <div className="bg-background/50 p-4 rounded-md border border-border/10 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{shareStats.saves}</span>
                    <span className="text-xs text-gray-400">{language === 'en' ? 'Saves' : 'Salvări'}</span>
                  </div>
                </div>
                
                <div className="bg-background/50 p-4 rounded-md border border-border/10 text-center mb-4">
                  <h4 className="font-medium mb-2">
                    {language === 'en' ? 'Your Impact' : 'Impactul Tău'}
                  </h4>
                  <p className="text-sm text-gray-300 mb-4">
                    {language === 'en'
                      ? 'By sharing inspiration, you\'ve helped motivate others on their journey.'
                      : 'Prin distribuirea inspirației, ai ajutat la motivarea altora în călătoria lor.'
                    }
                  </p>
                  
                  {shareStats.shares > 5 && (
                    <div className="flex items-center justify-center p-3 bg-amber-900/20 border border-amber-800/30 rounded-md">
                      <Award className="h-5 w-5 mr-2 text-amber-400" />
                      <span className="text-sm text-amber-300">
                        {language === 'en'
                          ? 'Inspiration Champion Badge Unlocked!'
                          : 'Insignă de Campion al Inspirației Deblocată!'
                        }
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-center text-gray-400">
                  {language === 'en'
                    ? 'Continue sharing to increase your impact score!'
                    : 'Continuă să distribui pentru a-ți crește scorul de impact!'
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Hidden canvas for generating the image */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }} 
          width="1200" 
          height="630"
        />
      </DialogContent>
    </Dialog>
  );
};
