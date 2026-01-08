import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { SecurityProvider } from "@/components/SecurityProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MigrationProvider } from "@/context/MigrationContext";
import { DataMigrationModal } from "@/components/DataMigrationModal";
import { ThemeProvider } from "@/context/ThemeContext";

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
const Challenge = lazy(() => import("./pages/Challenge"));
const ChallengeDay = lazy(() => import("./pages/ChallengeDay"));
const Door = lazy(() => import("./pages/Door"));
const Focus = lazy(() => import("./pages/Focus"));
const Core = lazy(() => import("./pages/Core"));
const DailyFour = lazy(() => import("./pages/DailyFour"));
const Journal = lazy(() => import("./pages/Journal"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
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
const About = lazy(() => import("./pages/About"));
const DailyTimeline = lazy(() => import("./pages/DailyTimeline"));
const Biz4Report = lazy(() => import("./pages/Biz4Report"));
const Core4LeadMagnet = lazy(() => import("./pages/Core4LeadMagnet"));
const Core4ThankYou = lazy(() => import("./pages/Core4ThankYou"));
const Vision2026 = lazy(() => import("./pages/Vision2026"));
const Vision2026Plan = lazy(() => import("./pages/Vision2026Plan"));
const Vision2026Dashboard = lazy(() => import("./pages/Vision2026Dashboard"));
const VisionBoard2026 = lazy(() => import("./pages/VisionBoard2026"));
const DailyFlow = lazy(() => import("./pages/DailyFlow"));
const ChampionRoutineHistory = lazy(() => import("./pages/ChampionRoutineHistory"));
const WorkoutHistory = lazy(() => import("./pages/WorkoutHistory"));
const WidgetDashboard = lazy(() => import("./pages/WidgetDashboard"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const RelationshipCoach = lazy(() => import("./pages/RelationshipCoach"));
const TherapistCoach = lazy(() => import("./pages/TherapistCoach"));
const PerformanceCoachPage = lazy(() => import("./pages/PerformanceCoach"));
const EmotionalTracker = lazy(() => import("./pages/EmotionalTracker"));
const TimeTracker = lazy(() => import("./pages/TimeTracker"));
const AccountabilityCoach = lazy(() => import("./pages/AccountabilityCoach"));

// Loading component for lazy routes
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <MigrationProvider>
                  <LanguageProvider>
                    <SecurityProvider>
                      <ProgressProvider>
                      <DataMigrationModal />
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
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
                    <Route path="/master-plan" element={
                      <ProtectedRoute>
                        <MasterPlanSystem />
                      </ProtectedRoute>
                    } />
                    <Route path="/challenge" element={
                      <ProtectedRoute>
                        <Challenge />
                      </ProtectedRoute>
                    } />
                    <Route path="/challenge/:day" element={
                      <ProtectedRoute>
                        <ChallengeDay />
                      </ProtectedRoute>
                    } />
                    <Route path="/learn" element={
                      <ProtectedRoute>
                        <Challenge />
                      </ProtectedRoute>
                    } />
                    <Route path="/door" element={
                      <ProtectedRoute>
                        <Door />
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
                        <DailyFlow />
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
                    <Route path="/relationship-coach" element={
                      <ProtectedRoute>
                        <RelationshipCoach />
                      </ProtectedRoute>
                    } />
                    <Route path="/therapist-coach" element={
                      <ProtectedRoute>
                        <TherapistCoach />
                      </ProtectedRoute>
                    } />
                    <Route path="/performance-coach" element={
                      <ProtectedRoute>
                        <PerformanceCoachPage />
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
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    </ProgressProvider>
                  </SecurityProvider>
                </LanguageProvider>
              </MigrationProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
