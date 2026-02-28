import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Building2, Laptop, GraduationCap } from "lucide-react";

const personas = [
  {
    icon: Building2,
    titleRo: "Antreprenorul Blocat",
    titleEn: "The Stuck Entrepreneur",
    descRo: "Ai construit compania, dar acum compania te conduce pe tine. Lucrezi 60+ ore pe săptămână și nu ai timp pentru nimic altceva.",
    descEn: "You built the company, but now it runs you. Working 60+ hours per week with no time for anything else.",
    tagRo: "€50K-500K revenue",
    tagEn: "€50K-500K revenue",
    gradient: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Laptop,
    titleRo: "Freelancerul Ambițios",
    titleEn: "The Ambitious Freelancer",
    descRo: "Ai atins un plafon de venit și ești blocat în faza de 'doing'. Vrei să scalezi, dar nu știi cum să faci tranziția.",
    descEn: "You've hit an income ceiling and are stuck in 'doing' mode. Want to scale but don't know how to transition.",
    tagRo: "€2K-10K/lună",
    tagEn: "€2K-10K/month",
    gradient: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: GraduationCap,
    titleRo: "Coach-ul / Mentorul",
    titleEn: "The Coach / Mentor",
    descRo: "Jonglezi cu 5+ tool-uri și petreci mai mult timp pe admin decât pe coaching. Ai nevoie de un sistem unificat.",
    descEn: "Juggling 5+ tools and spending more time on admin than coaching. You need a unified system.",
    tagRo: "Scalare prin sistem",
    tagEn: "Scale through systems",
    gradient: "from-green-500/10 to-emerald-500/10",
    borderColor: "border-green-500/20",
    iconColor: "text-green-500",
  },
];

export const TargetAudienceSection = () => {
  const { language } = useLanguage();

  return (
    <section id="target" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            {language === 'ro' ? 'PENTRU CINE ESTE' : 'WHO IS IT FOR'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro'
              ? 'Cine beneficiază de CEO Mind OS?'
              : 'Who benefits from CEO Mind OS?'}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {personas.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-2xl border ${p.borderColor} bg-gradient-to-br ${p.gradient} p-6 hover:scale-[1.02] transition-transform duration-300`}
              >
                <Icon className={`w-10 h-10 ${p.iconColor} mb-4`} />
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {language === 'ro' ? p.titleRo : p.titleEn}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {language === 'ro' ? p.descRo : p.descEn}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${p.iconColor} bg-background/60 border ${p.borderColor}`}>
                  {language === 'ro' ? p.tagRo : p.tagEn}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
