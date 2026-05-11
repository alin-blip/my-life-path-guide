import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Building2, Laptop, GraduationCap } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";

const personas = [
  {
    icon: Building2,
    titleRo: "Antreprenorul Blocat",
    titleEn: "The Stuck Entrepreneur",
    descRo: "Ai construit compania, dar acum compania te conduce pe tine. Lucrezi 60+ ore pe săptămână și nu ai timp pentru nimic altceva.",
    descEn: "You built the company, but now it runs you. Working 60+ hours per week with no time for anything else.",
    tagRo: "€50K–500K revenue",
    tagEn: "€50K–500K revenue",
  },
  {
    icon: Laptop,
    titleRo: "Freelancerul Ambițios",
    titleEn: "The Ambitious Freelancer",
    descRo: "Ai atins un plafon de venit și ești blocat în faza de 'doing'. Vrei să scalezi, dar nu știi cum să faci tranziția.",
    descEn: "You've hit an income ceiling and are stuck in 'doing' mode. Want to scale but don't know how to transition.",
    tagRo: "€2K–10K/lună",
    tagEn: "€2K–10K/month",
  },
  {
    icon: GraduationCap,
    titleRo: "Coach-ul / Mentorul",
    titleEn: "The Coach / Mentor",
    descRo: "Jonglezi cu 5+ tool-uri și petreci mai mult timp pe admin decât pe coaching. Ai nevoie de un sistem unificat.",
    descEn: "Juggling 5+ tools and spending more time on admin than coaching. You need a unified system.",
    tagRo: "Scalare prin sistem",
    tagEn: "Scale through systems",
  },
];

export const TargetAudienceSection = () => {
  const { language } = useLanguage();

  return (
    <section id="target" className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <SectionLabel className="justify-center mb-4">
            {language === 'ro' ? 'Pentru cine este' : 'Who is it for'}
          </SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
            {language === 'ro' ? (
              <>Cine beneficiază de <em className="text-primary not-italic font-display italic">CEO Mind OS</em>?</>
            ) : (
              <>Who benefits from <em className="text-primary not-italic font-display italic">CEO Mind OS</em>?</>
            )}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px bg-border border border-border max-w-5xl mx-auto">
          {personas.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-card p-8 hover:bg-accent/30 transition-colors duration-300"
              >
                <Icon className="w-8 h-8 text-primary mb-6" strokeWidth={1.25} />
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {language === 'ro' ? p.titleRo : p.titleEn}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {language === 'ro' ? p.descRo : p.descEn}
                </p>
                <span className="inline-block font-mono text-xs uppercase tracking-wider text-primary border-t border-border pt-3 w-full">
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
