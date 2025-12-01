import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const PitSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const pitItems = [
    { id: "work", label: "Lucrez constant dar rezultatele nu vin" },
    { id: "disconnect", label: "Mă simt deconectat de familie/partener" },
    { id: "body", label: "Corpul meu suferă (oboseală, greutate, lipsă energie)" },
    { id: "numb", label: "Mă sedez cu mâncarea/alcoolul/rețelele sociale" },
    { id: "deserve", label: "Simt că nu merit mai mult" },
  ];

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Ești În Groapă?
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Groapa sărăciei are 5 consecințe. Bifează ce rezonează cu tine:
        </p>
      </div>

      <Card className="bg-card border-border shadow-lg p-8 md:p-12 max-w-3xl mx-auto">
        <div className="space-y-6 mb-8">
          {pitItems.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id={item.id}
                checked={checkedItems[item.id] || false}
                onCheckedChange={(checked) => {
                  setCheckedItems(prev => ({
                    ...prev,
                    [item.id]: checked === true
                  }));
                }}
                className="mt-1"
              />
              <label
                htmlFor={item.id}
                className="text-lg text-foreground font-medium cursor-pointer flex-1"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>

        {checkedCount >= 2 && (
          <div className="bg-gradient-to-r from-destructive/10 to-accent/10 border-l-4 border-destructive p-6 rounded-r-lg">
            <p className="text-lg text-foreground font-bold mb-2">
              Ai bifat {checkedCount} din 5 — Ești în Groapă.
            </p>
            <p className="text-base text-muted-foreground">
              Vestea bună? <span className="text-primary font-bold">Există o cale de ieșire.</span> Calea Războinicului 
              te învață cum să ieși din Groapă și să construiești un echilibru real în toate ariile vieții.
            </p>
          </div>
        )}

        {checkedCount > 0 && checkedCount < 2 && (
          <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
            <p className="text-base text-muted-foreground">
              Ești aproape de marginea Gropii. Acum e momentul să construiești un sistem care 
              <span className="text-foreground font-bold"> te protejează și te pune pe calea creșterii.</span>
            </p>
          </div>
        )}

        {checkedCount === 0 && (
          <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg">
            <p className="text-base text-muted-foreground">
              E excelent că nu rezonezi cu aceste simptome! Totuși, Calea Războinicului te învață 
              <span className="text-foreground font-bold"> cum să PAZ</span> ce ai construit și să 
              <span className="text-foreground font-bold"> SCALEZI</span> fără să sacrifici nimic.
            </p>
          </div>
        )}
      </Card>
    </section>
  );
};