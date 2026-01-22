import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CaseStudies = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const caseStudies = [
    {
      name: "Alexandru M.",
      role: "CEO, Tech Startup",
      avatar: "🧔",
      quote: language === 'ro'
        ? 'Am trecut de la 70h/săptămână la 45h cu rezultate mai bune.'
        : 'I went from 70h/week to 45h with better results.',
      highlight: language === 'ro' ? '+40% timp liber' : '+40% free time',
      metric: '+40%',
      metricLabel: language === 'ro' ? 'Timp liber' : 'Free time',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      name: "Maria D.",
      role: "Founder, Agency",
      avatar: "👩‍💼",
      quote: language === 'ro'
        ? 'Pentru prima dată am simțit că am control asupra vieții mele.'
        : 'For the first time I felt in control of my life.',
      highlight: language === 'ro' ? '+60% energie' : '+60% energy',
      metric: '+60%',
      metricLabel: language === 'ro' ? 'Energie' : 'Energy',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section className="n8n-section">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="n8n-badge mb-4 mx-auto w-fit">
            {language === 'ro' ? 'Studii de caz' : 'Case Studies'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {language === 'ro' 
              ? 'Rezultate reale de la oameni reali' 
              : 'Real results from real people'}
          </h2>
        </motion.div>

        {/* Case Study Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {caseStudies.map((study, idx) => (
            <motion.div
              key={study.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="n8n-card p-8 relative group"
            >
              {/* Metric Badge */}
              <div className={`absolute -top-4 right-8 px-4 py-2 rounded-full bg-gradient-to-r ${study.gradient} text-white font-bold shadow-lg`}>
                {study.metric}
              </div>
              
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-muted-foreground/20 mb-4" />
              
              {/* Quote */}
              <blockquote className="text-xl font-medium text-foreground mb-6">
                "{study.quote}"
              </blockquote>
              
              {/* Highlight */}
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${study.gradient} text-white mb-6`}>
                ✨ {study.highlight}
              </div>
              
              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                  {study.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{study.name}</div>
                  <div className="text-sm text-muted-foreground">{study.role}</div>
                </div>
              </div>
              
              {/* CTA */}
              <Button 
                variant="link" 
                className="mt-4 p-0 h-auto text-primary group-hover:gap-3 gap-2 transition-all"
                onClick={() => navigate('/auth')}
              >
                {language === 'ro' ? 'Citește studiul de caz' : 'Read case study'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
