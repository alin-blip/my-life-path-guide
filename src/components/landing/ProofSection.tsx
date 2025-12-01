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
          Transformări Reale în Toate Cele 4 Arii
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Nu este teorie. Sunt antreprenori români care au parcurs Calea Războinicului și au rezultate măsurabile în Corp, Spirit, Relații și Business.
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
              <p className="text-muted-foreground text-sm">Antreprenor român explică transformarea completă: de la burnout la echilibru în Corp, Relații, Spirit și Business</p>
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
              <span className="text-accent font-bold text-xl">Toate cele 4 arii</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4 italic">
              "În 90 de zile: am slăbit 12kg, m-am împăcat cu soția, am claritate spirituală și profit +€15k/lună. Calea Războinicului mi-a arătat că nu trebuie să sacrific nimic pentru business."
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-foreground font-semibold">Ionuț P.</p>
              <p className="text-muted-foreground text-sm">E-commerce, 42 ani, căsătorit</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/30 shadow-md">
          <CardHeader>
            <Quote className="w-8 h-8 text-accent mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold text-xl">De la burnout la claritate</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4 italic">
              "Eram epuizat total. Calea Războinicului m-a ajutat să-mi reconstruiesc corpul, să mă reconectez spiritual, să-mi repar căsnicia și să cresc business-ul cu +22% în Q1. Acum am TOTUL."
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-foreground font-semibold">Mihai S.</p>
              <p className="text-muted-foreground text-sm">SaaS B2B, 38 ani, 2 copii</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/30 shadow-md">
          <CardHeader>
            <Quote className="w-8 h-8 text-primary mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold text-xl">Relații + Business împreună</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4 italic">
              "Credeam că trebuie să aleg între familie și business. Protocolul Balance mi-a arătat că pot avea ambele. Acum familia mă susține și business-ul crește natural."
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-foreground font-semibold">Ana M.</p>
              <p className="text-muted-foreground text-sm">Consulting, 35 ani, mamă</p>
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