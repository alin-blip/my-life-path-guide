import { BarChart3, Clock, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ProblemSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Te recunoști aici?
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Faci €500k-€10M/an, dar...
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-300 shadow-md group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-slate-900 text-xl">Haos de task-uri</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-lg">
              10 liste, 5 tool-uri diferite, zero claritate. Știi că trebuie să faci multe, dar nu știi de unde să începi.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-300 shadow-md group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-slate-900 text-xl">Time waste masiv</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-lg">
              Lucrezi 60h/săptămână, dar doar 8h sunt cu ROI real. Restul = reacții, task-uri low-value și "busy work".
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-300 shadow-md group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-slate-900 text-xl">Burnout iminent</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-lg">
              Profitul e bun, dar ai sacrificat sănătatea, relațiile și bucuria. Te întrebi: "Merită?"
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-300 shadow-md group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-pink-600 group-hover:scale-110 transition-transform duration-300" />
              <CardTitle className="text-slate-900 text-xl">Zero strategie clară</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-lg">
              Viziune €10M → dar ce fac azi la 9 AM? Lipsa de claritate te costă €100k+/an în oportunități pierdute.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};