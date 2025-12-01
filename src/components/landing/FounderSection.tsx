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
            <p className="text-lg leading-relaxed font-semibold text-foreground">
              <span className="text-destructive">7 ani.</span> 7 ani mi-au trebuit să descopăr, să testez și să dovedesc drumul unui războinic.
            </p>

            <p className="leading-relaxed">
              7 ani în care am trecut prin <span className="text-destructive font-bold">burnout, spitalizare și depresie profundă</span>. 
              Am ajuns în punctul în care doctorii nu mi-au mai dat nici o șansă. Soția mea a fost distrusă. 
              <span className="text-foreground font-semibold"> Am fost o legumă mentală timp de un an...</span>
            </p>

            <p className="leading-relaxed">
              Dar am refuzat să accept că acesta e sfârșitul. Am început să caut răspunsuri — 
              nu în pastile sau terapii convenționale, ci în <span className="text-primary font-bold">adevăr</span>. 
              Am realizat că problema nu era doar în business. Era în <span className="text-foreground font-semibold">TOATE ariile</span> — 
              corp, spirit, relații, afaceri.
            </p>

            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r">
              <p className="text-foreground font-bold mb-2">Rezultatul transformării:</p>
              <ul className="space-y-1 text-sm">
                <li>✓ Am slăbit 30 kg în 4 luni</li>
                <li>✓ De la depresie la putere mentală și claritate</li>
                <li>✓ Business de 5M€+ în 3 ani</li>
                <li>✓ De la relație toxică la căsnicie plină de pasiune</li>
                <li>✓ Tată și soț ghidat de credință</li>
              </ul>
            </div>

            <p className="leading-relaxed">
              Am învățat că <span className="text-primary font-bold">succesul fără echilibru e doar o altă formă de sărăcie</span>. 
              Poți avea milioane în bancă și totuși să fii în Groapă — deconectat, desensibilizat, distrus pe dinăuntru.
            </p>

            <p className="leading-relaxed">
              Am sistematizat tot ce am învățat și l-am transformat în Calea Războinicului. Nu doar pentru mine — 
              pentru că <span className="text-foreground font-bold">nu am avut pe nimeni care să-mi arate calea</span>. 
              Dar TU ai acum această oportunitate.
            </p>

            <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r">
              <p className="text-foreground font-bold">
                Acum sistemul este folosit de 65,000+ bărbați în 40+ de țări. Adaptat pentru piața românească.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
