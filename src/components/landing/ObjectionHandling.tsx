import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Clock, DollarSign } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ObjectionHandling = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Întrebări frecvente
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Răspunsuri directe la obiecțiile comune
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              <CardTitle className="text-foreground text-lg">"Am deja Notion/Asana"</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Tool-urile clasice sunt pentru <strong>task management</strong> generic.
            </p>
            <p className="text-foreground">
              RoWarrior e sistem de <strong>War Planning</strong> specific pentru antreprenori €500k-€10M+: obiectiv domino, KPI esențiali, coaching AI Hormozi.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/30 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-6 h-6 text-accent" />
              <CardTitle className="text-foreground text-lg">"Nu am timp să învăț"</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              <strong>Setup: 15 minute.</strong>
            </p>
            <p className="text-muted-foreground mb-3">
              <strong>Rezultate: 48 ore.</strong>
            </p>
            <p className="text-foreground">
              Setezi War Plan rapid, apoi execuți 1-3 task-uri high-ROI pe zi. Zero complexitate, maximum impact.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/30 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6 text-primary" />
              <CardTitle className="text-foreground text-lg">"E prea scump"</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              197 LEI/lună vs. <strong>€100k/an pierdut</strong> în haos și time waste.
            </p>
            <p className="text-muted-foreground mb-3">
              ROI calculation: Economisești 20h/săptămână = €5k-€20k/lună.
            </p>
            <p className="text-accent font-semibold">
              ROI 42x în primul trimestru.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};