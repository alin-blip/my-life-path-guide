
import { 
  Quote, 
  QuoteLanguage, 
  QuoteCategory, 
  QuoteDifficulty
} from './types/quoteTypes';

/**
 * Enhanced Quotes Database for Warrior App
 *
 * This database contains an extensive collection of motivational quotes
 * with rich metadata for personalization and categorization.
 */
export const quotes: Quote[] = [
  // Leadership Quotes
  {
    id: "l1",
    text: "A leader is one who knows the way, goes the way, and shows the way.",
    author: "John C. Maxwell",
    category: "leadership",
    difficulty: "beginner",
    tags: ["guidance", "example", "direction"],
    backgroundOptions: ["mountains", "path", "compass"],
    language: "en"
  },
  {
    id: "l2",
    text: "Leadership is not about being in charge. It is about taking care of those in your charge.",
    author: "Simon Sinek",
    category: "leadership",
    difficulty: "intermediate",
    tags: ["responsibility", "care", "service"],
    backgroundOptions: ["team", "hands", "support"],
    language: "en"
  },
  {
    id: "l3",
    text: "The greatest leader is not necessarily the one who does the greatest things. He is the one that gets people to do the greatest things.",
    author: "Ronald Reagan",
    category: "leadership",
    difficulty: "advanced",
    tags: ["inspiration", "empowerment", "achievement"],
    backgroundOptions: ["summit", "team", "achievement"],
    language: "en"
  },
  {
    id: "l4",
    text: "Un lider adevărat își asumă puțin mai mult din vină și puțin mai puțin din credit.",
    author: "Arnold H. Glasow",
    category: "leadership",
    difficulty: "intermediate",
    tags: ["responsabilitate", "umilință", "caracter"],
    backgroundOptions: ["echipă", "munte", "pod"],
    language: "ro"
  },
  {
    id: "l5",
    text: "Liderii eficienți știu când să vorbească și când să asculte.",
    author: "Anonymous",
    category: "leadership",
    difficulty: "beginner",
    tags: ["comunicare", "ascultare", "înțelepciune"],
    backgroundOptions: ["conversație", "ureche", "gură"],
    language: "ro"
  },
  // Perseverance Quotes
  {
    id: "p1",
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "perseverance",
    difficulty: "beginner",
    tags: ["persistence", "progress", "patience"],
    backgroundOptions: ["turtle", "path", "mountain"],
    language: "en"
  },
  {
    id: "p2",
    text: "Perseverance is not a long race; it is many short races one after the other.",
    author: "Walter Elliot",
    category: "perseverance",
    difficulty: "intermediate",
    tags: ["endurance", "consistency", "determination"],
    backgroundOptions: ["track", "hurdles", "finish-line"],
    language: "en"
  },
  {
    id: "p3",
    text: "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will.",
    author: "Vince Lombardi",
    category: "perseverance",
    difficulty: "advanced",
    tags: ["willpower", "determination", "success"],
    backgroundOptions: ["mountain-climber", "finish-line", "victory"],
    language: "en"
  },
  {
    id: "p4",
    text: "Perseverența este eșecul de a eșua.",
    author: "Anonymous",
    category: "perseverance",
    difficulty: "beginner",
    tags: ["determinare", "succes", "eșec"],
    backgroundOptions: ["munte", "drum", "obstacol"],
    language: "ro"
  },
  {
    id: "p5",
    text: "Puterea nu vine din câștigarea victoriilor. Forțele tale cresc când treci prin greutăți și decizi să nu renunți.",
    author: "Arnold Schwarzenegger",
    category: "perseverance",
    difficulty: "intermediate",
    tags: ["putere", "rezistență", "provocări"],
    backgroundOptions: ["greutăți", "obstacole", "victorie"],
    language: "ro"
  }
];

/**
 * Get a random quote from the database
 * @returns {Quote} A random quote object
 */
export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

/**
 * Get a daily quote based on the current date
 * @param {QuoteLanguage} language - The preferred language (en/ro)
 * @returns {Quote} A quote object selected based on the current date
 */
export const getDailyQuote = (language: QuoteLanguage = 'en'): Quote => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Filter quotes by language
  const languageQuotes = quotes.filter(quote => quote.language === language);
  
  // Use the day of year to select a quote (cycling through available quotes)
  const index = dayOfYear % languageQuotes.length;
  return languageQuotes[index];
};

/**
 * Get quotes filtered by category
 * @param {QuoteCategory} category - The category to filter by
 * @param {QuoteLanguage} language - The preferred language (en/ro)
 * @returns {Quote[]} An array of quote objects in the specified category
 */
export const getQuotesByCategory = (category: QuoteCategory, language: QuoteLanguage = 'en'): Quote[] => {
  return quotes.filter(quote => 
    quote.category === category && quote.language === language
  );
};

/**
 * Get quotes filtered by difficulty level
 * @param {QuoteDifficulty} difficulty - The difficulty level (beginner/intermediate/advanced)
 * @param {QuoteLanguage} language - The preferred language (en/ro)
 * @returns {Quote[]} An array of quote objects with the specified difficulty
 */
export const getQuotesByDifficulty = (difficulty: QuoteDifficulty, language: QuoteLanguage = 'en'): Quote[] => {
  return quotes.filter(quote => 
    quote.difficulty === difficulty && quote.language === language
  );
};

/**
 * Get personalized quotes based on user preferences
 * @param {QuoteCategory[]} preferredCategories - Array of preferred categories
 * @param {QuoteDifficulty | null} difficulty - Preferred difficulty level
 * @param {QuoteLanguage} language - The preferred language (en/ro)
 * @returns {Quote[]} An array of personalized quote objects
 */
export const getPersonalizedQuotes = (
  preferredCategories: QuoteCategory[] = [], 
  difficulty: QuoteDifficulty | null = null,
  language: QuoteLanguage = 'en'
): Quote[] => {
  let filteredQuotes = quotes.filter(quote => quote.language === language);
  
  if (preferredCategories.length > 0) {
    filteredQuotes = filteredQuotes.filter(quote => 
      preferredCategories.includes(quote.category)
    );
  }
  
  if (difficulty) {
    filteredQuotes = filteredQuotes.filter(quote => 
      quote.difficulty === difficulty
    );
  }
  
  return filteredQuotes;
};

/**
 * Search quotes by keyword
 * @param {string} keyword - The keyword to search for
 * @param {QuoteLanguage} language - The preferred language (en/ro)
 * @returns {Quote[]} An array of quote objects containing the keyword
 */
export const searchQuotes = (keyword: string, language: QuoteLanguage = 'en'): Quote[] => {
  const lowercaseKeyword = keyword.toLowerCase();
  return quotes.filter(quote => 
    (quote.text.toLowerCase().includes(lowercaseKeyword) || 
    quote.author.toLowerCase().includes(lowercaseKeyword) || 
    quote.tags.some(tag => tag.toLowerCase().includes(lowercaseKeyword))) &&
    quote.language === language
  );
};

export default quotes;
