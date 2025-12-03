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
      className={`mb-12 md:mb-16 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
            Începe acum. Vezi primele rezultate în 48 ore.
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Trial gratuit 3 zile (card necesar). Zero risc. Anulezi oricând în perioada de probă fără nicio taxare.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
            <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center sm:mb-3 shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-left sm:text-center">
                <p className="text-slate-900 font-semibold text-sm sm:text-base mb-0 sm:mb-1">Setup 15 minute</p>
                <p className="text-slate-500 text-xs sm:text-sm">War Plan rapid, apoi execuți</p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center sm:mb-3 shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-left sm:text-center">
                <p className="text-slate-900 font-semibold text-sm sm:text-base mb-0 sm:mb-1">Rezultate în 48h</p>
                <p className="text-slate-500 text-xs sm:text-sm">Claritate + primele victorii</p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center sm:mb-3 shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-left sm:text-center">
                <p className="text-slate-900 font-semibold text-sm sm:text-base mb-0 sm:mb-1">Garanție Zero Risc</p>
                <p className="text-slate-500 text-xs sm:text-sm">Trial 3 zile, anulezi gratuit</p>
              </div>
            </div>
          </div>

          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            onClick={() => navigate('/auth')}
          >
            Începe Trial de 3 Zile
          </Button>

          <p className="text-slate-500 text-xs sm:text-sm mt-4 md:mt-6">
            150+ antreprenori români • Medie +22% profit în Q1 • Trial 3 zile gratuit
          </p>
        </div>
      </div>
    </section>
  );
};