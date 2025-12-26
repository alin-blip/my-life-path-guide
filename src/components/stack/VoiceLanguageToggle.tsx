import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/context/LanguageContext';

interface VoiceLanguageToggleProps {
  currentLanguage: 'ro-RO' | 'en-US';
  onLanguageChange: (lang: 'ro-RO' | 'en-US') => void;
  disabled?: boolean;
}

export const VoiceLanguageToggle: React.FC<VoiceLanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
  disabled = false
}) => {
  const { t } = useLanguage();
  
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'ro-RO' ? 'en-US' : 'ro-RO';
    onLanguageChange(newLang);
  };

  const displayLang = currentLanguage === 'ro-RO' ? 'RO' : 'EN';
  const fullLangName = currentLanguage === 'ro-RO' ? t('romanian') : t('english');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            disabled={disabled}
            className="h-8 gap-1.5 min-w-[70px]"
          >
            <Languages className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{displayLang}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{t('voiceRecognitionLanguage')}: {fullLangName}</p>
          <p className="text-xs text-muted-foreground">{t('clickToChange')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
