import { BarChart3, Clock, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProblemSection = () => {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Te recunoști aici?
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Faci €500k-€10M/an, dar...
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-red-900/40 to-red-700/40 border-red-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-red-400" />
              <CardTitle className="text-white text-xl">Haos de task-uri</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 text-lg">
              10 liste, 5 tool-uri diferite, zero claritate. Știi că trebuie să faci multe, dar nu știi de unde să începi.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/40 to-orange-700/40 border-orange-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-400" />
              <CardTitle className="text-white text-xl">Time waste masiv</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 text-lg">
              Lucrezi 60h/săptămână, dar doar 8h sunt cu ROI real. Restul = reacții, task-uri low-value și "busy work".
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-purple-400" />
              <CardTitle className="text-white text-xl">Burnout iminent</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 text-lg">
              Profitul e bun, dar ai sacrificat sănătatea, relațiile și bucuria. Te întrebi: "Merită?"
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-900/40 to-pink-700/40 border-pink-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-pink-400" />
              <CardTitle className="text-white text-xl">Zero strategie clară</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 text-lg">
              Viziune €10M → dar ce fac azi la 9 AM? Lipsa de claritate te costă €100k+/an în oportunități pierdute.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};