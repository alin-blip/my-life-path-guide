import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dumbbell, Briefcase, Sparkles, Heart, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PerformanceCoachChat } from '@/components/ai/PerformanceCoachChat';
import { RelationshipCoachChat } from '@/components/ai/RelationshipCoachChat';
import { TherapistCoachChat } from '@/components/ai/TherapistCoachChat';
import { NapoleonHillCoachWidget } from '@/components/dashboard/widgets/NapoleonHillCoachWidget';
import performanceCoachImg from '@/assets/performance-coach.png';
import napoleonHillImg from '@/assets/napoleon-hill-coach.png';

export const DualCoachCard: React.FC = () => {
  const [performanceCoachOpen, setPerformanceCoachOpen] = useState(false);
  const [napoleonCoachOpen, setNapoleonCoachOpen] = useState(false);
  const [relationshipCoachOpen, setRelationshipCoachOpen] = useState(false);
  const [therapistCoachOpen, setTherapistCoachOpen] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-background">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <CardContent className="relative p-4 md:p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 mb-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold tracking-wide text-foreground">YOUR AI COACHES</span>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Alege un coach și începe transformarea</p>
          </div>

          {/* Coach Categories Grid */}
          <div className="space-y-6">
            {/* BODY Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold text-blue-100 uppercase tracking-wide">Body</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Performance Coach */}
                <div 
                  className="group cursor-pointer"
                  onClick={() => setPerformanceCoachOpen(true)}
                >
                  <div className={cn(
                    "relative flex items-center gap-4 p-4 rounded-xl",
                    "bg-gradient-to-r from-blue-600/20 to-blue-900/20",
                    "border border-blue-500/30 hover:border-blue-400/60",
                    "transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20",
                    "hover:scale-[1.02]"
                  )}>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
                      <img 
                        src={performanceCoachImg}
                        alt="Performance Coach"
                        className="relative w-full h-full object-cover object-top rounded-lg border border-blue-400/40"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-blue-100 truncate">Performance Coach</h4>
                      <p className="text-xs text-blue-200/70 mt-0.5">Fitness, energie, somn</p>
                    </div>
                    <Dumbbell className="h-5 w-5 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Therapist Coach */}
                <div 
                  className="group cursor-pointer"
                  onClick={() => setTherapistCoachOpen(true)}
                >
                  <div className={cn(
                    "relative flex items-center gap-4 p-4 rounded-xl",
                    "bg-gradient-to-r from-teal-600/20 to-teal-900/20",
                    "border border-teal-500/30 hover:border-teal-400/60",
                    "transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20",
                    "hover:scale-[1.02]"
                  )}>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-500/30 to-teal-600/30 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-teal-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-teal-100 truncate">Therapist Coach</h4>
                      <p className="text-xs text-teal-200/70 mt-0.5">Stres, anxietate, mindfulness</p>
                    </div>
                    <Brain className="h-5 w-5 text-teal-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>

            {/* BALANCE Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-pink-400" />
                <h3 className="text-sm font-bold text-pink-100 uppercase tracking-wide">Balance</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {/* Relationship Coach */}
                <div 
                  className="group cursor-pointer"
                  onClick={() => setRelationshipCoachOpen(true)}
                >
                  <div className={cn(
                    "relative flex items-center gap-4 p-4 rounded-xl",
                    "bg-gradient-to-r from-pink-600/20 to-pink-900/20",
                    "border border-pink-500/30 hover:border-pink-400/60",
                    "transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20",
                    "hover:scale-[1.02]"
                  )}>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-pink-500/30 to-pink-600/30 flex items-center justify-center">
                      <Heart className="h-8 w-8 text-pink-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-pink-100 truncate">Relationship Coach</h4>
                      <p className="text-xs text-pink-200/70 mt-0.5">Relații, comunicare, conexiuni</p>
                    </div>
                    <Heart className="h-5 w-5 text-pink-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>

            {/* BUSINESS Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-100 uppercase tracking-wide">Business</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {/* Napoleon Hill Coach */}
                <div 
                  className="group cursor-pointer"
                  onClick={() => setNapoleonCoachOpen(true)}
                >
                  <div className={cn(
                    "relative flex items-center gap-4 p-4 rounded-xl",
                    "bg-gradient-to-r from-amber-600/20 to-amber-900/20",
                    "border border-amber-500/30 hover:border-amber-400/60",
                    "transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20",
                    "hover:scale-[1.02]"
                  )}>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-amber-500/20 blur-xl" />
                      <img 
                        src={napoleonHillImg}
                        alt="Napoleon Hill Coach"
                        className="relative w-full h-full object-cover object-top rounded-lg border border-amber-400/40"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-amber-100 truncate">Napoleon Hill Coach</h4>
                      <p className="text-xs text-amber-200/70 mt-0.5">Gândește și devii bogat</p>
                    </div>
                    <Briefcase className="h-5 w-5 text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
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

      {/* Therapist Coach Dialog */}
      <Dialog open={therapistCoachOpen} onOpenChange={setTherapistCoachOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-500" />
              Therapist Coach
            </DialogTitle>
          </DialogHeader>
          <div className="h-[60vh] overflow-hidden">
            <TherapistCoachChat />
          </div>
        </DialogContent>
      </Dialog>

      {/* Relationship Coach Dialog */}
      <Dialog open={relationshipCoachOpen} onOpenChange={setRelationshipCoachOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Relationship Coach
            </DialogTitle>
          </DialogHeader>
          <div className="h-[60vh] overflow-hidden">
            <RelationshipCoachChat />
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
