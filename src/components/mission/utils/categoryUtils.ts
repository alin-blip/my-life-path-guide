
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';

export const useCategoryLabel = (category: MissionCategory) => {
  const { language } = useLanguage();
  
  if (!category) {
    return '';
  }
  
  if (language === 'en') {
    switch(category) {
      case 'body': return 'BODY';
      case 'being': return 'SPIRITUALITY';
      case 'balance': return 'RELATIONSHIPS';
      case 'business': return "BUSINESS";
      default: return String(category).toUpperCase();
    }
  } else {
    switch(category) {
      case 'body': return 'CORP';
      case 'being': return 'SPIRITUALITATE';
      case 'balance': return 'RELAȚII';
      case 'business': return 'AFACERI';
      default: return String(category).toUpperCase();
    }
  }
};

// Add utility function to get category color
export const getCategoryColor = (category: MissionCategory): string => {
  switch (category) {
    case 'body': return 'from-feminine-primary to-feminine-rose';
    case 'being': return 'from-feminine-accent to-blue-800';
    case 'balance': return 'from-feminine-light to-feminine-primary';
    case 'business': return 'from-blue-800 to-blue-600';
    default: return 'from-feminine-primary to-feminine-accent';
  }
};

// Add helper for getting translated category name
export const getCategoryName = (category: MissionCategory, language: string): string => {
  if (language === 'en') {
    switch (category) {
      case 'body': return 'Body';
      case 'being': return 'Spirituality';
      case 'balance': return 'Relationships';
      case 'business': return "Business";
      default: return category;
    }
  } else {
    switch (category) {
      case 'body': return 'Corp';
      case 'being': return 'Spiritualitate';
      case 'balance': return 'Relații';
      case 'business': return 'Afaceri';
      default: return category;
    }
  }
};
