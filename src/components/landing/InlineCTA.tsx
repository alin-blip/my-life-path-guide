import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface InlineCTAProps {
  headlineRo: string;
  headlineEn: string;
  ctaRo?: string;
  ctaEn?: string;
}

export const InlineCTA = ({ headlineRo, headlineEn, ctaRo, ctaEn }: InlineCTAProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRo = language === 'ro';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            {isRo ? headlineRo : headlineEn}
          </h3>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-6 text-base font-bold group"
          >
            {isRo ? (ctaRo || 'Instalează CEO Mind OS') : (ctaEn || 'Install CEO Mind OS')}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
