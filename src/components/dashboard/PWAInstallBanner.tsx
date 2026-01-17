import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if running on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check if dismissed recently (7 days)
    const dismissedAt = localStorage.getItem('pwa-banner-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) return;
    }

    // Detect iOS
    const iosDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(iosDevice);

    // Listen for beforeinstallprompt on Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show banner for iOS (no beforeinstallprompt event)
    if (iosDevice) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    setShowBanner(false);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // Navigate to install instructions page
      navigate('/install');
    } else if (deferredPrompt) {
      // Trigger Android install prompt
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <div className={cn(
      "relative rounded-xl border p-4 mb-4",
      "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10",
      "border-emerald-500/30"
    )}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <Smartphone className="h-6 w-6 animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-foreground">
            {language === 'en' 
              ? '📲 Install WarriorOS on your phone!' 
              : '📲 Instalează WarriorOS pe telefon!'}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {language === 'en'
              ? 'Quick access, works offline, just like a real app'
              : 'Acces rapid, funcționează offline, ca o aplicație reală'}
          </p>
        </div>

        {/* Action button */}
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
        >
          {isIOS ? (
            <>
              <ExternalLink className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'How to' : 'Vezi cum'}
              </span>
              <span className="sm:hidden">
                {language === 'en' ? 'Info' : 'Info'}
              </span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'Install' : 'Instalează'}
              </span>
              <span className="sm:hidden">
                {language === 'en' ? 'Get' : 'Ia'}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
