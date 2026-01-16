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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 text-destructive text-sm font-medium">
              <Zap className="h-4 w-4" />
              EVALUARE GRATUITĂ
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
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
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Descoperă-ți Puterea Reală în 5 minute. Acest assessment îți va arăta 
            exact unde te afli în cele 4 dimensiuni esențiale ale vieții tale.
          </motion.p>

          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="aspect-video">
              <iframe
                src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=V1yuGZIFwCmEzEQEyResQM-axg8QlAqtG0HmWD3iDmbLWn0JJ&videoRatio=1.777778&type=v&skinColor=%232758EB" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                width="100%" 
                height="100%"
                className="rounded-2xl"
              />
            </div>
          </motion.div>

          {/* CTA Button after video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Button
              size="lg"
              onClick={onStart}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-xl px-10 py-7 shadow-lg hover:shadow-xl transition-all"
            >
              Începe Evaluarea Gratuită
              <ArrowRight className="h-6 w-6" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ⏱️ Durează doar 5 minute • 100% Gratuit
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Cum Funcționează</h2>
            <p className="text-muted-foreground">
              Un proces simplu în 3 pași pentru a-ți descoperi realitatea
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { step: 1, title: 'Evaluează-te Sincer', desc: 'Răspunde la 8 întrebări despre cele 4 dimensiuni ale vieții tale' },
              { step: 2, title: 'Primești Scorul', desc: 'Vezi imediat unde te afli: Adormit, Treaz, Activ sau Accelerat' },
              { step: 3, title: 'Începe Transformarea', desc: 'Primești un plan personalizat pentru următorii pași' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Dimensions */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Cele 4 Dimensiuni</h2>
            <p className="text-muted-foreground">
              Fiecare dimensiune are un impact profund asupra vieții tale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '💪', name: 'CORPUL', desc: 'Fitness și Alimentație - Fundamentul energiei tale fizice', color: 'from-red-500/20 to-red-500/5' },
              { icon: '🧘', name: 'FIINȚA', desc: 'Conexiune Spirituală și Certitudine - Puterea ta interioară', color: 'from-purple-500/20 to-purple-500/5' },
              { icon: '⚖️', name: 'ECHILIBRU', desc: 'Relații și Familie - Legăturile care te susțin', color: 'from-blue-500/20 to-blue-500/5' },
              { icon: '💼', name: 'BUSINESS', desc: 'Mecanică și Bani - Prosperitatea ta materială', color: 'from-green-500/20 to-green-500/5' }
            ].map((dim, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${dim.color} border border-border/50`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{dim.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{dim.name}</h3>
                    <p className="text-sm text-muted-foreground">{dim.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-6">Ce Vei Primi</h2>
            <div className="space-y-4">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 justify-center"
                >
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={onStart}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-xl px-10 py-7 shadow-lg hover:shadow-xl transition-all"
            >
              Începe Evaluarea Gratuită
              <ArrowRight className="h-6 w-6" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ⏱️ Durează doar 5 minute • 100% Gratuit
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
