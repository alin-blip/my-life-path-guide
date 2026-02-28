import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { X, CheckCircle2 } from "lucide-react";

const comparisons = {
  ro: {
    without: [
      "Te bazezi pe noroc și voință",
      "Sacrifici sănătatea pentru business",
      "Jonglezi cu 5+ aplicații fără rezultat",
      "Emoțiile îți sabotează deciziile",
      "Lucrezi 60+ ore fără progres real",
      "Burnout-ul e la un pas distanță",
    ],
    with: [
      "Scalezi cu precizie chirurgicală",
      "Corp, minte și business cresc simultan",
      "Un singur sistem pentru totul",
      "Transformi emoțiile în combustibil",
      "Lucrezi mai puțin, obții de 3-10x mai mult",
      "Ai un business suveran care rulează singur",
    ],
  },
  en: {
    without: [
      "You rely on luck and willpower",
      "You sacrifice health for business",
      "Juggling 5+ apps with no results",
      "Emotions sabotage your decisions",
      "Working 60+ hours with no real progress",
      "Burnout is one step away",
    ],
    with: [
      "You scale with surgical precision",
      "Body, mind and business grow simultaneously",
      "One single system for everything",
      "You transform emotions into fuel",
      "Work less, get 3-10x more",
      "You have a sovereign business that runs itself",
    ],
  },
};

export const ComparisonSection = () => {
  const { language } = useLanguage();
  const data = language === 'ro' ? comparisons.ro : comparisons.en;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            {language === 'ro' ? 'DIFERENȚA' : 'THE DIFFERENCE'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {language === 'ro'
              ? <>Diferența este <span className="n8n-gradient-text">sistemul tău de operare</span>.</>
              : <>The difference is <span className="n8n-gradient-text">your operating system</span>.</>}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
          >
            <h3 className="text-lg font-bold text-red-500 mb-6">
              {language === 'ro' ? 'Fără CEO Mind OS' : 'Without CEO Mind OS'}
            </h3>
            <div className="space-y-4">
              {data.without.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* With */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6"
          >
            <h3 className="text-lg font-bold text-green-500 mb-6">
              {language === 'ro' ? 'Cu CEO Mind OS' : 'With CEO Mind OS'}
            </h3>
            <div className="space-y-4">
              {data.with.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
