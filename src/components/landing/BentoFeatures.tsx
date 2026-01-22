import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Brain, Target, Heart, Dumbbell, 
  Calendar, BarChart3, MessageSquare, Sparkles,
  Zap, Timer, Trophy
} from "lucide-react";

export const BentoFeatures = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: language === 'ro' ? 'AI Coaches Personali' : 'Personal AI Coaches',
      description: language === 'ro' 
        ? '4 coach-uri AI specializate pentru fiecare pilon al vieții tale. Ghidare personalizată 24/7.'
        : '4 specialized AI coaches for each life pillar. Personalized 24/7 guidance.',
      size: 'large',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: Target,
      title: language === 'ro' ? 'War Planning' : 'War Planning',
      description: language === 'ro' 
        ? 'Planifică obiectivele pe 90 de zile și execută cu claritate.'
        : 'Plan 90-day goals and execute with clarity.',
      size: 'medium',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Calendar,
      title: language === 'ro' ? 'Rutine Zilnice' : 'Daily Routines',
      description: language === 'ro' 
        ? 'Rutine de dimineață și seară optimizate pentru performanță.'
        : 'Morning and evening routines optimized for performance.',
      size: 'medium',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Dumbbell,
      title: language === 'ro' ? 'Body Tracking' : 'Body Tracking',
      description: language === 'ro' 
        ? 'Monitorizează energia, somnul și antrenamentele.'
        : 'Track energy, sleep and workouts.',
      size: 'small',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Heart,
      title: language === 'ro' ? 'Relații' : 'Relationships',
      description: language === 'ro' 
        ? 'Acțiuni zilnice pentru conexiuni mai profunde.'
        : 'Daily actions for deeper connections.',
      size: 'small',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: BarChart3,
      title: language === 'ro' ? 'Analytics' : 'Analytics',
      description: language === 'ro' 
        ? 'Dashboard cu progresul pe toate dimensiunile.'
        : 'Dashboard with progress across all dimensions.',
      size: 'medium',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: MessageSquare,
      title: language === 'ro' ? 'Comunitate' : 'Community',
      description: language === 'ro' 
        ? 'Conectează-te cu alți războinici motivați.'
        : 'Connect with other motivated warriors.',
      size: 'small',
      gradient: 'from-fuchsia-500 to-pink-500',
    },
    {
      icon: Sparkles,
      title: language === 'ro' ? 'Transformare Emoțională' : 'Emotional Transformation',
      description: language === 'ro' 
        ? 'Stack-uri ghidate pentru procesarea emoțiilor.'
        : 'Guided stacks for processing emotions.',
      size: 'small',
      gradient: 'from-purple-500 to-violet-500',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            {language === 'ro' ? 'Funcționalități' : 'Features'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro' 
              ? 'Tot ce ai nevoie pentru transformare' 
              : 'Everything you need for transformation'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Un ecosistem complet care te ghidează în toate aspectele vieții.'
              : 'A complete ecosystem that guides you in all aspects of life.'}
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, idx) => {
            const sizeClasses = {
              large: 'col-span-2 row-span-2',
              medium: 'col-span-2 md:col-span-1 row-span-1',
              small: 'col-span-1 row-span-1',
            };

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`${sizeClasses[feature.size as keyof typeof sizeClasses]} group relative bg-card border border-border rounded-2xl p-6 overflow-hidden cursor-default transition-all duration-300 hover:shadow-xl hover:border-primary/30`}
              >
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className={`text-sm text-muted-foreground ${feature.size === 'small' ? 'hidden md:block' : ''}`}>
                  {feature.description}
                </p>

                {/* Decorative Arrow for large cards */}
                {feature.size === 'large' && (
                  <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-3 gap-4 md:gap-8 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border"
        >
          {[
            { icon: Timer, value: '15', unit: 'min', label: language === 'ro' ? 'setup' : 'setup' },
            { icon: Zap, value: '48h', unit: '', label: language === 'ro' ? 'până la rezultate' : 'to results' },
            { icon: Trophy, value: '92%', unit: '', label: language === 'ro' ? 'rată de succes' : 'success rate' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {stat.value}<span className="text-lg">{stat.unit}</span>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
