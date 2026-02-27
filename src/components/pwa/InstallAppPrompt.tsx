import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Smartphone, Monitor, Share, Plus, MoreVertical, Download, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppPrompt: React.FC = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('pwa_install_dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt);
      // Don't show for 24 hours after dismiss
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    setDismissed(true);
  };

  if (isInstalled) {
    return (
      <Card className="p-4 mb-6 bg-green-500/10 border-green-500/30">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="text-green-400 font-medium">
            {language === 'en' ? 'App installed! Open from your home screen.' : 'Aplicația este instalată! Deschide-o din ecranul principal.'}
          </span>
        </div>
      </Card>
    );
  }

  if (dismissed) return null;

  const isRo = language === 'ro';

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-primary/30 relative">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            {deviceType === 'desktop' ? (
              <Monitor className="h-6 w-6 text-primary" />
            ) : (
              <Smartphone className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {isRo ? '📲 Instalează CEO Mind OS' : '📲 Install CEO Mind OS'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRo 
                ? 'Acces instant din ecranul principal, fără browser'
                : 'Instant access from your home screen, no browser needed'}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleInstallClick}
          className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 whitespace-nowrap"
        >
          <Download className="h-4 w-4 mr-2" />
          {isRo ? 'Instalează' : 'Install'}
        </Button>
      </div>

      {showInstructions && (
        <div className="mt-4 pt-4 border-t border-border">
          {deviceType === 'ios' ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {isRo ? 'Pe iPhone/iPad:' : 'On iPhone/iPad:'}
              </p>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">1</span>
                  {isRo ? 'Apasă pe' : 'Tap'} <Share className="h-4 w-4 inline mx-1" /> {isRo ? '(butonul Share)' : '(Share button)'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">2</span>
                  {isRo ? 'Scroll și apasă "Add to Home Screen"' : 'Scroll and tap "Add to Home Screen"'} <Plus className="h-4 w-4 inline mx-1" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">3</span>
                  {isRo ? 'Apasă "Add" în colțul din dreapta sus' : 'Tap "Add" in the top right corner'}
                </li>
              </ol>
            </div>
          ) : deviceType === 'android' ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {isRo ? 'Pe Android:' : 'On Android:'}
              </p>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">1</span>
                  {isRo ? 'Apasă pe' : 'Tap'} <MoreVertical className="h-4 w-4 inline mx-1" /> {isRo ? '(meniul browser)' : '(browser menu)'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">2</span>
                  {isRo ? 'Selectează "Install app" sau "Add to Home screen"' : 'Select "Install app" or "Add to Home screen"'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">3</span>
                  {isRo ? 'Confirmă instalarea' : 'Confirm the installation'}
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {isRo ? 'Pe Desktop (Chrome/Edge):' : 'On Desktop (Chrome/Edge):'}
              </p>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">1</span>
                  {isRo ? 'Caută iconița de instalare' : 'Look for the install icon'} <Download className="h-4 w-4 inline mx-1" /> {isRo ? 'în bara de adrese' : 'in the address bar'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">2</span>
                  {isRo ? 'Click pe "Install" pentru a adăuga aplicația' : 'Click "Install" to add the app'}
                </li>
              </ol>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
