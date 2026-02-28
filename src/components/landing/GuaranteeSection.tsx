import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck } from "lucide-react";

export const GuaranteeSection = () => {
  const { language } = useLanguage();
  const isRo = language === 'ro';

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-green-500/5 border-2 border-green-500/20 rounded-2xl p-8 md:p-12"
        >
          <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {isRo ? 'Garanție 100% — 90 de Zile' : '100% Guarantee — 90 Days'}
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {isRo
              ? 'Dacă în 90 de zile nu vezi rezultate măsurabile, îți dăm banii înapoi. Fără întrebări. Fără bătăi de cap.'
              : "If you don't see measurable results in 90 days, we give you your money back. No questions asked. No hassle."}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
