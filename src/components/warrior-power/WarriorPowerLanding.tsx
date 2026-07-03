import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

interface WarriorPowerLandingProps {
  onStart: () => void;
}

const COPY = {
  ro: {
    badge: 'EVALUARE GRATUITĂ',
    h1a: 'ADEVĂRUL PE CARE',
    h1b: 'NU ÎL VEZI',
    h1c: 'TE COSTĂ!',
    sub: 'Descoperă-ți puterea reală în 5 minute. Acest assessment îți va arăta exact unde te afli în cele 4 dimensiuni esențiale ale vieții tale.',
    cta: 'Începe Evaluarea Gratuită',
    ctaNote: '⏱️ Durează doar 5 minute • 100% Gratuit',
    howTitle: 'Cum funcționează',
    howSub: 'Un proces simplu în 3 pași pentru a-ți descoperi realitatea',
    steps: [
      { title: 'Evaluează-te sincer', desc: 'Răspunde la 8 întrebări despre cele 4 dimensiuni ale vieții tale' },
      { title: 'Primești scorul', desc: 'Vezi imediat unde te afli: adormit, treaz, activ sau accelerat' },
      { title: 'Începe transformarea', desc: 'Primești un plan personalizat pentru următorii pași' },
    ],
    dimTitle: 'Cele 4 dimensiuni',
    dimSub: 'Fiecare dimensiune are un impact profund asupra vieții tale',
    dims: [
      { icon: '💪', name: 'CORPUL', desc: 'Fitness și alimentație - fundamentul energiei tale fizice' },
      { icon: '🧘', name: 'FIINȚA', desc: 'Conexiune spirituală și certitudine - puterea ta interioară' },
      { icon: '⚖️', name: 'ECHILIBRU', desc: 'Relații și familie - legăturile care te susțin' },
      { icon: '💼', name: 'BUSINESS', desc: 'Mecanică și bani - prosperitatea ta materială' },
    ],
    benTitle: 'Ce vei primi',
    benefits: [
      'Descoperă realitatea ta actuală în cele 4 dimensiuni ale vieții',
      'Identifică zonele care te țin pe loc și te sabotează',
      'Primește un plan personalizat de transformare',
    ],
  },
  en: {
    badge: 'FREE ASSESSMENT',
    h1a: 'THE TRUTH YOU',
    h1b: "DON'T SEE",
    h1c: 'IS COSTING YOU!',
    sub: 'Discover your real power in 5 minutes. This assessment will show you exactly where you stand across the 4 essential dimensions of your life.',
    cta: 'Start the Free Assessment',
    ctaNote: '⏱️ Takes just 5 minutes • 100% Free',
    howTitle: 'How it works',
    howSub: 'A simple 3-step process to uncover your reality',
    steps: [
      { title: 'Rate yourself honestly', desc: 'Answer 8 questions about the 4 dimensions of your life' },
      { title: 'Get your score', desc: 'Instantly see where you stand: asleep, awake, active, or accelerated' },
      { title: 'Begin your transformation', desc: 'Get a personalized plan for your next steps' },
    ],
    dimTitle: 'The 4 dimensions',
    dimSub: 'Each dimension has a profound impact on your life',
    dims: [
      { icon: '💪', name: 'BODY', desc: 'Fitness and nutrition — the foundation of your physical energy' },
      { icon: '🧘', name: 'BEING', desc: 'Spiritual connection and certainty — your inner power' },
      { icon: '⚖️', name: 'BALANCE', desc: 'Relationships and family — the bonds that hold you up' },
      { icon: '💼', name: 'BUSINESS', desc: 'Craft and money — your material prosperity' },
    ],
    benTitle: 'What you get',
    benefits: [
      'See your current reality across the 4 dimensions of life',
      'Identify what keeps you stuck and sabotages you',
      'Get a personalized transformation plan',
    ],
  },
} as const;

export function WarriorPowerLanding({ onStart }: WarriorPowerLandingProps) {
  const { language } = useLanguage();
  const t = COPY[language === 'en' ? 'en' : 'ro'];
  const benefitIcons = [Target, Zap, TrendingUp];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Montserrat',sans-serif]">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

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
              {t.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2"
          >
            {t.h1a}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-primary">
              {t.h1b}
            </span>
            <br />
            {t.h1c}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-2"
          >
            {t.sub}
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
              {t.cta}
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              {t.ctaNote}
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t.howTitle}</h2>
            <p className="text-sm sm:text-base text-gray-700">{t.howSub}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {t.steps.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary">{idx + 1}</span>
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t.dimTitle}</h2>
            <p className="text-sm sm:text-base text-gray-700">{t.dimSub}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {t.dims.map((dim, idx) => {
              const colors = ['from-red-500/20 to-red-500/5', 'from-purple-500/20 to-purple-500/5', 'from-blue-500/20 to-blue-500/5', 'from-green-500/20 to-green-500/5'];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors[idx]} border border-gray-200`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-3xl sm:text-4xl">{dim.icon}</span>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg mb-1">{dim.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{dim.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t.benTitle}</h2>
            <div className="space-y-3 sm:space-y-4">
              {t.benefits.map((text, idx) => {
                const Icon = benefitIcons[idx];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start sm:items-center gap-2 sm:gap-3 justify-start sm:justify-center text-left sm:text-center px-2"
                  >
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-sm sm:text-base">{text}</span>
                  </motion.div>
                );
              })}
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
              {t.cta}
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              {t.ctaNote}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
