import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export const InteractiveTimeline = () => {
  const { language } = useLanguage();

  const steps = [
    {
      day: language === 'ro' ? 'Ziua 1' : 'Day 1',
      title: language === 'ro' ? 'Setup War Plan' : 'Setup War Plan',
      description: language === 'ro'
        ? 'Definești viziunea pe 90 de zile pentru toate cele 4 dimensiuni. AI-ul te ghidează pas cu pas.'
        : 'Define your 90-day vision for all 4 dimensions. AI guides you step by step.',
      duration: '15-20 min',
      results: language === 'ro' 
        ? ['Claritate asupra direcției', 'Obiective SMART setate', 'Motivație maximă']
        : ['Clarity on direction', 'SMART goals set', 'Maximum motivation'],
      color: 'from-blue-500 to-indigo-500',
    },
    {
      day: language === 'ro' ? 'Zilele 2-7' : 'Days 2-7',
      title: language === 'ro' ? 'Execuție Zilnică' : 'Daily Execution',
      description: language === 'ro'
        ? 'Rutine de dimineață și seară personalizate. Task-uri zilnice pentru fiecare pilon.'
        : 'Personalized morning and evening routines. Daily tasks for each pillar.',
      duration: '30-45 min/zi',
      results: language === 'ro'
        ? ['Rutine automate', 'Progres vizibil', 'Energie crescută']
        : ['Automated routines', 'Visible progress', 'Increased energy'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      day: language === 'ro' ? 'Săptămânal' : 'Weekly',
      title: language === 'ro' ? 'Review & Ajustare' : 'Review & Adjust',
      description: language === 'ro'
        ? 'Analizezi progresul, celebrezi victoriile și planifici săptămâna următoare.'
        : 'Analyze progress, celebrate wins and plan the next week.',
      duration: '20 min',
      results: language === 'ro'
        ? ['Perspectivă clară', 'Ajustări strategice', 'Momentum susținut']
        : ['Clear perspective', 'Strategic adjustments', 'Sustained momentum'],
      color: 'from-purple-500 to-violet-500',
    },
    {
      day: language === 'ro' ? '90 de Zile' : '90 Days',
      title: language === 'ro' ? 'Transformare Completă' : 'Complete Transformation',
      description: language === 'ro'
        ? 'Ai transformat toate cele 4 dimensiuni. Ești o versiune complet nouă.'
        : 'You have transformed all 4 dimensions. You are a completely new version.',
      duration: language === 'ro' ? 'Rezultat' : 'Result',
      results: language === 'ro'
        ? ['+30% energie', '+40% claritate mentală', '+50% productivitate']
        : ['+30% energy', '+40% mental clarity', '+50% productivity'],
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {language === 'ro' ? 'Cum funcționează' : 'How it works'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro' 
              ? 'De la haos la claritate în 90 de zile' 
              : 'From chaos to clarity in 90 days'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Un sistem dovedit care te transformă pas cu pas, fără a te copleși.'
              : 'A proven system that transforms you step by step, without overwhelming you.'}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative"
            >
              {/* Timeline Line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent md:left-1/2 md:-translate-x-0.5" />
              )}

              <div className={`flex flex-col md:flex-row gap-6 md:gap-12 items-start mb-8 md:mb-12 ${
                idx % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}>
                {/* Day Badge */}
                <div className="flex-shrink-0 flex items-center gap-4 md:w-40 md:justify-end">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg`}
                  >
                    {step.day.split(' ')[1] || step.day}
                  </motion.div>
                  <span className="md:hidden text-sm font-medium text-muted-foreground">
                    {step.duration}
                  </span>
                </div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="flex-1 bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {step.title}
                      </h3>
                      <span className="text-sm text-primary font-medium hidden md:inline">
                        {step.duration}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {step.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {step.results.map((result, rIdx) => (
                      <span
                        key={rIdx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {result}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
