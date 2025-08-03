
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';

export const useCategoryLabel = (category: MissionCategory) => {
  const { language } = useLanguage();
  
  if (!category) {
    return '';
  }
  
  if (language === 'en') {
    switch(category) {
      case 'body': return 'SACRED VESSEL';
      case 'being': return 'DIVINE CONNECTION';
      case 'balance': return 'SACRED RELATIONSHIPS';
      case 'business': return "QUEEN'S EMPIRE";
      default: return String(category).toUpperCase();
    }
  } else {
    switch(category) {
      case 'body': return 'VAS SACRU';
      case 'being': return 'CONEXIUNE DIVINĂ';
      case 'balance': return 'RELAȚII SACRE';
      case 'business': return 'IMPERIUL REGINEI';
      default: return String(category).toUpperCase();
    }
  }
};

// Add utility function to get category color
export const getCategoryColor = (category: MissionCategory): string => {
  switch (category) {
    case 'body': return 'from-feminine-primary to-feminine-rose';
    case 'being': return 'from-feminine-purple to-purple-700';
    case 'balance': return 'from-pink-600 to-feminine-primary';
    case 'business': return 'from-yellow-600 to-orange-600';
    default: return 'from-feminine-primary to-feminine-purple';
  }
};

// Add helper for getting translated category name
export const getCategoryName = (category: MissionCategory, language: string): string => {
  if (language === 'en') {
    switch (category) {
      case 'body': return 'Sacred Vessel';
      case 'being': return 'Divine Connection';
      case 'balance': return 'Sacred Relationships';
      case 'business': return "Queen's Empire";
      default: return category;
    }
  } else {
    switch (category) {
      case 'body': return 'Vas Sacru';
      case 'being': return 'Conexiune Divină';
      case 'balance': return 'Relații Sacre';
      case 'business': return 'Imperiul Reginei';
      default: return category;
    }
  }
};
