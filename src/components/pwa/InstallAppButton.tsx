import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Install CEO Mind OS as a PWA.
 * - Android/Desktop Chrome → native install prompt
 * - iOS Safari → instructions dialog (Add to Home Screen)
 * - Hidden when already installed (standalone mode)
 */
export const InstallAppButton: React.FC<{ variant?: 'default' | 'outline' | 'ghost'; className?: string }> = ({
  variant = 'default',
  className,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSDialog, setShowIOSDialog] = useState(false);

  useEffect(() => {
    // Detect already-installed (running as PWA)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS (no beforeinstallprompt support)
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => setIsStandalone(true);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  // Already installed → hide
  if (isStandalone) return null;

  // No native prompt available AND not iOS → hide (e.g. Firefox desktop)
  if (!deferredPrompt && !isIOS) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIOS) {
      setShowIOSDialog(true);
    }
  };

  return (
    <>
      <Button onClick={handleClick} variant={variant} className={className} size="sm">
        <Download className="w-4 h-4 mr-2" />
        Instalează aplicația
      </Button>

      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Instalează CEO Mind OS pe iPhone</DialogTitle>
            <DialogDescription>
              Adaugă aplicația pe ecranul de start în 3 pași simpli:
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="font-semibold text-primary">1.</span>
              <span className="flex items-center gap-1.5">
                Apasă butonul <Share className="inline w-4 h-4" /> <strong>Share</strong> din bara
                Safari (jos)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-primary">2.</span>
              <span className="flex items-center gap-1.5">
                Selectează <Plus className="inline w-4 h-4" />{' '}
                <strong>„Add to Home Screen"</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-semibold text-primary">3.</span>
              <span>
                Confirmă <strong>„Add"</strong> — icon-ul CEO Mind OS apare pe ecranul de start
              </span>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground mt-4">
            După instalare, aplicația se deschide fullscreen ca o aplicație nativă.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
