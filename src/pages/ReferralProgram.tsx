import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  DollarSign, 
  Repeat, 
  Gift, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  TrendingUp,
  Share2,
  Clock,
  Shield,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useAffiliateLink } from "@/hooks/useAffiliateLink";
import { Helmet } from "react-helmet-async";

const ReferralProgram = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { referralLink, shareReferralLink, isLoading } = useAffiliateLink();

  const content = {
    en: {
      title: "Referral Program",
      heroTitle: "Earn 50% Commission",
      heroSubtitle: "On Every Payment. Forever.",
      heroDescription: "Bring your friends, clients, or audience to the platform and earn 50% of every subscription payment they make — not just once, but for as long as they stay subscribed.",
      
      howItWorksTitle: "How It Works",
      step1Title: "1. Get Your Link",
      step1Desc: "Upgrade to PRO and receive your unique referral link instantly.",
      step2Title: "2. Share It",
      step2Desc: "Share your link with friends, clients, followers, or anyone who wants to level up.",
      step3Title: "3. Earn 50%",
      step3Desc: "Every time they pay, you get 50%. Monthly or annually — your commission is recurring.",
      
      mathTitle: "The Math That Changes Everything",
      mathSubtitle: "This isn't pocket change. This is a real income stream.",
      example1: "5 referrals × €97/month = €242.50/month for you",
      example2: "10 referrals × €97/month = €485/month for you", 
      example3: "25 referrals × €97/month = €1,212.50/month for you",
      mathNote: "And that's just PRO. Elite referrals pay even more.",
      
      whyTitle: "Why This Is Different",
      why1Title: "50% Commission",
      why1Desc: "Not 10%. Not 20%. A full 50% of every payment goes to you.",
      why2Title: "Recurring Forever",
      why2Desc: "As long as your referral stays subscribed, you keep earning. Monthly. Annually. Forever.",
      why3Title: "Automatic Payouts",
      why3Desc: "Via Stripe Connect. No invoices. No chasing payments. It just lands in your account.",
      why4Title: "Real-Time Tracking",
      why4Desc: "See every referral, every conversion, every euro in your Coach Dashboard.",
      
      perfectForTitle: "Perfect For",
      perfect1: "Coaches & Trainers",
      perfect1Desc: "Give your clients the tools they need and get paid for it.",
      perfect2: "Content Creators",
      perfect2Desc: "Monetize your audience with something that actually helps them.",
      perfect3: "Community Leaders",
      perfect3Desc: "Strengthen your community while building passive income.",
      perfect4: "Entrepreneurs",
      perfect4Desc: "Add a recurring revenue stream to your business.",
      
      upgradeTitle: "Ready to Start Earning?",
      upgradeSubtitle: "Upgrade to PRO to unlock your referral link and start building passive income today.",
      upgradeCta: "Upgrade to PRO",
      
      alreadyProTitle: "Your Referral Link",
      alreadyProSubtitle: "Share this link and start earning 50% on every subscription.",
      copyLink: "Copy Link",
      shareLink: "Share Link",
      viewDashboard: "View Coach Dashboard",
      
      faqTitle: "Frequently Asked Questions",
      faq1Q: "When do I get paid?",
      faq1A: "Payouts are automatic via Stripe Connect. Once you reach €25 in earnings, it transfers to your bank account.",
      faq2Q: "Do I need to be a coach to join?",
      faq2A: "No! Any PRO member can earn referral commissions. The Coach Dashboard is available for ELITE members who want advanced client management.",
      faq3Q: "What if my referral upgrades from PRO to ELITE?",
      faq3A: "You earn 50% of their new plan too. Higher plan = higher commission for you.",
      faq4Q: "Is there a limit to how many referrals I can have?",
      faq4A: "No limit. Refer 5 people or 500 — you earn 50% on every single one.",
    },
    ro: {
      title: "Program Referral",
      heroTitle: "Câștigă 50% Comision",
      heroSubtitle: "La Fiecare Plată. Pentru Totdeauna.",
      heroDescription: "Adu-ți prietenii, clienții sau audiența pe platformă și câștigă 50% din fiecare plată de abonament pe care o fac — nu doar o singură dată, ci cât timp rămân abonați.",
      
      howItWorksTitle: "Cum Funcționează",
      step1Title: "1. Primești Link-ul",
      step1Desc: "Fă upgrade la PRO și primești instant link-ul tău unic de referral.",
      step2Title: "2. Distribuie-l",
      step2Desc: "Împărtășește link-ul cu prietenii, clienții, followerii sau oricine vrea să evolueze.",
      step3Title: "3. Câștigi 50%",
      step3Desc: "De fiecare dată când plătesc, tu primești 50%. Lunar sau anual — comisionul tău este recurent.",
      
      mathTitle: "Matematica Care Schimbă Totul",
      mathSubtitle: "Asta nu e bani de buzunar. Asta e un venit real.",
      example1: "5 referrals × €97/lună = €242.50/lună pentru tine",
      example2: "10 referrals × €97/lună = €485/lună pentru tine",
      example3: "25 referrals × €97/lună = €1,212.50/lună pentru tine",
      mathNote: "Și asta e doar PRO. Referralurile Elite plătesc și mai mult.",
      
      whyTitle: "De Ce Este Diferit",
      why1Title: "50% Comision",
      why1Desc: "Nu 10%. Nu 20%. Un 50% complet din fiecare plată merge la tine.",
      why2Title: "Recurent Pentru Totdeauna",
      why2Desc: "Cât timp referralul tău rămâne abonat, tu continui să câștigi. Lunar. Anual. Mereu.",
      why3Title: "Plăți Automate",
      why3Desc: "Prin Stripe Connect. Fără facturi. Fără alergat după plăți. Banii ajung direct în cont.",
      why4Title: "Tracking în Timp Real",
      why4Desc: "Vezi fiecare referral, fiecare conversie, fiecare euro în Coach Dashboard.",
      
      perfectForTitle: "Perfect Pentru",
      perfect1: "Coachi și Traineri",
      perfect1Desc: "Dă-le clienților tăi instrumentele de care au nevoie și fii plătit pentru asta.",
      perfect2: "Creatori de Conținut",
      perfect2Desc: "Monetizează-ți audiența cu ceva care îi ajută cu adevărat.",
      perfect3: "Lideri de Comunitate",
      perfect3Desc: "Întărește-ți comunitatea în timp ce construiești venit pasiv.",
      perfect4: "Antreprenori",
      perfect4Desc: "Adaugă un flux de venit recurent afacerii tale.",
      
      upgradeTitle: "Pregătit Să Începi Să Câștigi?",
      upgradeSubtitle: "Fă upgrade la PRO pentru a-ți debloca link-ul de referral și începe să construiești venit pasiv azi.",
      upgradeCta: "Upgrade la PRO",
      
      alreadyProTitle: "Link-ul Tău de Referral",
      alreadyProSubtitle: "Distribuie acest link și începe să câștigi 50% la fiecare abonament.",
      copyLink: "Copiază Link",
      shareLink: "Distribuie",
      viewDashboard: "Vezi Coach Dashboard",
      
      faqTitle: "Întrebări Frecvente",
      faq1Q: "Când primesc banii?",
      faq1A: "Plățile sunt automate prin Stripe Connect. Odată ce atingi €25 în câștiguri, se transferă în contul tău bancar.",
      faq2Q: "Trebuie să fiu coach pentru a mă înscrie?",
      faq2A: "Nu! Orice membru PRO poate câștiga comisioane de referral. Coach Dashboard este disponibil pentru membrii ELITE care vor management avansat de clienți.",
      faq3Q: "Ce se întâmplă dacă referralul meu face upgrade de la PRO la ELITE?",
      faq3A: "Câștigi 50% din noul lor plan. Plan mai mare = comision mai mare pentru tine.",
      faq4Q: "Există o limită la câte referraluri pot avea?",
      faq4A: "Fără limită. Referă 5 persoane sau 500 — câștigi 50% pentru fiecare.",
    }
  };

  const t = content[language];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Helmet>
        <title>{t.title} | CEO Mind OS</title>
        <meta name="description" content={t.heroDescription} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          
          <motion.div 
            className="container mx-auto px-4 relative z-10"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-primary font-semibold">{t.title}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4">
                <span className="text-primary">{t.heroTitle}</span>
              </h1>
              <p className="text-2xl md:text-4xl font-bold text-foreground mb-6">
                {t.heroSubtitle}
              </p>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {t.heroDescription}
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-center mb-12">
                {t.howItWorksTitle}
              </motion.h2>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  { icon: Gift, title: t.step1Title, desc: t.step1Desc },
                  { icon: Share2, title: t.step2Title, desc: t.step2Desc },
                  { icon: DollarSign, title: t.step3Title, desc: t.step3Desc }
                ].map((step, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <Card className="glass-card h-full text-center p-6 hover:border-primary/50 transition-all">
                      <CardContent className="pt-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <step.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Math */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.mathTitle}</h2>
                <p className="text-xl text-muted-foreground">{t.mathSubtitle}</p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="glass-card border-primary/30 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {[t.example1, t.example2, t.example3].map((example, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-xl ${
                            idx === 2 ? 'bg-primary/20 border border-primary/40' : 'bg-muted/50'
                          }`}
                        >
                          <span className={`text-lg md:text-xl font-mono ${idx === 2 ? 'text-primary font-bold' : ''}`}>
                            {example}
                          </span>
                          {idx === 2 && <TrendingUp className="h-6 w-6 text-primary" />}
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-muted-foreground mt-6 italic">
                      {t.mathNote}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Why Different */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-center mb-12">
                {t.whyTitle}
              </motion.h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[
                  { icon: DollarSign, title: t.why1Title, desc: t.why1Desc },
                  { icon: Repeat, title: t.why2Title, desc: t.why2Desc },
                  { icon: Zap, title: t.why3Title, desc: t.why3Desc },
                  { icon: TrendingUp, title: t.why4Title, desc: t.why4Desc }
                ].map((item, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <Card className="glass-card h-full p-6">
                      <CardContent className="p-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Perfect For */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-center mb-12">
                {t.perfectForTitle}
              </motion.h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[
                  { icon: Users, title: t.perfect1, desc: t.perfect1Desc },
                  { icon: Share2, title: t.perfect2, desc: t.perfect2Desc },
                  { icon: Shield, title: t.perfect3, desc: t.perfect3Desc },
                  { icon: Crown, title: t.perfect4, desc: t.perfect4Desc }
                ].map((item, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <Card className="glass-card h-full p-6 text-center">
                      <CardContent className="p-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <item.icon className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-muted/50 to-accent/10">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="max-w-2xl mx-auto text-center"
            >
              {user && referralLink ? (
                <motion.div variants={itemVariants}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.alreadyProTitle}</h2>
                  <p className="text-lg text-muted-foreground mb-8">{t.alreadyProSubtitle}</p>
                  
                  <Card className="glass-card border-primary/30 p-6 mb-6">
                    <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
                      <input 
                        type="text" 
                        value={referralLink} 
                        readOnly 
                        className="flex-1 bg-transparent text-sm font-mono truncate outline-none"
                      />
                    </div>
                  </Card>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      onClick={shareReferralLink}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Share2 className="h-5 w-5" />
                      {t.shareLink}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate('/coach')}
                      className="gap-2"
                    >
                      <TrendingUp className="h-5 w-5" />
                      {t.viewDashboard}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.upgradeTitle}</h2>
                  <p className="text-lg text-muted-foreground mb-8">{t.upgradeSubtitle}</p>
                  
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/pricing')}
                    className="gap-2 text-lg px-8 py-6"
                  >
                    {t.upgradeCta}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="max-w-3xl mx-auto"
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-center mb-12">
                {t.faqTitle}
              </motion.h2>
              
              <div className="space-y-4">
                {[
                  { q: t.faq1Q, a: t.faq1A },
                  { q: t.faq2Q, a: t.faq2A },
                  { q: t.faq3Q, a: t.faq3A },
                  { q: t.faq4Q, a: t.faq4A }
                ].map((faq, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <Card className="glass-card">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-2 flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          {faq.q}
                        </h3>
                        <p className="text-muted-foreground pl-8">{faq.a}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReferralProgram;
