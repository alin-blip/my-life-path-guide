import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, Users, Gift, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const UrgencySection = () => {
  const navigate = useNavigate();
  const [spotsLeft, setSpotsLeft] = useState(47);
  const { elementRef, isVisible } = useScrollAnimation();

  useEffect(() => {
    // Simulate spots decreasing (in production, fetch from backend)
    const interval = setInterval(() => {
      setSpotsLeft(prev => Math.max(1, prev - Math.floor(Math.random() * 2)));
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="urgency"
    >
      <Card className="bg-gradient-to-br from-feminine-primary/20 via-feminine-purple/20 to-feminine-accent/20 border-feminine-primary p-8 md:p-12 relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-feminine-primary/10 to-feminine-purple/10 animate-pulse" />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <Badge className="bg-feminine-accent text-white border-0 mb-4 text-lg px-6 py-2">
              🔥 Ofertă Limitată Founding Members
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Primii 100 de Membri Pro<br />
              Primesc Acces Premium GRATUIT
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Intri în grupul exclusiv de Founding Members și primești beneficii permanente
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            <Card className="bg-background/60 backdrop-blur border-feminine-primary/30 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-feminine-primary/20 rounded-lg">
                  <Users className="h-8 w-8 text-feminine-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Comunitate Privată Founding Members</h3>
                  <p className="text-gray-300 text-sm">
                    Acces exclusiv la grupul de WhatsApp/Telegram cu ceilalți 100 de founderi + sesiuni lunare de Q&A live
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-feminine-primary/30 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-feminine-primary/20 rounded-lg">
                  <Gift className="h-8 w-8 text-feminine-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Stack-uri Premium Lifetime</h3>
                  <p className="text-gray-300 text-sm">
                    Acces GRATUIT pe viață la toate stack-urile premium noi (valoare €97/lună)
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-feminine-primary/30 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-feminine-primary/20 rounded-lg">
                  <Zap className="h-8 w-8 text-feminine-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Implementare Prioritară</h3>
                  <p className="text-gray-300 text-sm">
                    Feature requests-urile tale au prioritate în roadmap + early access la toate update-urile
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-feminine-primary/30 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-feminine-primary/20 rounded-lg">
                  <Clock className="h-8 w-8 text-feminine-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Preț Blocat Pe Viață</h3>
                  <p className="text-gray-300 text-sm">
                    €197/lună pentru totdeauna. Când prețul crește la €297+, tu rămâi la €197
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-destructive/20 border border-destructive rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-3">
              <Clock className="h-8 w-8 text-destructive animate-pulse" />
              <div className="text-center">
                <div className="text-sm text-gray-300 mb-1">Locuri Rămase din 100</div>
                <div className="text-4xl font-bold text-white">{spotsLeft}</div>
              </div>
            </div>
            <p className="text-center text-gray-300 text-sm">
              Când se ocupă toate locurile, beneficiile Founding Members dispar pentru totdeauna
            </p>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-feminine-accent via-feminine-primary to-feminine-purple hover:from-feminine-primary hover:to-feminine-accent text-white px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-feminine-primary/50 transition-all hover:scale-105"
            >
              Vreau Să Fiu Founding Member — Trial 3 Zile GRATUIT
            </Button>
            <p className="text-sm text-gray-400 mt-4">
              Nu plătești nimic acum. Trial 3 zile să vezi dacă îți place. Anulezi oricând.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
