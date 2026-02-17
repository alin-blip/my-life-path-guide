import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, BarChart3, Bot, Users, BookOpen, Settings, 
  CheckCircle2, Sparkles 
} from "lucide-react";

export const B2BValueStack = () => {
  const { language } = useLanguage();

  const items = [
    {
      icon: DollarSign,
      title: language === 'ro' ? '50% Comision Recurent FOREVER' : '50% Recurring Commission FOREVER',
      desc: language === 'ro' 
        ? 'Câștigi jumătate din fiecare abonament, în fiecare lună, atâta timp cât clientul rămâne activ.'
        : 'Earn half of every subscription, every month, as long as the client stays active.',
    },
    {
      icon: BarChart3,
      title: language === 'ro' ? 'Dashboard cu Progresul Clienților' : 'Client Progress Dashboard',
      desc: language === 'ro'
        ? 'Vezi în timp real ce fac clienții: streak-uri, obiective completate, sesiuni de coaching.'
        : 'See in real-time what your clients do: streaks, completed goals, coaching sessions.',
    },
    {
      icon: Bot,
      title: language === 'ro' ? 'AI Coach 24/7 pentru Clienți' : '24/7 AI Coach for Clients',
      desc: language === 'ro'
        ? 'Un coach AI care lucrează non-stop pentru clienții tăi — introspectie, accountability, mindset.'
        : 'An AI coach working non-stop for your clients — introspection, accountability, mindset.',
    },
    {
      icon: Users,
      title: language === 'ro' ? 'Comunitate Privată (Tribe)' : 'Private Community (Tribe)',
      desc: language === 'ro'
        ? 'Creează-ți propria comunitate cu brand-ul tău. Gestionează membri, postări și discuții.'
        : 'Create your own branded community. Manage members, posts and discussions.',
    },
    {
      icon: BookOpen,
      title: language === 'ro' ? 'Cursuri & Content Monetizabil' : 'Courses & Monetizable Content',
      desc: language === 'ro'
        ? 'Publică cursuri, ebook-uri, resurse premium. Vinde direct din platformă cu Stripe.'
        : 'Publish courses, ebooks, premium resources. Sell directly from the platform via Stripe.',
    },
    {
      icon: Settings,
      title: language === 'ro' ? 'Rutină Personalizată per Grup' : 'Custom Routine per Group',
      desc: language === 'ro'
        ? 'Creează rutine custom cu pași, ordine și durată pentru fiecare grup de clienți.'
        : 'Create custom routines with steps, order, and duration for each client group.',
      comingSoon: true,
    },
  ];

  return (
    <section className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="n8n-gradient-text">
              {language === 'ro' ? 'Ce Primești ca Partner Coach' : 'What You Get as Partner Coach'}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Tot ce ai nevoie ca să scalezi, într-un singur loc.'
              : 'Everything you need to scale, in one place.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 relative group"
            >
              {item.comingSoon && (
                <Badge className="absolute top-4 right-4 bg-accent/20 text-accent border-accent/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Coming Soon
                </Badge>
              )}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
