import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const segments = [
  {
    id: "startup",
    label: "0-100k EUR/an",
    title: "Start-UP",
    benefits: [
      "Îți definești Domino-ul săptămânal pentru a nu te pierde în haos",
      "Scapi de 80% din task-urile inutile care te blochează",
      "Coaching AI pentru decizii rapide în primele 90 de zile critice"
    ]
  },
  {
    id: "scale",
    label: "100k-500k EUR/an",
    title: "Scale-UP Early",
    benefits: [
      "Automatizezi procesele care îți mănâncă timpul",
      "Crești profitul cu 15-20% fără să angajezi",
      "Sistem de execuție pentru echipa ta mică dar eficientă"
    ]
  },
  {
    id: "growth",
    label: "500k-2M EUR/an",
    title: "Scale-UP Growth",
    benefits: [
      "Elimini bottleneck-urile care te țin blocat la 6 cifre",
      "Delegi strategic fără să pierzi controlul",
      "Crești profitul cu 20-30% prin focus și claritate"
    ]
  },
  {
    id: "optimize",
    label: "2M-10M+ EUR/an",
    title: "Optimization",
    benefits: [
      "Optimizezi operațiunile pentru marje mai mari",
      "Scapi de burnout și redevii CEO strategic",
      "Coaching AI nivel Hormozi pentru decizii de 6-7 cifre"
    ]
  }
];

export const SegmentQuiz = () => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  return (
    <div className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
        La ce cifră de afaceri ești acum?
      </h2>
      <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
        Selectează unde te afli ca să vezi exact cum RoWarrior te ajută în etapa TA
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {segments.map((segment) => (
          <Card
            key={segment.id}
            className={`p-6 cursor-pointer transition-all hover:scale-105 ${
              selectedSegment === segment.id
                ? "bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 border-feminine-primary"
                : "bg-background/40 border-border hover:border-feminine-primary/50"
            }`}
            onClick={() => setSelectedSegment(segment.id)}
          >
            <div className="text-center">
              <div className={`text-lg font-bold mb-2 ${
                selectedSegment === segment.id ? "text-feminine-primary" : "text-white"
              }`}>
                {segment.label}
              </div>
              <div className="text-sm text-gray-400">{segment.title}</div>
            </div>
          </Card>
        ))}
      </div>

      {selectedSegment && (
        <Card className="bg-gradient-to-br from-feminine-primary/10 to-feminine-purple/10 border-feminine-primary/30 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Cum te ajută RoWarrior în etapa ta
          </h3>
          <div className="space-y-3 max-w-2xl mx-auto">
            {segments.find(s => s.id === selectedSegment)?.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-feminine-accent shrink-0 mt-0.5" />
                <p className="text-gray-200">{benefit}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
