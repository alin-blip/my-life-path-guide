import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Sunrise, LayoutDashboard, Layers, Bot, Quote } from "lucide-react";

const pillars = [
  {
    icon: Sunrise,
    nameRo: "The Warrior Routine",
    nameEn: "The Warrior Routine",
    descRo: "Rutina zilnică de execuție care îți aliniază corpul, mintea și business-ul în primele 90 de minute ale zilei.",
    descEn: "The daily execution routine that aligns your body, mind and business in the first 90 minutes of the day.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-500",
  },
  {
    icon: LayoutDashboard,
    nameRo: "The Door",
    nameEn: "The Door",
    descRo: "Centrul de comandă săptămânal. Planifici, prioritizezi și execuți cu claritate chirurgicală.",
    descEn: "The weekly command center. Plan, prioritize and execute with surgical clarity.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Layers,
    nameRo: "The Stack",
    nameEn: "The Stack",
    descRo: "Protocoale de transformare emoțională. Transformă furia, frica și confuzia în putere și claritate.",
    descEn: "Emotional transformation protocols. Transform anger, fear and confusion into power and clarity.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: Bot,
    nameRo: "AI Coaches",
    nameEn: "AI Coaches",
    descRo: "Coaching AI 24/7 pentru accountability, mindset și execuție. Ca un mentor personal care nu doarme niciodată.",
    descEn: "24/7 AI coaching for accountability, mindset and execution. Like a personal mentor that never sleeps.",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
  },
];

export const MethodologySection = () => {
  const { language } = useLanguage();

  return (
    <section id="methodology" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            {language === 'ro' ? 'METODOLOGIA' : 'METHODOLOGY'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro'
              ? 'Sistemul care transformă intenția strategică în realitate predictibilă.'
              : 'The system that transforms strategic intention into predictable reality.'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {language === 'ro'
              ? 'CEO Mind OS nu e un curs. E un sistem complet cu 4 piloni care lucrează împreună pentru a-ți face upgrade la nivel de identitate.'
              : "CEO Mind OS isn't a course. It's a complete system with 4 pillars working together to upgrade you at identity level."}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-2xl border border-border bg-gradient-to-br ${pillar.gradient} p-6 hover:scale-[1.02] transition-transform duration-300`}
              >
                <Icon className={`w-10 h-10 ${pillar.iconColor} mb-4`} />
                <h3 className="text-xl font-bold text-foreground mb-2">{pillar.nameRo}</h3>
                <p className="text-muted-foreground">
                  {language === 'ro' ? pillar.descRo : pillar.descEn}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Founder Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-8">
            <Quote className="w-8 h-8 text-primary/40 mx-auto mb-4" />
            <p className="text-lg md:text-xl italic text-foreground mb-4">
              {language === 'ro'
                ? '"Nu îți dăm mai multe informații. Transformăm cine ești la nivel de identitate."'
                : '"We don\'t give you more information. We transform who you are at identity level."'}
            </p>
            <p className="text-muted-foreground font-medium">— Alin Radu, Founder CEO Mind OS</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
