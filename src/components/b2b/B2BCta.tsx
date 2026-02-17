import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";

export const B2BCta = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <section className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-10 md:p-16"
        >
          <Rocket className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'ro' 
              ? 'Gata să-ți Scalezi Practica de Coaching?'
              : 'Ready to Scale Your Coaching Practice?'}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            {language === 'ro'
              ? 'Înscrie-te gratuit, conectează Stripe și începe să câștigi din prima zi.'
              : 'Sign up for free, connect Stripe and start earning from day one.'}
          </p>
          <Button
            size="xl"
            onClick={() => navigate('/coach')}
            className="n8n-glow-button text-primary-foreground text-lg px-10 py-7 rounded-xl font-bold group shadow-2xl"
          >
            {language === 'ro' ? 'Începe Acum' : 'Start Now'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            {language === 'ro' ? '100% gratuit • Fără obligații • Setup în 5 minute' : '100% free • No obligations • Setup in 5 minutes'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
