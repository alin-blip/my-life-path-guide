import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { UserX, Flame, Heart, Zap, Brain, Lock } from "lucide-react";

const problems = [
  {
    icon: UserX,
    titleRo: "Capcana Identității",
    titleEn: "The Identity Trap",
    descRo: "Ești blocat în rolul de executant. Nu ai făcut saltul de la operator la CEO.",
    descEn: "You're stuck in the executor role. You haven't made the leap from operator to CEO.",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: Flame,
    titleRo: "Capcana Burnout-ului",
    titleEn: "The Burnout Trap",
    descRo: "Lucrezi non-stop fără pauză. Corpul, mintea și relațiile suferă iar tu numești asta 'dedicare'.",
    descEn: "You work nonstop without breaks. Your body, mind and relationships suffer while you call it 'dedication'.",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: Heart,
    titleRo: "Mitul Sacrificiului",
    titleEn: "The Sacrifice Myth",
    descRo: "Crezi că trebuie să sacrifici sănătatea, familia sau pacea interioară pentru succes.",
    descEn: "You believe you must sacrifice health, family or inner peace for success.",
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: Zap,
    titleRo: "Prăpastia Execuției",
    titleEn: "The Execution Gap",
    descRo: "Știi ce trebuie să faci, dar nu reușești să transformi cunoștințele în acțiune zilnică.",
    descEn: "You know what to do, but can't turn knowledge into daily action.",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Brain,
    titleRo: "Deficitul Emoțional",
    titleEn: "The Emotional Deficit",
    descRo: "Emoțiile te controlează. Stresul, frica și furia îți sabotează deciziile.",
    descEn: "Emotions control you. Stress, fear and anger sabotage your decisions.",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Lock,
    titleRo: "Bariera Accesibilității",
    titleEn: "The Accessibility Barrier",
    descRo: "Sistemele de transformare de elită costă €10K+. Fondatorii obișnuiți nu au acces.",
    descEn: "Elite transformation systems cost €10K+. Regular founders don't have access.",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
];

export const ProblemSectionNew = () => {
  const { language } = useLanguage();

  return (
    <section id="problem" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium mb-4">
            {language === 'ro' ? 'PROBLEMA' : 'THE PROBLEM'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro'
              ? <>Nu îți lipsesc informații.<br />Îți lipsește un <span className="n8n-gradient-text">sistem de operare</span>.</>
              : <>You don't lack information.<br />You lack an <span className="n8n-gradient-text">operating system</span>.</>}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Cele 6 probleme critice care țin antreprenorii blocați, faliți sau epuizați:'
              : 'The 6 critical problems keeping entrepreneurs stuck, broke or burned out:'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`rounded-2xl border p-6 ${p.bg} hover:scale-[1.02] transition-transform duration-300`}
              >
                <Icon className={`w-8 h-8 ${p.color} mb-4`} />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {language === 'ro' ? p.titleRo : p.titleEn}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {language === 'ro' ? p.descRo : p.descEn}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
