import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Quote } from "lucide-react";

export const FounderSectionNew = () => {
  const { language } = useLanguage();

  return (
    <section id="founder" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            {language === 'ro' ? 'FONDATORUL' : 'THE FOUNDER'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro'
              ? <>De la operator blocat<br />la <span className="n8n-gradient-text">CEO suveran</span>.</>
              : <>From stuck operator<br />to <span className="n8n-gradient-text">sovereign CEO</span>.</>}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              {language === 'ro'
                ? 'Alin Radu a construit CEO Mind OS din propria experiență de antreprenor care a trecut prin burnout, dezechilibru și senzația că "trebuie să fac totul singur".'
                : 'Alin Radu built CEO Mind OS from his own experience as an entrepreneur who went through burnout, imbalance and the feeling of "I have to do everything myself."'}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {language === 'ro'
                ? 'După ani de studiu cu mentori de top și investiții de peste €100K în dezvoltare personală, a creat un sistem care integrează transformarea personală cu execuția profesională — într-un singur loc.'
                : 'After years of study with top mentors and investments of over €100K in personal development, he created a system that integrates personal transformation with professional execution — in one place.'}
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <Quote className="w-6 h-6 text-primary/40 mb-3" />
              <p className="text-foreground italic font-medium">
                {language === 'ro'
                  ? '"Am construit CEO Mind OS pentru că nu am găsit niciun sistem care să facă upgrade la FONDATOR, nu doar la business. Acum acest sistem este disponibil pentru toți."'
                  : '"I built CEO Mind OS because I couldn\'t find any system that upgrades the FOUNDER, not just the business. Now this system is available to everyone."'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
