import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dumbbell, Briefcase, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PerformanceCoachChat } from '@/components/ai/PerformanceCoachChat';
import { NapoleonHillCoachWidget } from '@/components/dashboard/widgets/NapoleonHillCoachWidget';

export const DualCoachCard: React.FC = () => {
  const [performanceCoachOpen, setPerformanceCoachOpen] = useState(false);
  const [napoleonCoachOpen, setNapoleonCoachOpen] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-blue-950/50 via-background to-amber-950/30">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        <CardContent className="relative p-4 md:p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">AI COACHES</span>
            </div>
            <h3 className="text-lg font-semibold">Alege-ți Coach-ul</h3>
          </div>

          {/* Two Coach Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Performance Coach - Left */}
            <div className="relative group">
              <div className={cn(
                "relative flex flex-col items-center p-4 rounded-xl",
                "bg-gradient-to-b from-blue-500/10 to-blue-900/20",
                "border border-blue-500/30 hover:border-blue-400/50",
                "transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              )}>
                {/* Coach Avatar */}
                <div className="relative mb-4">
                  {/* Blue aura/glow effect */}
                  <div className="absolute inset-0 blur-xl bg-blue-500/30 rounded-full scale-150 group-hover:scale-175 transition-transform" />
                  <div className="absolute inset-0 blur-md bg-blue-400/20 rounded-full scale-125" />
                  
                  {/* Stylized body silhouette */}
                  <div className="relative w-20 h-24 flex items-center justify-center">
                    <svg 
                      viewBox="0 0 60 80" 
                      className="w-full h-full drop-shadow-lg"
                      fill="none"
                    >
                      {/* Shadow/aura layer */}
                      <ellipse cx="30" cy="75" rx="20" ry="5" className="fill-blue-500/20" />
                      
                      {/* Body silhouette */}
                      <path 
                        d="M30 8C34.4183 8 38 11.5817 38 16C38 20.4183 34.4183 24 30 24C25.5817 24 22 20.4183 22 16C22 11.5817 25.5817 8 30 8Z" 
                        className="fill-blue-400"
                      />
                      <path 
                        d="M30 26C38 26 44 32 44 40V52C44 54 42 56 40 56H20C18 56 16 54 16 52V40C16 32 22 26 30 26Z" 
                        className="fill-blue-500"
                      />
                      <path 
                        d="M16 36L8 44M44 36L52 44" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        className="stroke-blue-400"
                      />
                      <path 
                        d="M22 56L20 72M38 56L40 72" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        className="stroke-blue-500"
                      />
                      
                      {/* Energy lines */}
                      <path 
                        d="M4 30L10 35M56 30L50 35M4 50L12 48M56 50L48 48" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        className="stroke-blue-300/60"
                      />
                    </svg>
                  </div>
                </div>

                {/* Coach Info */}
                <h4 className="font-semibold text-blue-100 text-center mb-1">
                  Personal Performance
                </h4>
                <p className="text-xs text-blue-200/70 text-center mb-4 line-clamp-2">
                  Antrenează-ți corpul și mintea pentru performanță maximă
                </p>

                {/* CTA Button */}
                <Button 
                  onClick={() => setPerformanceCoachOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                  size="sm"
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Start Coaching
                </Button>
              </div>
            </div>

            {/* Napoleon Hill Coach - Right */}
            <div className="relative group">
              <div className={cn(
                "relative flex flex-col items-center p-4 rounded-xl",
                "bg-gradient-to-b from-amber-500/10 to-amber-900/20",
                "border border-amber-500/30 hover:border-amber-400/50",
                "transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
              )}>
                {/* Coach Avatar */}
                <div className="relative mb-4">
                  {/* Golden aura/glow effect */}
                  <div className="absolute inset-0 blur-xl bg-amber-500/30 rounded-full scale-150 group-hover:scale-175 transition-transform" />
                  <div className="absolute inset-0 blur-md bg-amber-400/20 rounded-full scale-125" />
                  
                  {/* Napoleon Hill portrait silhouette */}
                  <div className="relative w-20 h-24 flex items-center justify-center">
                    <svg 
                      viewBox="0 0 60 80" 
                      className="w-full h-full drop-shadow-lg"
                      fill="none"
                    >
                      {/* Shadow layer */}
                      <ellipse cx="30" cy="75" rx="18" ry="4" className="fill-amber-500/20" />
                      
                      {/* Head with hair */}
                      <ellipse cx="30" cy="20" rx="14" ry="16" className="fill-amber-600" />
                      <path 
                        d="M16 16C16 10 22 6 30 6C38 6 44 10 44 16V14C44 10 38 8 30 8C22 8 16 10 16 14V16Z" 
                        className="fill-amber-800"
                      />
                      
                      {/* Suit */}
                      <path 
                        d="M30 38C42 38 50 46 50 56V72H10V56C10 46 18 38 30 38Z" 
                        className="fill-amber-900"
                      />
                      
                      {/* Collar/tie */}
                      <path 
                        d="M26 38L30 50L34 38" 
                        className="fill-amber-100"
                      />
                      <path 
                        d="M29 50L30 65L31 50" 
                        className="fill-amber-700"
                      />
                      
                      {/* Lapels */}
                      <path 
                        d="M22 40L26 38L24 55L18 50Z" 
                        className="fill-amber-800"
                      />
                      <path 
                        d="M38 40L34 38L36 55L42 50Z" 
                        className="fill-amber-800"
                      />
                    </svg>
                  </div>
                </div>

                {/* Coach Info */}
                <h4 className="font-semibold text-amber-100 text-center mb-1">
                  Napoleon Hill
                </h4>
                <p className="text-xs text-amber-200/70 text-center mb-4 line-clamp-2">
                  Gândește și vei deveni bogat - Principii de succes
                </p>

                {/* CTA Button */}
                <Button 
                  onClick={() => setNapoleonCoachOpen(true)}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white"
                  size="sm"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Start Coaching
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Coach Dialog */}
      <Dialog open={performanceCoachOpen} onOpenChange={setPerformanceCoachOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-500" />
              Personal Performance Coach
            </DialogTitle>
          </DialogHeader>
          <div className="h-[60vh] overflow-hidden">
            <PerformanceCoachChat />
          </div>
        </DialogContent>
      </Dialog>

      {/* Napoleon Hill Coach Dialog */}
      <Dialog open={napoleonCoachOpen} onOpenChange={setNapoleonCoachOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-500" />
              Napoleon Hill Business Coach
            </DialogTitle>
          </DialogHeader>
          <div className="h-[60vh] overflow-hidden">
            <NapoleonHillCoachWidget 
              size="large" 
              onRemove={() => setNapoleonCoachOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
