import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { DoorProvider } from "@/context/DoorContext";
import { SecurityProvider } from "@/components/SecurityProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/context/ThemeContext";
import { TourProvider } from "@/context/TourContext";
// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for better performance
const Stack = lazy(() => import("./pages/Stack"));
const Workout = lazy(() => import("./pages/Workout"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const Relationships = lazy(() => import("./pages/Relationships"));
const StackLibrary = lazy(() => import("./pages/StackLibrary"));
const StackViewer = lazy(() => import("./pages/StackViewer"));
const MasterPlanSystem = lazy(() => import("./pages/MasterPlanSystem"));
const LearnPage = lazy(() => import("./pages/Learn"));
const Challenge = lazy(() => import("./pages/Challenge"));
const ChallengeDay = lazy(() => import("./pages/ChallengeDay"));
const Challenge7ZileLanding = lazy(() => import("./pages/Challenge7ZileLanding"));
const Door = lazy(() => import("./pages/Door"));
const Focus = lazy(() => import("./pages/Focus"));
const Core = lazy(() => import("./pages/Core"));
const DailyFour = lazy(() => import("./pages/DailyFour"));
const Journal = lazy(() => import("./pages/Journal"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const EmailMonitoring = lazy(() => import("./pages/EmailMonitoring"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const Support = lazy(() => import("./pages/Support").then(m => ({ default: m.Support })));
const Notes = lazy(() => import("./pages/Notes").then(m => ({ default: m.Notes })));
const Library = lazy(() => import("./pages/Library").then(m => ({ default: m.Library })));
const Pricing = lazy(() => import("./pages/Pricing"));
const Business = lazy(() => import("./pages/Business"));
const HormoziAnalysis = lazy(() => import("./pages/HormoziAnalysis"));
const VoiceAnalysis = lazy(() => import("./pages/VoiceAnalysis"));
const Lifebook = lazy(() => import("./pages/Lifebook"));
const VibeCanvasPage = lazy(() => import("./pages/VibeCanvasPage"));
const About = lazy(() => import("./pages/About"));
const DailyTimeline = lazy(() => import("./pages/DailyTimeline"));
const Biz4Report = lazy(() => import("./pages/Biz4Report"));
const Core4LeadMagnet = lazy(() => import("./pages/Core4LeadMagnet"));
const Core4ThankYou = lazy(() => import("./pages/Core4ThankYou"));
const Vision2026 = lazy(() => import("./pages/Vision2026"));
const Vision2026Plan = lazy(() => import("./pages/Vision2026Plan"));
const Vision2026Dashboard = lazy(() => import("./pages/Vision2026Dashboard"));
const VisionBoard2026 = lazy(() => import("./pages/VisionBoard2026"));
const FactMaps = lazy(() => import("./pages/FactMaps"));
const QuickQuiz = lazy(() => import("./pages/QuickQuiz"));
const DailyFlow = lazy(() => import("./pages/DailyFlow"));
const ChampionRoutineHistory = lazy(() => import("./pages/ChampionRoutineHistory"));
const WorkoutHistory = lazy(() => import("./pages/WorkoutHistory"));
const WidgetDashboard = lazy(() => import("./pages/WidgetDashboard"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const EmotionalTracker = lazy(() => import("./pages/EmotionalTracker"));
const TimeTracker = lazy(() => import("./pages/TimeTracker"));
const AccountabilityCoach = lazy(() => import("./pages/AccountabilityCoach"));
const EmpowermentMeditation = lazy(() => import("./pages/EmpowermentMeditation"));
const ChampionRoutine = lazy(() => import("./pages/ChampionRoutine"));
const MindShifting = lazy(() => import("./pages/MindShifting"));
const Minte = lazy(() => import("./pages/Minte"));
const MinteTeste = lazy(() => import("./pages/MinteTeste"));
const MinteQuizPage = lazy(() => import("./pages/MinteQuizPage"));
const MinteCredinte = lazy(() => import("./pages/MinteCredinte"));
const CredinteFundamentale = lazy(() => import("./pages/CredinteFundamentale"));
const CredinteFundamentaleCapitol = lazy(() => import("./pages/CredinteFundamentaleCapitol"));
const CredinteFundamentaleAudit = lazy(() => import("./pages/CredinteFundamentaleAudit"));
const CredinteFundamentaleAuditResult = lazy(() => import("./pages/CredinteFundamentaleAuditResult"));
const BeliefGratitudeAnchor = lazy(() => import("./pages/BeliefGratitudeAnchor"));
const BeliefNoButValidator = lazy(() => import("./pages/BeliefNoButValidator"));
const BeliefAntiArrogance = lazy(() => import("./pages/BeliefAntiArrogance"));
const BeliefForgiveness = lazy(() => import("./pages/BeliefForgiveness"));
const BeliefSelfCare = lazy(() => import("./pages/BeliefSelfCare"));
const BeliefReprogrammerHub = lazy(() => import("./pages/BeliefReprogrammerHub"));
const BeliefReprogrammerSession = lazy(() => import("./pages/BeliefReprogrammerSession"));
const BeliefLibrary = lazy(() => import("./pages/BeliefLibrary"));
const MintePSA = lazy(() => import("./pages/MintePSA"));
const MentalitateStack = lazy(() => import("./pages/MentalitateStack"));
const DashboardSettingsPage = lazy(() => import("./pages/DashboardSettingsPage"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LifeScore = lazy(() => import("./pages/LifeScore"));
const WarriorsWay = lazy(() => import("./pages/WarriorsWay"));
const WarriorLaunchAccelerator = lazy(() => import("./pages/WarriorLaunchAccelerator"));
const WarriorAcceleratorThankYou = lazy(() => import("./pages/WarriorAcceleratorThankYou"));
const WarriorPower = lazy(() => import("./pages/WarriorPower"));
const GameObjectives = lazy(() => import("./pages/GameObjectives"));

const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const Business2026LeadMagnet = lazy(() => import("./pages/Business2026LeadMagnet"));
const CoachDashboard = lazy(() => import("./pages/CoachDashboard"));
const ReferralProgram = lazy(() => import("./pages/ReferralProgram"));
const ChallengeLanding = lazy(() => import("./pages/ChallengeLanding"));
const ChallengeEnglish = lazy(() => import("./pages/ChallengeEnglish"));
const ChallengeDayEnglish = lazy(() => import("./pages/ChallengeDayEnglish"));
const MindCoach = lazy(() => import("./pages/MindCoach"));
const MindCoachLanding = lazy(() => import("./pages/MindCoachLanding"));
const Marriage = lazy(() => import("./pages/Marriage"));
const MarriageAudit = lazy(() => import("./pages/MarriageAudit"));
const MarriageProfilePage = lazy(() => import("./pages/MarriageProfile"));
const MarriageTimelinePage = lazy(() => import("./pages/MarriageTimeline"));
const MarriageQuiz = lazy(() => import("./pages/MarriageQuiz"));
const Parenting = lazy(() => import("./pages/Parenting"));
const ParentingProfilePage = lazy(() => import("./pages/ParentingProfile"));
const ParentingLibrary = lazy(() => import("./pages/ParentingLibrary"));
const ParentingToxicityScan = lazy(() => import("./pages/ParentingToxicityScan"));
const ParentingTools = lazy(() => import("./pages/ParentingTools"));
const ParentingCoach = lazy(() => import("./pages/ParentingCoach"));
const ParentingTimeline = lazy(() => import("./pages/ParentingTimeline"));
const Tools = lazy(() => import("./pages/Tools"));
const Programs = lazy(() => import("./pages/Programs"));
const PersonalPowerOverview = lazy(() => import("./pages/PersonalPowerOverview"));
const PersonalPowerDayPage = lazy(() => import("./pages/PersonalPowerDay"));
const UltimateYouOverview = lazy(() => import("./pages/UltimateYouOverview"));
const UltimateYouDayPage = lazy(() => import("./pages/UltimateYouDay"));
const GroupPage = lazy(() => import("./pages/GroupPage"));
const Messages = lazy(() => import("./pages/Messages"));
const B2BLanding = lazy(() => import("./pages/B2BLanding"));
const ChallengeUpsell = lazy(() => import("./pages/ChallengeUpsell"));
const Blog = lazy(() => import("./pages/Blog"));
const BurnoutTest = lazy(() => import("./pages/BurnoutTest"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const EbookLanding = lazy(() => import("./pages/EbookLanding"));
const EbookThankYou = lazy(() => import("./pages/EbookThankYou"));
const EbookUpsell = lazy(() => import("./pages/EbookUpsell"));
const EbookPaymentSuccess = lazy(() => import("./pages/EbookPaymentSuccess"));
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
);

// Disable window-focus refetching globally — it caused a full "refresh" flicker
// on every tab switch. Individual queries can opt back in if they truly need it.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 60_000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AuthProvider>
                  <LanguageProvider>
                    <TourProvider>
                    <SecurityProvider>
                      <DoorProvider>
                        <ProgressProvider>
                        <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/settings" element={
                      <ProtectedRoute>
                        <DashboardSettingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/stack" element={
                      <ProtectedRoute>
                        <Stack />
                      </ProtectedRoute>
                    } />
                    <Route path="/stack-library" element={
                      <ProtectedRoute>
                        <StackLibrary />
                      </ProtectedRoute>
                    } />
                    <Route path="/stack/view/:id" element={
                      <ProtectedRoute>
                        <StackViewer />
                      </ProtectedRoute>
                    } />
                    <Route path="/master-plan" element={<Navigate to="/programs?tab=classroom" replace />} />
                    <Route path="/challenge-7-zile" element={<Challenge7ZileLanding />} />
                    <Route path="/challenge-en" element={<ChallengeEnglish />} />
                    <Route path="/challenge-en/:day" element={<ChallengeDayEnglish />} />
                    <Route path="/challenge" element={<Challenge />} />
                    <Route path="/challenge/:day" element={<ChallengeDay />} />
                    <Route path="/learn" element={<Navigate to="/programs?tab=classroom" replace />} />
                    <Route path="/door" element={
                      <ProtectedRoute>
                        <Door />
                      </ProtectedRoute>
                    } />
                    <Route path="/fact-maps" element={
                      <ProtectedRoute>
                        <FactMaps />
                      </ProtectedRoute>
                    } />
                    <Route path="/focus" element={
                      <ProtectedRoute>
                        <Focus />
                      </ProtectedRoute>
                    } />
                    <Route path="/core" element={
                      <ProtectedRoute>
                        <Core />
                      </ProtectedRoute>
                    } />
                    <Route path="/daily-four" element={
                      <ProtectedRoute>
                        <DailyFour />
                      </ProtectedRoute>
                    } />
                    <Route path="/journal" element={
                      <ProtectedRoute>
                        <Journal />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminPanel />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/email-monitoring" element={
                      <ProtectedRoute>
                        <EmailMonitoring />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/library" element={
                      <ProtectedRoute>
                        <Library />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/support" element={
                      <ProtectedRoute>
                        <Support />
                      </ProtectedRoute>
                    } />
                    <Route path="/notes" element={
                      <ProtectedRoute>
                        <Notes />
                      </ProtectedRoute>
                    } />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/business" element={
                      <ProtectedRoute>
                        <Business />
                      </ProtectedRoute>
                    } />
                    <Route path="/business/hormozi-analysis" element={
                      <ProtectedRoute>
                        <HormoziAnalysis />
                      </ProtectedRoute>
                    } />
                    <Route path="/voice-analysis" element={
                      <ProtectedRoute>
                        <VoiceAnalysis />
                      </ProtectedRoute>
                    } />
                    <Route path="/lifebook/*" element={
                      <ProtectedRoute>
                        <Lifebook />
                      </ProtectedRoute>
                    } />
                    <Route path="/about" element={<About />} />
                    <Route path="/core4" element={<Core4LeadMagnet />} />
                    <Route path="/core4-thank-you" element={<Core4ThankYou />} />
                    <Route path="/vision-2026" element={<Vision2026 />} />
                    <Route path="/vision-2026/plan" element={<Vision2026Plan />} />
                    <Route path="/vision-2026/dashboard" element={
                      <ProtectedRoute>
                        <Vision2026Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/daily-timeline" element={
                      <ProtectedRoute>
                        <DailyTimeline />
                      </ProtectedRoute>
                    } />
                    <Route path="/vision-board" element={<VisionBoard2026 />} />
                    <Route path="/daily-flow" element={
                      <ProtectedRoute>
                        <DailyFlow />
                      </ProtectedRoute>
                    } />
                    <Route path="/champion-routine" element={
                      <ProtectedRoute>
                        <ChampionRoutine />
                      </ProtectedRoute>
                    } />
                    <Route path="/mind-shifting" element={
                      <ProtectedRoute>
                        <MindShifting />
                      </ProtectedRoute>
                    } />
                    <Route path="/minte" element={
                      <ProtectedRoute>
                        <Minte />
                      </ProtectedRoute>
                    } />
                    <Route path="/minte/teste" element={
                      <ProtectedRoute>
                        <MinteTeste />
                      </ProtectedRoute>
                    } />
                    <Route path="/minte/teste/:slug" element={
                      <ProtectedRoute>
                        <MinteQuizPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/minte/credinte" element={
                      <ProtectedRoute>
                        <MinteCredinte />
                      </ProtectedRoute>
                    } />
                    <Route path="/minte/credinte-fundamentale" element={
                      <ProtectedRoute>
                        <CredinteFundamentale />
                      </ProtectedRoute>
                    } />
                    <Route path="/minte/credinte-fundamentale/audit" element={
                      <ProtectedRoute>
                        <CredinteFundamentaleAudit />
                      </ProtectedRoute>
                    } />
                    <Route path="/minte/credinte-fundamentale/audit/:id" element={
                      <ProtectedRoute>
                        <CredinteFundamentaleAuditResult />
                      </ProtectedRoute>
                    } />
                    <Route path="/credinte/gratitude" element={
                      <ProtectedRoute><BeliefGratitudeAnchor /></ProtectedRoute>
                    } />
                    <Route path="/credinte/apreciere-fara-dar" element={
                      <ProtectedRoute><BeliefNoButValidator /></ProtectedRoute>
                    } />
                    <Route path="/credinte/anti-aroganta" element={
                      <ProtectedRoute><BeliefAntiArrogance /></ProtectedRoute>
                    } />
                    <Route path="/credinte/forgiveness" element={
                      <ProtectedRoute><BeliefForgiveness /></ProtectedRoute>
                    } />
                    <Route path="/credinte/grija-de-sine" element={
                      <ProtectedRoute><BeliefSelfCare /></ProtectedRoute>
                    } />
                    <Route path="/minte/credinte-fundamentale/reprogrammer" element={
                       <ProtectedRoute><BeliefReprogrammerHub /></ProtectedRoute>
                     } />
                     <Route path="/minte/credinte-fundamentale/reprogrammer/:sessionId" element={
                       <ProtectedRoute><BeliefReprogrammerSession /></ProtectedRoute>
                     } />
                     <Route path="/biblioteca-credintelor" element={
                       <ProtectedRoute><BeliefLibrary /></ProtectedRoute>
                     } />
                     <Route path="/minte/credinte-fundamentale/:slug" element={
                       <ProtectedRoute>
                         <CredinteFundamentaleCapitol />
                       </ProtectedRoute>
                     } />
                    <Route path="/minte/psa" element={
                      <ProtectedRoute>
                        <MintePSA />
                      </ProtectedRoute>
                    } />
                    <Route path="/minte/stack" element={
                      <ProtectedRoute>
                        <MentalitateStack />
                      </ProtectedRoute>
                    } />
                    <Route path="/empowerment-meditation" element={
                      <ProtectedRoute>
                        <EmpowermentMeditation />
                      </ProtectedRoute>
                    } />
                    <Route path="/biz4-report" element={
                      <ProtectedRoute>
                        <Biz4Report />
                      </ProtectedRoute>
                    } />
                    <Route path="/champion-routine-history" element={
                      <ProtectedRoute>
                        <ChampionRoutineHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/workout" element={
                      <ProtectedRoute>
                        <Workout />
                      </ProtectedRoute>
                    } />
                    <Route path="/nutrition" element={
                      <ProtectedRoute>
                        <Nutrition />
                      </ProtectedRoute>
                    } />
                    <Route path="/relationships" element={
                      <ProtectedRoute>
                        <Relationships />
                      </ProtectedRoute>
                    } />
                    <Route path="/workout-history" element={
                      <ProtectedRoute>
                        <WorkoutHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/widget-dashboard" element={
                      <ProtectedRoute>
                        <WidgetDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/leaderboard" element={
                      <ProtectedRoute>
                        <Leaderboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/achievements" element={
                      <ProtectedRoute>
                        <Achievements />
                      </ProtectedRoute>
                    } />
                    <Route path="/emotional-tracker" element={
                      <ProtectedRoute>
                        <EmotionalTracker />
                      </ProtectedRoute>
                    } />
                    <Route path="/time-tracker" element={
                      <ProtectedRoute>
                        <TimeTracker />
                      </ProtectedRoute>
                    } />
                    <Route path="/accountability-coach" element={
                      <ProtectedRoute>
                        <AccountabilityCoach />
                      </ProtectedRoute>
                    } />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/life-score" element={<LifeScore />} />
                    <Route path="/burnout-test" element={<BurnoutTest />} />
                    <Route path="/burnout-test-en" element={<BurnoutTest />} />
                    <Route path="/warriors-way" element={
                      <ProtectedRoute>
                        <WarriorsWay />
                      </ProtectedRoute>
                    } />
                    <Route path="/warrior-launch-accelerator" element={<WarriorLaunchAccelerator />} />
                    <Route path="/warrior-accelerator-thank-you" element={
                      <ProtectedRoute>
                        <WarriorAcceleratorThankYou />
                      </ProtectedRoute>
                    } />
                    <Route path="/warrior-power" element={<WarriorPower />} />
                    <Route path="/game-objectives" element={
                      <ProtectedRoute>
                        <GameObjectives />
                      </ProtectedRoute>
                    } />
                    <Route path="/brotherhood" element={<Navigate to="/programs?tab=community" replace />} />
                    <Route path="/vibe-canvas" element={
                      <ProtectedRoute>
                        <VibeCanvasPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/business-2026" element={<Business2026LeadMagnet />} />
                    <Route path="/quick-quiz" element={
                      <ProtectedRoute>
                        <QuickQuiz />
                      </ProtectedRoute>
                    } />
                    <Route path="/coach" element={
                      <ProtectedRoute>
                        <CoachDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/referral-program" element={<ReferralProgram />} />
                    <Route path="/challenge-landing" element={<ChallengeLanding />} />
                    <Route path="/mind-coach" element={
                      <ProtectedRoute>
                        <MindCoach />
                      </ProtectedRoute>
                    } />
                    <Route path="/mind-coach-transform" element={<MindCoachLanding />} />
                    <Route path="/chat" element={<Navigate to="/mind-coach" replace />} />
                    <Route path="/marriage-quiz" element={<MarriageQuiz />} />
                    <Route path="/marriage" element={
                      <ProtectedRoute>
                        <Marriage />
                      </ProtectedRoute>
                    } />
                    <Route path="/marriage/audit" element={
                      <ProtectedRoute>
                        <MarriageAudit />
                      </ProtectedRoute>
                    } />
                    <Route path="/marriage/profile" element={
                      <ProtectedRoute>
                        <MarriageProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/marriage/timeline" element={
                      <ProtectedRoute>
                        <MarriageTimelinePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting" element={
                      <ProtectedRoute>
                        <Parenting />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/profile" element={
                      <ProtectedRoute>
                        <ParentingProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/library" element={
                      <ProtectedRoute>
                        <ParentingLibrary />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/library/:childId" element={
                      <ProtectedRoute>
                        <ParentingLibrary />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/toxicity-scan" element={
                      <ProtectedRoute>
                        <ParentingToxicityScan />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/tools" element={
                      <ProtectedRoute>
                        <ParentingTools />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/coach" element={
                      <ProtectedRoute>
                        <ParentingCoach />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/coach/:childId" element={
                      <ProtectedRoute>
                        <ParentingCoach />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/timeline" element={
                      <ProtectedRoute>
                        <ParentingTimeline />
                      </ProtectedRoute>
                    } />
                    <Route path="/parenting/timeline/:childId" element={
                      <ProtectedRoute>
                        <ParentingTimeline />
                      </ProtectedRoute>
                    } />
                    <Route path="/tools" element={
                      <ProtectedRoute>
                        <Tools />
                      </ProtectedRoute>
                    } />
                    <Route path="/programs" element={
                      <ProtectedRoute>
                        <Programs />
                      </ProtectedRoute>
                    } />
                    <Route path="/personal-power" element={
                      <ProtectedRoute>
                        <PersonalPowerOverview />
                      </ProtectedRoute>
                    } />
                    <Route path="/personal-power/:day" element={
                      <ProtectedRoute>
                        <PersonalPowerDayPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/ultimate-you" element={
                      <ProtectedRoute>
                        <UltimateYouOverview />
                      </ProtectedRoute>
                    } />
                    <Route path="/ultimate-you/:day" element={
                      <ProtectedRoute>
                        <UltimateYouDayPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/groups/:groupId" element={
                      <ProtectedRoute>
                        <GroupPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/messages" element={
                      <ProtectedRoute>
                        <Messages />
                      </ProtectedRoute>
                    } />
                    <Route path="/challenge-upsell" element={
                      <ProtectedRoute>
                        <ChallengeUpsell />
                      </ProtectedRoute>
                    } />
                    <Route path="/b2b" element={<B2BLanding />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/ebook" element={<EbookLanding />} />
                    <Route path="/ebook-en" element={<EbookLanding />} />
                    <Route path="/ebook-multumesc" element={<EbookThankYou />} />
                    <Route path="/ebook-thank-you" element={<EbookThankYou />} />
                    <Route path="/ebook-upsell" element={<EbookUpsell />} />
                    <Route path="/ebook-upsell-en" element={<EbookUpsell />} />
                    <Route path="/ebook-plata-reusita" element={<EbookPaymentSuccess />} />
                    <Route path="/ebook-payment-success" element={<EbookPaymentSuccess />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />
                        <Route path="*" element={<NotFound />} />
                       </Routes>
                      </Suspense>
                      </ProgressProvider>
                      </DoorProvider>
                    </SecurityProvider>
                    </TourProvider>
                  </LanguageProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
