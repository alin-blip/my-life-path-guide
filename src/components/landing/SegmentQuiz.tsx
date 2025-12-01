import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const segments = [
  {
    id: "body",
    label: "Corp & Sănătate",
    icon: "💪",
    title: "Body",
    benefits: [
      "Protocol zilnic de energie și reziliență fizică",
      "Sistem de tracking pentru somn, alimentație și mișcare",
      "Recuperare după burnout și epuizare cronică"
    ]
  },
  {
    id: "being",
    label: "Spirit & Scop",
    icon: "🙏",
    title: "Being",
    benefits: [
      "Claritate asupra scopului și direcției de viață",
      "Protocol de rugăciune și meditație adaptată pentru antreprenori",
      "Transformare emoțională prin Stack-uri ghidate"
    ]
  },
  {
    id: "balance",
    label: "Relații & Familie",
    icon: "❤️",
    title: "Balance",
    benefits: [
      "Reconstruiești conexiunea cu familia și partenerul",
      "Sistem de obiective comune pentru relațiile importante",
      "Scapi de vinovăție și construiești prezență autentică"
    ]
  },
  {
    id: "business",
    label: "Afaceri & Prosperitate",
    icon: "💼",
    title: "Business",
    benefits: [
      "War Planning pentru execuție focusată și creștere măsurabilă",
      "Coaching AI pentru bottleneck-uri și decizii strategice",
      "Delegare inteligentă și automatizare pentru profit maxim"
    ]
  }
];

export const SegmentQuiz = () => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <div 
      ref={elementRef}
      className={`mb-16 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
        Care e cea mai mare luptă a ta acum?
      </h2>
      <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
        Selectează aria în care simți că ai nevoie de claritate și transformare
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {segments.map((segment) => (
          <Card
            key={segment.id}
            className={`p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
              selectedSegment === segment.id
                ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary shadow-lg"
                : "bg-card border-border hover:border-primary/50"
            }`}
            onClick={() => setSelectedSegment(segment.id)}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{segment.icon}</div>
              <div className={`text-lg font-bold mb-1 ${
                selectedSegment === segment.id ? "text-primary" : "text-foreground"
              }`}>
                {segment.label}
              </div>
              <div className="text-xs text-muted-foreground">{segment.title}</div>
            </div>
          </Card>
        ))}
      </div>

      {selectedSegment && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg">
          <h3 className="text-xl font-bold text-foreground mb-4 text-center">
            Calea Războinicului te transformă aici
          </h3>
          <div className="space-y-3 max-w-2xl mx-auto">
            {segments.find(s => s.id === selectedSegment)?.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <p className="text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
