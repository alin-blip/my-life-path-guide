import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, Zap, Lock, CheckCircle2 } from "lucide-react";

export const EnterpriseSection = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: language === 'ro' ? 'Securitate' : 'Security',
      description: language === 'ro' 
        ? 'Date criptate end-to-end. Conformitate GDPR completă.'
        : 'End-to-end encrypted data. Full GDPR compliance.',
      items: language === 'ro'
        ? ['Criptare end-to-end', 'GDPR compliant', 'Autentificare securizată']
        : ['End-to-end encryption', 'GDPR compliant', 'Secure authentication'],
    },
    {
      icon: Zap,
      title: language === 'ro' ? 'Performanță' : 'Performance',
      description: language === 'ro'
        ? 'Infrastructură cloud scalabilă. Uptime 99.9%.'
        : 'Scalable cloud infrastructure. 99.9% uptime.',
      items: language === 'ro'
        ? ['99.9% uptime', 'Răspuns rapid AI', 'Sincronizare în timp real']
        : ['99.9% uptime', 'Fast AI response', 'Real-time sync'],
    },
    {
      icon: Lock,
      title: language === 'ro' ? 'Confidențialitate' : 'Privacy',
      description: language === 'ro'
        ? 'Datele tale rămân ale tale. Niciodată vândute sau partajate.'
        : 'Your data stays yours. Never sold or shared.',
      items: language === 'ro'
        ? ['Date private 100%', 'Control total', 'Export oricând']
        : ['100% private data', 'Full control', 'Export anytime'],
    },
  ];

  const testimonial = {
    quote: language === 'ro'
      ? 'Platforma m-a ajutat să îmi recuperez relația cu familia și să cresc profitul cu 35%.'
      : 'The platform helped me recover my relationship with family and grow profit by 35%.',
    name: 'Dan C.',
    role: language === 'ro' ? 'E-commerce, €2M/an' : 'E-commerce, €2M/year',
    avatar: '👨‍💻',
  };

  return (
    <section className="n8n-section bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="n8n-badge mb-4 mx-auto w-fit">
              <Shield className="w-4 h-4" />
              {language === 'ro' ? '100% Sigur' : '100% Secure'}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {language === 'ro' ? 'Securitate.' : 'Security.'}{' '}
              {language === 'ro' ? 'Fiabilitate.' : 'Reliability.'}{' '}
              <span className="n8n-gradient-text">
                {language === 'ro' ? 'Confidențialitate.' : 'Privacy.'}
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Feature Cards */}
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="n8n-card p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Floating Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <div className="n8n-card p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium">
                ⭐ {language === 'ro' ? 'Testimonial verificat' : 'Verified testimonial'}
              </div>
              <p className="text-lg text-foreground text-center mt-4 mb-4">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{testimonial.avatar}</span>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            {['🔒 GDPR', '🛡️ SSL', '☁️ Cloud EU', '✓ SOC2'].map((badge) => (
              <div 
                key={badge}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted-foreground"
              >
                {badge}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
