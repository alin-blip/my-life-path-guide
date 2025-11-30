import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const FounderSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="founder"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          De Ce Am Creat RoWarrior?
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Povestea din spatele sistemului care transformă antreprenori blocați în CEO-uri strategici
        </p>
      </div>

      <Card className="bg-card border-border shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Founder Image Placeholder */}
          <div className="w-full md:w-48 shrink-0">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/30 flex items-center justify-center">
              <Quote className="h-16 w-16 text-primary/40" />
            </div>
            <div className="mt-4 text-center">
              <div className="font-bold text-foreground text-lg">[Numele Fondatorului]</div>
              <div className="text-sm text-muted-foreground">Fondator RoWarrior</div>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 space-y-4 text-muted-foreground">
            <p className="text-lg leading-relaxed">
              <span className="text-accent font-bold">În 2019</span>, am ajuns la 2M EUR cifră de afaceri... 
              și eram mai blocat ca niciodată. Lucram 80h/săptămână, echipa de 15 oameni habar nu avea ce e prioritar, 
              și eu trăiam în task-uri operative.
            </p>

            <p className="leading-relaxed">
              Am încercat toate tool-urile: Asana, Monday, Notion, Trello. Nimic nu funcționa. 
              Problema nu erau task-urile — <span className="text-foreground font-semibold">problema era lipsa de CLARITATE strategică</span>.
            </p>

            <p className="leading-relaxed">
              Atunci am descoperit conceptul de <span className="text-primary font-bold">"Domino"</span> din 
              cartea <em>The ONE Thing</em> de Gary Keller. Am combinat asta cu frameworks de la Alex Hormozi, 
              sistemele de execuție militară, și coaching AI.
            </p>

            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r">
              <p className="text-foreground font-semibold">
                Rezultat: În 6 luni am crescut profitul cu 35%, am redus orele lucrate cu 40%, și echipa știa 
                EXACT ce face fiecare zi.
              </p>
            </div>

            <p className="leading-relaxed">
              Am sistematizat tot ce am învățat și l-am transformat în RoWarrior. Acum peste 150 de antreprenori 
              români folosesc sistemul și raportează în medie +22% profit în primele 90 de zile.
            </p>

            <p className="text-sm text-muted-foreground italic">
              <span className="text-accent">Nota:</span> Adaugă aici povestea ta reală, experiența concretă, 
              cifrele tale și de ce exact ai creat această platformă. Autenticitatea vinde mai mult decât orice "pitch".
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
