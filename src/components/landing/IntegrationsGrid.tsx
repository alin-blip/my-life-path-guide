import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Dumbbell, 
  Brain, 
  Heart, 
  Briefcase,
  Calendar,
  Target,
  MessageSquare,
  BarChart3,
  BookOpen,
  Sparkles,
  Timer,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const IntegrationsGrid = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const features = [
    { icon: Dumbbell, label: language === 'ro' ? 'Antrenamente' : 'Workouts', color: 'from-green-500 to-emerald-500' },
    { icon: Brain, label: language === 'ro' ? 'Meditație' : 'Meditation', color: 'from-purple-500 to-violet-500' },
    { icon: Heart, label: language === 'ro' ? 'Relații' : 'Relationships', color: 'from-pink-500 to-rose-500' },
    { icon: Briefcase, label: 'Business', color: 'from-blue-500 to-indigo-500' },
    { icon: Calendar, label: 'The Door', color: 'from-orange-500 to-amber-500' },
    { icon: Target, label: 'Vision Board', color: 'from-red-500 to-orange-500' },
    { icon: MessageSquare, label: 'AI Coaching', color: 'from-cyan-500 to-teal-500' },
    { icon: BarChart3, label: 'Analytics', color: 'from-indigo-500 to-purple-500' },
    { icon: BookOpen, label: language === 'ro' ? 'Jurnalizare' : 'Journaling', color: 'from-yellow-500 to-orange-500' },
    { icon: Sparkles, label: language === 'ro' ? 'Afirmații' : 'Affirmations', color: 'from-fuchsia-500 to-pink-500' },
    { icon: Timer, label: language === 'ro' ? 'Rutine' : 'Routines', color: 'from-lime-500 to-green-500' },
    { icon: Trophy, label: 'Achievements', color: 'from-amber-500 to-yellow-500' },
  ];

  return (
    <section className="n8n-section bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro' 
              ? 'Conectează-ți viața întreagă cu' 
              : 'Connect your entire life with'}
            {' '}
            <span className="n8n-gradient-text">
              {language === 'ro' ? 'sistemul 4B' : 'the 4B system'}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Peste 12 instrumente integrate într-un singur ecosistem pentru transformare completă.'
              : 'Over 12 tools integrated into a single ecosystem for complete transformation.'}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto mb-10">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex flex-col items-center gap-3 p-4 bg-card border border-border rounded-xl cursor-pointer transition-shadow hover:shadow-lg"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">{feature.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline" 
            className="group"
          >
            {language === 'ro' ? 'Explorează toate funcțiile' : 'Explore all features'}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
