import { motion } from 'framer-motion';
import { Play, ArrowRight, CheckCircle, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WarriorPowerLandingProps {
  onStart: () => void;
}

export function WarriorPowerLanding({ onStart }: WarriorPowerLandingProps) {
  const benefits = [
    { icon: Target, text: 'Descoperă realitatea ta actuală în cele 4 dimensiuni ale vieții' },
    { icon: Zap, text: 'Identifică zonele care te țin pe loc și te sabotează' },
    { icon: TrendingUp, text: 'Primește un plan personalizat de transformare' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Montserrat',sans-serif]">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 md:py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-white" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-destructive/20 text-destructive text-xs sm:text-sm font-medium">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              EVALUARE GRATUITĂ
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2"
          >
            ADEVĂRUL PE CARE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-primary">
              NU ÎL VEZI
            </span>
            <br />
            TE COSTĂ!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-2"
          >
            Descoperă-ți puterea reală în 5 minute. Acest assessment îți va arăta 
            exact unde te afli în cele 4 dimensiuni esențiale ale vieții tale.
          </motion.p>

          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl"
          >
            <div className="aspect-video">
              <iframe
                src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=V1yuGZIFwCmEzEQEyResQM-axg8QlAqtG0HmWD3iDmbLWn0JJ&videoRatio=1.777778&type=v&skinColor=%232758EB" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                width="100%" 
                height="100%"
                className="rounded-xl sm:rounded-2xl"
              />
            </div>
          </motion.div>

          {/* CTA Button after video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 sm:mb-8 px-2"
          >
            <Button
              size="lg"
              onClick={onStart}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base sm:text-lg md:text-xl px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-7 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto min-h-[52px]"
            >
              Începe Evaluarea Gratuită
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              ⏱️ Durează doar 5 minute • 100% Gratuit
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Cum funcționează</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Un proces simplu în 3 pași pentru a-ți descoperi realitatea
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {[
              { step: 1, title: 'Evaluează-te sincer', desc: 'Răspunde la 8 întrebări despre cele 4 dimensiuni ale vieții tale' },
              { step: 2, title: 'Primești scorul', desc: 'Vezi imediat unde te afli: adormit, treaz, activ sau accelerat' },
              { step: 3, title: 'Începe transformarea', desc: 'Primești un plan personalizat pentru următorii pași' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Dimensions */}
      <section className="py-10 sm:py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Cele 4 dimensiuni</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Fiecare dimensiune are un impact profund asupra vieții tale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { icon: '💪', name: 'CORPUL', desc: 'Fitness și alimentație - fundamentul energiei tale fizice', color: 'from-red-500/20 to-red-500/5' },
              { icon: '🧘', name: 'FIINȚA', desc: 'Conexiune spirituală și certitudine - puterea ta interioară', color: 'from-purple-500/20 to-purple-500/5' },
              { icon: '⚖️', name: 'ECHILIBRU', desc: 'Relații și familie - legăturile care te susțin', color: 'from-blue-500/20 to-blue-500/5' },
              { icon: '💼', name: 'BUSINESS', desc: 'Mecanică și bani - prosperitatea ta materială', color: 'from-green-500/20 to-green-500/5' }
            ].map((dim, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${dim.color} border border-gray-200`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-3xl sm:text-4xl">{dim.icon}</span>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">{dim.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{dim.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & CTA */}
      <section className="py-10 sm:py-12 md:py-16 px-4 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 sm:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ce vei primi</h2>
            <div className="space-y-3 sm:space-y-4">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start sm:items-center gap-2 sm:gap-3 justify-start sm:justify-center text-left sm:text-center px-2"
                >
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-sm sm:text-base">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="px-2"
          >
            <Button
              size="lg"
              onClick={onStart}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base sm:text-lg md:text-xl px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-7 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto min-h-[52px]"
            >
              Începe Evaluarea Gratuită
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              ⏱️ Durează doar 5 minute • 100% Gratuit
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
