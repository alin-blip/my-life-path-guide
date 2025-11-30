import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const idealFor = [
  "Antreprenori cu cifră 100k-10M+ EUR care vor să crească profitul fără să lucreze mai mult",
  "CEO-uri blocați în operațional care vor să devină CEO-uri strategici",
  "Business owners care simt că echipa lor nu execută la nivel maxim",
  "Antreprenori care au încercat Asana, Monday, Notion și tot n-au claritate",
  "Leaderi care vor rezultate măsurabile în 90 de zile, nu 'productivity hacks'"
];

const notFor = [
  "Freelanceri sau solo-prenori sub 50k EUR/an (sistemul e prea avansat pentru etapa ta)",
  "Persoane care caută 'life hacks' și trucuri de productivitate (RoWarrior e sistem, nu tips & tricks)",
  "Antreprenori care nu sunt dispuși să investească 10 minute/zi în planificare strategică",
  "Business-uri fără cifră stabilă care încă caută Product-Market Fit",
  "Cei care vor soluții instant fără să implementeze un sistem real"
];

export const ForWhomSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="for-whom"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          RoWarrior Este Pentru Tine?
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Fii sincer cu tine: dacă te regăsești în coloana din stânga, e făcut pentru tine.
          Dacă ești în coloana din dreapta, <span className="text-primary font-bold">încă</span> nu e momentul potrivit.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Pentru Cine Este */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-8 w-8 text-accent" />
            <h3 className="text-2xl font-bold text-foreground">RoWarrior ESTE pentru tine dacă:</h3>
          </div>
          <ul className="space-y-4">
            {idealFor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-sm text-foreground">
              <span className="font-bold">TL;DR:</span> Ai business real cu cifră reală, vrei să scalezi smart, și ești dispus să urmezi un sistem dovedit.
            </p>
          </div>
        </Card>

        {/* Pentru Cine NU Este */}
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/30 p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <XCircle className="h-8 w-8 text-destructive" />
            <h3 className="text-2xl font-bold text-foreground">RoWarrior NU este pentru tine dacă:</h3>
          </div>
          <ul className="space-y-4">
            {notFor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
            <p className="text-sm text-foreground">
              <span className="font-bold">TL;DR:</span> Dacă ești în faza de validare sau cauți quick fixes, RoWarrior e prea mult pentru tine acum. Revino când ai cifră stabilă.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Dacă ești în coloana verde, intră în trial. Dacă ești în roșu, salvează pagina asta și revino când ești pregătit.
          <span className="block mt-2 text-accent font-semibold">Nu forța fit-ul. RoWarrior funcționează doar pentru cei care sunt pregătiți.</span>
        </p>
      </div>
    </div>
  );
};
