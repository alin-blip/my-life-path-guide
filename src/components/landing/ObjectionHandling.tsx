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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          "Dar dacă...?" — Îți Înțeleg Îndoielile
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Și eu am avut aceleași întrebări când eram în groapa ta. Iată ce am învățat.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Obiecția 1: Nu am timp */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-foreground text-xl">"Nu am timp să mai adaug ceva nou"</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Te înțeleg perfect.</span> Și eu lucram 14-16 ore pe zi și tot simțeam că nu am timp de nimic.
            </p>
            <p className="text-foreground leading-relaxed">
              Adevărul e că <span className="font-semibold">nu e vorba de timp, ci de prioritate</span>. RoWarrior nu îți adaugă task-uri — îți elimină haosul. În loc să lucrezi pe 20 de lucruri pe care le uiți, lucrezi pe 3 lucruri clare care contează.
            </p>
            <p className="text-sm text-muted-foreground italic border-l-4 border-primary/30 pl-4 py-2">
              Când am început, mi-a luat 30 de minute să îmi planific prima săptămână. La finalul acelei săptămâni, am realizat că am recuperat 8 ore din haos și distracții inutile.
            </p>
          </CardContent>
        </Card>

        {/* Obiecția 2: E prea scump */}
        <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Wallet className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-foreground text-xl">"E prea scump pentru mine acum"</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Înțeleg.</span> Și eu am stat luni întregi amânând să investesc în mine pentru că "nu aveam bani".
            </p>
            <p className="text-foreground leading-relaxed">
              Dar <span className="font-semibold">cât te costă să rămâi blocat unde ești</span>? Cât te costă să pierzi alte 6 luni lucrând fără claritate? Cât te costă anxietatea de a nu ști dacă mergi în direcția bună?
            </p>
            <p className="text-sm text-muted-foreground italic border-l-4 border-accent/30 pl-4 py-2">
              Un client mi-a spus: "Am cheltuit mai mult pe cafele și distracții într-o lună decât costă RoWarrior. Dar RoWarrior mi-a schimbat viața. Cafeaua mi-a dat doar agitație."
            </p>
          </CardContent>
        </Card>

        {/* Obiecția 3: Am încercat altele */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <RefreshCcw className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-foreground text-xl">"Am încercat altele și nu au funcționat"</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Normal să fii sceptic.</span> Și eu am încercat zeci de sisteme, cursuri, coaching-uri. Majoritatea erau teorie fără implementare sau hack-uri fără fundație.
            </p>
            <p className="text-foreground leading-relaxed">
              RoWarrior nu e un curs. Nu e un tool. <span className="font-semibold">E o cale de viață</span> — un sistem care integrează corp, spirit, relații și business simultan. Nu te învăț trucuri. Te învăț <span className="font-semibold">cum să devii omul care construiește</span> ce visezi.
            </p>
            <p className="text-sm text-muted-foreground italic border-l-4 border-primary/30 pl-4 py-2">
              Diferența: celelalte îți spun "ce" să faci. RoWarrior te ajută să devii "cine" trebuie să fii pentru a face ce trebuie.
            </p>
          </CardContent>
        </Card>

        {/* Obiecția 4: Nu sunt sigur că funcționează pentru mine */}
        <Card className="bg-gradient-to-br from-accent/5 to-primary/10 border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Shield className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-foreground text-xl">"Nu sunt sigur că funcționează pentru mine"</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Perfect. Nici eu nu eram sigur la început.</span> Am stat săptămâni întrebându-mă dacă merită.
            </p>
            <p className="text-foreground leading-relaxed">
              De aceea am <span className="font-semibold">garanție de rambursare 90 de zile</span>. Încearcă sistemul. Implementează protocolul. Dacă după 3 luni nu vezi progres în măcar 2 din cele 4 arii, îți returnez banii fără întrebări.
            </p>
            <p className="text-sm text-muted-foreground italic border-l-4 border-accent/30 pl-4 py-2">
              Dar dacă funcționează? Dacă în 90 de zile ai mai multă claritate, energie și direcție decât ai avut în ultimii 3 ani? Atunci regretul nu e că ai încercat — e că nu ai încercat mai devreme.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Final Empathetic Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 p-8 max-w-4xl mx-auto mt-12 shadow-xl">
        <p className="text-lg md:text-xl text-foreground text-center leading-relaxed mb-4">
          <span className="font-bold">Știu că e greu să ai încredere.</span> Știu că ai fost dezamăgit înainte. Știu că ți-e frică să investești timp și bani și să nu meargă.
        </p>
        <p className="text-base md:text-lg text-muted-foreground text-center leading-relaxed">
          Dar întrebarea nu e "Dacă funcționează?" — <span className="text-foreground font-semibold">întrebarea e "Când vrei să începi să construiești viața pe care o meriți?"</span> Pentru că fiecare zi amânată e o zi pierdută. Și viața nu se joacă la repeat.
        </p>
      </Card>
    </section>
  );
};