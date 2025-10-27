import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ValueStackPricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Câți bani pierzi săptămâna asta fără RoWarrior?
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Dacă faci €1M/an și pierzi 50% din timp pe low-value work... <span className="text-feminine-accent font-bold">pierzi €500k/an</span>.
        </p>
      </div>

      {/* Value Stack pentru Pro */}
      <div className="max-w-2xl mx-auto mb-12">
        <Card className="bg-gradient-to-br from-feminine-primary/30 to-feminine-purple/30 border-2 border-feminine-primary">
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-2 bg-feminine-accent">Cel mai popular</Badge>
            <CardTitle className="text-4xl font-bold text-white">Plan Pro</CardTitle>
            <div className="flex items-baseline justify-center gap-2 mt-4">
              <span className="text-5xl font-bold text-white">197 LEI</span>
              <span className="text-gray-300">/ lună</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-green-900/40 to-green-700/40 border border-green-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">ROI Calculation</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Economisești 20h/săptămână</span>
                  <span className="text-feminine-accent font-bold">€5k-€20k/lună</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Crești profit cu 15-30%</span>
                  <span className="text-feminine-accent font-bold">€25k-€150k/trimestru</span>
                </div>
                <div className="border-t border-green-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">Cost RoWarrior Pro</span>
                    <span className="text-white font-bold text-lg">197 LEI/lună</span>
                  </div>
                  <p className="text-green-400 text-sm mt-2 text-right font-semibold">
                    Se plătește singur în prima săptămână
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-white font-semibold mb-3">Primești:</p>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
                <span className="text-gray-200">War Plan pe o pagină — viziune €10M → task-ul de azi</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
                <span className="text-gray-200">1 obiectiv domino săptămânal + 3-5 KPI esențiali</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
                <span className="text-gray-200">1-3 task-uri high-ROI pe zi — zero time waste</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
                <span className="text-gray-200">Coaching AI tip Hormozi pentru ofertă și preț</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
                <span className="text-gray-200">Sprint de 90 de zile cu obiective și checkpoint-uri</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
                <span className="text-gray-200">Template-uri, playbook-uri și checklists de implementare</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/40 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">Garanție Zero Risc</p>
                  <p className="text-gray-200 text-sm">
                    Trial 3 zile gratuit. Vezi rezultate în 48h sau anulezi fără nicio taxare.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-feminine-primary to-feminine-purple hover:from-feminine-accent hover:to-feminine-purple text-white text-lg py-6"
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
          className="border-feminine-primary text-white hover:bg-feminine-primary/20"
        >
          Vezi toate planurile și comparația completă
        </Button>
      </div>
    </section>
  );
};