// Napoleon Hill - Think and Grow Rich - Daily Book Pages Service
// 365 pages from the book for daily reading

export interface BookPage {
  id: number;
  chapter: string;
  chapterNumber: number;
  title: string;
  content: string;
  principle: string;
  dailyAction: string;
}

// Sample pages from Think and Grow Rich - in production, this would be the full book
const bookPages: BookPage[] = [
  // Chapter 1: Introduction - The Power of Thought
  {
    id: 1,
    chapter: "Introduction",
    chapterNumber: 1,
    title: "The Power of Thought",
    content: "TRULY, 'thoughts are things,' and powerful things at that, when they are mixed with definiteness of purpose, persistence, and a burning desire for their translation into riches, or other material objects.",
    principle: "Thoughts Are Things",
    dailyAction: "Write down one burning desire you have. Be specific about what you want."
  },
  {
    id: 2,
    chapter: "Introduction",
    chapterNumber: 1,
    title: "Edwin C. Barnes' Burning Desire",
    content: "When Edwin C. Barnes climbed down from the freight train in Orange, New Jersey, he may have resembled a tramp, but his thoughts were those of a king! He had a BURNING DESIRE to become a business associate of the great Edison.",
    principle: "Burning Desire",
    dailyAction: "Visualize yourself already in possession of your major goal. Feel the emotions."
  },
  {
    id: 3,
    chapter: "Introduction", 
    chapterNumber: 1,
    title: "Burning All Bridges",
    content: "He stood there before Edison, saying 'I have come to go into business with you.' Barnes succeeded because he chose a definite goal, placed all his energy, all his willpower, everything back of that goal. He did not become the partner of Edison the day he arrived. But he got his opportunity.",
    principle: "Definiteness of Purpose",
    dailyAction: "Identify what you are willing to 'burn the bridges' for. What commitment are you ready to make?"
  },
  // Chapter 2: Desire - The Starting Point of All Achievement
  {
    id: 4,
    chapter: "Desire",
    chapterNumber: 2,
    title: "The First Step Toward Riches",
    content: "The starting point of all achievement is DESIRE. Keep this constantly in mind. Weak desires bring weak results, just as a small amount of fire makes a small amount of heat.",
    principle: "Desire",
    dailyAction: "Rate your desire on a scale of 1-10. If it's less than 8, ask yourself: Why don't I want this more?"
  },
  {
    id: 5,
    chapter: "Desire",
    chapterNumber: 2,
    title: "The Six Steps",
    content: "First. Fix in your mind the exact amount of money you desire. It is not sufficient merely to say 'I want plenty of money.' Be definite as to the amount.",
    principle: "Definiteness",
    dailyAction: "Write down the EXACT amount of money you want. Not 'more money' but a specific number."
  },
  {
    id: 6,
    chapter: "Desire",
    chapterNumber: 2,
    title: "What Will You Give?",
    content: "Second. Determine exactly what you intend to give in return for the money you desire. There is no such reality as 'something for nothing.'",
    principle: "Value Exchange",
    dailyAction: "Define clearly what service or value you will provide in exchange for your desired wealth."
  },
  {
    id: 7,
    chapter: "Desire",
    chapterNumber: 2,
    title: "Set Your Deadline",
    content: "Third. Establish a definite date when you intend to possess the money you desire.",
    principle: "Time-Bound Goals",
    dailyAction: "Set a specific date by which you will achieve your financial goal. Write it down."
  },
  // Chapter 3: Faith
  {
    id: 8,
    chapter: "Faith",
    chapterNumber: 3,
    title: "Visualization and Belief",
    content: "FAITH is the head chemist of the mind. When FAITH is blended with thought, the subconscious mind instantly picks up the vibration, translates it into its spiritual equivalent, and transmits it to Infinite Intelligence.",
    principle: "Faith",
    dailyAction: "Spend 5 minutes visualizing your goal as already achieved. FEEL the reality of it."
  },
  {
    id: 9,
    chapter: "Faith",
    chapterNumber: 3,
    title: "Self-Confidence Formula",
    content: "First. I know that I have the ability to achieve the object of my Definite Purpose in life, therefore, I DEMAND of myself persistent, continuous action toward its attainment, and I here and now promise to render such action.",
    principle: "Self-Confidence",
    dailyAction: "Read the self-confidence formula aloud, morning and evening."
  },
  {
    id: 10,
    chapter: "Faith",
    chapterNumber: 3,
    title: "Thoughts Magnetized by Faith",
    content: "ALL THOUGHTS WHICH HAVE BEEN EMOTIONALIZED (given feeling) AND MIXED WITH FAITH, begin immediately to translate themselves into their physical equivalent or counterpart.",
    principle: "Emotionalized Thoughts",
    dailyAction: "Add strong positive emotion to your visualization practice. Feel gratitude as if you already have it."
  },
  // Chapter 4: Auto-Suggestion
  {
    id: 11,
    chapter: "Auto-Suggestion",
    chapterNumber: 4,
    title: "The Medium for Influencing the Subconscious",
    content: "AUTO-SUGGESTION is the agency of communication between that part of the mind where conscious thought takes place, and that which serves as the seat of action for the subconscious mind.",
    principle: "Auto-Suggestion",
    dailyAction: "Create your personal affirmation statement. Read it twice daily with emotion."
  },
  {
    id: 12,
    chapter: "Auto-Suggestion",
    chapterNumber: 4,
    title: "Concentrate on Your Desire",
    content: "When you begin to carry out the instructions in connection with the six steps described in the chapter on DESIRE, it will be necessary for you to make use of the principle of CONCENTRATION.",
    principle: "Concentration",
    dailyAction: "Eliminate distractions for 30 minutes. Focus solely on your major purpose."
  },
  // Chapter 5: Specialized Knowledge
  {
    id: 13,
    chapter: "Specialized Knowledge",
    chapterNumber: 5,
    title: "Knowledge is Only Potential Power",
    content: "KNOWLEDGE will not attract money, unless it is organized, and intelligently directed, through practical PLANS OF ACTION, to the DEFINITE END of accumulation of money.",
    principle: "Specialized Knowledge",
    dailyAction: "Identify one skill you need to develop. Take one action today to learn it."
  },
  {
    id: 14,
    chapter: "Specialized Knowledge",
    chapterNumber: 5,
    title: "The Highway to Success",
    content: "The person who stops studying merely because he has finished school is forever hopelessly doomed to mediocrity. The way of success is the way of continuous pursuit of knowledge.",
    principle: "Continuous Learning",
    dailyAction: "Commit to reading at least 10 pages of an educational book today."
  },
  // Chapter 6: Imagination
  {
    id: 15,
    chapter: "Imagination",
    chapterNumber: 6,
    title: "The Workshop of the Mind",
    content: "The imagination is literally the workshop wherein are fashioned all plans created by man. The impulse, the DESIRE, is given shape, form, and ACTION through the aid of the imaginative faculty of the mind.",
    principle: "Imagination",
    dailyAction: "Write down 10 ideas related to your major goal. Don't judge them, just write."
  },
  // Chapter 7: Organized Planning
  {
    id: 16,
    chapter: "Organized Planning",
    chapterNumber: 7,
    title: "The Crystallization of Desire into Action",
    content: "You have learned that everything man creates or acquires, begins in the form of DESIRE, that desire is taken on the first lap of its journey, from the abstract to the concrete, into the workshop of the IMAGINATION, where PLANS for its transition are created and organized.",
    principle: "Organized Planning",
    dailyAction: "Create a detailed plan for achieving your goal. Break it into weekly and daily actions."
  },
  // Chapter 8: Decision
  {
    id: 17,
    chapter: "Decision",
    chapterNumber: 8,
    title: "The Mastery of Procrastination",
    content: "ACCURATE analysis of over 25,000 men and women who had experienced failure, disclosed the fact that LACK OF DECISION was near the head of the list of the 30 major causes of FAILURE.",
    principle: "Decision",
    dailyAction: "Make one decision you've been putting off. Act on it immediately."
  },
  {
    id: 18,
    chapter: "Decision",
    chapterNumber: 8,
    title: "Reach Decisions Promptly",
    content: "The majority of people who fail to accumulate money sufficient for their needs, are, generally, easily influenced by the 'opinions' of others. If you are influenced by 'opinions' when you reach DECISIONS, you will not succeed in any undertaking.",
    principle: "Independent Thinking",
    dailyAction: "Make your decisions based on your own judgment. Stop seeking approval from others."
  },
  // Chapter 9: Persistence
  {
    id: 19,
    chapter: "Persistence",
    chapterNumber: 9,
    title: "The Sustained Effort Necessary to Induce Faith",
    content: "PERSISTENCE is an essential factor in the procedure of transmuting DESIRE into its monetary equivalent. The basis of persistence is the POWER OF WILL.",
    principle: "Persistence",
    dailyAction: "When you feel like quitting today, push through for 10 more minutes."
  },
  {
    id: 20,
    chapter: "Persistence",
    chapterNumber: 9,
    title: "How to Develop Persistence",
    content: "There are four simple steps which lead to the habit of PERSISTENCE. They call for no great amount of intelligence, no particular amount of education, and but little time or effort.",
    principle: "Building Habits",
    dailyAction: "Review your definite purpose and plan. Reaffirm your commitment."
  },
  // Chapter 10: Power of the Master Mind
  {
    id: 21,
    chapter: "Power of the Master Mind",
    chapterNumber: 10,
    title: "The Driving Force",
    content: "The 'Master Mind' may be defined as: 'Coordination of knowledge and effort, in a spirit of harmony, between two or more people, for the attainment of a definite purpose.'",
    principle: "Master Mind",
    dailyAction: "Identify 2-3 people who could be in your mastermind group. Reach out to one."
  },
  // Chapter 11: The Mystery of Sex Transmutation
  {
    id: 22,
    chapter: "The Mystery of Sex Transmutation",
    chapterNumber: 11,
    title: "Transmuting Creative Energy",
    content: "The emotion of sex contains the secret of creative ability. When harnessed and transmuted, this driving force is capable of lifting men into that higher sphere of thought which enables them to master the sources of worry and petty annoyance.",
    principle: "Energy Transmutation",
    dailyAction: "Channel your creative energy into productive work on your major purpose."
  },
  // Chapter 12: The Subconscious Mind
  {
    id: 23,
    chapter: "The Subconscious Mind",
    chapterNumber: 12,
    title: "The Connecting Link",
    content: "THE SUBCONSCIOUS MIND consists of a field of consciousness, in which every impulse of thought that reaches the objective mind through any of the five senses, is classified and recorded.",
    principle: "Subconscious Mind",
    dailyAction: "Before sleep, plant positive thoughts about your goals in your subconscious mind."
  },
  // Chapter 13: The Brain
  {
    id: 24,
    chapter: "The Brain",
    chapterNumber: 13,
    title: "A Broadcasting and Receiving Station for Thought",
    content: "The brain is capable of picking up thought vibrations which are being released by other brains. The Creative Imagination is the 'receiving set' of the brain.",
    principle: "Brain Power",
    dailyAction: "Tune into the thoughts of successful people by reading their books or listening to them."
  },
  // Chapter 14: The Sixth Sense
  {
    id: 25,
    chapter: "The Sixth Sense",
    chapterNumber: 14,
    title: "The Door to the Temple of Wisdom",
    content: "The SIXTH SENSE is that portion of the subconscious mind which has been referred to as the Creative Imagination. It has also been referred to as the 'receiving set' through which ideas, plans, and thoughts flash into the mind.",
    principle: "Sixth Sense",
    dailyAction: "Spend 10 minutes in silence, listening for intuitive guidance about your path."
  },
  // Additional pages cycling through principles
  {
    id: 26,
    chapter: "The Six Ghosts of Fear",
    chapterNumber: 15,
    title: "Conquering Fear",
    content: "Before you can put any portion of this philosophy into successful use, your mind must be prepared to receive it. The preparation is not difficult. It begins with study, analysis, and understanding of three enemies which you shall have to clear out: INDECISION, DOUBT, and FEAR.",
    principle: "Conquering Fear",
    dailyAction: "Write down your biggest fear. Then write three reasons why you can overcome it."
  },
  {
    id: 27,
    chapter: "The Six Ghosts of Fear",
    chapterNumber: 15,
    title: "The Fear of Poverty",
    content: "The fear of POVERTY is, without doubt, the most destructive of the six basic fears. It has been placed at the head of the list, because it is the most difficult to master.",
    principle: "Overcoming Poverty Mindset",
    dailyAction: "Replace thoughts of lack with thoughts of abundance. Count your blessings."
  },
  {
    id: 28,
    chapter: "The Six Ghosts of Fear",
    chapterNumber: 15,
    title: "The Fear of Criticism",
    content: "Just how man originally came by this fear, no one can state definitely, but one thing is certain—he has it in a highly developed form.",
    principle: "Overcoming Criticism Fear",
    dailyAction: "Take one action today that you've been avoiding due to fear of what others might think."
  },
  // More pages to round out the month
  {
    id: 29,
    chapter: "Desire",
    chapterNumber: 2,
    title: "The Burning Obsession",
    content: "Every human being who reaches the age of understanding of the purpose of money, wishes for it. Wishing will not bring riches. But desiring riches with a state of mind that becomes an obsession, then planning definite ways and means to acquire riches, will.",
    principle: "Obsessive Desire",
    dailyAction: "Transform your wish into an obsession. Think about your goal at least 10 times today."
  },
  {
    id: 30,
    chapter: "Faith",
    chapterNumber: 3,
    title: "The State of Mind",
    content: "FAITH is a state of mind which may be induced, or created, by affirmation or repeated instructions to the subconscious mind, through the principle of auto-suggestion.",
    principle: "Induced Faith",
    dailyAction: "Repeat your faith affirmation 10 times with conviction and emotion."
  },
  {
    id: 31,
    chapter: "Persistence",
    chapterNumber: 9,
    title: "The Power to Hold On",
    content: "If you find yourself lacking in persistence, this weakness may be remedied by building a stronger fire under your desires.",
    principle: "Strengthening Persistence",
    dailyAction: "Review why you want to achieve your goal. Reconnect with your deepest motivation."
  }
];

// Generate remaining pages by cycling through the principles
const generateRemainingPages = (): BookPage[] => {
  const principles = [
    { chapter: "Desire", chapterNumber: 2, principle: "Burning Desire" },
    { chapter: "Faith", chapterNumber: 3, principle: "Faith & Belief" },
    { chapter: "Auto-Suggestion", chapterNumber: 4, principle: "Auto-Suggestion" },
    { chapter: "Specialized Knowledge", chapterNumber: 5, principle: "Specialized Knowledge" },
    { chapter: "Imagination", chapterNumber: 6, principle: "Creative Imagination" },
    { chapter: "Organized Planning", chapterNumber: 7, principle: "Organized Planning" },
    { chapter: "Decision", chapterNumber: 8, principle: "Prompt Decision" },
    { chapter: "Persistence", chapterNumber: 9, principle: "Persistence" },
    { chapter: "Power of the Master Mind", chapterNumber: 10, principle: "Master Mind" },
    { chapter: "The Mystery of Sex Transmutation", chapterNumber: 11, principle: "Transmutation" },
    { chapter: "The Subconscious Mind", chapterNumber: 12, principle: "Subconscious" },
    { chapter: "The Brain", chapterNumber: 13, principle: "Brain Power" },
    { chapter: "The Sixth Sense", chapterNumber: 14, principle: "Sixth Sense" }
  ];

  const additionalPages: BookPage[] = [];
  
  for (let i = 32; i <= 365; i++) {
    const principleIndex = (i - 32) % principles.length;
    const principle = principles[principleIndex];
    
    additionalPages.push({
      id: i,
      chapter: principle.chapter,
      chapterNumber: principle.chapterNumber,
      title: `Daily Practice: ${principle.principle}`,
      content: `Today's focus is on the principle of ${principle.principle}. Napoleon Hill taught that this principle is essential for achieving success. Take time today to study and apply this principle in your life and work.`,
      principle: principle.principle,
      dailyAction: `Apply the principle of ${principle.principle} in at least one situation today.`
    });
  }
  
  return additionalPages;
};

const allBookPages = [...bookPages, ...generateRemainingPages()];

export const getDailyPage = (): BookPage => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Cycle through pages based on day of year
  const pageIndex = (dayOfYear - 1) % allBookPages.length;
  return allBookPages[pageIndex];
};

export const getPageByNumber = (pageNumber: number): BookPage | null => {
  return allBookPages.find(page => page.id === pageNumber) || null;
};

export const getTotalPages = (): number => {
  return allBookPages.length;
};

export const getChapters = (): string[] => {
  const chapters = [...new Set(allBookPages.map(page => page.chapter))];
  return chapters;
};

export const getPagesByChapter = (chapter: string): BookPage[] => {
  return allBookPages.filter(page => page.chapter === chapter);
};

export default {
  getDailyPage,
  getPageByNumber,
  getTotalPages,
  getChapters,
  getPagesByChapter
};
