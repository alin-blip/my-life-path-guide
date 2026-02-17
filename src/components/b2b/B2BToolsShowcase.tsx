import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { 
  Brain, Target, MapPin, Dumbbell, Utensils, Heart, 
  BookOpen, Timer, Trophy, MessageSquare 
} from "lucide-react";

export const B2BToolsShowcase = () => {
  const { language } = useLanguage();

  const tools = [
    { icon: Brain, name: language === 'ro' ? 'Stacks (Introspecție AI)' : 'Stacks (AI Introspection)', color: 'text-purple-500' },
    { icon: Target, name: language === 'ro' ? 'Door (Planificare Săptămânală)' : 'Door (Weekly Planning)', color: 'text-blue-500' },
    { icon: MapPin, name: language === 'ro' ? 'Harta Realității' : 'Reality Map', color: 'text-green-500' },
    { icon: Dumbbell, name: language === 'ro' ? 'Antrenamente' : 'Workouts', color: 'text-red-500' },
    { icon: Utensils, name: language === 'ro' ? 'Nutriție' : 'Nutrition', color: 'text-orange-500' },
    { icon: Heart, name: language === 'ro' ? 'Relații' : 'Relationships', color: 'text-pink-500' },
    { icon: BookOpen, name: language === 'ro' ? 'Challenge 7 Zile' : '7-Day Challenge', color: 'text-cyan-500' },
    { icon: Timer, name: language === 'ro' ? 'Rutina Campionului' : 'Champion Routine', color: 'text-amber-500' },
    { icon: Trophy, name: language === 'ro' ? 'Obiective & Gamificare' : 'Goals & Gamification', color: 'text-yellow-500' },
    { icon: MessageSquare, name: language === 'ro' ? 'Coach AI 24/7' : '24/7 AI Coach', color: 'text-indigo-500' },
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="n8n-gradient-text">
              {language === 'ro' ? 'Instrumente pentru Clienții Tăi' : 'Tools for Your Clients'}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Clienții tăi primesc acces la un ecosistem complet de transformare.'
              : 'Your clients get access to a complete transformation ecosystem.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 text-center group cursor-default"
            >
              <tool.icon className={`w-8 h-8 ${tool.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium text-foreground">{tool.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
