import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { UserPlus, CreditCard, Send } from "lucide-react";

export const B2BHowItWorks = () => {
  const { language } = useLanguage();

  const steps = [
    {
      icon: UserPlus,
      number: '01',
      title: language === 'ro' ? 'Creează Profil de Coach' : 'Create Coach Profile',
      desc: language === 'ro' ? 'Completezi profilul în 30 de secunde. Numele, bio, nișa ta.' : 'Fill your profile in 30 seconds. Name, bio, your niche.',
    },
    {
      icon: CreditCard,
      number: '02',
      title: language === 'ro' ? 'Conectează Stripe' : 'Connect Stripe',
      desc: language === 'ro' ? 'Stripe Connect Express — plăți automate, direct în contul tău.' : 'Stripe Connect Express — automatic payments, directly to your account.',
    },
    {
      icon: Send,
      number: '03',
      title: language === 'ro' ? 'Trimite Link-ul Clienților' : 'Send Link to Clients',
      desc: language === 'ro' ? 'Ei se înscriu, tu câștigi 50% recurent. Simplu.' : 'They sign up, you earn 50% recurring. Simple.',
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
              {language === 'ro' ? 'Cum Funcționează' : 'How It Works'}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {language === 'ro' ? '3 pași simpli. Sub 5 minute.' : '3 simple steps. Under 5 minutes.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
                <step.icon className="w-10 h-10 text-primary" />
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
