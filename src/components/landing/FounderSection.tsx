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
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          De Ce Am Creat RoWarrior?
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Povestea din spatele sistemului care transformă antreprenori blocați în CEO-uri strategici
        </p>
      </div>

      <Card className="bg-white border-slate-200 shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Founder Image Placeholder */}
          <div className="w-full md:w-48 shrink-0">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <Quote className="h-16 w-16 text-primary/40" />
            </div>
            <div className="mt-4 text-center">
              <div className="font-bold text-slate-900 text-lg">[Numele Fondatorului]</div>
              <div className="text-sm text-slate-500">Fondator RoWarrior</div>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 space-y-4 text-slate-600">
            <p className="text-lg leading-relaxed font-semibold text-slate-900">
              <span className="text-red-500">7 ani.</span> 7 ani mi-au trebuit să descopăr, să testez și să dovedesc drumul unui războinic.
            </p>

            <p className="leading-relaxed">
              În 2016, aveam "totul": cifră de afaceri peste €1M, echipă de 15 oameni, birouri frumoase. 
              Dar realitatea? <span className="text-red-600 font-bold">Burnout total, 105kg, anxietate cronică, soție pe care o vedeam 2 ore pe săptămână</span>.
            </p>

            <p className="leading-relaxed">
              Am ajuns la spital după o criză de anxietate. Doctorii mi-au spus: 
              <span className="text-red-600 font-semibold italic"> "Dacă nu schimbi radical ceva, nu mai ai mult timp."</span> 
              Aveam 32 de ani și eram gata să mor.
            </p>

            <p className="leading-relaxed">
              Am realizat adevărul brutal: <span className="text-slate-900 font-bold">Aveam bani, dar nu aveam VIAȚĂ</span>. 
              Corpul meu se prăbușea. Relația cu soția era moartă. Nu mai simțeam nimic spiritual. 
              Business-ul mergea, dar eu eram o ruină umană.
            </p>

            <p className="leading-relaxed">
              Am refuzat să accept că acesta e sfârșitul. Am început să caut răspunsuri — 
              nu în pastile sau motivație de weekend, ci în <span className="text-primary font-bold">adevăr brutal</span>. 
              Am realizat că problema nu era doar în business. Era în <span className="text-slate-900 font-semibold">TOATE ariile simultan</span> — 
              corp, spirit, relații, afaceri.
            </p>

            <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r">
              <p className="text-slate-900 font-bold mb-2">Rezultatul transformării:</p>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>✓ Am slăbit 30 kg în 4 luni</li>
                <li>✓ De la depresie la putere mentală și claritate</li>
                <li>✓ Business de 5M€+ în 3 ani</li>
                <li>✓ De la relație toxică la căsnicie plină de pasiune</li>
                <li>✓ Tată și soț ghidat de credință</li>
              </ul>
            </div>

            <p className="leading-relaxed">
              <span className="text-primary font-bold">Succesul fără echilibru este doar o altă formă de sărăcie.</span> 
              Poți avea milioane în bancă și totuși să fii în Groapă — deconectat, desensibilizat, distrus pe dinăuntru. 
              Eu am fost acolo. <span className="text-slate-900 font-semibold">Nu mai vreau ca alți bărbați să ajungă unde am fost eu.</span>
            </p>

            <p className="leading-relaxed">
              Am sistematizat tot ce am învățat în cei 7 ani și l-am transformat în Calea Războinicului. 
              Nu pentru că vreau să vând ceva — pentru că <span className="text-slate-900 font-bold">nu am avut pe nimeni care să-mi arate calea când eram în groapă</span>. 
              Și știu durerea asta. <span className="text-green-600 font-bold">Tu ai acum șansa pe care eu nu am avut-o.</span>
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
              <p className="text-slate-900 font-bold">
                Acum sistemul este folosit de 65,000+ bărbați în 40+ de țări. Adaptat pentru piața românească.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
