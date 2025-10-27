import { Calendar, Target, TrendingUp, CheckCircle2 } from "lucide-react";

export const HowItWorksTimeline = () => {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Cum funcționează: Primele 7 zile
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Setup 15 minute. Rezultate în 48 ore. Transformare în 90 de zile.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-feminine-primary via-feminine-purple to-feminine-accent" />
          
          {/* Day 1 */}
          <div className="relative pl-20 pb-12">
            <div className="absolute left-4 top-2 w-8 h-8 bg-feminine-primary rounded-full flex items-center justify-center border-4 border-background">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 border border-feminine-primary/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-feminine-primary font-bold text-lg">Ziua 1</span>
                <span className="text-gray-400">• 15 minute</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">War Plan Setup</h3>
              <p className="text-gray-300">
                Setezi viziunea €10M, obiectivul trimestrial și primul obiectiv domino săptămânal. AI-ul te ajută să identifici ce mișcă acul.
              </p>
            </div>
          </div>

          {/* Days 2-7 */}
          <div className="relative pl-20 pb-12">
            <div className="absolute left-4 top-2 w-8 h-8 bg-feminine-purple rounded-full flex items-center justify-center border-4 border-background">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gradient-to-br from-feminine-purple/20 to-purple-700/20 border border-feminine-purple/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-feminine-purple font-bold text-lg">Zilele 2-7</span>
                <span className="text-gray-400">• 3 task-uri/zi</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Weekly Domino + Daily Execution</h3>
              <p className="text-gray-300 mb-3">
                Execuți 1-3 task-uri high-ROI pe zi, conectate la obiectivul domino. Zero time waste pe low-value work.
              </p>
              <div className="flex items-center gap-2 text-feminine-accent">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Rezultat: Claritate totală + primele victorii în 48h</span>
              </div>
            </div>
          </div>

          {/* Day 7 Review */}
          <div className="relative pl-20 pb-12">
            <div className="absolute left-4 top-2 w-8 h-8 bg-feminine-accent rounded-full flex items-center justify-center border-4 border-background">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-feminine-accent font-bold text-lg">Ziua 7</span>
                <span className="text-gray-400">• First Review</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Weekly Review & Adjust</h3>
              <p className="text-gray-300">
                Analizezi ce a mișcat acul, ce blocaje ai întâmpinat și ajustezi rapid pentru săptămâna următoare.
              </p>
            </div>
          </div>

          {/* 90 Days Result */}
          <div className="relative pl-20">
            <div className="absolute left-4 top-2 w-8 h-8 bg-gradient-to-r from-feminine-primary to-feminine-accent rounded-full flex items-center justify-center border-4 border-background">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gradient-to-br from-feminine-primary/30 to-feminine-accent/30 border-2 border-feminine-primary rounded-xl p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-feminine-accent font-bold text-2xl">După 90 de zile</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Rezultate Concrete</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-feminine-primary shrink-0" />
                  <span className="text-gray-200"><strong>+15-30% profit</strong> fără ore suplimentare</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-feminine-primary shrink-0" />
                  <span className="text-gray-200"><strong>-50% time waste</strong> pe low-value work</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-feminine-primary shrink-0" />
                  <span className="text-gray-200"><strong>Claritate strategică</strong> totală</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-feminine-primary shrink-0" />
                  <span className="text-gray-200"><strong>Disciplină zilnică</strong> pe pilot automat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};