
import React from 'react';
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
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardPage from "./pages/DashboardPage";
import Stack from "./pages/Stack";
import StackLibrary from "./pages/StackLibrary";
import StackViewer from "./pages/StackViewer";
import Learn from "./pages/Learn";
import Door from "./pages/Door";
import Game from "./pages/Game";
import Core from "./pages/Core";
import DailyFour from "./pages/DailyFour";
import Chat from "./pages/Chat";
import Tribe from "./pages/Tribe";
import Journal from "./pages/Journal";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Fitness from "./pages/Fitness";
import GeneralsTent from "./pages/GeneralsTent";
import NotFound from "./pages/NotFound";
import { Settings } from "./pages/Settings";
import { Support } from "./pages/Support";
import { Notes } from "./pages/Notes";
import { Library } from "./pages/Library";
import Pricing from "./pages/Pricing";
import Business from "./pages/Business";
import HormoziAnalysis from "./pages/HormoziAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <SecurityProvider>
                <ProgressProvider>
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
                    <Route path="/learn" element={
                      <ProtectedRoute>
                        <Learn />
                      </ProtectedRoute>
                    } />
                    <Route path="/door" element={
                      <ProtectedRoute>
                        <Door />
                      </ProtectedRoute>
                    } />
                    <Route path="/game" element={
                      <ProtectedRoute>
                        <Game />
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
                    <Route path="/chat" element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } />
                    <Route path="/tribe" element={
                      <ProtectedRoute>
                        <Tribe />
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
                    <Route path="/fitness" element={
                      <ProtectedRoute>
                        <Fitness />
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
                    <Route path="/generals-tent" element={
                      <ProtectedRoute>
                        <GeneralsTent />
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProgressProvider>
              </SecurityProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
