// Napoleon Hill - Think and Grow Rich - Daily Book Pages Service
// 365 pages based on Napoleon Hill's 13 principles for daily study and application
// Note: This service provides original summaries and interpretations of Napoleon Hill's principles.
// Users should obtain their own copy of "Think and Grow Rich" for the complete text.

export interface BookPage {
  id: number;
  chapter: string;
  chapterNumber: number;
  title: string;
  content: string;
  principle: string;
  dailyAction: string;
  keyInsight?: string;
}

// The 13 Principles of Success from Think and Grow Rich
const PRINCIPLES = [
  { name: "Desire", chapter: "Desire", chapterNumber: 2 },
  { name: "Faith", chapter: "Faith", chapterNumber: 3 },
  { name: "Auto-Suggestion", chapter: "Auto-Suggestion", chapterNumber: 4 },
  { name: "Specialized Knowledge", chapter: "Specialized Knowledge", chapterNumber: 5 },
  { name: "Imagination", chapter: "Imagination", chapterNumber: 6 },
  { name: "Organized Planning", chapter: "Organized Planning", chapterNumber: 7 },
  { name: "Decision", chapter: "Decision", chapterNumber: 8 },
  { name: "Persistence", chapter: "Persistence", chapterNumber: 9 },
  { name: "Power of the Master Mind", chapter: "Power of the Master Mind", chapterNumber: 10 },
  { name: "The Mystery of Sex Transmutation", chapter: "Sex Transmutation", chapterNumber: 11 },
  { name: "The Subconscious Mind", chapter: "The Subconscious Mind", chapterNumber: 12 },
  { name: "The Brain", chapter: "The Brain", chapterNumber: 13 },
  { name: "The Sixth Sense", chapter: "The Sixth Sense", chapterNumber: 14 }
];

// Core lessons for each principle with daily actions
const coreLessons: Record<string, { lessons: Array<{ title: string; content: string; action: string; insight: string }> }> = {
  "Desire": {
    lessons: [
      {
        title: "The Starting Point of All Achievement",
        content: "Every achievement begins with a burning desire. Not a wish, not a hope, but a pulsating, burning desire that transcends everything else. This desire must be so strong that it becomes your dominant thought.",
        action: "Write down your most important goal. Rate your desire for it on a scale of 1-10. If it's less than 8, ask yourself why.",
        insight: "Weak desires bring weak results. The strength of your desire determines the strength of your results."
      },
      {
        title: "The Six Steps to Riches",
        content: "Napoleon Hill outlined six definite steps to transform desire into its financial equivalent: Fix the exact amount, determine what you'll give, set a deadline, create a plan, write it down, and read it daily.",
        action: "Write out all six steps for your primary goal. Be specific with amounts, dates, and what you will give in return.",
        insight: "Vague goals produce vague results. Definiteness of purpose is the starting point of all achievement."
      },
      {
        title: "Burning All Bridges",
        content: "When you truly commit to a goal, you eliminate all possibility of retreat. Like the warriors who burned their ships upon landing on enemy shores, you must remove the option of failure from your mind.",
        action: "Identify one 'escape route' you've been keeping open. Make a decision to close it today.",
        insight: "The person who wins is the person who thinks they can, and burns all bridges that lead to retreat."
      },
      {
        title: "Desire vs. Wishing",
        content: "Wishing will not bring riches. But desiring riches with a state of mind that becomes an obsession, then planning definite ways to acquire them, and backing those plans with persistence, will bring riches.",
        action: "Transform one wish into a definite desire by creating a specific plan with a deadline.",
        insight: "A wish is a desire without energy. A true desire has a plan and a timeline."
      }
    ]
  },
  "Faith": {
    lessons: [
      {
        title: "Faith is the Head Chemist of the Mind",
        content: "Faith is the visualizing and believing in the attainment of desire. When faith is blended with thought, the subconscious mind instantly picks up the vibration and translates it into its spiritual equivalent.",
        action: "Spend 5 minutes visualizing your goal as already achieved. Feel the emotions of success.",
        insight: "Faith is a state of mind that may be induced by repeated affirmation of orders to the subconscious mind."
      },
      {
        title: "The Self-Confidence Formula",
        content: "I know I have the ability to achieve my definite purpose. I demand of myself persistent, continuous action. I will eliminate negative thoughts and surround myself with encouragement.",
        action: "Write your own self-confidence formula and read it aloud twice daily.",
        insight: "All thoughts which have been emotionalized and mixed with faith begin to translate themselves into their physical equivalent."
      },
      {
        title: "Emotionalized Thoughts",
        content: "Faith is the only agency through which the cosmic force of Infinite Intelligence can be harnessed. Thoughts backed by strong emotions become magnetized with faith and attract similar or related thoughts.",
        action: "Add strong positive emotion to your visualization practice. Feel gratitude as if you already have what you desire.",
        insight: "The subconscious mind responds to thoughts mixed with emotion more readily than to pure reason."
      },
      {
        title: "Faith Through Repetition",
        content: "Faith is induced or created by repeated instruction to the subconscious mind. This is the only known method of voluntary development of faith.",
        action: "Create a faith affirmation and repeat it 10 times with conviction and emotion.",
        insight: "Any idea, plan, or purpose may be placed in the mind through repetition of thought."
      }
    ]
  },
  "Auto-Suggestion": {
    lessons: [
      {
        title: "The Medium for Influencing the Subconscious",
        content: "Auto-suggestion is the agency of communication between the conscious mind and the subconscious. It is the tool through which you can direct your subconscious toward your goals.",
        action: "Create a personal auto-suggestion statement for your primary goal. Read it morning and evening.",
        insight: "Your ability to use auto-suggestion depends on your capacity to concentrate and develop desire."
      },
      {
        title: "The Power of Concentration",
        content: "When you begin the six steps from the chapter on Desire, you must make use of concentration. Fix your attention on your goal until the burning desire for its realization is created.",
        action: "Set aside 30 minutes today for concentrated thought on your major purpose. Eliminate all distractions.",
        insight: "Concentration is the act of focusing the mind upon a given desire until ways and means for its realization have been worked out."
      },
      {
        title: "The Subconscious Accepts Commands",
        content: "The subconscious mind takes any orders given to it in a spirit of absolute faith and acts upon those orders. It does not distinguish between constructive and destructive thought impulses.",
        action: "Monitor your self-talk today. Replace every negative statement with a positive one.",
        insight: "You are planting in your subconscious mind the plan of what you want. Guard what you plant."
      },
      {
        title: "Making Auto-Suggestion Work",
        content: "Plain, unemotional words do not influence the subconscious. You must emotionalize your statements. See yourself in possession of your goal while making your auto-suggestion.",
        action: "Revise your auto-suggestion statement to include vivid emotional language.",
        insight: "Thoughts which are mixed with emotion are those which most influence the subconscious mind."
      }
    ]
  },
  "Specialized Knowledge": {
    lessons: [
      {
        title: "Knowledge is Only Potential Power",
        content: "Knowledge alone will not attract money unless it is organized, intelligently directed through practical plans of action, and applied toward a definite end. General knowledge serves little purpose.",
        action: "Identify one area of specialized knowledge you need for your goal. Take one step to acquire it today.",
        insight: "The person who can organize and direct knowledge toward a definite purpose will find more power in specialized knowledge than in general education."
      },
      {
        title: "The Highway of Learning Never Ends",
        content: "The person who stops studying merely because they finished school is forever doomed to mediocrity. The way of success is the way of continuous pursuit of knowledge.",
        action: "Commit to reading at least 10 pages from a relevant book or article today.",
        insight: "Successful people never stop acquiring specialized knowledge related to their major purpose."
      },
      {
        title: "Sources of Knowledge",
        content: "Knowledge may be acquired from many sources: formal education, self-study, experience, master mind groups, and specialized courses. The organization of knowledge is more important than the knowledge itself.",
        action: "List 5 sources from which you can acquire knowledge for your goal. Contact or access one today.",
        insight: "It is not essential that you have all the knowledge needed—know where to find it when necessary."
      },
      {
        title: "The Power of an Organized Mind",
        content: "An educated person is one who has so developed their mind that they may acquire anything they want without violating the rights of others. Education comes from within through self-development.",
        action: "Create a system for organizing and reviewing the knowledge you're acquiring.",
        insight: "The truly educated person knows how to get knowledge when they need it and how to organize it into definite plans of action."
      }
    ]
  },
  "Imagination": {
    lessons: [
      {
        title: "The Workshop of the Mind",
        content: "Imagination is literally the workshop wherein are fashioned all plans created by humanity. The impulse of desire is given shape, form, and action through the imaginative faculty of the mind.",
        action: "Spend 15 minutes letting your imagination run free about ways to achieve your goal. Write down 10 ideas.",
        insight: "Your only limitation is the one you set up in your own mind."
      },
      {
        title: "Synthetic vs. Creative Imagination",
        content: "Synthetic imagination arranges old concepts into new combinations. Creative imagination is the source of 'hunches' and 'inspirations'—it is your direct link to Infinite Intelligence.",
        action: "Before sleep tonight, ask your creative imagination for a solution to a current challenge.",
        insight: "The great leaders of business, industry, and finance were highly developed in their imagination."
      },
      {
        title: "Ideas are the Beginning of All Fortunes",
        content: "Ideas are the starting points of all fortunes. Ideas are products of imagination. Every human being has the ability to imagine, but only a few develop and use this ability.",
        action: "Take one of your best ideas and create a preliminary plan for bringing it to life.",
        insight: "Fortunes are built on ideas that make life easier, better, or more efficient for others."
      },
      {
        title: "Training Your Imagination",
        content: "The imagination may be strengthened through use. It becomes more alert and receptive the more it is called upon. Like a muscle, it grows stronger with exercise.",
        action: "Practice creative visualization for 10 minutes. See your ideal life in vivid detail.",
        insight: "Your imagination is the preview of life's coming attractions."
      }
    ]
  },
  "Organized Planning": {
    lessons: [
      {
        title: "The Crystallization of Desire into Action",
        content: "Everything begins with desire, which is processed through imagination where plans are created. These plans must be organized into intelligent action. Without a plan, desire remains a dream.",
        action: "Create a detailed plan with weekly milestones for your primary goal.",
        insight: "Plans are useless unless and until they have been translated into action."
      },
      {
        title: "The Master Mind Alliance",
        content: "No individual has sufficient experience, education, or knowledge to ensure the accumulation of great wealth without the cooperation of others. You need a Master Mind group.",
        action: "Identify 2-3 people who could be part of your Master Mind alliance. Reach out to one.",
        insight: "Great power can be accumulated through no other principle than the Master Mind."
      },
      {
        title: "Leaders and Followers",
        content: "The world needs capable leaders more than anything else. There are eleven major attributes of leadership and ten major causes of failure in leadership. Study both.",
        action: "Rate yourself honestly on the eleven qualities of leadership. Identify two areas to improve.",
        insight: "Leadership calls for self-discipline, decisiveness, and a definite major purpose."
      },
      {
        title: "Temporary Defeat is Not Failure",
        content: "When your plans fail, as they sometimes will, do not give up—create new plans. Temporary defeat is not permanent failure. It may only mean that your plans were not sound.",
        action: "Review a recent setback. What lesson can you extract? How can you adjust your plan?",
        insight: "Every adversity brings with it the seed of an equivalent benefit."
      }
    ]
  },
  "Decision": {
    lessons: [
      {
        title: "The Mastery of Procrastination",
        content: "Analysis of over 25,000 people who experienced failure revealed that lack of decision was near the head of the list of major causes of failure. Successful people reach decisions promptly.",
        action: "Make one decision today that you've been putting off. Act on it immediately.",
        insight: "Procrastination is the opposite of decision. The habit of reaching definite decisions can be acquired."
      },
      {
        title: "Reach Decisions Promptly",
        content: "Those who reach decisions promptly and definitely know what they want, and generally get it. The leaders of every walk of life decide quickly and firmly.",
        action: "Practice making faster decisions today. Set a time limit for minor decisions.",
        insight: "Tell the world what you intend to do, but first show it. This is the value of a definite decision."
      },
      {
        title: "Change Decisions Slowly",
        content: "People who fail to accumulate money are generally easily influenced by the opinions of others. Those who succeed keep their own counsel and make their own decisions.",
        action: "Make your next important decision without seeking approval from others.",
        insight: "The world has a way of making room for the person whose words and actions show they know where they are going."
      },
      {
        title: "The Value of Definiteness",
        content: "Definiteness of decision always requires courage—sometimes great courage. The courage to make a decision shows you have mastery of yourself.",
        action: "Identify a decision you've avoided due to fear. Commit to making it within 24 hours.",
        insight: "The moment you definitely decide, all sorts of things begin to happen to help you that otherwise would never have occurred."
      }
    ]
  },
  "Persistence": {
    lessons: [
      {
        title: "The Sustained Effort Necessary for Faith",
        content: "Persistence is an essential factor in transforming desire into its monetary equivalent. The basis of persistence is the power of will. With will and desire, you are practically unstoppable.",
        action: "When you feel like quitting today, push through for 10 more minutes.",
        insight: "Persistence is to the character of man as carbon is to steel."
      },
      {
        title: "The Four Simple Steps to Persistence",
        content: "Persistence can be developed: (1) A definite purpose backed by burning desire, (2) A definite plan expressed in continuous action, (3) A mind closed against negativity, (4) A friendly alliance with others.",
        action: "Assess yourself on these four points. Which needs the most work? Focus on it today.",
        insight: "Persistence is simply the sustained effort necessary to induce faith."
      },
      {
        title: "Symptoms of Lack of Persistence",
        content: "Most people are ready to throw away their plans and quit at the first sign of opposition. A few carry on despite obstacles and reach their goal. The majority are ready to give up easily.",
        action: "Review a time you gave up too soon. What would you do differently with your current knowledge?",
        insight: "There is no substitute for persistence. It cannot be supplanted by any other quality."
      },
      {
        title: "How to Develop Persistence",
        content: "If you find yourself lacking in persistence, build a stronger fire under your desires. Review your purpose daily, intensify your desire, and take consistent action despite how you feel.",
        action: "Review your major purpose and reconnect with why it matters deeply to you.",
        insight: "Riches do not respond to wishes. They respond only to definite plans backed by definite desires through constant persistence."
      }
    ]
  },
  "Power of the Master Mind": {
    lessons: [
      {
        title: "The Driving Force of Achievement",
        content: "The Master Mind is the coordination of knowledge and effort, in a spirit of harmony, between two or more people for the attainment of a definite purpose. No individual achieves great success alone.",
        action: "Identify 2-3 people who share your vision. Plan how to approach them about forming an alliance.",
        insight: "When minds blend in harmony, a third mind emerges that is greater than any individual mind."
      },
      {
        title: "Two Characteristics of the Master Mind",
        content: "First, the economic benefit of surrounding yourself with the advice and cooperation of others. Second, the psychic benefit of the blending of minds creating a third mind.",
        action: "Analyze your current relationships. Which ones give you energy? Which ones drain you?",
        insight: "You are the average of the five people you spend the most time with."
      },
      {
        title: "Harmony is Essential",
        content: "The Master Mind principle cannot work without harmony. When minds clash instead of blend, the power is lost. Choose your alliance members carefully and maintain harmony.",
        action: "Resolve one conflict or source of friction in an important relationship today.",
        insight: "Power grows out of organized knowledge, but it grows out of it through the application of mind in harmony."
      },
      {
        title: "Building Your Master Mind Alliance",
        content: "Select people who have the knowledge, experience, and resources you need. Meet regularly. Create an atmosphere of mutual respect and shared purpose. Give as much as you receive.",
        action: "Create a structure for your Master Mind meetings: frequency, agenda, expectations.",
        insight: "Great power can be accumulated through no other principle than the harmonious Master Mind."
      }
    ]
  },
  "Sex Transmutation": {
    lessons: [
      {
        title: "The Creative Energy of Success",
        content: "The emotion of sex contains the secret of creative ability. When harnessed and redirected, this energy can drive tremendous achievement. It is the most powerful of all human emotions.",
        action: "Channel your creative energy today into productive work on your major purpose.",
        insight: "The transmutation of sex energy calls for more willpower than the average person cares to use for this purpose."
      },
      {
        title: "The Power of Emotional Energy",
        content: "Creative genius is powered by the stimulation of mind, which includes the emotions of love, faith, enthusiasm, and yes, the desire for expression. These can be transmuted into any form of action.",
        action: "Identify the strongest positive emotion you have. How can you harness it for your goals?",
        insight: "The human mind responds to stimuli. The greatest are the emotions."
      },
      {
        title: "Achievement Requires Intensity",
        content: "People seldom succeed before the age of 40 because they dissipate their energies in the physical expression of emotion. When they learn to transmute this energy, they rise to great heights.",
        action: "Notice today when you feel a surge of energy. Redirect it toward something constructive.",
        insight: "Energy can neither be created nor destroyed—only transformed. Transform your energy wisely."
      },
      {
        title: "The Role of Love",
        content: "When the emotion of love, driven by sex, is combined with the emotions of romance and faith, genius and creative ability flourish. Love lifts one to heights of super-achievement.",
        action: "Express love and appreciation today to someone important to you.",
        insight: "Love is the greatest of all emotions. When mixed with other positive emotions, it creates miracles."
      }
    ]
  },
  "The Subconscious Mind": {
    lessons: [
      {
        title: "The Connecting Link to Infinite Intelligence",
        content: "The subconscious mind is the connecting link between the finite mind of man and Infinite Intelligence. It works day and night. You can voluntarily plant in it any plan, thought, or purpose.",
        action: "Before sleep tonight, plant a positive thought or goal in your subconscious mind.",
        insight: "The subconscious mind works upon all thought impulses—positive or negative. Guard your thoughts."
      },
      {
        title: "The Power of Positive Emotions",
        content: "There are seven major positive emotions: desire, faith, love, sex, enthusiasm, romance, and hope. There are seven major negative emotions. You cannot have both in your mind simultaneously.",
        action: "Monitor your emotions today. Each time you notice a negative emotion, replace it with a positive one.",
        insight: "Positive and negative emotions cannot occupy the mind at the same time. One will dominate."
      },
      {
        title: "Programming Your Subconscious",
        content: "The subconscious mind will translate into reality a thought driven by faith, just as readily as a thought driven by fear. It is your responsibility to feed it positive thoughts.",
        action: "Create a nightly ritual of programming your subconscious with your goals and positive affirmations.",
        insight: "The subconscious mind makes no distinction between constructive and destructive thought impulses."
      },
      {
        title: "The Subconscious Never Sleeps",
        content: "The subconscious receives and files sensory impressions continuously, acting upon whatever reaches it. It can be influenced by autosuggestion and will carry out orders given to it.",
        action: "Review what you've fed your subconscious mind recently. Make a plan to improve the input.",
        insight: "Your subconscious is either your greatest ally or your worst enemy. You decide which."
      }
    ]
  },
  "The Brain": {
    lessons: [
      {
        title: "The Broadcasting and Receiving Station",
        content: "The brain is capable of picking up thought vibrations being released by other brains. The creative imagination is the receiving set, and the subconscious mind is the broadcasting station.",
        action: "Tune into the thoughts of successful people today by reading their work or listening to them.",
        insight: "Every brain is both a broadcasting and receiving station for thought vibrations."
      },
      {
        title: "Thought Vibrations",
        content: "Thoughts that are mixed with emotion have a higher vibration rate. They are picked up more readily and travel farther. This is why emotionalized thought is so powerful.",
        action: "Add strong emotion to your goals and affirmations to increase their broadcast power.",
        insight: "The brain transmits thoughts with the most energy when those thoughts are mixed with emotion."
      },
      {
        title: "The Importance of Environment",
        content: "Just as a radio can pick up different stations, your brain can tune into different thought frequencies. Your environment and associations influence which frequencies you receive.",
        action: "Evaluate your environment. Does it support or hinder your goals? Make one improvement.",
        insight: "You cannot tune into positive thought waves in a negative environment."
      },
      {
        title: "The Sixth Sense and the Brain",
        content: "Through the faculty of creative imagination, finite minds have direct communication with Infinite Intelligence. This is the connecting link between the mind of man and the source of all creation.",
        action: "Practice meditation or quiet contemplation to strengthen your connection to creative imagination.",
        insight: "The brain is the physical equipment through which the mind operates. Keep it healthy and active."
      }
    ]
  },
  "The Sixth Sense": {
    lessons: [
      {
        title: "The Door to the Temple of Wisdom",
        content: "The Sixth Sense is that portion of the subconscious mind referred to as creative imagination. It is the receiving set through which ideas, plans, and thoughts flash into the mind.",
        action: "Spend 10 minutes in silence today, listening for intuitive guidance about your path.",
        insight: "The Sixth Sense comes only by meditation through mind development from within."
      },
      {
        title: "The Source of Hunches",
        content: "The Sixth Sense defies description but can be understood through daily meditation and inner development. It is the source of hunches and inspirations that cannot be explained by logic alone.",
        action: "Keep a journal of your hunches and inspirations. Note which ones prove accurate.",
        insight: "When the Sixth Sense warns you, heed the warning. It is often correct."
      },
      {
        title: "Developing Your Intuition",
        content: "The Sixth Sense is not something that can be acquired from external sources. It is developed over time through the mastery of the other twelve principles in this philosophy.",
        action: "Review your application of all thirteen principles. Which needs the most attention?",
        insight: "The Sixth Sense is nature's protection against mistakes caused by incomplete knowledge."
      },
      {
        title: "Trust Your Inner Guidance",
        content: "There will come a time when you can close your eyes and ask your creative imagination for guidance on any problem. Trust the answers that come, for they are from a higher source.",
        action: "Practice asking your inner guidance for solutions and trust the answers you receive.",
        insight: "The development of the Sixth Sense is the climax of this philosophy."
      }
    ]
  }
};

// Generate all 365 pages by cycling through principles and lessons
const generateAllPages = (): BookPage[] => {
  const allPages: BookPage[] = [];
  let pageId = 1;
  
  // First, create pages from the detailed lessons (4 lessons x 13 principles = 52 pages)
  for (const principle of PRINCIPLES) {
    const lessons = coreLessons[principle.name]?.lessons || [];
    for (const lesson of lessons) {
      allPages.push({
        id: pageId++,
        chapter: principle.chapter,
        chapterNumber: principle.chapterNumber,
        title: lesson.title,
        content: lesson.content,
        principle: principle.name,
        dailyAction: lesson.action,
        keyInsight: lesson.insight
      });
    }
  }
  
  // Then, create additional pages cycling through principles with practice focus
  const practiceThemes = [
    "Morning Reflection",
    "Daily Application",
    "Evening Review",
    "Weekly Integration",
    "Practical Exercise",
    "Challenge Day",
    "Deep Dive Study"
  ];
  
  while (allPages.length < 365) {
    const principleIndex = (allPages.length - 52) % PRINCIPLES.length;
    const themeIndex = Math.floor((allPages.length - 52) / PRINCIPLES.length) % practiceThemes.length;
    const principle = PRINCIPLES[principleIndex];
    const theme = practiceThemes[themeIndex];
    
    const lessons = coreLessons[principle.name]?.lessons || [];
    const lessonIndex = (allPages.length - 52) % lessons.length;
    const baseLesson = lessons[lessonIndex] || lessons[0];
    
    allPages.push({
      id: pageId++,
      chapter: principle.chapter,
      chapterNumber: principle.chapterNumber,
      title: `${theme}: ${principle.name}`,
      content: `Today's focus is on the principle of ${principle.name}. ${baseLesson?.content || 'Take time to study and apply this principle in your daily life.'}`,
      principle: principle.name,
      dailyAction: baseLesson?.action || `Apply the principle of ${principle.name} in at least one situation today.`,
      keyInsight: baseLesson?.insight
    });
  }
  
  return allPages;
};

const allBookPages = generateAllPages();

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

export const getPagesByPrinciple = (principle: string): BookPage[] => {
  return allBookPages.filter(page => page.principle === principle);
};

export const getAllPrinciples = (): string[] => {
  return PRINCIPLES.map(p => p.name);
};

export const getPrincipleDescription = (principle: string): string => {
  const descriptions: Record<string, string> = {
    "Desire": "The starting point of all achievement - the burning, passionate desire for a definite goal.",
    "Faith": "The visualization of and belief in the attainment of desire. Faith is developed through affirmation.",
    "Auto-Suggestion": "The medium for influencing the subconscious mind through self-directed communication.",
    "Specialized Knowledge": "Organized, practical knowledge directed toward a definite purpose.",
    "Imagination": "The workshop of the mind where plans are fashioned into reality.",
    "Organized Planning": "The crystallization of desire into actionable, systematic plans.",
    "Decision": "The mastery of procrastination through prompt and definite decision-making.",
    "Persistence": "The sustained effort necessary to induce faith and maintain momentum.",
    "Power of the Master Mind": "The coordination of knowledge and effort in a spirit of harmony.",
    "Sex Transmutation": "The switching of the mind from thoughts of physical expression to other creative efforts.",
    "The Subconscious Mind": "The connecting link between the finite mind and Infinite Intelligence.",
    "The Brain": "The broadcasting and receiving station for thought vibrations.",
    "The Sixth Sense": "The door to the temple of wisdom - creative imagination and intuition."
  };
  return descriptions[principle] || principle;
};
