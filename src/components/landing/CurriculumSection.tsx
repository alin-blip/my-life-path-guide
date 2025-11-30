import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Brain, TrendingUp, Users } from "lucide-react";

const modules = [
  {
    number: 1,
    title: "War Planning Foundation",
    duration: "Săptămâna 1-2",
    icon: Target,
    description: "Învăți să identifici DOMINO-ul săptămânal și să elimini 80% din task-uri",
    outcomes: [
      "Definești obiectivul domino care dă jos toate celelalte",
      "Elimini task-urile care nu contribuie la domino",
      "Structurezi săptămâna în jurul a 1-3 task-uri high-ROI"
    ]
  },
  {
    number: 2,
    title: "Execuție Zilnică & Sistem",
    duration: "Săptămâna 3-4",
    icon: Brain,
    description: "Integrezi rutina zilnică și sistemul de tracking al progresului",
    outcomes: [
      "Creezi ritual-ul de dimineață (10 minute War Planning)",
      "Tracking automat al progresului zilnic",
      "Ajustări rapide bazate pe feedback real"
    ]
  },
  {
    number: 3,
    title: "AI Coaching & Optimizare",
    duration: "Săptămâna 5-8",
    icon: TrendingUp,
    description: "Folosești coaching-ul AI tip Hormozi pentru decizii strategice",
    outcomes: [
      "Analiză AI a bottleneck-urilor din business",
      "Recomandări personalizate pentru creștere",
      "Stack-uri de coaching pentru probleme specifice"
    ]
  },
  {
    number: 4,
    title: "Scale & Delegare",
    duration: "Săptămâna 9-12",
    icon: Users,
    description: "Scalezi sistemul și delegi eficient către echipă",
    outcomes: [
      "Transformi procesul tău în sistem pentru echipă",
      "Delegi task-urile low-ROI fără să pierzi controlul",
      "Raportare automată și accountability în echipă"
    ]
  }
];

export const CurriculumSection = () => {
  return (
    <div className="mb-24" id="curriculum">
      <div className="text-center mb-12">
        <Badge className="bg-feminine-primary/20 text-feminine-primary border-feminine-primary/30 mb-4">
          Program în 4 Module
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Cum Te Transformi în War-Planning CEO
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Nu este doar un tool. Este un <span className="text-feminine-primary font-bold">program complet</span> care
          te duce de la haos la execuție impecabilă în 90 de zile.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Timeline line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-feminine-primary via-feminine-purple to-feminine-accent transform -translate-x-1/2" />

        <div className="space-y-12">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            const isEven = idx % 2 === 0;
            
            return (
              <div key={module.number} className="relative">
                {/* Timeline dot */}
                <div className="hidden md:block absolute left-1/2 top-8 w-6 h-6 bg-feminine-primary rounded-full border-4 border-background transform -translate-x-1/2 z-10" />
                
                <div className={`md:grid md:grid-cols-2 gap-8 ${isEven ? '' : 'md:grid-flow-col-dense'}`}>
                  <div className={isEven ? 'md:text-right' : 'md:col-start-2'}>
                    <Card className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur border-feminine-primary/30 p-6 hover:border-feminine-primary transition-all">
                      <div className="flex items-start gap-4 md:flex-row-reverse md:justify-end">
                        <div className={`p-3 bg-feminine-primary/20 rounded-lg ${isEven ? 'md:ml-0' : ''}`}>
                          <Icon className="h-8 w-8 text-feminine-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 md:justify-end">
                            <Badge variant="outline" className="border-feminine-primary/50 text-feminine-primary">
                              Modul {module.number}
                            </Badge>
                            <span className="text-sm text-gray-400">{module.duration}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                          <p className="text-gray-300 mb-4">{module.description}</p>
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-feminine-accent">Ce Obții:</div>
                            <ul className="space-y-1 text-sm text-gray-400">
                              {module.outcomes.map((outcome, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-feminine-accent mt-1">•</span>
                                  <span>{outcome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-feminine-primary/10 to-feminine-purple/10 border-feminine-primary/30 p-6 max-w-3xl mx-auto">
          <p className="text-lg text-white">
            <span className="font-bold text-feminine-accent">Rezultat final:</span> În 90 de zile ai un sistem
            de execuție care rulează singur, echipa ta știe exact ce face, și tu ai timp pentru strategie și creștere.
          </p>
        </Card>
      </div>
    </div>
  );
};
