import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Wallet, RefreshCcw, Shield } from "lucide-react";
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
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          "Dar dacă...?" — Îți Înțeleg Îndoielile
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Și eu am avut aceleași întrebări când eram în groapa ta. Iată ce am învățat.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Obiecția 1: Nu am timp */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6">
                <Clock className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="text-slate-900 text-xl">"Nu am timp să mai adaug ceva nou"</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              <span className="text-slate-900 font-semibold">Te înțeleg perfect.</span> Și eu lucram 14-16 ore pe zi și tot simțeam că nu am timp de nimic.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Adevărul e că <span className="font-semibold">nu e vorba de timp, ci de prioritate</span>. Napoleon Hill Academy nu îți adaugă task-uri — îți elimină haosul. În loc să lucrezi pe 20 de lucruri pe care le uiți, lucrezi pe 3 lucruri clare care contează.
            </p>
            <p className="text-sm text-slate-500 italic border-l-4 border-blue-200 pl-4 py-2">
              Când am început, mi-a luat 30 de minute să îmi planific prima săptămână. La finalul acelei săptămâni, am realizat că am recuperat 8 ore din haos și distracții inutile.
            </p>
          </CardContent>
        </Card>

        {/* Obiecția 2: E prea scump */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 shadow-lg hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 rounded-lg transition-all duration-300 group-hover:bg-green-200 group-hover:scale-110 group-hover:rotate-6">
                <Wallet className="w-7 h-7 text-green-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="text-slate-900 text-xl">"E prea scump pentru mine acum"</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              <span className="text-slate-900 font-semibold">Înțeleg.</span> Și eu am stat luni întregi amânând să investesc în mine pentru că "nu aveam bani".
            </p>
            <p className="text-slate-700 leading-relaxed">
              Dar <span className="font-semibold">cât te costă să rămâi blocat unde ești</span>? Cât te costă să pierzi alte 6 luni lucrând fără claritate? Cât te costă anxietatea de a nu ști dacă mergi în direcția bună?
            </p>
            <p className="text-sm text-slate-500 italic border-l-4 border-green-200 pl-4 py-2">
              Un client mi-a spus: "Am cheltuit mai mult pe cafele și distracții într-o lună decât costă Napoleon Hill Academy. Dar Napoleon Hill Academy mi-a schimbat viața. Cafeaua mi-a dat doar agitație."
            </p>
          </CardContent>
        </Card>

        {/* Obiecția 3: Am încercat altele */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 shadow-lg hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-lg transition-all duration-300 group-hover:bg-purple-200 group-hover:scale-110 group-hover:rotate-6">
                <RefreshCcw className="w-7 h-7 text-purple-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-180" />
              </div>
              <CardTitle className="text-slate-900 text-xl">"Am încercat altele și nu au funcționat"</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              <span className="text-slate-900 font-semibold">Normal să fii sceptic.</span> Și eu am încercat zeci de sisteme, cursuri, coaching-uri. Majoritatea erau teorie fără implementare sau hack-uri fără fundație.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Napoleon Hill Academy nu e un curs. Nu e un tool. <span className="font-semibold">E o cale de viață</span> — un sistem care integrează corp, spirit, relații și business simultan. Nu te învăț trucuri. Te învăț <span className="font-semibold">cum să devii omul care construiește</span> ce visezi.
            </p>
            <p className="text-sm text-slate-500 italic border-l-4 border-purple-200 pl-4 py-2">
              Diferența: celelalte îți spun "ce" să faci. Napoleon Hill Academy te ajută să devii "cine" trebuie să fii pentru a face ce trebuie.
            </p>
          </CardContent>
        </Card>

        {/* Obiecția 4: Nu sunt sigur că funcționează pentru mine */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-lg hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-orange-100 rounded-lg transition-all duration-300 group-hover:bg-orange-200 group-hover:scale-110 group-hover:rotate-6">
                <Shield className="w-7 h-7 text-orange-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardTitle className="text-slate-900 text-xl">"Nu sunt sigur că funcționează pentru mine"</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              <span className="text-slate-900 font-semibold">Perfect. Nici eu nu eram sigur la început.</span> Am stat săptămâni întrebându-mă dacă merită.
            </p>
            <p className="text-slate-700 leading-relaxed">
              De aceea am <span className="font-semibold">garanție de rambursare 90 de zile</span>. Încearcă sistemul. Implementează protocolul. Dacă după 3 luni nu vezi progres în măcar 2 din cele 4 arii, îți returnez banii fără întrebări.
            </p>
            <p className="text-sm text-slate-500 italic border-l-4 border-orange-200 pl-4 py-2">
              Dar dacă funcționează? Dacă în 90 de zile ai mai multă claritate, energie și direcție decât ai avut în ultimii 3 ani? Atunci regretul nu e că ai încercat — e că nu ai încercat mai devreme.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Final Empathetic Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary/30 p-8 max-w-4xl mx-auto mt-12 shadow-xl">
        <p className="text-lg md:text-xl text-slate-900 text-center leading-relaxed mb-4">
          <span className="font-bold">Știu că e greu să ai încredere.</span> Știu că ai fost dezamăgit înainte. Știu că ți-e frică să investești timp și bani și să nu meargă.
        </p>
        <p className="text-base md:text-lg text-slate-600 text-center leading-relaxed">
          Dar întrebarea nu e "Dacă funcționează?" — <span className="text-slate-900 font-semibold">întrebarea e "Când vrei să începi să construiești viața pe care o meriți?"</span> Pentru că fiecare zi amânată e o zi pierdută. Și viața nu se joacă la repeat.
        </p>
      </Card>
    </section>
  );
};
