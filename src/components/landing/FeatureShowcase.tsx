import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FeatureShowcase = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const features = language === 'ro' 
    ? [
        'Sistem AI care învață din comportamentul tău',
        'Rutine personalizate pentru fiecare etapă',
        'Feedback în timp real și ajustări automate',
        'Integrare completă între toate cele 4 arii',
      ]
    : [
        'AI system that learns from your behavior',
        'Personalized routines for every stage',
        'Real-time feedback and automatic adjustments',
        'Complete integration across all 4 areas',
      ];

  return (
    <section className="n8n-section relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute w-full h-full opacity-5" viewBox="0 0 1000 1000">
          {/* Circuit lines */}
          {[...Array(20)].map((_, i) => (
            <line
              key={i}
              x1={Math.random() * 1000}
              y1={Math.random() * 1000}
              x2={Math.random() * 1000}
              y2={Math.random() * 1000}
              stroke="currentColor"
              strokeWidth="1"
              className="circuit-line"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
          {/* Dots */}
          {[...Array(30)].map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 1000}
              cy={Math.random() * 1000}
              r="3"
              fill="currentColor"
              className="opacity-30"
            />
          ))}
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {language === 'ro' ? 'Execută.' : 'Execute.'}{' '}
              {language === 'ro' ? 'Ajustează.' : 'Adjust.'}{' '}
              <span className="n8n-gradient-text">
                {language === 'ro' ? 'Repetă.' : 'Repeat.'}
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              {language === 'ro'
                ? 'WarriorOS învață din fiecare acțiune pe care o faci. Cu cât îl folosești mai mult, cu atât devine mai bun la a te ghida către obiectivele tale.'
                : 'WarriorOS learns from every action you take. The more you use it, the better it gets at guiding you towards your goals.'}
            </p>
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
            
            <Button 
              onClick={() => navigate('/auth')}
              className="n8n-glow-button text-white"
            >
              {language === 'ro' ? 'Începe transformarea' : 'Start your transformation'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center"
          >
            {/* Concentric circles */}
            <div className="relative w-80 h-80">
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 20 + ring * 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                  style={{
                    top: `${(ring - 1) * 15}%`,
                    left: `${(ring - 1) * 15}%`,
                    right: `${(ring - 1) * 15}%`,
                    bottom: `${(ring - 1) * 15}%`,
                  }}
                >
                  <div 
                    className="w-full h-full rounded-full border-2 border-dashed"
                    style={{
                      borderColor: `hsla(25, 95%, 55%, ${0.4 - ring * 0.1})`,
                    }}
                  />
                </motion.div>
              ))}
              
              {/* Center lightning icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl lightning-icon"
                >
                  <Zap className="w-12 h-12 text-white" />
                </motion.div>
              </div>
              
              {/* Orbiting dots */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 2 }}
                  className="absolute inset-0"
                >
                  <div 
                    className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
                    style={{
                      top: '10%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
