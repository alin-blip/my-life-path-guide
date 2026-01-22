import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { TrendingUp, Users, Zap, Award } from "lucide-react";

export const LogoCloud = () => {
  const { language } = useLanguage();

  const stats = [
    {
      icon: Users,
      value: "500+",
      label: language === 'ro' ? 'Antreprenori activi' : 'Active entrepreneurs',
    },
    {
      icon: TrendingUp,
      value: "92%",
      label: language === 'ro' ? 'Raportează claritate' : 'Report clarity',
    },
    {
      icon: Zap,
      value: "48h",
      label: language === 'ro' ? 'Primele rezultate' : 'First results',
    },
    {
      icon: Award,
      value: "€2M+",
      label: language === 'ro' ? 'Venituri generate' : 'Revenue generated',
    },
  ];

  const industries = language === 'ro'
    ? ['Tech', 'Consultanță', 'E-commerce', 'Coaching', 'Agenții', 'SaaS', 'Real Estate', 'Finance']
    : ['Tech', 'Consulting', 'E-commerce', 'Coaching', 'Agencies', 'SaaS', 'Real Estate', 'Finance'];

  return (
    <section className="py-12 md:py-16 border-y border-border/50 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Industries Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-center flex-wrap gap-3 md:gap-4">
            <span className="text-sm text-muted-foreground mr-2">
              {language === 'ro' ? 'Folosit în:' : 'Used in:'}
            </span>
            {industries.map((industry, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="px-4 py-2 rounded-full bg-background border border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-300"
              >
                {industry}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
