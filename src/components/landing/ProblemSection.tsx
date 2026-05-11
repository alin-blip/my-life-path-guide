import { BarChart3, Clock, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const problems = [
  { icon: BarChart3, title: "Haos de task-uri", desc: "10 liste, 5 tool-uri diferite, zero claritate. Știi că trebuie să faci multe, dar nu știi de unde să începi." },
  { icon: Clock, title: "Time waste masiv", desc: "Lucrezi 60h/săptămână, dar doar 8h sunt cu ROI real. Restul = reacții, task-uri low-value și 'busy work'." },
  { icon: Flame, title: "Burnout iminent", desc: "Profitul e bun, dar ai sacrificat sănătatea, relațiile și bucuria. Te întrebi: 'Merită?'" },
  { icon: Target, title: "Zero strategie clară", desc: "Viziune €10M → dar ce fac azi la 9 AM? Lipsa de claritate te costă €100k+/an în oportunități pierdute." },
];

export const ProblemSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="text-center mb-12">
        <SectionLabel className="justify-center mb-4">Problema</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
          Te recunoști <em className="text-primary not-italic font-display italic">aici?</em>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Faci €500k–€10M/an, dar...
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-px bg-border max-w-5xl mx-auto border border-border">
        {problems.map((p, i) => {
          const Icon = p.icon;
          return (
            <Card key={i} variant="ghost" className="rounded-none bg-card group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={1.25} />
                  <CardTitle className="text-foreground text-lg">{p.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{p.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
