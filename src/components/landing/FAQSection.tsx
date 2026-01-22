import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown, Search, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export const FAQSection = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: language === 'ro' ? 'Cât durează să văd primele rezultate?' : 'How long until I see first results?',
      answer: language === 'ro'
        ? 'Majoritatea utilizatorilor raportează claritate și energie crescută în primele 48 de ore. Rezultatele semnificative apar de obicei în primele 2-3 săptămâni de utilizare constantă.'
        : 'Most users report clarity and increased energy within the first 48 hours. Significant results typically appear in the first 2-3 weeks of consistent use.',
    },
    {
      question: language === 'ro' ? 'Funcționează pentru toate tipurile de business?' : 'Does it work for all business types?',
      answer: language === 'ro'
        ? 'Da! WarriorOS este proiectat pentru antreprenori din orice industrie. Sistemul se adaptează la obiectivele și provocările tale specifice, indiferent dacă ai un startup tech, o agenție, e-commerce sau orice alt tip de business.'
        : 'Yes! WarriorOS is designed for entrepreneurs in any industry. The system adapts to your specific goals and challenges, whether you have a tech startup, agency, e-commerce or any other type of business.',
    },
    {
      question: language === 'ro' ? 'Cât timp trebuie să investesc zilnic?' : 'How much time do I need to invest daily?',
      answer: language === 'ro'
        ? 'Rutina minimă durează doar 15-20 de minute dimineața și 10 minute seara. Poți extinde sau personaliza în funcție de disponibilitatea ta. Sistemul este flexibil și se adaptează la stilul tău de viață.'
        : 'The minimum routine takes only 15-20 minutes in the morning and 10 minutes in the evening. You can extend or customize based on your availability. The system is flexible and adapts to your lifestyle.',
    },
    {
      question: language === 'ro' ? 'Ce se întâmplă dacă nu sunt mulțumit?' : 'What happens if I\'m not satisfied?',
      answer: language === 'ro'
        ? 'Oferim garanție completă de 7 zile. Dacă nu vezi valoare în primele 7 zile, îți returnăm 100% din sumă, fără întrebări. Credem în sistem și vrem să te asigurăm că nu ai nimic de pierdut.'
        : 'We offer a full 7-day guarantee. If you don\'t see value in the first 7 days, we refund 100% of the amount, no questions asked. We believe in the system and want to ensure you have nothing to lose.',
    },
    {
      question: language === 'ro' ? 'Cum funcționează AI Coach-ul?' : 'How does the AI Coach work?',
      answer: language === 'ro'
        ? 'AI Coach-ul este antrenat pe principii dovedite de productivitate, mindset și wellness. Îți oferă ghidare personalizată 24/7, răspunde la întrebări, te ajută să depășești blocajele și îți sugerează acțiuni specifice bazate pe progresul tău.'
        : 'The AI Coach is trained on proven productivity, mindset and wellness principles. It provides personalized 24/7 guidance, answers questions, helps you overcome blocks and suggests specific actions based on your progress.',
    },
    {
      question: language === 'ro' ? 'Pot să folosesc pe telefon?' : 'Can I use it on my phone?',
      answer: language === 'ro'
        ? 'Absolut! WarriorOS este optimizat pentru toate dispozitivele - desktop, tablet și mobil. Poți accesa rutinele, AI Coach-ul și tracking-ul de oriunde, oricând.'
        : 'Absolutely! WarriorOS is optimized for all devices - desktop, tablet and mobile. You can access routines, AI Coach and tracking from anywhere, anytime.',
    },
  ];

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
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
            {language === 'ro' 
              ? 'Întrebări frecvente' 
              : 'Frequently asked questions'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Găsește răspunsuri la cele mai comune întrebări despre WarriorOS.'
              : 'Find answers to the most common questions about WarriorOS.'}
          </p>
        </motion.div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={language === 'ro' ? 'Caută întrebări...' : 'Search questions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg rounded-xl"
            />
          </div>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.map((faq, idx) => (
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

        {/* Contact CTA */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">
              {language === 'ro' ? 'Nu am găsit ce cauți?' : 'Couldn\'t find what you\'re looking for?'}
            </p>
            <a href="/support" className="text-primary hover:underline">
              {language === 'ro' ? 'Contactează-ne →' : 'Contact us →'}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
