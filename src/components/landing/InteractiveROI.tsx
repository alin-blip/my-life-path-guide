import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const InteractiveROI = () => {
  const [bodyScore, setBodyScore] = useState<number>(5);
  const [relationshipsScore, setRelationshipsScore] = useState<number>(5);
  const [spiritScore, setSpiritScore] = useState<number>(5);
  const [businessScore, setBusinessScore] = useState<number>(5);
  const { elementRef, isVisible } = useScrollAnimation();

  const areas = [
    { 
      id: "body", 
      label: "Corp", 
      score: bodyScore, 
      setScore: setBodyScore,
      without: "Oboseală cronică, greutate în plus, lipsă de energie",
      with: "Energie zilnică constantă, corp sănătos și rezistent"
    },
    { 
      id: "relationships", 
      label: "Relații", 
      score: relationshipsScore, 
      setScore: setRelationshipsScore,
      without: "Deconectare emoțională, conflicte frecvente, singurătate",
      with: "Conexiune profundă cu familia, intimitate autentică"
    },
    { 
      id: "spirit", 
      label: "Spirit", 
      score: spiritScore, 
      setScore: setSpiritScore,
      without: "Confuzie despre scop, lipsă de sens, anxietate",
      with: "Claritate totală, pace interioară, conexiune spirituală"
    },
    { 
      id: "business", 
      label: "Bani", 
      score: businessScore, 
      setScore: setBusinessScore,
      without: "Stagnare financiară, stres constant despre bani",
      with: "Creștere predictibilă, abundență, libertate financiară"
    }
  ];

  const totalScore = bodyScore + relationshipsScore + spiritScore + businessScore;
  const maxScore = 40;
  const overallHealth = Math.round((totalScore / maxScore) * 100);

  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="roi-calculator"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Evaluează-ți Starea în Cele 4 Arii
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Evaluează fiecare arie de la 1 (foarte slab) la 10 (excelent) și vezi unde te afli acum
        </p>
      </div>

      <Card className="bg-white border-slate-200 shadow-lg p-8 max-w-5xl mx-auto">
        <div className="space-y-8 mb-8">
          {areas.map((area) => (
            <div key={area.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={area.id} className="text-lg text-slate-900 font-semibold">
                  {area.label}
                </Label>
                <span className="text-2xl font-bold text-primary">{area.score}/10</span>
              </div>
              <Input
                id={area.id}
                type="range"
                min="1"
                max="10"
                value={area.score}
                onChange={(e) => area.setScore(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <p className="font-semibold text-red-600 mb-1">❌ Fără CEO Mind OS:</p>
                  <p className="text-slate-600">{area.without}</p>
                </div>
                <div className="bg-blue-50 border border-primary/30 p-3 rounded">
                  <p className="font-semibold text-primary mb-1">✅ Cu CEO Mind OS:</p>
                  <p className="text-slate-600">{area.with}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center border-2 border-primary/40 shadow-lg">
          <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3" />
          <div className="text-lg text-slate-600 mb-2 font-semibold">Starea Ta Generală</div>
          <div className="text-5xl font-bold text-primary mb-4">
            {overallHealth}%
          </div>
          
          {overallHealth < 50 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r mb-4">
              <p className="text-slate-900 font-bold">⚠️ Ești în zona de risc</p>
              <p className="text-sm text-slate-600 mt-2">
                Când scorul general e sub 50%, riscul de burnout, probleme de sănătate și relații distruse crește exponențial. 
                E timpul să acționezi.
              </p>
            </div>
          )}
          
          {overallHealth >= 50 && overallHealth < 75 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r mb-4">
              <p className="text-slate-900 font-bold">📈 Ai un fundament solid</p>
              <p className="text-sm text-slate-600 mt-2">
                Ești pe drumul cel bun, dar există încă spațiu mare de creștere. 
                Calea Războinicului te va ajuta să ajungi la 80-90% în toate ariile.
              </p>
            </div>
          )}
          
          {overallHealth >= 75 && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r mb-4">
              <p className="text-slate-900 font-bold">🏆 Excelent! Continuă pe această cale</p>
              <p className="text-sm text-slate-600 mt-2">
                Ai un echilibru solid, dar chiar și războinicii puternici au nevoie de un sistem 
                care să-i mențină la acest nivel și să-i protejeze de recăderi.
              </p>
            </div>
          )}

          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            <span className="text-slate-900 font-bold">Calea Războinicului</span> nu se concentrează doar pe bani sau business. 
            Te ajută să crești <span className="text-primary font-bold">SIMULTAN</span> în toate cele 4 arii — 
            pentru că adevărata bogăție înseamnă abundență în toate domeniile vieții.
          </p>
        </div>
      </Card>
    </div>
  );
};
