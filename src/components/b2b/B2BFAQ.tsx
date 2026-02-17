import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const B2BFAQ = () => {
  const { language } = useLanguage();

  const faqs = language === 'ro' ? [
    { q: 'Cât câștig exact?', a: 'Primești 50% din fiecare abonament lunar al clienților aduși prin link-ul tău. La prețul standard de €97/lună, câștigi €48.50 per client, în fiecare lună, recurent.' },
    { q: 'Cum se face plata?', a: 'Plățile se procesează automat prin Stripe Connect. Banii ajung direct în contul tău bancar, fără intermediari.' },
    { q: 'Ce primesc clienții mei?', a: 'Acces complet la platformă: AI coaching, rutine zilnice, planificare săptămânală, antrenamente, nutriție, comunitate, challenge-uri și toate tool-urile de transformare.' },
    { q: 'Trebuie să plătesc ceva?', a: 'Nu. Înscrierea ca Partner Coach este gratuită. Nu există costuri ascunse sau taxe de platformă.' },
    { q: 'Pot să-mi creez propria comunitate?', a: 'Da! Fiecare coach primește un "Tribe" — o comunitate privată cu brand-ul tău, unde gestionezi membrii și conținutul.' },
    { q: 'Ce se întâmplă dacă un client anulează?', a: 'Comisionul se oprește doar dacă clientul anulează abonamentul. Cât timp rămâne activ, tu câștigi recurent.' },
  ] : [
    { q: 'How much do I earn exactly?', a: 'You get 50% of every monthly subscription from clients referred through your link. At the standard price of €97/month, you earn €48.50 per client, every month, recurring.' },
    { q: 'How do payments work?', a: 'Payments are processed automatically via Stripe Connect. Money goes directly to your bank account, no intermediaries.' },
    { q: 'What do my clients get?', a: 'Full platform access: AI coaching, daily routines, weekly planning, workouts, nutrition, community, challenges and all transformation tools.' },
    { q: 'Do I have to pay anything?', a: 'No. Signing up as a Partner Coach is free. No hidden costs or platform fees.' },
    { q: 'Can I create my own community?', a: 'Yes! Every coach gets a "Tribe" — a private community with your own branding where you manage members and content.' },
    { q: 'What happens if a client cancels?', a: 'The commission stops only if the client cancels their subscription. As long as they remain active, you earn recurring.' },
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
              {language === 'ro' ? 'Întrebări Frecvente' : 'Frequently Asked Questions'}
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
