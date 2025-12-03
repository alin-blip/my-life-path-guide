import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Calendar, TrendingDown, AlertTriangle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const UrgencySection = () => {
  const navigate = useNavigate();
  const { elementRef, isVisible } = useScrollAnimation();

  const costsPerDay = [
    {
      icon: Heart,
      area: "Corp",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      cost: "O zi pierdută = mai puțină energie, mai multă oboseală cronică, un pas mai aproape de burnout"
    },
    {
      icon: Calendar,
      area: "Relații",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      cost: "O zi pierdută = distanță mai mare cu familia, încă o zi în care copiii tăi te simt absent"
    },
    {
      icon: TrendingDown,
      area: "Spirit",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      cost: "O zi pierdută = mai multă confuzie, mai puțină claritate, încă o zi în care nu știi de ce faci ce faci"
    },
    {
      icon: TrendingDown,
      area: "Business",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      cost: "O zi pierdută = oportunități ratate, încă o săptămână de lucru haotic fără rezultate clare"
    }
  ];

  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="urgency"
    >
      <div className="text-center mb-12">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Cât Te Costă Fiecare Zi Fără Sistem?
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Nu e despre oferte sau locuri limitate. E despre <span className="text-red-600 font-bold">costul real</span> al fiecărei zile în care rămâi blocat.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
        {costsPerDay.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card 
              key={index}
              className={`${item.bgColor} border-2 ${item.borderColor} p-6 shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className={`${item.bgColor} p-3 rounded-lg border ${item.borderColor}`}>
                  <Icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${item.color}`}>{item.area}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.cost}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 p-8 md:p-12 max-w-4xl mx-auto mb-8 shadow-xl">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-slate-900">
            Fiecare zi fără sistem = fiecare zi mai adânc în Groapă
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Peste 1 an, costul nu va fi doar financiar. Va fi <span className="text-red-600 font-bold">sănătatea ta</span>, 
            <span className="text-red-600 font-bold"> relațiile tale</span>, 
            <span className="text-red-600 font-bold"> claritatea ta spirituală</span> și 
            <span className="text-red-600 font-bold"> oportunitatea de a avea TOTUL</span>.
          </p>
          <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-r mt-6">
            <p className="text-slate-900 font-bold text-lg mb-2">
              Întrebarea nu este "De ce acum?"
            </p>
            <p className="text-slate-600">
              Întrebarea este: <span className="text-slate-900 font-semibold">"Câte zile mai pot să pierd înainte să fie prea târziu?"</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="text-center">
        <Button
          size="lg"
          onClick={() => navigate('/auth')}
          className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-16 py-8 text-2xl font-bold shadow-2xl transition-all hover:scale-105"
        >
          Începe Transformarea Astăzi — Trial 3 Zile GRATUIT
        </Button>
        <p className="text-sm text-slate-500 mt-4 max-w-xl mx-auto">
          Nu plătești nimic acum. Trial 3 zile să vezi dacă îți place. Garanție 90 de zile sau banii înapoi + €100 dacă nu vezi îmbunătățiri.
        </p>
      </div>
    </div>
  );
};
