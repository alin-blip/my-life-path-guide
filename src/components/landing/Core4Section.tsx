import { Card } from "@/components/ui/card";
import { Heart, Brain, Scale, TrendingUp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const Core4Section = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  const coreAreas = [
    {
      icon: Heart,
      title: "Corp",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      description: "Energie, sănătate, vitalitate",
      details: "Un corp plin de energie este fundația pentru tot ce construiești. Fără sănătate, nimic altceva nu contează."
    },
    {
      icon: Brain,
      title: "Ființă (Spirit)",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description: "Credință, sens, pace interioară",
      details: "Conectarea cu ceva mai mare decât tine îți oferă claritate, scop și puterea de a depăși orice obstacol."
    },
    {
      icon: Scale,
      title: "Echilibru (Relații)",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description: "Familie, partener, prieteni",
      details: "Relațiile de calitate sunt sursa fericirii autentice. Nu sacrifica niciodată familia pentru bani."
    },
    {
      icon: TrendingUp,
      title: "Afaceri (Bani)",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      description: "Libertate financiară, impact, moștenire",
      details: "Banii sunt doar un instrument — dar un instrument esențial pentru a-ți proteja familia și a crea impact."
    }
  ];

  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Cele 4 Arii ale Vieții
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Adevărata bogăție înseamnă abundență în TOATE ariile — nu doar una pe costul celorlalte
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {coreAreas.map((area, index) => {
          const Icon = area.icon;
          return (
            <Card 
              key={index}
              className={`${area.bgColor} border-2 ${area.borderColor} p-8 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`${area.bgColor} p-3 rounded-lg border ${area.borderColor}`}>
                  <Icon className={`h-8 w-8 ${area.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-1">{area.title}</h3>
                  <p className={`text-sm font-semibold ${area.color}`}>{area.description}</p>
                </div>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {area.details}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/40 p-8 max-w-4xl mx-auto mt-8 shadow-lg">
        <p className="text-lg text-foreground font-bold text-center mb-2">
          🎯 Filosofia RoWarrior: Progres SIMULTAN în toate cele 4 arii
        </p>
        <p className="text-base text-muted-foreground text-center">
          Nu sacrifici corpul pentru bani. Nu sacrifici familia pentru succes. Nu sacrifici spiritualitatea pentru productivitate. 
          <span className="text-foreground font-semibold"> Construiești totul în același timp — echilibrat, sustenabil, de durată.</span>
        </p>
      </Card>
    </section>
  );
};