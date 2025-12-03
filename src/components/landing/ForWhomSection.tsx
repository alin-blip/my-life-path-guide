import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const idealFor = [
  "Vrei să ai TOTUL — nu doar bani, ci și sănătate, relații, pace interioară",
  "Ești dispus să te confrunți cu adevărul despre viața ta",
  "Vrei un sistem structurat, nu motivație de weekend",
  "Înțelegi că schimbarea cere timp, energie și angajament",
  "Vrei să lași o moștenire copiilor tăi — un exemplu de bărbat complet"
];

const notFor = [
  "Cauți o soluție rapidă sau un 'hack' magic",
  "Nu ești dispus să faci munca zilnică",
  "Vrei doar bani, fără echilibru în corp, relații sau spirit",
  "Crezi că deja știi totul și nu ai nevoie de un sistem",
  "Nu ești dispus să spui adevărul despre unde ești acum"
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
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          RoWarrior Este Pentru Tine?
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Fii sincer cu tine: dacă te regăsești în coloana din stânga, e făcut pentru tine.
          Dacă ești în coloana din dreapta, <span className="text-primary font-bold">încă</span> nu e momentul potrivit.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Pentru Cine Este */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <h3 className="text-2xl font-bold text-slate-900">RoWarrior ESTE pentru tine dacă:</h3>
          </div>
          <ul className="space-y-4">
            {idealFor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-slate-700">
              <span className="font-bold">Pe scurt:</span> Vrei să ai un corp sănătos, relații puternice, claritate spirituală ȘI un business profitabil — și ești gata să urmezi un sistem complet.
            </p>
          </div>
        </Card>

        {/* Pentru Cine NU Este */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="text-2xl font-bold text-slate-900">RoWarrior NU este pentru tine dacă:</h3>
          </div>
          <ul className="space-y-4">
            {notFor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
            <p className="text-sm text-slate-700">
              <span className="font-bold">Pe scurt:</span> Dacă vrei doar bani fără echilibru sau cauți soluții rapide fără efort, RoWarrior nu este pentru tine. Revino când ești pregătit pentru transformare completă.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Dacă te regăsești în coloana verde, începe trial-ul gratuit. Dacă ești în roșu, salvează pagina și revino când ești pregătit.
          <span className="block mt-2 text-green-600 font-semibold">RoWarrior funcționează doar pentru cei care sunt gata să se transforme cu adevărat.</span>
        </p>
      </div>
    </div>
  );
};
