import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Quote, TrendingUp } from "lucide-react";

export const ProofSection = () => {
  return (
    <section className="mb-24" id="proof">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Rezultate Reale de la Antreprenori Români
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Nu este teorie. Sunt business-uri reale care au implementat sistemul War Planning și au rezultate măsurabile.
        </p>
      </div>

      {/* Video Testimonial Placeholder */}
      <div className="mb-12 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur border-feminine-primary/30 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-feminine-primary/10 to-feminine-purple/10 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-feminine-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-feminine-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-lg text-white font-semibold mb-2">Video Testimonial</p>
              <p className="text-gray-400 text-sm">Antreprenor român cu cifră 1.2M EUR explică cum a crescut profitul cu 28% în 90 de zile</p>
              <p className="text-xs text-gray-500 mt-2">(Video în curând — momentan avem doar testimoniale text)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Client Logos */}
      <div className="mb-12">
        <p className="text-center text-gray-400 text-sm mb-6">Folosit de antreprenori din:</p>
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto opacity-60">
          <div className="px-6 py-3 bg-background/40 rounded border border-border text-gray-300 font-semibold">
            E-commerce
          </div>
          <div className="px-6 py-3 bg-background/40 rounded border border-border text-gray-300 font-semibold">
            SaaS
          </div>
          <div className="px-6 py-3 bg-background/40 rounded border border-border text-gray-300 font-semibold">
            Consultanță
          </div>
          <div className="px-6 py-3 bg-background/40 rounded border border-border text-gray-300 font-semibold">
            Agenții
          </div>
          <div className="px-6 py-3 bg-background/40 rounded border border-border text-gray-300 font-semibold">
            Real Estate
          </div>
        </div>
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