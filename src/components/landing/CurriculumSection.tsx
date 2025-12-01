import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Target, Calendar, Brain, TrendingUp, Users } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const modules = [
  {
    number: "PAS 0",
    title: "Harta Realității",
    duration: "Ziua 1",
    icon: Map,
    description: "Radiografia faptică a vieții tale acum — unde ești cu adevărat în toate cele 4 arii.",
    outcomes: [
      "Evaluezi onest situația actuală în corp, spirit, relații și afaceri",
      "Identifici decalajul dintre unde ești și unde vrei să ajungi",
      "Elimini autoinșelarea și minciuna despre starea ta reală",
      "Construiești fundația pentru transformare autentică"
    ]
  },
  {
    number: "PAS 1",
    title: "Jocul Imposibil",
    duration: "Ziua 2-3",
    icon: Target,
    description: "Stabilești obiective clare pe 1 an în toate ariile — vei ști EXACT unde mergi.",
    outcomes: [
      "Definești viziunea ta pe 1 an pentru corp, spirit, relații, business",
      "Transformi vise vagi în obiective măsurabile și datate",
      "Creezi un plan anual clar care te ghidează zilnic",
      "Înțelegi exact ce trebuie să faci pentru a avea TOTUL"
    ]
  },
  {
    number: "PAS 2",
    title: "Milestone-uri Lunare",
    duration: "Săptămâna 1",
    icon: Calendar,
    description: "Împarți obiectivele anuale în pași lunari — transformi imposibilul în realizabil.",
    outcomes: [
      "Creezi roadmap lunar pentru fiecare din cele 4 arii",
      "Stabilești milestone-uri clare și măsurabile",
      "Înveți să lucrezi progresiv, pas cu pas",
      "Transformi obiective mari în acțiuni săptămânale"
    ]
  },
  {
    number: "MODUL 1",
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
    number: "MODUL 2",
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
    number: "MODUL 3",
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
    number: "MODUL 4",
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
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="curriculum"
    >
      <div className="text-center mb-12">
        <Badge className="bg-primary/10 text-primary border-primary/50 mb-4 font-semibold">
          Program Complet în 7 Pași
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          De la Realitate la Transformare Completă
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Începi cu o radiografie faptică a vieții tale, stabilești obiective clare pe 1 an, apoi implementezi
          <span className="text-primary font-bold"> sistemul complet</span> care te duce la rezultate în toate cele 4 arii.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Timeline line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary transform -translate-x-1/2" />

        <div className="space-y-12">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            const isEven = idx % 2 === 0;
            
            return (
              <div key={module.number} className="relative">
                {/* Timeline dot */}
                <div className="hidden md:block absolute left-1/2 top-8 w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg transform -translate-x-1/2 z-10" />
                
                <div className={`md:grid md:grid-cols-2 gap-8 ${isEven ? '' : 'md:grid-flow-col-dense'}`}>
                  <div className={isEven ? 'md:text-right' : 'md:col-start-2'}>
                    <Card className="bg-card border-primary/30 p-6 hover:border-primary hover:shadow-lg transition-all shadow-md">
                      <div className="flex items-start gap-4 md:flex-row-reverse md:justify-end">
                        <div className={`p-3 bg-primary/10 rounded-lg ${isEven ? 'md:ml-0' : ''}`}>
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 md:justify-end">
                            <Badge variant="outline" className="border-primary/50 text-primary font-semibold">
                              {module.number}
                            </Badge>
                            <span className="text-sm text-muted-foreground font-medium">{module.duration}</span>
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">{module.title}</h3>
                          <p className="text-muted-foreground mb-4">{module.description}</p>
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-accent">Ce Obții:</div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {module.outcomes.map((outcome, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-accent mt-1">•</span>
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
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/40 p-6 max-w-3xl mx-auto shadow-lg">
          <p className="text-lg text-foreground">
            <span className="font-bold text-accent">Rezultat final:</span> Știi EXACT unde ești, unde mergi și ce trebuie să faci zilnic.
            Ai un sistem complet de execuție care aduce rezultate constante în corp, spirit, relații și business.
          </p>
        </Card>
      </div>
    </div>
  );
};
