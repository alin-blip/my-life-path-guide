import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const FinalCTA = () => {
  const navigate = useNavigate();
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section 
      ref={elementRef}
      className={`mb-16 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-feminine-primary/30 to-feminine-purple/30 border-2 border-feminine-primary rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Începe acum. Vezi primele rezultate în 48 ore.
          </h2>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Trial gratuit 3 zile (card necesar). Zero risc. Anulezi oricând în perioada de probă fără nicio taxare.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-feminine-primary/20 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-feminine-primary" />
              </div>
              <p className="text-white font-semibold mb-1">Setup 15 minute</p>
              <p className="text-gray-300 text-sm">War Plan rapid, apoi execuți</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-feminine-purple/20 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-feminine-purple" />
              </div>
              <p className="text-white font-semibold mb-1">Rezultate în 48h</p>
              <p className="text-gray-300 text-sm">Claritate + primele victorii</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-feminine-accent/20 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-feminine-accent" />
              </div>
              <p className="text-white font-semibold mb-1">Garanție Zero Risc</p>
              <p className="text-gray-300 text-sm">Trial 3 zile, anulezi gratuit</p>
            </div>
          </div>

          <Button 
            size="lg"
            className="bg-gradient-to-r from-feminine-primary to-feminine-purple hover:from-feminine-accent hover:to-feminine-purple text-white px-12 py-6 text-xl font-bold"
            onClick={() => navigate('/auth')}
          >
            Începe Trial de 3 Zile
          </Button>

          <p className="text-gray-400 text-sm mt-6">
            150+ antreprenori români • Medie +22% profit în Q1 • Trial 3 zile gratuit
          </p>
        </div>
      </div>
    </section>
  );
};