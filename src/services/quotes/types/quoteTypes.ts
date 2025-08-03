
import { MacroNutrients } from '../../fitness/fitnessService';

export interface QuoteTag {
  name: string;
  count: number;
}

export interface QuoteBackground {
  name: string;
  url: string;
}

export type QuoteCategory = 'leadership' | 'perseverance' | 'growth' | 'courage' | 'discipline';
export type QuoteDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type QuoteLanguage = 'en' | 'ro';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
  difficulty: QuoteDifficulty;
  tags: string[];
  backgroundOptions: string[];
  language: QuoteLanguage;
}
