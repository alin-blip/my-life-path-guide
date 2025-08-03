
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (value: string) => {
    const newLanguage = value as 'en' | 'ro';
    
    // Save to localStorage before setting state to ensure it persists
    localStorage.setItem('language', newLanguage);
    
    // Update the language in context
    setLanguage(newLanguage);
    
    // Force a page reload to ensure all translations are properly applied
    // This is especially important for components like FactMapDetail that
    // need to refresh their question sets based on the selected language
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[100px] h-8">
          <SelectValue placeholder={t("language")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t("english")}</SelectItem>
          <SelectItem value="ro">{t("romanian")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
