import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ValueStackPricing = () => {
  const navigate = useNavigate();
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section 
      ref={elementRef}
      id="pricing" 
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Ce pierzi în viață fără Calea Războinicului?
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Nu e doar despre bani. Pierzi <span className="text-accent font-bold">sănătate, relații, claritate spirituală și prosperitate</span>. Costul real? Imposibil de calculat.
        </p>
      </div>

      {/* Value Stack pentru Pro */}
      <div className="max-w-2xl mx-auto mb-12">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary shadow-xl">
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-2 bg-accent text-white font-bold">Cel mai popular</Badge>
            <CardTitle className="text-4xl font-bold text-foreground">Plan Pro</CardTitle>
            <div className="flex items-baseline justify-center gap-2 mt-4">
              <span className="text-5xl font-bold text-foreground">197 LEI</span>
              <span className="text-muted-foreground">/ lună</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-400 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Transformare în Toate Cele 4 Arii</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-800">💪 Body: Energie + Sănătate</span>
                  <span className="text-accent font-bold">Nepretuit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-800">🙏 Spirit: Claritate + Scop</span>
                  <span className="text-accent font-bold">Nepretuit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-800">❤️ Relații: Conexiune + Pace</span>
                  <span className="text-accent font-bold">Nepretuit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-800">💼 Business: +15-30% profit</span>
                  <span className="text-accent font-bold">€25k-€150k/trimestru</span>
                </div>
                <div className="border-t-2 border-green-400 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-900 font-bold text-lg">Investiție RoWarrior Pro</span>
                    <span className="text-green-900 font-bold text-lg">197 LEI/lună</span>
                  </div>
                  <p className="text-green-600 text-sm mt-2 text-right font-semibold">
                    Doar partea de Business se plătește singur în prima săptămână
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-foreground">Cele 5 Protocoale ale Războinicului (Code, Stack, Core 4, Door, Game)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-foreground">Harta Realității + Jocul Imposibil pentru toate cele 4 arii de viață</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-foreground">War Planning System pentru execuție focusată și claritate săptămânală</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-foreground">AI Coaching multi-dimensional pentru transformare holistica</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-foreground">Stack Library (protocoale ghidate pentru fiecare arie)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-foreground">Tracking complet în Corp, Spirit, Relații și Business</span>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 mb-6 border-2 border-primary/30">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-accent shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-foreground mb-2">Garanție 90 de Zile sau Banii Înapoi + €100</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-semibold text-accent">Trial 3 zile GRATUIT</span> ca să testezi sistemul.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dacă după 90 de zile nu ai văzut cel puțin 10% îmbunătățire măsurabilă în profit sau productivitate, 
                    îți returnăm toți banii + €100 pentru timpul tău pierdut. <span className="font-semibold">Zero risc.</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white text-lg py-6 font-bold"
              onClick={() => navigate('/pricing')}
            >
              Începe Trial de 3 Zile (Card Necesar)
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/pricing')}
          className="border-primary text-primary hover:bg-primary hover:text-white font-semibold"
        >
          Vezi toate planurile și comparația completă
        </Button>
      </div>
    </section>
  );
};