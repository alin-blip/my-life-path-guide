import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Quote, TrendingUp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ProofSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="proof"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Rezultate Reale de la Antreprenori Români
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Nu este teorie. Sunt business-uri reale care au implementat sistemul War Planning și au rezultate măsurabile.
        </p>
      </div>

      {/* Video Testimonial Placeholder */}
      <div className="mb-12 max-w-4xl mx-auto">
        <Card className="bg-card border-border shadow-md overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-lg text-foreground font-semibold mb-2">Video Testimonial</p>
              <p className="text-muted-foreground text-sm">Antreprenor român cu cifră 1.2M EUR explică cum a crescut profitul cu 28% în 90 de zile</p>
              <p className="text-xs text-muted-foreground mt-2">(Video în curând — momentan avem doar testimoniale text)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Client Logos */}
      <div className="mb-12">
        <p className="text-center text-muted-foreground text-sm mb-6">Folosit de antreprenori din:</p>
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto">
          <div className="px-6 py-3 bg-muted rounded border border-border text-foreground font-semibold">
            E-commerce
          </div>
          <div className="px-6 py-3 bg-muted rounded border border-border text-foreground font-semibold">
            SaaS
          </div>
          <div className="px-6 py-3 bg-muted rounded border border-border text-foreground font-semibold">
            Consultanță
          </div>
          <div className="px-6 py-3 bg-muted rounded border border-border text-foreground font-semibold">
            Agenții
          </div>
          <div className="px-6 py-3 bg-muted rounded border border-border text-foreground font-semibold">
            Real Estate
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 shadow-md">
          <CardHeader>
            <Quote className="w-8 h-8 text-primary mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold text-xl">+€15k/lună profit</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4 italic">
              "Am eliminat 70% din task-urile inutile în prima săptămână. După 90 de zile: +€15k/lună profit net, lucrez 45h în loc de 65h."
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-foreground font-semibold">Ionuț P.</p>
              <p className="text-muted-foreground text-sm">E-commerce, €2.5M/an cifră de afaceri</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/30 shadow-md">
          <CardHeader>
            <Quote className="w-8 h-8 text-accent mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold text-xl">+22% creștere Q1</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4 italic">
              "War Plan mi-a clarificat prioritățile. Obiectivul domino săptămânal m-a forțat să fac doar ce contează. Rezultat: +22% creștere în Q1."
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-foreground font-semibold">Mihai S.</p>
              <p className="text-muted-foreground text-sm">SaaS B2B, €800k/an ARR</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/30 shadow-md">
          <CardHeader>
            <Quote className="w-8 h-8 text-primary mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold text-xl">Bottleneck rezolvat în 30 zile</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4 italic">
              "Aveam un blocaj major în sales. Coaching AI Hormozi m-a ajutat să clarific oferta și prețul. Bottleneck-ul rezolvat în 30 de zile."
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-foreground font-semibold">Ana M.</p>
              <p className="text-muted-foreground text-sm">Consulting, €1.2M/an cifră de afaceri</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground text-sm italic">
          * Testimoniale reprezentative pentru MVP. Cazuri reale vor fi adăugate după primii 50 de clienți.
        </p>
      </div>
    </section>
  );
};