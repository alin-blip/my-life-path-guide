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
      className={`mb-12 md:mb-16 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 text-center mb-3 md:mb-4 px-2">
        Care e cea mai mare luptă a ta acum?
      </h2>
      <p className="text-sm sm:text-base text-slate-600 text-center mb-6 md:mb-8 max-w-2xl mx-auto px-2">
        Selectează aria în care simți că ai nevoie de claritate și transformare
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {segments.map((segment) => (
          <Card
            key={segment.id}
            className={`group p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
              selectedSegment === segment.id
                ? "bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary shadow-xl shadow-primary/20"
                : "bg-white border border-slate-200 hover:border-primary/50 hover:shadow-xl hover:shadow-slate-200/50"
            }`}
            onClick={() => setSelectedSegment(segment.id)}
          >
            <div className="text-center">
              <div className="text-2xl md:text-4xl mb-2 md:mb-3 transform group-hover:scale-110 transition-transform duration-300">{segment.icon}</div>
              <div className={`text-sm md:text-lg font-bold mb-1 ${
                selectedSegment === segment.id ? "text-primary" : "text-slate-900"
              }`}>
                {segment.label}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500">{segment.title}</div>
            </div>
          </Card>
        ))}
      </div>

      {selectedSegment && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary/30 p-5 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 text-center">
            Calea Războinicului te transformă aici
          </h3>
          <div className="space-y-2 md:space-y-3 max-w-2xl mx-auto">
            {segments.find(s => s.id === selectedSegment)?.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0 mt-0.5" />
                <p className="text-sm md:text-base text-slate-700">{benefit}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
