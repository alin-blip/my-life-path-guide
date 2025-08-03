import quotes, {
  getRandomQuote,
  getDailyQuote,
  getQuotesByCategory,
  getQuotesByDifficulty,
  getPersonalizedQuotes,
  searchQuotes
} from './quotesDatabase';
import { 
  Quote, 
  QuoteCategory, 
  QuoteDifficulty, 
  QuoteLanguage 
} from './types/quoteTypes';

// Local storage keys
const QUOTE_HISTORY_KEY = 'warrior_quote_history';
const QUOTE_PREFERENCES_KEY = 'warrior_quote_preferences';
const QUOTE_INTERACTIONS_KEY = 'warrior_quote_interactions';

// Types for user preferences and interactions
interface QuoteWithTimestamp extends Quote {
  viewedAt: string;
}

export interface QuotePreferences {
  preferredCategories: QuoteCategory[];
  preferredDifficulty: QuoteDifficulty | null;
  preferredLanguage: QuoteLanguage;
  excludedAuthors: string[];
}

interface QuoteInteraction {
  timestamp: string;
  count: number;
}

interface QuoteRating {
  rating: number;
  timestamp: string;
}

interface QuoteReflection {
  text: string;
  timestamp: string;
}

interface QuoteInteractions {
  likes: Record<string, QuoteInteraction>;
  shares: Record<string, QuoteInteraction>;
  saves: Record<string, QuoteInteraction>;
  ratings?: Record<string, QuoteRating>;
  reflections?: Record<string, QuoteReflection>;
}

/**
 * Get the user's quote history from local storage
 * @returns {QuoteWithTimestamp[]} Array of previously viewed quotes
 */
export const getQuoteHistory = (): QuoteWithTimestamp[] => {
  try {
    const history = localStorage.getItem(QUOTE_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error retrieving quote history:', error);
    return [];
  }
};

/**
 * Add a quote to the user's history
 * @param {Quote} quote - The quote to add to history
 */
export const addQuoteToHistory = (quote: Quote): void => {
  try {
    const history = getQuoteHistory();
    // Add quote with timestamp
    const quoteWithTimestamp: QuoteWithTimestamp = {
      ...quote,
      viewedAt: new Date().toISOString()
    };
    // Add to beginning of array (most recent first)
    const updatedHistory = [quoteWithTimestamp, ...history].slice(0, 50); // Keep last 50 quotes
    localStorage.setItem(QUOTE_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error adding quote to history:', error);
  }
};

/**
 * Get the user's quote preferences from local storage
 * @returns {QuotePreferences} User's quote preferences
 */
export const getQuotePreferences = (): QuotePreferences => {
  try {
    const preferences = localStorage.getItem(QUOTE_PREFERENCES_KEY);
    return preferences ? JSON.parse(preferences) : {
      preferredCategories: [],
      preferredDifficulty: null,
      preferredLanguage: 'en',
      excludedAuthors: []
    };
  } catch (error) {
    console.error('Error retrieving quote preferences:', error);
    return {
      preferredCategories: [],
      preferredDifficulty: null,
      preferredLanguage: 'en',
      excludedAuthors: []
    };
  }
};

/**
 * Save the user's quote preferences
 * @param {QuotePreferences} preferences - The preferences to save
 */
export const saveQuotePreferences = (preferences: QuotePreferences): void => {
  try {
    localStorage.setItem(QUOTE_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving quote preferences:', error);
  }
};

/**
 * Update a specific preference
 * @param {keyof QuotePreferences} key - The preference key to update
 * @param {any} value - The new value
 */
export const updateQuotePreference = <K extends keyof QuotePreferences>(key: K, value: QuotePreferences[K]): void => {
  try {
    const preferences = getQuotePreferences();
    preferences[key] = value;
    saveQuotePreferences(preferences);
  } catch (error) {
    console.error('Error updating quote preference:', error);
  }
};

/**
 * Get quote interactions (likes, shares, saves)
 * @returns {QuoteInteractions} User's interactions with quotes
 */
export const getQuoteInteractions = (): QuoteInteractions => {
  try {
    const interactions = localStorage.getItem(QUOTE_INTERACTIONS_KEY);
    return interactions ? JSON.parse(interactions) : {
      likes: {},
      shares: {},
      saves: {}
    };
  } catch (error) {
    console.error('Error retrieving quote interactions:', error);
    return {
      likes: {},
      shares: {},
      saves: {}
    };
  }
};

/**
 * Record a user interaction with a quote
 * @param {string} quoteId - The ID of the quote
 * @param {'likes' | 'shares' | 'saves'} interactionType - The type of interaction
 */
export const recordQuoteInteraction = (quoteId: string, interactionType: 'likes' | 'shares' | 'saves'): void => {
  try {
    const interactions = getQuoteInteractions();
    if (!interactions[interactionType]) {
      interactions[interactionType] = {};
    }
    // Record interaction with timestamp
    interactions[interactionType][quoteId] = {
      timestamp: new Date().toISOString(),
      count: (interactions[interactionType][quoteId]?.count || 0) + 1
    };
    localStorage.setItem(QUOTE_INTERACTIONS_KEY, JSON.stringify(interactions));
  } catch (error) {
    console.error('Error recording quote interaction:', error);
  }
};

/**
 * Check if a quote has been interacted with
 * @param {string} quoteId - The ID of the quote
 * @param {'likes' | 'shares' | 'saves'} interactionType - The type of interaction
 * @returns {boolean} Whether the quote has been interacted with
 */
export const hasInteractedWithQuote = (quoteId: string, interactionType: 'likes' | 'shares' | 'saves'): boolean => {
  try {
    const interactions = getQuoteInteractions();
    return !!interactions[interactionType]?.[quoteId];
  } catch (error) {
    console.error('Error checking quote interaction:', error);
    return false;
  }
};

/**
 * Get a personalized quote based on user preferences and history
 * @returns {Quote} A personalized quote
 */
export const getPersonalizedQuoteForUser = (): Quote => {
  try {
    const preferences = getQuotePreferences();
    const history = getQuoteHistory();
    
    // Get quotes matching user preferences
    let candidateQuotes = getPersonalizedQuotes(
      preferences.preferredCategories,
      preferences.preferredDifficulty,
      preferences.preferredLanguage
    );
    
    // Filter out excluded authors
    if (preferences.excludedAuthors && preferences.excludedAuthors.length > 0) {
      candidateQuotes = candidateQuotes.filter(quote => 
        !preferences.excludedAuthors.includes(quote.author)
      );
    }
    
    // If no matching quotes, fall back to all quotes in preferred language
    if (candidateQuotes.length === 0) {
      candidateQuotes = quotes.filter(
        quote => quote.language === preferences.preferredLanguage
      );
    }
    
    // Prioritize quotes that haven't been seen recently
    const recentQuoteIds = history.slice(0, 10).map(quote => quote.id);
    const unseenQuotes = candidateQuotes.filter(quote => !recentQuoteIds.includes(quote.id));
    
    // If there are unseen quotes, select from those, otherwise select from all candidates
    const quotesToSelectFrom = unseenQuotes.length > 0 ? unseenQuotes : candidateQuotes;
    
    // Select a random quote from the filtered list
    const randomIndex = Math.floor(Math.random() * quotesToSelectFrom.length);
    const selectedQuote = quotesToSelectFrom[randomIndex];
    
    // Add to history
    addQuoteToHistory(selectedQuote);
    
    return selectedQuote;
  } catch (error) {
    console.error('Error getting personalized quote:', error);
    // Fallback to random quote
    return getRandomQuote();
  }
};

/**
 * Get quotes that are similar to a given quote
 * @param {Quote} quote - The reference quote
 * @param {number} limit - Maximum number of similar quotes to return
 * @returns {Quote[]} Array of similar quotes
 */
export const getSimilarQuotes = (quote: Quote, limit: number = 3): Quote[] => {
  try {
    // Get quotes in the same category
    let similarQuotes = quotes.filter(q => 
      q.id !== quote.id && 
      q.category === quote.category && 
      q.language === quote.language
    );
    
    // If not enough quotes in same category, add quotes with similar tags
    if (similarQuotes.length < limit) {
      const quotesWithSimilarTags = quotes.filter(q => 
        q.id !== quote.id && 
        q.category !== quote.category && 
        q.language === quote.language && 
        q.tags.some(tag => quote.tags.includes(tag))
      );
      
      // Combine and remove duplicates
      const combinedQuotes = [...similarQuotes, ...quotesWithSimilarTags];
      similarQuotes = combinedQuotes.filter((quote, index, self) => 
        index === self.findIndex(q => q.id === quote.id)
      );
    }
    
    // Shuffle and limit
    return similarQuotes
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting similar quotes:', error);
    return [];
  }
};

/**
 * Rate the impact of a quote (1-5 stars)
 * @param {string} quoteId - The ID of the quote
 * @param {number} rating - The rating (1-5)
 */
export const rateQuoteImpact = (quoteId: string, rating: number): void => {
  try {
    const interactions = getQuoteInteractions();
    if (!interactions.ratings) {
      interactions.ratings = {};
    }
    interactions.ratings[quoteId] = {
      rating,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(QUOTE_INTERACTIONS_KEY, JSON.stringify(interactions));
  } catch (error) {
    console.error('Error rating quote impact:', error);
  }
};

/**
 * Add a personal reflection to a quote
 * @param {string} quoteId - The ID of the quote
 * @param {string} reflection - The user's reflection
 */
export const addQuoteReflection = (quoteId: string, reflection: string): void => {
  try {
    const interactions = getQuoteInteractions();
    if (!interactions.reflections) {
      interactions.reflections = {};
    }
    interactions.reflections[quoteId] = {
      text: reflection,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(QUOTE_INTERACTIONS_KEY, JSON.stringify(interactions));
  } catch (error) {
    console.error('Error adding quote reflection:', error);
  }
};

/**
 * Get a user's reflection on a quote
 * @param {string} quoteId - The ID of the quote
 * @returns {QuoteReflection|null} The reflection or null if none exists
 */
export const getQuoteReflection = (quoteId: string): QuoteReflection | null => {
  try {
    const interactions = getQuoteInteractions();
    return interactions.reflections?.[quoteId] || null;
  } catch (error) {
    console.error('Error getting quote reflection:', error);
    return null;
  }
};

/**
 * Get the most impactful quotes based on user ratings
 * @param {number} limit - Maximum number of quotes to return
 * @returns {Array} Array of most impactful quotes with their ratings
 */
export const getMostImpactfulQuotes = (limit: number = 5): (Quote & { userRating: number })[] => {
  try {
    const interactions = getQuoteInteractions();
    const ratings = interactions.ratings || {};
    
    // Get quote IDs with ratings
    const ratedQuoteIds = Object.keys(ratings);
    
    // Get the actual quote objects with their ratings
    const ratedQuotes = ratedQuoteIds
      .map(id => {
        const quote = quotes.find(q => q.id === id);
        return quote ? {
          ...quote,
          userRating: ratings[id].rating
        } : null;
      })
      .filter((q): q is (Quote & { userRating: number }) => q !== null);
    
    // Sort by rating (highest first) and limit
    return ratedQuotes
      .sort((a, b) => b.userRating - a.userRating)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting most impactful quotes:', error);
    return [];
  }
};

export default {
  getRandomQuote,
  getDailyQuote,
  getQuotesByCategory,
  getQuotesByDifficulty,
  getPersonalizedQuotes,
  searchQuotes,
  getQuoteHistory,
  addQuoteToHistory,
  getQuotePreferences,
  saveQuotePreferences,
  updateQuotePreference,
  getQuoteInteractions,
  recordQuoteInteraction,
  hasInteractedWithQuote,
  getPersonalizedQuoteForUser,
  getSimilarQuotes,
  rateQuoteImpact,
  addQuoteReflection,
  getQuoteReflection,
  getMostImpactfulQuotes
};
