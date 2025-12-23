
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Language = 'en' | 'ro';

type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

// All translations for the app
const translations: Translations = {
  en: {
    // Auth page
    "becomeTheWarrior": "Become the Warrior",
    "youWereMeantToBe": "you were meant to be",
    "transformYourLife": "Transform your life with purpose and discipline. Our platform helps you build habits, track progress, and connect with like-minded warriors.",
    "dailyStackSystem": "Daily Stack System",
    "buildPowerfulHabits": "Build powerful habits through daily reflection and action",
    "warriorTribe": "Warrior Tribe",
    "connectWithWarriors": "Connect with warriors who challenge and support your growth",
    "growthTracking": "Growth Tracking",
    "visualizeYourProgress": "Visualize your progress with powerful analytics",
    
    // Transformation Workshop
    "transformationWorkshop": "Introspection",
    "coachingDescription": "Take a moment to reflect and get guidance through our AI coaching system",
    "prayerStackTitle": "What are you going to title this conversation with God?",
    "whatAreYouGoingToTitleThisCoaching": "What are you going to title this coaching session?",
    "whoOrWhatAreYouStacking": "Who or what are you focusing on?",
    "whyHasThisTriggeredYou": "In this moment, why has this triggered you to pray?",
    "whatIsTheStory": "What is the story you're telling yourself, created by your trigger \"this trigger\", about this situation?",
    "describeSingleWordFeelings": "Describe the single word feelings that arise for you when you tell yourself that story?",
    "iWantGodToKnow": "Lord, I want to know",
    "dearGod": "Dear GOD,",
    "singularLesson": "What is the singular lesson on life you are taking from this coaching session?",
    "significantRevelation": "What is the most significant revelation or insight you are leaving this coaching session with, and why do you feel that way?",
    "immediateActions": "What immediate actions are you committed to taking leaving this session?",
    
    // Common
    "language": "Language",
    "english": "English",
    "romanian": "Romanian",
    
    // Common UI elements
    "dashboard": "DASHBOARD",
    "stack": "INTROSPECTION",
    "triggers": "Triggers",
    "selectTrigger": "Select a trigger",
    "newStack": "New Session",
    "startStack": "Start a Session",
    "startStackDesc": "Select a trigger from the left to begin your daily reflection. This practice helps you process your emotions and experiences.",
    "power": "POWER",
    "production": "PRODUCTION",
    "stackCompleted": "Session Completed",
    "reflectionSaved": "Your reflection has been saved",
    "startNewStack": "Start New Session",
    "typeResponse": "Type your response...",
    "stackHistory": "Session History",
    "noStackHistory": "No session history yet",
    "completed": "Completed",
    "today": "Today",
    "yesterday": "Yesterday",
    
    // Trigger responses
    "reflectExperience": "Let's reflect on your experience.",
    "thankYouReflection": "Thank you for your reflection. Your insights have been saved to your COACHING.",
    
    // Button actions
    "view": "VIEW",
    "send": "Send",
    
    // Admin panel
    "toolsManagement": "Tools Management",
    "addNewTool": "Add New Tool",
    "searchTools": "Search tools...",
    "isActive": "Active",
    "inactive": "Inactive",
    "deactivate": "Deactivate",
    "activate": "Activate",
    "launchTool": "Launch Tool",
    "launching": "Launching",
    "noToolsFound": "No tools found",
    "tryAdjusting": "Try adjusting your search or filters.",
    
    // Core navigation
    "goToDashboard": "Go to Dashboard",
    "continue": "Continue",
    "backToDashboard": "Back to Dashboard",
    "core": "CORE",
    
    // Core 4 activities
    "fitness": "FITNESS",
    "fuel": "FUEL",
    "meditation": "MEDITATION",
    "memoirs": "MEMOIRS",
    "person1": "PERSON 1",
    "person2": "PERSON 2",
    "discover": "DISCOVER",
    "declare": "DECLARE",
    "thisWeek": "THIS WEEK",
    "body": "BODY",
    "being": "BEING",
    "balance": "BALANCE",
    "business": "BUSINESS",
    "share": "SHARE",
    "activityCompleted": "{activity} completed!",
    "activityIncomplete": "{activity} marked incomplete",
    "greatJob": "Great job! Your Core 4 progress has been updated.",
    "progressUpdated": "Your progress has been updated.",
    
    // Dashboard specific
    "trackActivities": "Track Activities",
    "myDaily": "MY DAILY",
    "myWeekly": "MY WEEKLY",
    "myQuarterly": "MY QUARTERLY",
    "theMemory": "THE MEMORY",
    "theScore": "THE SCORE",
    "theStreaks": "THE STREAKS",
    "theTotal": "THE TOTAL",
    "door": "DOOR",
    "game": "GAME",
    "myMissions": "MY MISSIONS",
    "warriorBody": "Warrior Body",
    "meditationWarrior": "Meditation Warrior",
    "soulmateFamily": "Soul mate Family",
    "buildingKingdom": "Building the Kingdom",
    "noStackCompletedYet": "You haven't completed your daily stack yet.",
    "beginNow": "Begin now",
    "gratefulMessage": "I'm grateful for this new opportunity to grow.",
    "noDoorTasksYet": "You haven't set Domino Door tasks yet.",
    "noTaskSet": "No task set",
    "setTasks": "Set Tasks",
    "viewCoreDetails": "View Core Details",
    
    // Door specific translations
    "commandCenter": "TO DO",
    "doorTitle": "DOOR",
    "doorPlanningSystem": "Weekly Planning System",
    "currentWeek": "Current Week",
    "pastWeek": "Past Week", 
    "futureWeek": "Future Week",
    "viewingPastWeek": "You are viewing a past week",
    "viewingFutureWeek": "You are viewing a future week",
    "backToCurrentWeek": "🏠 Back to Current Week",
    "ideaList": "IDEA LIST",
    "hotList": "HOT LIST", 
    "weeklyGoal": "WEEKLY GOAL",
    "dominoDoor": "DOMINO DOOR",
    "weeklyMassiveGoal": "WEEKLY MASSIVE GOAL",
    "tasks": "TASKS",
    "todoList": "TO DO LIST",
    "doList": "DO LIST",
    "monday": "Monday",
    "tuesday": "Tuesday", 
    "wednesday": "Wednesday",
    "thursday": "Thursday",
    "friday": "Friday",
    "saturday": "Saturday",
    "sunday": "Sunday",
    "mondayShort": "Mon",
    "tuesdayShort": "Tue",
    "wednesdayShort": "Wed", 
    "thursdayShort": "Thu",
    "fridayShort": "Fri",
    "saturdayShort": "Sat",
    "sundayShort": "Sun",
    "noGoalSelected": "No goal selected yet",
    "dragGoalToSet": "Drag an item from the idea list to set your weekly massive goal",
    "mainGoal": "Main Goal:",
    "keyPoints": "Key Points:",
    "keyPoint": "Key point",
    "noTasksForDay": "No tasks for this day",
    "dragItemsHere": "Drag items here from your IDEA list",
    "yourIdeaListEmpty": "Your idea list is empty",
    "addNewItemsToStart": "Add new items to get started",
    "addNewIdea": "Add New Idea",
    "addItem": "Add Item",
    "searchItems": "Search items...",
    "searchIdeas": "Search ideas...",
    "normal": "Normal",
    "important": "Important",
    "urgent": "Urgent",
    "urgentImportant": "Urgent & Important",
    "moveBackToIdeaList": "Move back to Idea List",
    "moveBackToHotList": "Move back to Hot List",
    "keyPointLabel": "Key Point",
    "todayLabel": "Today",
    "weekLabel": "Week",
    "autoSaveInfo": "Your weekly planning is saved automatically",
    "enterNewIdea": "Enter your new idea...",
    "selectPriority": "Select priority",
    "deleteIdea": "Delete idea",
    "editIdea": "Edit idea",
    "weekly": "Weekly",
    "planning": "Planning",
    
    // Fact Maps
    "backToFactMaps": "Back to Fact Maps",
    "mapOrGoalNotFound": "Map or goal not found",
    "enterYourAnswer": "Enter your answer here...",
    "characters": "Characters",
    "previous": "Previous",
    "next": "Next",
    "reset": "Reset",
    "save": "Save",
    "success": "Success",
    "answersSaved": "Your answers have been saved.",
    "stackShared": "Stack Shared",
    "linkCopiedToClipboard": "Link copied to clipboard",
    "savedToLibrary": "Saved to Library",
    "savedToLibraryDesc": "Your stack has been saved to your library",
    "stackLibrary": "Stack Library",
    "all": "All",
    "shared": "Shared",
    "noStacksInLibrary": "You don't have any stacks in your library yet",
    "createYourFirstStack": "Create Your First Stack",
    "errorSaving": "Error Saving",
    "startOver": "Start Over",
    "actionDescription": "Action description",
    "addAction": "Add Action",
    "actionAdded": "Action Added",
    "actionAddedDesc": "Your action has been added successfully",
    "reminderSet": "Reminder Set",
    "reminderSetDesc": "You will be reminded about this action",
    "actions": "Actions",
    "coaching_completed": "Coaching Completed",
    "coaching_completed_desc": "Your coaching session has been saved",
    "startNew": "Start New",
    "noCoachingHistoryYet": "No coaching history yet",
    
    // Divine Coaching specific
    "whatAreYouGoingToTitleThisDivineCoaching": "What are you going to title this Divine coaching session?",
    "whoOrWhatAreYouStackingDivine": "Who or what are you stacking?",
    "whyHasThisTriggeredYouToPray": "In this moment, why has this triggered you to pray?",
    "whatIsTheStoryDivineTrigger": "What is the story you're telling yourself, created by this trigger, about this and the situation?",
    "describeSingleWordFeelingsDivine": "Describe the single word feelings that arise for you when you tell yourself that story?",
    "godIsListening": "God is listening what do you have to say?",
    "iWantGODToKnow1": "Lord, I want to know:",
    "iWantGODToKnow2": "Lord, I want to know:",
    "iWantGODToKnow3": "Lord, I want to know:",
    "iWantGODToKnow4": "Lord, I want to know:",
    "dearGODWhatDoYouWantMeToSee": "Dear GOD, What do you want me to see here?",
    "whatDoYouWantMeToHear": "What do you want me to hear?",
    "whatDoYouWantMeToLearn": "What do you want me to learn?",
    "whatDoYouWantMeToFeel": "What do you want me to feel?",
    "whatDoYouWantMeToKnow": "What do you want me to know?",
    "whatDoYouWantMeToDo": "What do you want me to do?",
    "godHeardYou": "God wants you to:",
    "singularLessonDivine": "What is the singular lesson on life you are taking from this Divine coaching session?",
    "howDoesThisLessonApplyToBody": "How does this lesson apply to your Body?",
    "howDoesThisLessonApplyToBeing": "How does this lesson apply to your Being?",
    "howDoesThisLessonApplyToBalance": "How does this lesson apply to your Balance?",
    "howDoesThisLessonApplyToBusiness": "How does this lesson apply to your Business?",
    "significantRevelationDivine": "What is the most significant revelation or insight you are leaving this Divine coaching session with, and why do you feel that way?",
    "immediateActionsDivine": "What immediate actions are you committed to taking leaving this session?",
    "doYouWantToAddToHotList": "Do you want to add this to hot list?",
    "isThereAnythingElseToAddToHotList": "Is there anything else you want to add to hot list?",
    
    // Landing Page - Jump to Freedom
    "jumpToFreedom": "Jump to Freedom",
    "haveItAll": "Have It All",
    "startNowSeeResults": "Start Now. See Results in 48 Hours.",
    "freeTrial7Days": "Free 7-day trial (card required). Zero risk. Cancel anytime during trial with no charge.",
    "fifteenMinuteSetup": "15-Minute Setup",
    "quickOnboarding": "Quick onboarding, then execute",
    "resultsIn48h": "Results in 48h",
    "clarityFirstWins": "Clarity + first wins",
    "zeroRiskGuarantee": "Zero Risk Guarantee",
    "sevenDayTrialCancelFree": "7-day trial, cancel free",
    "startYour7DayFreeTrial": "Start Your 7-Day Free Trial",
    "membersTransformed": "500+ members transformed",
    "averageLifeSatisfaction": "Average +35% life satisfaction in 30 days",
    "costOfWaiting": "The Cost of Waiting",
    "everyDayWithoutSystem": "Every Day Without a System Costs You",
    "whileYouHesitate": "While you hesitate, life keeps moving. Here's what you lose with each passing day:",
    "bodyEnergyCost": "-0.5% energy & vitality",
    "beingPeaceCost": "-1 moment of inner peace",
    "balanceConnectionCost": "-1 meaningful connection",
    "businessRevenueCost": "-$50-500 potential revenue",
    "thirtyDaysFromNow": "30 Days From Now",
    "transformationChoice": "You can either be 30 days into your transformation, experiencing more energy, clarity, better relationships, and growing income... or still wondering 'what if?'",
    "energyLevel": "Energy Level",
    "mindfulMinutes": "Mindful Minutes",
    "qualityMoments": "Quality Moments",
    "productivityIncrease": "Productivity",
    "startMyTransformationToday": "Start My Transformation Today",
    "averageSetupTime": "Average setup time: 15 minutes",
    "aboutJumpToFreedom": "About Jump to Freedom",
    "ourMissionValues": "Our Mission & Values",
    "aboutDescription": "Learn about Jump to Freedom's mission to help you achieve holistic success across Body, Being, Balance, and Business through proven systems and daily habits.",
    "missionToHelpYou": "We're on a mission to help you break free from the trap of imbalance and build a life where you truly have it all - health, peace, love, and prosperity.",
    "storyBehind": "The Story Behind Jump to Freedom",
    "purposeDriven": "Purpose-Driven",
    "purposeDrivenDesc": "Every feature is designed to help you live with intention and achieve meaningful goals across all areas of life.",
    "holisticGrowth": "Holistic Growth",
    "holisticGrowthDesc": "We believe true success comes from balance - nurturing your body, mind, relationships, and career together.",
    "continuousImprovement": "Continuous Improvement",
    "continuousImprovementDesc": "Small daily actions compound into extraordinary results. We help you build systems, not just motivation.",
    "communitySupport": "Community Support",
    "communitySupportDesc": "You're not alone on this journey. Connect with like-minded individuals committed to growth.",
    "fourPillarsOfFreedom": "The 4 Pillars of Freedom",
    "trueFreedomComes": "True freedom comes from mastery in all four areas of life. Neglect one, and the others eventually suffer.",
    "bodyPillarDesc": "Physical health, energy, fitness, and vitality",
    "beingPillarDesc": "Mental clarity, spirituality, and inner peace",
    "balancePillarDesc": "Relationships, family, and meaningful connections",
    "businessPillarDesc": "Career growth, finances, and professional success",
    "ourMission": "Our Mission",
    "missionStatement": "To empower 1 million people to break free from the trap of imbalanced living and build lives of holistic abundance.",
    "ourVision": "Our Vision",
    "visionStatement": "A world where success is measured not by achievements in isolation, but by the harmony and fulfillment across all dimensions of life.",
    "ourCoreValues": "Our Core Values",
    "coreValuesPrinciples": "These principles guide everything we build and every decision we make.",
    "readyToJump": "Ready to Jump to Freedom?",
    "joinThousands": "Join thousands of people who have transformed their lives by mastering all four pillars. Start your 7-day free trial today.",
    "startFreeTrial": "Start Free Trial",
    "learnMore": "Learn More",
    
    // XP System translations
    "level": "Level",
    "xp": "XP",
    "xpToNextLevel": "XP to next level",
    "totalXP": "Total XP",
    "levelUp": "Level Up!",
    "levelUpCongrats": "Congratulations!",
    "youReachedLevel": "You've reached level",
    "keepGoing": "Keep going! Great things await.",
    "continueJourney": "Continue Journey",
    "xpEarned": "XP earned",
    
    // Level titles
    "levelTitle_1": "Awakening Seeker",
    "levelTitle_2": "Focused Initiate",
    "levelTitle_3": "Disciplined Warrior",
    "levelTitle_4": "Rising Champion",
    "levelTitle_5": "Enlightened Master",
    "levelTitle_6": "Wise Sage",
    "levelTitle_7": "Legendary Hero",
    "levelTitle_8": "Transcendent Being",
    "levelTitle_9": "Cosmic Warrior",
    "levelTitle_10": "Infinite Master",
    
    // Daily Challenges
    "dailyChallenges": "Daily Challenges",
    "challengeProgress": "Progress",
    "claimReward": "Claim Reward",
    "challengeCompleted": "Completed!",
    "challengesRefreshIn": "Challenges refresh in",
    "allChallengesComplete": "All challenges complete! Great work!",
    "hours": "hours",
    "minutes": "minutes",
    
    // Challenge types
    "challenge_complete_stack": "Complete a Stack",
    "challenge_complete_stack_desc": "Finish a reflection stack",
    "challenge_read_pages": "Read Pages",
    "challenge_read_pages_desc": "Read at least 5 pages today",
    "challenge_complete_core": "Complete Core 4",
    "challenge_complete_core_desc": "Complete all Core 4 activities",
    "challenge_complete_actions": "Complete Actions",
    "challenge_complete_actions_desc": "Complete 3 action items",
    "challenge_login_streak": "Login Streak",
    "challenge_login_streak_desc": "Maintain your streak",
    "challenge_complete_door": "Door Tasks",
    "challenge_complete_door_desc": "Complete 5 door tasks",
    
    // Smart Notifications
    "goodMorning": "Good Morning!",
    "goodAfternoon": "Good Afternoon!",
    "goodEvening": "Good Evening!",
    "streakAtRisk": "Your streak is at risk!",
    "streakAtRiskDesc": "Complete an activity to keep your streak alive",
    "almostLevelUp": "Almost there!",
    "almostLevelUpDesc": "Just {xp} XP to level up!",
    "welcomeBack": "Welcome back!",
    "welcomeBackDesc": "Ready to continue your journey?",
    "greatStreak": "Amazing streak!",
    "greatStreakDesc": "{days} days and counting!",
    "startSession": "Start Session",
    "viewProgress": "View Progress",
    
    // Streak Milestones
    "streakMilestone": "Streak Milestone!",
    "days": "days",
    "dayStreak": "Day Streak",
    "streakBonus": "Streak Bonus",
    "streakShieldUnlocked": "Streak Shield Unlocked!",
    "streakShieldDesc": "You now have protection against losing your streak",
    "keepItUp": "Keep Going!",
    
    // Streak milestone titles
    "streak_7_title": "One Week Warrior",
    "streak_7_subtitle": "7 days of dedication",
    "streak_7_message": "You've shown real commitment. The habit is forming!",
    "streak_30_title": "Monthly Master",
    "streak_30_subtitle": "30 days of discipline",
    "streak_30_message": "A full month! You're building something extraordinary.",
    "streak_100_title": "Century Champion",
    "streak_100_subtitle": "100 days of excellence",
    "streak_100_message": "100 days of growth. You're truly unstoppable!",
    "streak_365_title": "Annual Legend",
    "streak_365_subtitle": "365 days of mastery",
    "streak_365_message": "A full year! You've achieved legendary status.",
    
    // Badge Unlock
    "badgeUnlocked": "Badge Unlocked!",
    "newBadge": "New Badge",
    "awesome": "Awesome!",
    
    // Weekly Recap
    "weeklyRecap": "Weekly Recap",
    "weekNumber": "Week",
    "daysActive": "Days Active",
    "daysActiveSubtitle": "You showed up this week!",
    "stacksCompleted": "Stacks Completed",
    "stacksCompletedSubtitle": "Reflection sessions done",
    "pagesRead": "Pages Read",
    "pagesReadSubtitle": "Knowledge gained",
    "actionsCompleted": "Actions Completed",
    "actionsCompletedSubtitle": "Tasks accomplished",
    "xpEarnedWeek": "XP Earned",
    "xpEarnedSubtitle": "Experience gained",
    "currentStreakWeek": "Current Streak",
    "currentStreakSubtitle": "Days in a row",
    "badgesEarned": "Badges Earned",
    "badgesEarnedSubtitle": "Achievements unlocked",
    "greatWeek": "Great week!",
    "seeYouNextWeek": "See you next week!",
    
    // Milestone Celebrations
    "milestoneReached": "Milestone Reached!",
    "firstStack": "First Stack",
    "firstStackMessage": "You completed your first reflection stack!",
    "tenStacks": "10 Stacks",
    "tenStacksMessage": "A milestone of reflection and growth!",
    "hundredPages": "100 Pages",
    "hundredPagesMessage": "You've read 100 pages of wisdom!",
    "firstWeek": "First Week",
    "firstWeekMessage": "Your first week streak!",
    "firstMonth": "First Month",
    "firstMonthMessage": "An entire month of dedication!",
    "levelFive": "Level 5",
    "levelFiveMessage": "You've reached Level 5!",
    "levelTen": "Level 10",
    "levelTenMessage": "The big 10! You're a master!",
    
    // Rewards Showcase
    "rewards": "Rewards",
    "unlockableRewards": "Unlockable Rewards",
    "themes": "Themes",
    "avatars": "Avatars",
    "frames": "Frames",
    "unlockAt": "Unlock at Level",
    "unlocked": "Unlocked",
    "equipped": "Equipped",
    "equip": "Equip",
    "locked": "Locked",
    "nextReward": "Next Reward",
    
    // Reward names
    "reward_dark_theme": "Dark Warrior Theme",
    "reward_dark_theme_desc": "A sleek dark theme for focused warriors",
    "reward_gold_theme": "Golden Champion Theme",
    "reward_gold_theme_desc": "A prestigious golden theme",
    "reward_nature_theme": "Nature Harmony Theme",
    "reward_nature_theme_desc": "Calming nature-inspired colors",
    "reward_avatar_warrior": "Warrior Avatar",
    "reward_avatar_warrior_desc": "The classic warrior avatar",
    "reward_avatar_sage": "Sage Avatar",
    "reward_avatar_sage_desc": "Wisdom personified",
    "reward_avatar_legend": "Legend Avatar",
    "reward_avatar_legend_desc": "For legendary achievers",
    "reward_frame_bronze": "Bronze Frame",
    "reward_frame_bronze_desc": "A sturdy bronze frame",
    "reward_frame_silver": "Silver Frame",
    "reward_frame_silver_desc": "An elegant silver frame",
    "reward_frame_gold": "Gold Frame",
    "reward_frame_gold_desc": "The prestigious gold frame",
    
    // Gamification general
    "gamification": "Gamification",
    "achievements": "Achievements",
    "progress": "Progress",
    "streak": "Streak",
    "currentStreak": "Current Streak",
    "longestStreak": "Longest Streak",
    "totalDaysActive": "Total Days Active",
    "loading": "Loading...",
    "error": "Error",
    "close": "Close",
    "ok": "OK",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "remove": "Remove",
    "update": "Update",
    "create": "Create",
    "submit": "Submit",
    "done": "Done",
    "finish": "Finish",
    "start": "Start",
    "stop": "Stop",
    "pause": "Pause",
    "resume": "Resume",
    "retry": "Retry",
    "back": "Back",
    "forward": "Forward",
    "yes": "Yes",
    "no": "No",
    
    // DailyCompactCard
    "dailyPage": "Daily Page",
    "read": "Read",
    "pleaseLoginToTrack": "Please login to track progress",
    "actionCompletedToast": "Action completed!",
    "showMore": "Show more",
    "showLess": "Show less"
  },
  ro: {
    // Auth page
    "becomeTheWarrior": "Devino Războinicul",
    "youWereMeantToBe": "care ai fost menit să fii",
    "transformYourLife": "Transformă-ți viața cu scop și disciplină. Platforma noastră te ajută să îți construiești obiceiuri, să îți urmărești progresul și să te conectezi cu războinici care gândesc la fel.",
    "dailyStackSystem": "Sistemul Zilnic Stack",
    "buildPowerfulHabits": "Construiește obiceiuri puternice prin reflecție și acțiune zilnică",
    "warriorTribe": "Tribul Războinicilor",
    "connectWithWarriors": "Conectează-te cu războinici care îți provoacă și susțin creșterea",
    "growthTracking": "Urmărirea Creșterii",
    "visualizeYourProgress": "Vizualizează-ți progresul cu analize puternice",
    
    // Transformation Workshop
    "transformationWorkshop": "Introspecție",
    "coachingDescription": "Ia-ți un moment pentru a reflecta și a primi îndrumare prin sistemul nostru de coaching cu AI",
    "prayerStackTitle": "Ce titlu vei da acestei conversații cu Dumnezeu?",
    "whatAreYouGoingToTitleThisCoaching": "Ce titlu vei da acestei sesiuni de coaching?",
    "whoOrWhatAreYouStacking": "Pe cine sau ce te concentrezi?",
    "whyHasThisTriggeredYou": "În acest moment, de ce te-a declanșat să te rogi?",
    "whatIsTheStory": "Care este povestea pe care ți-o spui, creată de declanșatorul tău \"this trigger\", despre această situație?",
    "describeSingleWordFeelings": "Descrie sentimentele într-un singur cuvânt care apar pentru tine când îți spui acea poveste?",
    "iWantGodToKnow": "Doamne, vreau să știu",
    "dearGod": "Dragă DOAMNE,",
    "singularLesson": "Care este lecția singulară despre viață pe care o iei din această sesiune de coaching?",
    "significantRevelation": "Care este cea mai semnificativă revelație sau insight cu care pleci din această sesiune de coaching și de ce te simți așa?",
    "immediateActions": "Ce acțiuni imediate te angajezi să faci când părăsești această sesiune?",
    
    // Common
    "language": "Limbă",
    "english": "Engleză",
    "romanian": "Română",
    
    // Common UI elements
    "dashboard": "PANOU DE CONTROL",
    "stack": "INTROSPECȚIE",
    "triggers": "Declanșatori",
    "selectTrigger": "Selectează un declanșator",
    "newStack": "Sesiune Nouă",
    "startStack": "Începe o Sesiune",
    "startStackDesc": "Selectează un declanșator din stânga pentru a începe reflecția zilnică. Această practică te ajută să procesezi emoțiile și experiențele tale.",
    "power": "PUTERE",
    "production": "PRODUCȚIE",
    "stackCompleted": "Sesiune Finalizată",
    "reflectionSaved": "Reflecția ta a fost salvată",
    "startNewStack": "Începe o Sesiune Nouă",
    "typeResponse": "Scrie răspunsul tău...",
    "stackHistory": "Istoric Sesiuni",
    "noStackHistory": "Încă nu există istoric sesiuni",
    "completed": "Finalizat",
    "today": "Astăzi",
    "yesterday": "Ieri",
    
    // Trigger responses
    "reflectExperience": "Să reflectăm asupra experienței tale.",
    "thankYouReflection": "Îți mulțumim pentru reflecția ta. Ideile tale au fost salvate în secțiunea COACHING.",
    
    // Button actions
    "view": "VIZUALIZEAZĂ",
    "send": "Trimite",
    
    // Admin panel
    "toolsManagement": "Gestionare Instrumente",
    "addNewTool": "Adaugă Instrument Nou",
    "searchTools": "Caută instrumente...",
    "isActive": "Activ",
    "inactive": "Inactiv",
    "deactivate": "Dezactivează",
    "activate": "Activează",
    "launchTool": "Lansează Instrumentul",
    "launching": "Se lansează",
    "noToolsFound": "Nu s-au găsit instrumente",
    "tryAdjusting": "Încearcă să ajustezi căutarea sau filtrele.",
    
    // Core navigation
    "goToDashboard": "Mergi la Panoul de Control",
    "continue": "Continuă",
    "backToDashboard": "Înapoi la Panoul de Control",
    "core": "NUCLEU",
    
    // Core 4 activities
    "fitness": "FITNESS",
    "fuel": "ALIMENTAȚIE",
    "meditation": "MEDITAȚIE",
    "memoirs": "MEMORII",
    "person1": "PERSOANA 1",
    "person2": "PERSOANA 2",
    "discover": "DESCOPERĂ",
    "declare": "DECLARĂ",
    "thisWeek": "ACEASTĂ SĂPTĂMÂNĂ",
    "body": "CORP",
    "being": "FIINȚĂ",
    "balance": "ECHILIBRU",
    "business": "AFACERI",
    "share": "DISTRIBUIE",
    "activityCompleted": "{activity} finalizat!",
    "activityIncomplete": "{activity} marcat ca nefinalizat",
    "greatJob": "Bună treabă! Progresul tău Core 4 a fost actualizat.",
    "progressUpdated": "Progresul tău a fost actualizat.",
    
    // Dashboard specific
    "trackActivities": "Urmărește Activitățile",
    "myDaily": "ACTIVITĂȚILE MELE ZILNICE",
    "myWeekly": "ACTIVITĂȚILE MELE SĂPTĂMÂNALE",
    "myQuarterly": "ACTIVITĂȚILE MELE TRIMESTRIALE",
    "theMemory": "MEMORIA",
    "theScore": "SCORUL",
    "theStreaks": "SERIILE",
    "theTotal": "TOTALUL",
    "door": "UȘA",
    "game": "JOC",
    "myMissions": "MISIUNILE MELE",
    "warriorBody": "Corp de Războinic",
    "meditationWarrior": "Războinic Meditativ",
    "soulmateFamily": "Familie Sufletească",
    "buildingKingdom": "Construirea Regatului",
    "noStackCompletedYet": "Nu ai finalizat încă stack-ul zilnic.",
    "beginNow": "Începe acum",
    "gratefulMessage": "Sunt recunoscător pentru această nouă oportunitate de a crește.",
    "noDoorTasksYet": "Nu ai setat încă sarcini Domino pentru Ușă.",
    "noTaskSet": "Nicio sarcină setată",
    "setTasks": "Setează Sarcini",
    "viewCoreDetails": "Vezi Detaliile Core",
    
    // Door specific translations
    "commandCenter": "TASKURI",
    "doorTitle": "UȘA",
    "doorPlanningSystem": "Sistem de Planificare Săptămânală", 
    "currentWeek": "Săptămâna Curentă",
    "pastWeek": "Săptămână Trecută",
    "futureWeek": "Săptămână Viitoare",
    "viewingPastWeek": "⚠️ Vizualizezi o săptămână trecută",
    "viewingFutureWeek": "⚠️ Vizualizezi o săptămână viitoare",
    "backToCurrentWeek": "🏠 Înapoi la săptămâna curentă",
    "ideaList": "LISTA DE IDEI",
    "hotList": "LISTA DE IDEI",
    "weeklyGoal": "OBIECTIV SĂPTĂMÂNAL",
    "dominoDoor": "UȘA DOMINO",
    "weeklyMassiveGoal": "OBIECTIV MASIV SĂPTĂMÂNAL",
    "tasks": "SARCINI",
    "todoList": "LISTA DE ACTIVITĂȚI",
    "doList": "LISTA DE FĂCUT",
    "monday": "Luni",
    "tuesday": "Marți",
    "wednesday": "Miercuri",
    "thursday": "Joi",
    "friday": "Vineri",
    "saturday": "Sâmbătă",
    "sunday": "Duminică",
    "mondayShort": "Lun",
    "tuesdayShort": "Mar",
    "wednesdayShort": "Mie",
    "thursdayShort": "Joi",
    "fridayShort": "Vin",
    "saturdayShort": "Sâm",
    "sundayShort": "Dum",
    "noGoalSelected": "Niciun obiectiv selectat încă",
    "dragGoalToSet": "Trage un element din lista de idei pentru a-ți seta obiectivul masiv săptămânal",
    "mainGoal": "Obiectiv Principal:",
    "keyPoints": "Puncte Cheie:",
    "keyPoint": "Punct cheie",
    "noTasksForDay": "Nu există sarcini pentru această zi",
    "dragItemsHere": "Trage elemente aici din lista ta de IDEI",
    "yourIdeaListEmpty": "Lista ta de idei este goală",
    "addNewItemsToStart": "Adaugă elemente noi pentru a începe",
    "addNewIdea": "Adaugă Idee Nouă",
    "addItem": "Adaugă Element",
    "searchItems": "Caută taskuri...",
    "searchIdeas": "Caută idei...",
    "normal": "Normal",
    "important": "Important",
    "urgent": "Urgent",
    "urgentImportant": "Urgent și Important",
    "moveBackToIdeaList": "Mută înapoi în Lista de Idei",
    "moveBackToHotList": "Mută înapoi în Lista Fierbinte",
    "keyPointLabel": "Punct Cheie",
    "todayLabel": "Astăzi",
    "weekLabel": "Săptămâna",
    "autoSaveInfo": "Planificarea săptămânală este salvată automat",
    "enterNewIdea": "Introdu ideea ta nouă...",
    "selectPriority": "Selectează prioritatea",
    "deleteIdea": "Șterge ideea",
    "editIdea": "Editează ideea",
    "weekly": "Săptămânal",
    "planning": "Planificare",
    
    // Fact Maps
    "backToFactMaps": "Înapoi la Hărțile de Fapte",
    "mapOrGoalNotFound": "Harta sau obiectivul nu a fost găsit",
    "enterYourAnswer": "Introduceți răspunsul dvs. aici...",
    "characters": "Caractere",
    "previous": "Anterior",
    "next": "Următorul",
    "reset": "Resetează",
    "save": "Salvează",
    "success": "Succes",
    "answersSaved": "Răspunsurile tale au fost salvate.",
    "stackShared": "Stack Partajat",
    "linkCopiedToClipboard": "Link copiat în clipboard",
    "savedToLibrary": "Salvat în Bibliotecă",
    "savedToLibraryDesc": "Stack-ul tău a fost salvat în bibliotecă",
    "stackLibrary": "Biblioteca de Stack-uri",
    "all": "Toate",
    "shared": "Partajat",
    "noStacksInLibrary": "Nu ai încă stack-uri în bibliotecă",
    "createYourFirstStack": "Creează Primul Tău Stack",
    "errorSaving": "Eroare la Salvare",
    "startOver": "Începe din nou",
    "actionDescription": "Descriere acțiune",
    "addAction": "Adaugă Acțiune",
    "actionAdded": "Acțiune Adăugată",
    "actionAddedDesc": "Acțiunea ta a fost adăugată cu succes",
    "reminderSet": "Reminder Setat",
    "reminderSetDesc": "Vei fi amintit despre această acțiune",
    "actions": "Acțiuni",
    "coaching_completed": "Coaching Finalizat",
    "coaching_completed_desc": "Sesiunea ta de coaching a fost salvată",
    "startNew": "Începe Nou",
    "noCoachingHistoryYet": "Încă nu există istoric de coaching",
    
    // Divine Coaching specific
    "whatAreYouGoingToTitleThisDivineCoaching": "Ce titlu vei da acestei sesiuni de coaching divin?",
    "whoOrWhatAreYouStackingDivine": "Pe cine sau ce te concentrezi?",
    "whyHasThisTriggeredYouToPray": "În acest moment, de ce te-a declanșat să te rogi?",
    "whatIsTheStoryDivineTrigger": "Care este povestea pe care ți-o spui, creată de acest declanșator, despre aceasta și situație?",
    "describeSingleWordFeelingsDivine": "Descrie sentimentele într-un singur cuvânt care apar pentru tine când îți spui acea poveste?",
    "godIsListening": "Dumnezeu ascultă, ce ai de spus?",
    "iWantGODToKnow1": "Doamne, vreau să știu:",
    "iWantGODToKnow2": "Doamne, vreau să știu:",
    "iWantGODToKnow3": "Doamne, vreau să știu:",
    "iWantGODToKnow4": "Doamne, vreau să știu:",
    "dearGODWhatDoYouWantMeToSee": "Dragă DOAMNE, Ce vrei să văd aici?",
    "whatDoYouWantMeToHear": "Ce vrei să aud?",
    "whatDoYouWantMeToLearn": "Ce vrei să învăț?",
    "whatDoYouWantMeToFeel": "Ce vrei să simt?",
    "whatDoYouWantMeToKnow": "Ce vrei să știu?",
    "whatDoYouWantMeToDo": "Ce vrei să fac?",
    "godHeardYou": "Dumnezeu vrea ca tu să:",
    "singularLessonDivine": "Care este lecția singulară despre viață pe care o iei din această sesiune de coaching divin?",
    "howDoesThisLessonApplyToBody": "Cum se aplică această lecție Corpului tău?",
    "howDoesThisLessonApplyToBeing": "Cum se aplică această lecție Ființei tale?",
    "howDoesThisLessonApplyToBalance": "Cum se aplică această lecție Echilibrului tău?",
    "howDoesThisLessonApplyToBusiness": "Cum se aplică această lecție Afacerii tale?",
    "significantRevelationDivine": "Care este cea mai semnificativă revelație sau insight cu care pleci din această sesiune de coaching divin și de ce te simți așa?",
    "immediateActionsDivine": "Ce acțiuni imediate te angajezi să faci când părăsești această sesiune?",
    "doYouWantToAddToHotList": "Vrei să adaugi asta la lista fierbinte?",
    "isThereAnythingElseToAddToHotList": "Mai este ceva ce vrei să adaugi la lista fierbinte?",
    
    // Landing Page - Jump to Freedom
    "jumpToFreedom": "Salt către Libertate",
    "haveItAll": "Ai Tot ce Vrei",
    "startNowSeeResults": "Începe Acum. Vezi Rezultate în 48 de Ore.",
    "freeTrial7Days": "Trial gratuit 7 zile (card necesar). Zero risc. Anulezi oricând în perioada de probă fără taxare.",
    "fifteenMinuteSetup": "Setup de 15 Minute",
    "quickOnboarding": "Onboarding rapid, apoi execuți",
    "resultsIn48h": "Rezultate în 48h",
    "clarityFirstWins": "Claritate + primele victorii",
    "zeroRiskGuarantee": "Garanție Zero Risc",
    "sevenDayTrialCancelFree": "Trial 7 zile, anulezi gratuit",
    "startYour7DayFreeTrial": "Începe Trial-ul Gratuit de 7 Zile",
    "membersTransformed": "500+ membri transformați",
    "averageLifeSatisfaction": "În medie +35% satisfacție în viață în 30 de zile",
    "costOfWaiting": "Costul Așteptării",
    "everyDayWithoutSystem": "Fiecare Zi Fără un Sistem Te Costă",
    "whileYouHesitate": "În timp ce eziti, viața continuă. Iată ce pierzi cu fiecare zi care trece:",
    "bodyEnergyCost": "-0.5% energie și vitalitate",
    "beingPeaceCost": "-1 moment de pace interioară",
    "balanceConnectionCost": "-1 conexiune semnificativă",
    "businessRevenueCost": "-50-500$ venituri potențiale",
    "thirtyDaysFromNow": "Peste 30 de Zile",
    "transformationChoice": "Poți fi fie la 30 de zile în transformarea ta, experimentând mai multă energie, claritate, relații mai bune și venituri în creștere... sau încă te întrebi 'ce-ar fi dacă?'",
    "energyLevel": "Nivel de Energie",
    "mindfulMinutes": "Minute Mindful",
    "qualityMoments": "Momente de Calitate",
    "productivityIncrease": "Productivitate",
    "startMyTransformationToday": "Începe-mi Transformarea Astăzi",
    "averageSetupTime": "Timp mediu de setup: 15 minute",
    "aboutJumpToFreedom": "Despre Jump to Freedom",
    "ourMissionValues": "Misiunea și Valorile Noastre",
    "aboutDescription": "Află despre misiunea Jump to Freedom de a te ajuta să atingi succesul holistic în Corp, Ființă, Echilibru și Afaceri prin sisteme dovedite și obiceiuri zilnice.",
    "missionToHelpYou": "Suntem pe o misiune de a te ajuta să te eliberezi din capcana dezechilibrului și să construiești o viață în care ai cu adevărat totul - sănătate, pace, iubire și prosperitate.",
    "storyBehind": "Povestea din Spatele Jump to Freedom",
    "purposeDriven": "Orientat spre Scop",
    "purposeDrivenDesc": "Fiecare funcționalitate este concepută pentru a te ajuta să trăiești cu intenție și să atingi obiective semnificative în toate ariile vieții.",
    "holisticGrowth": "Creștere Holistică",
    "holisticGrowthDesc": "Credem că adevăratul succes vine din echilibru - hrănind corpul, mintea, relațiile și cariera împreună.",
    "continuousImprovement": "Îmbunătățire Continuă",
    "continuousImprovementDesc": "Acțiunile zilnice mici se acumulează în rezultate extraordinare. Te ajutăm să construiești sisteme, nu doar motivație.",
    "communitySupport": "Suport din Comunitate",
    "communitySupportDesc": "Nu ești singur în această călătorie. Conectează-te cu oameni care gândesc la fel și sunt dedicați creșterii.",
    "fourPillarsOfFreedom": "Cei 4 Piloni ai Libertății",
    "trueFreedomComes": "Adevărata libertate vine din măiestria în toate cele patru arii ale vieții. Neglijează una, și celelalte vor suferi eventual.",
    "bodyPillarDesc": "Sănătate fizică, energie, fitness și vitalitate",
    "beingPillarDesc": "Claritate mentală, spiritualitate și pace interioară",
    "balancePillarDesc": "Relații, familie și conexiuni semnificative",
    "businessPillarDesc": "Creștere în carieră, finanțe și succes profesional",
    "ourMission": "Misiunea Noastră",
    "missionStatement": "Să împuternicim 1 milion de oameni să se elibereze din capcana vieții dezechilibrate și să construiască vieți de abundență holistică.",
    "ourVision": "Viziunea Noastră",
    "visionStatement": "O lume în care succesul este măsurat nu prin realizări izolate, ci prin armonie și împlinire în toate dimensiunile vieții.",
    "ourCoreValues": "Valorile Noastre de Bază",
    "coreValuesPrinciples": "Aceste principii ghidează tot ce construim și fiecare decizie pe care o luăm.",
    "readyToJump": "Ești Gata să Sari către Libertate?",
    "joinThousands": "Alătură-te miilor de oameni care și-au transformat viețile prin stăpânirea tuturor celor patru piloni. Începe trial-ul gratuit de 7 zile astăzi.",
    "startFreeTrial": "Începe Trial Gratuit",
    "learnMore": "Află Mai Multe",
    
    // XP System translations
    "level": "Nivel",
    "xp": "XP",
    "xpToNextLevel": "XP pentru nivelul următor",
    "totalXP": "XP Total",
    "levelUp": "Nivel Nou!",
    "levelUpCongrats": "Felicitări!",
    "youReachedLevel": "Ai ajuns la nivelul",
    "keepGoing": "Continuă! Lucruri mărețe te așteaptă.",
    "continueJourney": "Continuă Călătoria",
    "xpEarned": "XP câștigat",
    
    // Level titles
    "levelTitle_1": "Căutător Trezit",
    "levelTitle_2": "Inițiat Concentrat",
    "levelTitle_3": "Războinic Disciplinat",
    "levelTitle_4": "Campion în Ascensiune",
    "levelTitle_5": "Maestru Luminat",
    "levelTitle_6": "Înțelept Sage",
    "levelTitle_7": "Erou Legendar",
    "levelTitle_8": "Ființă Transcendentă",
    "levelTitle_9": "Războinic Cosmic",
    "levelTitle_10": "Maestru Infinit",
    
    // Daily Challenges
    "dailyChallenges": "Provocări Zilnice",
    "challengeProgress": "Progres",
    "claimReward": "Revendică Recompensa",
    "challengeCompleted": "Finalizat!",
    "challengesRefreshIn": "Provocările se reînnoiesc în",
    "allChallengesComplete": "Toate provocările completate! Bună treabă!",
    "hours": "ore",
    "minutes": "minute",
    
    // Challenge types
    "challenge_complete_stack": "Finalizează un Stack",
    "challenge_complete_stack_desc": "Termină o sesiune de reflecție",
    "challenge_read_pages": "Citește Pagini",
    "challenge_read_pages_desc": "Citește cel puțin 5 pagini astăzi",
    "challenge_complete_core": "Finalizează Core 4",
    "challenge_complete_core_desc": "Completează toate activitățile Core 4",
    "challenge_complete_actions": "Completează Acțiuni",
    "challenge_complete_actions_desc": "Finalizează 3 elemente de acțiune",
    "challenge_login_streak": "Serie de Conectări",
    "challenge_login_streak_desc": "Menține seria ta",
    "challenge_complete_door": "Sarcini Door",
    "challenge_complete_door_desc": "Finalizează 5 sarcini door",
    
    // Smart Notifications
    "goodMorning": "Bună Dimineața!",
    "goodAfternoon": "Bună Ziua!",
    "goodEvening": "Bună Seara!",
    "streakAtRisk": "Seria ta este în pericol!",
    "streakAtRiskDesc": "Finalizează o activitate pentru a-ți menține seria",
    "almostLevelUp": "Aproape ai ajuns!",
    "almostLevelUpDesc": "Doar {xp} XP până la nivelul următor!",
    "welcomeBack": "Bine ai revenit!",
    "welcomeBackDesc": "Gata să continui călătoria?",
    "greatStreak": "Serie incredibilă!",
    "greatStreakDesc": "{days} zile și continuăm!",
    "startSession": "Începe Sesiunea",
    "viewProgress": "Vezi Progresul",
    
    // Streak Milestones
    "streakMilestone": "Milestone Serie!",
    "days": "zile",
    "dayStreak": "Zile Consecutive",
    "streakBonus": "Bonus Serie",
    "streakShieldUnlocked": "Scut Serie Deblocat!",
    "streakShieldDesc": "Acum ai protecție împotriva pierderii seriei",
    "keepItUp": "Continuă Așa!",
    
    // Streak milestone titles
    "streak_7_title": "Războinic de O Săptămână",
    "streak_7_subtitle": "7 zile de dedicare",
    "streak_7_message": "Ai arătat un angajament real. Obiceiul se formează!",
    "streak_30_title": "Maestru Lunar",
    "streak_30_subtitle": "30 de zile de disciplină",
    "streak_30_message": "O lună întreagă! Construiești ceva extraordinar.",
    "streak_100_title": "Campion Centenar",
    "streak_100_subtitle": "100 de zile de excelență",
    "streak_100_message": "100 de zile de creștere. Ești cu adevărat de neoprit!",
    "streak_365_title": "Legendă Anuală",
    "streak_365_subtitle": "365 de zile de măiestrie",
    "streak_365_message": "Un an întreg! Ai atins statutul de legendă.",
    
    // Badge Unlock
    "badgeUnlocked": "Insignă Deblocată!",
    "newBadge": "Insignă Nouă",
    "awesome": "Excelent!",
    
    // Weekly Recap
    "weeklyRecap": "Rezumatul Săptămânii",
    "weekNumber": "Săptămâna",
    "daysActive": "Zile Active",
    "daysActiveSubtitle": "Ai fost prezent săptămâna aceasta!",
    "stacksCompleted": "Stack-uri Finalizate",
    "stacksCompletedSubtitle": "Sesiuni de reflecție completate",
    "pagesRead": "Pagini Citite",
    "pagesReadSubtitle": "Cunoștințe acumulate",
    "actionsCompleted": "Acțiuni Finalizate",
    "actionsCompletedSubtitle": "Sarcini îndeplinite",
    "xpEarnedWeek": "XP Câștigat",
    "xpEarnedSubtitle": "Experiență acumulată",
    "currentStreakWeek": "Serie Curentă",
    "currentStreakSubtitle": "Zile consecutive",
    "badgesEarned": "Insigne Câștigate",
    "badgesEarnedSubtitle": "Realizări deblocate",
    "greatWeek": "Săptămână excelentă!",
    "seeYouNextWeek": "Ne vedem săptămâna viitoare!",
    
    // Milestone Celebrations
    "milestoneReached": "Milestone Atins!",
    "firstStack": "Primul Stack",
    "firstStackMessage": "Ai finalizat primul tău stack de reflecție!",
    "tenStacks": "10 Stack-uri",
    "tenStacksMessage": "Un milestone al reflecției și creșterii!",
    "hundredPages": "100 de Pagini",
    "hundredPagesMessage": "Ai citit 100 de pagini de înțelepciune!",
    "firstWeek": "Prima Săptămână",
    "firstWeekMessage": "Prima ta serie de o săptămână!",
    "firstMonth": "Prima Lună",
    "firstMonthMessage": "O lună întreagă de dedicare!",
    "levelFive": "Nivelul 5",
    "levelFiveMessage": "Ai ajuns la Nivelul 5!",
    "levelTen": "Nivelul 10",
    "levelTenMessage": "Marele 10! Ești un maestru!",
    
    // Rewards Showcase
    "rewards": "Recompense",
    "unlockableRewards": "Recompense Deblocabile",
    "themes": "Teme",
    "avatars": "Avataruri",
    "frames": "Rame",
    "unlockAt": "Deblochează la Nivelul",
    "unlocked": "Deblocat",
    "equipped": "Echipat",
    "equip": "Echipează",
    "locked": "Blocat",
    "nextReward": "Următoarea Recompensă",
    
    // Reward names
    "reward_dark_theme": "Tema Războinic Întunecat",
    "reward_dark_theme_desc": "O temă întunecată elegantă pentru războinici concentrați",
    "reward_gold_theme": "Tema Campion Auriu",
    "reward_gold_theme_desc": "O temă aurie prestigioasă",
    "reward_nature_theme": "Tema Armonie Naturală",
    "reward_nature_theme_desc": "Culori liniștitoare inspirate de natură",
    "reward_avatar_warrior": "Avatar Războinic",
    "reward_avatar_warrior_desc": "Avatarul clasic al războinicului",
    "reward_avatar_sage": "Avatar Înțelept",
    "reward_avatar_sage_desc": "Înțelepciunea personificată",
    "reward_avatar_legend": "Avatar Legendă",
    "reward_avatar_legend_desc": "Pentru realizatorii legendari",
    "reward_frame_bronze": "Ramă de Bronz",
    "reward_frame_bronze_desc": "O ramă solidă de bronz",
    "reward_frame_silver": "Ramă de Argint",
    "reward_frame_silver_desc": "O ramă elegantă de argint",
    "reward_frame_gold": "Ramă de Aur",
    "reward_frame_gold_desc": "Prestigioasa ramă de aur",
    
    // Gamification general
    "gamification": "Gamificare",
    "achievements": "Realizări",
    "progress": "Progres",
    "streak": "Serie",
    "currentStreak": "Serie Curentă",
    "longestStreak": "Cea Mai Lungă Serie",
    "totalDaysActive": "Total Zile Active",
    "loading": "Se încarcă...",
    "error": "Eroare",
    "close": "Închide",
    "ok": "OK",
    "cancel": "Anulează",
    "confirm": "Confirmă",
    "delete": "Șterge",
    "edit": "Editează",
    "add": "Adaugă",
    "remove": "Elimină",
    "update": "Actualizează",
    
    // DailyCompactCard
    "dailyPage": "Pagina Zilnică",
    "read": "Citit",
    "pleaseLoginToTrack": "Te rugăm să te autentifici pentru a urmări progresul",
    "actionCompletedToast": "Acțiune finalizată!",
    "showMore": "Arată mai mult",
    "showLess": "Arată mai puțin",
    "create": "Creează",
    "submit": "Trimite",
    "done": "Gata",
    "finish": "Finalizează",
    "start": "Începe",
    "stop": "Oprește",
    "pause": "Pauză",
    "resume": "Reia",
    "retry": "Încearcă din nou",
    "back": "Înapoi",
    "forward": "Înainte",
    "yes": "Da",
    "no": "Nu"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: true,
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Initialize with language from localStorage, defaulting to 'en'
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return (savedLanguage === 'en' || savedLanguage === 'ro') ? savedLanguage : 'en';
  };
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load language preference from database when user is authenticated
  useEffect(() => {
    const loadLanguageFromDB = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('language')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error loading language preference:', error);
          setIsLoading(false);
          return;
        }

        if (data?.language && (data.language === 'en' || data.language === 'ro')) {
          setLanguageState(data.language as Language);
          localStorage.setItem('language', data.language);
        }
      } catch (err) {
        console.error('Error loading language preference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageFromDB();
  }, [userId]);

  // Update language in both localStorage and database
  const setLanguage = useCallback(async (newLanguage: Language) => {
    // Update local state immediately
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);

    // If user is authenticated, save to database
    if (userId) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert(
            { 
              user_id: userId, 
              language: newLanguage,
              updated_at: new Date().toISOString()
            },
            { 
              onConflict: 'user_id' 
            }
          );

        if (error) {
          console.error('Error saving language preference:', error);
        }
      } catch (err) {
        console.error('Error saving language preference:', err);
      }
    }
  }, [userId]);

  const t = useCallback((key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
