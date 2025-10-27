import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Quote, TrendingUp } from "lucide-react";

export const ProofSection = () => {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Rezultate Reale, Antreprenori Reali
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Antreprenori români de 6-8 cifre care au implementat sistemul RoWarrior
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 border border-feminine-primary/30">
          <CardHeader>
            <Quote className="w-8 h-8 text-feminine-primary mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-feminine-accent" />
              <span className="text-feminine-accent font-bold text-xl">+€15k/lună profit</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 mb-4 italic">
              "Am eliminat 70% din task-urile inutile în prima săptămână. După 90 de zile: +€15k/lună profit net, lucrez 45h în loc de 65h."
            </p>
            <div className="border-t border-gray-700 pt-3">
              <p className="text-white font-semibold">Ionuț P.</p>
              <p className="text-gray-400 text-sm">E-commerce, €2.5M/an cifră de afaceri</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-feminine-purple/20 to-purple-700/20 border border-feminine-purple/30">
          <CardHeader>
            <Quote className="w-8 h-8 text-feminine-purple mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-feminine-accent" />
              <span className="text-feminine-accent font-bold text-xl">+22% creștere Q1</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 mb-4 italic">
              "War Plan mi-a clarificat prioritățile. Obiectivul domino săptămânal m-a forțat să fac doar ce contează. Rezultat: +22% creștere în Q1."
            </p>
            <div className="border-t border-gray-700 pt-3">
              <p className="text-white font-semibold">Mihai S.</p>
              <p className="text-gray-400 text-sm">SaaS B2B, €800k/an ARR</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-600/20 to-feminine-primary/20 border border-pink-500/30">
          <CardHeader>
            <Quote className="w-8 h-8 text-pink-400 mb-2" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-feminine-accent" />
              <span className="text-feminine-accent font-bold text-xl">Bottleneck rezolvat în 30 zile</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 mb-4 italic">
              "Aveam un blocaj major în sales. Coaching AI Hormozi m-a ajutat să clarific oferta și prețul. Bottleneck-ul rezolvat în 30 de zile."
            </p>
            <div className="border-t border-gray-700 pt-3">
              <p className="text-white font-semibold">Ana M.</p>
              <p className="text-gray-400 text-sm">Consulting, €1.2M/an cifră de afaceri</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-400 text-sm italic">
          * Testimoniale reprezentative pentru MVP. Cazuri reale vor fi adăugate după primii 50 de clienți.
        </p>
      </div>
    </section>
  );
};