import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dumbbell, Briefcase, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PerformanceCoachChat } from '@/components/ai/PerformanceCoachChat';
import { NapoleonHillCoachWidget } from '@/components/dashboard/widgets/NapoleonHillCoachWidget';
import performanceCoachImg from '@/assets/performance-coach.png';
import napoleonHillImg from '@/assets/napoleon-hill-coach.png';

export const DualCoachCard: React.FC = () => {
  const [performanceCoachOpen, setPerformanceCoachOpen] = useState(false);
  const [napoleonCoachOpen, setNapoleonCoachOpen] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-blue-950/50 via-background to-amber-950/30">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-amber-500/5" />
        
        <CardContent className="relative p-4 md:p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-amber-500/20 border border-primary/20 mb-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold tracking-wide text-foreground">YOUR AI COACHES</span>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Alege un coach și începe transformarea</p>
          </div>

          {/* Two Coach Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Coach - Left */}
            <div 
              className="relative group cursor-pointer"
              onClick={() => setPerformanceCoachOpen(true)}
            >
              <div className={cn(
                "relative flex flex-col items-center p-5 rounded-2xl",
                "bg-gradient-to-b from-blue-600/20 via-blue-900/30 to-blue-950/40",
                "border-2 border-blue-500/40 hover:border-blue-400/70",
                "transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30",
                "hover:scale-[1.02] hover:-translate-y-1"
              )}>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Coach Image */}
                <div className="relative mb-4 w-32 h-40 rounded-xl overflow-hidden">
                  {/* Blue aura behind image */}
                  <div className="absolute inset-0 bg-blue-500/30 blur-2xl scale-150 group-hover:scale-175 transition-transform duration-500" />
                  <div className="absolute inset-[-20%] bg-blue-400/20 blur-xl animate-pulse" />
                  
                  <img 
                    src={performanceCoachImg}
                    alt="Performance Coach"
                    className="relative w-full h-full object-cover object-top rounded-xl border-2 border-blue-400/50 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-400/50 transition-shadow duration-300"
                  />
                  
                  {/* Energy lines overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent" />
                </div>

                {/* Coach Info */}
                <h4 className="text-lg font-bold text-blue-100 text-center mb-1 tracking-wide">
                  PERSONAL PERFORMANCE
                </h4>
                <p className="text-xs text-blue-200/80 text-center mb-4 max-w-[200px]">
                  Antrenează-ți corpul și mintea pentru peak performance
                </p>

                {/* CTA Button */}
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPerformanceCoachOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50 transition-all duration-300"
                  size="lg"
                >
                  <Dumbbell className="h-5 w-5 mr-2" />
                  Start Coaching
                </Button>
              </div>
            </div>

            {/* Napoleon Hill Coach - Right */}
            <div 
              className="relative group cursor-pointer"
              onClick={() => setNapoleonCoachOpen(true)}
            >
              <div className={cn(
                "relative flex flex-col items-center p-5 rounded-2xl",
                "bg-gradient-to-b from-amber-600/20 via-amber-900/30 to-amber-950/40",
                "border-2 border-amber-500/40 hover:border-amber-400/70",
                "transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/30",
                "hover:scale-[1.02] hover:-translate-y-1"
              )}>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Coach Image */}
                <div className="relative mb-4 w-32 h-40 rounded-xl overflow-hidden">
                  {/* Golden aura behind image */}
                  <div className="absolute inset-0 bg-amber-500/30 blur-2xl scale-150 group-hover:scale-175 transition-transform duration-500" />
                  <div className="absolute inset-[-20%] bg-amber-400/20 blur-xl animate-pulse" />
                  
                  <img 
                    src={napoleonHillImg}
                    alt="Napoleon Hill Coach"
                    className="relative w-full h-full object-cover object-top rounded-xl border-2 border-amber-400/50 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-400/50 transition-shadow duration-300"
                  />
                  
                  {/* Vintage overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent" />
                </div>

                {/* Coach Info */}
                <h4 className="text-lg font-bold text-amber-100 text-center mb-1 tracking-wide">
                  NAPOLEON HILL
                </h4>
                <p className="text-xs text-amber-200/80 text-center mb-4 max-w-[200px]">
                  Gândește și vei deveni bogat - Principii de succes
                </p>

                {/* CTA Button */}
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNapoleonCoachOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-400/50 transition-all duration-300"
                  size="lg"
                >
                  <Briefcase className="h-5 w-5 mr-2" />
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
