
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';

export const useCategoryLabel = (category: MissionCategory) => {
  const { language } = useLanguage();
  
  if (!category) {
    return '';
  }
  
  if (language === 'en') {
    return String(category).toUpperCase();
  } else {
    switch(category) {
      case 'body': return 'CORP';
      case 'being': return 'FIINȚĂ';
      case 'balance': return 'ECHILIBRU';
      case 'business': return 'AFACERE';
      default: return String(category).toUpperCase();
    }
  }
};

// Add utility function to get category color
export const getCategoryColor = (category: MissionCategory): string => {
  switch (category) {
    case 'body': return 'from-red-500 to-red-700';
    case 'being': return 'from-blue-500 to-blue-700';
    case 'balance': return 'from-green-500 to-green-700';
    case 'business': return 'from-purple-500 to-purple-700';
    default: return 'from-blue-500 to-blue-700';
  }
};

// Add helper for getting translated category name
export const getCategoryName = (category: MissionCategory, language: string): string => {
  if (language === 'en') {
    switch (category) {
      case 'body': return 'Body';
      case 'being': return 'Being';
      case 'balance': return 'Balance';
      case 'business': return 'Business';
      default: return category;
    }
  } else {
    switch (category) {
      case 'body': return 'Corp';
      case 'being': return 'Ființă';
      case 'balance': return 'Echilibru';
      case 'business': return 'Afacere';
      default: return category;
    }
  }
};
