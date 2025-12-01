import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Target, DoorOpen, Gamepad2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const UniqueMechanismSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  const protocols = [
    {
      number: "1",
      icon: BookOpen,
      title: "Codul",
      description: "Te învață să trăiești în adevăr",
      result: "Fundament solid, fără minciuni",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300"
    },
    {
      number: "2",
      icon: Brain,
      title: "Stack-ul",
      description: "Introspecție zilnică (10-15 min)",
      result: "Claritate mentală, perspective noi",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300"
    },
    {
      number: "3",
      icon: Target,
      title: "Core 4",
      description: "Acțiuni zilnice în 4 arii",
      result: "Echilibru constant",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300"
    },
    {
      number: "4",
      icon: DoorOpen,
      title: "Ușa",
      description: "Planificare săptămânală",
      result: "Focus pe ce contează",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300"
    },
    {
      number: "5",
      icon: Gamepad2,
      title: "Jocul",
      description: "Misiuni lunare/anuale",
      result: "Viziune pe termen lung",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300"
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
          Cele 5 Protocoale ale Războinicului
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Nu e un tool de productivitate. E un <span className="text-primary font-bold">sistem complet de viață</span> care integrează corp, spirit, relații și afaceri.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
        {protocols.map((protocol, index) => {
          const Icon = protocol.icon;
          return (
            <Card
              key={index}
              className={`${protocol.bgColor} border-2 ${protocol.borderColor} p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`${protocol.bgColor} border-2 ${protocol.borderColor} rounded-full w-10 h-10 flex items-center justify-center font-bold ${protocol.color} text-lg shrink-0`}>
                  {protocol.number}
                </div>
                <Icon className={`h-8 w-8 ${protocol.color}`} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{protocol.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{protocol.description}</p>
              <div className={`border-t-2 ${protocol.borderColor} pt-3`}>
                <p className={`text-sm font-semibold ${protocol.color}`}>→ {protocol.result}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/40 p-8 max-w-4xl mx-auto shadow-lg">
        <p className="text-lg text-foreground font-bold text-center mb-2">
          🎯 Funcționează împreună ca un SISTEM
        </p>
        <p className="text-base text-muted-foreground text-center">
          Fiecare protocol se conectează cu celelalte. Codul stabilește fundația, Stack-ul îți oferă claritate zilnică, 
          Core 4 asigură progresul în toate ariile, Ușa te ține focalizat săptămânal, iar Jocul îți păstrează viziunea pe termen lung. 
          <span className="text-foreground font-semibold"> Nu funcționează unul fără celelalte.</span>
        </p>
      </Card>
    </section>
  );
};