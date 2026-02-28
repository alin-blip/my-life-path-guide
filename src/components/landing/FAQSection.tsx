import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown, HelpCircle } from "lucide-react";

export const FAQSection = () => {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: language === 'ro' ? 'Ce este CEO Mind OS exact?' : 'What is CEO Mind OS exactly?',
      answer: language === 'ro'
        ? 'CEO Mind OS este primul sistem de operare pentru fondatori. Nu e un curs, nu e coaching, nu e o aplicație de productivitate. E un sistem complet cu 4 piloni (Warrior Routine, The Door, The Stack, AI Coaches) care lucrează împreună pentru a-ți face upgrade la nivel de identitate — de la operator la CEO suveran.'
        : "CEO Mind OS is the first operating system for founders. It's not a course, not coaching, not a productivity app. It's a complete system with 4 pillars (Warrior Routine, The Door, The Stack, AI Coaches) working together to upgrade you at identity level — from operator to sovereign CEO.",
    },
    {
      question: language === 'ro' ? 'Este un curs online sau o aplicație?' : 'Is it an online course or an app?',
      answer: language === 'ro'
        ? 'Niciuna dintre ele în mod tradițional. CEO Mind OS este o platformă interactivă care combină rutine zilnice de execuție, planificare săptămânală, protocoale de transformare emoțională și coaching AI — totul într-un singur loc. E un sistem viu care se adaptează la tine.'
        : "Neither in the traditional sense. CEO Mind OS is an interactive platform that combines daily execution routines, weekly planning, emotional transformation protocols and AI coaching — all in one place. It's a living system that adapts to you.",
    },
    {
      question: language === 'ro' ? 'Cât timp durează să văd rezultate?' : 'How long until I see results?',
      answer: language === 'ro'
        ? 'Majoritatea utilizatorilor raportează claritate și energie crescută în primele 48 de ore. Rezultatele semnificative apar de obicei în primele 2-3 săptămâni de utilizare constantă. Challenge-ul gratuit de 7 zile este conceput să îți arate valoarea sistemului rapid.'
        : 'Most users report clarity and increased energy within the first 48 hours. Significant results typically appear in the first 2-3 weeks of consistent use. The free 7-day challenge is designed to show you the system\'s value quickly.',
    },
    {
      question: language === 'ro' ? 'Pot anula oricând?' : 'Can I cancel anytime?',
      answer: language === 'ro'
        ? 'Da, absolut. Poți anula abonamentul oricând, fără penalități și fără întrebări. În plus, oferim garanție completă de 90 de zile. Dacă nu vezi valoare, îți returnăm 100% din sumă.'
        : 'Yes, absolutely. You can cancel your subscription anytime, no penalties and no questions asked. Plus, we offer a full 90-day guarantee. If you don\'t see value, we refund 100% of the amount.',
    },
    {
      question: language === 'ro' ? 'Ce include Challenge-ul gratuit de 7 zile?' : 'What does the free 7-day Challenge include?',
      answer: language === 'ro'
        ? 'Challenge-ul gratuit îți oferă acces la Warrior Routine (rutina zilnică de execuție), primele protocoale Stack pentru transformare emoțională, și ghidare pas cu pas pentru fiecare zi. E conceput să îți demonstreze puterea sistemului înainte de orice investiție.'
        : 'The free challenge gives you access to the Warrior Routine (daily execution routine), first Stack protocols for emotional transformation, and step-by-step guidance for each day. It\'s designed to demonstrate the system\'s power before any investment.',
    },
    {
      question: language === 'ro' ? 'Funcționează pentru orice tip de business?' : 'Does it work for any type of business?',
      answer: language === 'ro'
        ? 'CEO Mind OS este conceput pentru fondatori, freelanceri și coach-i care vor să scaleze fără să sacrifice sănătatea, relațiile sau pacea interioară. Funcționează indiferent de industrie.'
        : 'CEO Mind OS is designed for founders, freelancers and coaches who want to scale without sacrificing health, relationships or inner peace. It works regardless of industry.',
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro' ? 'Întrebări frecvente' : 'Frequently asked questions'}
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
