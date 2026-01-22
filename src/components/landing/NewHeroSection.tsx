import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Dumbbell, Brain, Heart, Briefcase, User } from "lucide-react";
import { useState } from "react";

export const NewHeroSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('body');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const tabs = [
    { id: 'body', label: 'Body', icon: Dumbbell, color: 'from-green-500 to-emerald-500' },
    { id: 'being', label: 'Being', icon: Brain, color: 'from-purple-500 to-violet-500' },
    { id: 'balance', label: 'Balance', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'business', label: 'Business', icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
    { id: 'you', label: language === 'ro' ? 'Tu' : 'You', icon: User, color: 'from-orange-500 to-amber-500' },
  ];

  const tabContent: Record<string, { title: string; description: string; features: string[] }> = {
    body: {
      title: language === 'ro' ? 'Coach AI pentru Corp' : 'AI Body Coach',
      description: language === 'ro' 
        ? 'Antrenamente personalizate, nutriție și tracking pentru energia maximă.'
        : 'Personalized workouts, nutrition and tracking for maximum energy.',
      features: language === 'ro' 
        ? ['Antrenamente personalizate', 'Plan nutrițional AI', 'Tracking energie', 'Rutine dimineață']
        : ['Personalized workouts', 'AI nutrition plan', 'Energy tracking', 'Morning routines'],
    },
    being: {
      title: language === 'ro' ? 'Coach AI pentru Mindset' : 'AI Being Coach',
      description: language === 'ro'
        ? 'Meditații ghidate, vizualizări și dezvoltare personală avansată.'
        : 'Guided meditations, visualizations and advanced personal development.',
      features: language === 'ro'
        ? ['Meditații ghidate', 'Vizualizări AI', 'Jurnalizare', 'Afirmații personalizate']
        : ['Guided meditations', 'AI visualizations', 'Journaling', 'Custom affirmations'],
    },
    balance: {
      title: language === 'ro' ? 'Coach AI pentru Relații' : 'AI Balance Coach',
      description: language === 'ro'
        ? 'Îmbunătățește relațiile cu familia, prietenii și partenerii de business.'
        : 'Improve relationships with family, friends and business partners.',
      features: language === 'ro'
        ? ['Acțiuni zilnice', 'Reminder-uri smart', 'Tracking relații', 'Exerciții comunicare']
        : ['Daily actions', 'Smart reminders', 'Relationship tracking', 'Communication exercises'],
    },
    business: {
      title: language === 'ro' ? 'Coach AI pentru Business' : 'AI Business Coach',
      description: language === 'ro'
        ? 'Strategie, productivitate și creștere business cu AI personal.'
        : 'Strategy, productivity and business growth with personal AI.',
      features: language === 'ro'
        ? ['Planificare săptămânală', 'Deep work focus', 'OKR tracking', 'Content calendar']
        : ['Weekly planning', 'Deep work focus', 'OKR tracking', 'Content calendar'],
    },
    you: {
      title: language === 'ro' ? 'Totul despre Tine' : 'All About You',
      description: language === 'ro'
        ? 'Dashboard personal cu toate progresele și obiectivele tale într-un singur loc.'
        : 'Personal dashboard with all your progress and goals in one place.',
      features: language === 'ro'
        ? ['Dashboard unificat', 'Progress tracking', 'Achievements', 'Vision Board AI']
        : ['Unified dashboard', 'Progress tracking', 'Achievements', 'AI Vision Board'],
    },
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 md:py-24 overflow-hidden n8n-hero-gradient">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full"
        >
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        </motion.div>
        <motion.div
          animate={{ 
            rotate: [360, 0],
          }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full"
        >
          <div className="absolute bottom-1/2 right-1/2 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="n8n-badge">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {language === 'ro' ? '#1 Sistem AI pentru Antreprenori' : '#1 AI System for Entrepreneurs'}
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">
                {language === 'ro' ? 'Sistemul AI pentru a atinge' : 'The AI system to achieve'}
              </span>
              <br />
              <span className="n8n-gradient-text">
                {language === 'ro' ? 'succes fără sacrificiu' : 'success without sacrifice'}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === 'ro' 
                ? '4 Coachi AI pentru Corp, Mindset, Relații și Business. Disponibili 24/7 să te ghideze către versiunea ta maximă.'
                : '4 AI Coaches for Body, Mindset, Relationships and Business. Available 24/7 to guide you to your best self.'}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="n8n-glow-button text-white text-lg px-8 py-6 rounded-xl font-semibold group"
            >
              {language === 'ro' ? 'Începe gratuit' : 'Get started for free'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/support')}
              className="text-lg px-8 py-6 rounded-xl border-2"
            >
              {language === 'ro' ? 'Vorbește cu echipa' : 'Talk to sales'}
            </Button>
          </motion.div>

          {/* Interactive Tab Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="n8n-preview-container shadow-2xl"
          >
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 p-4 border-b border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`n8n-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid lg:grid-cols-2 gap-8 items-center"
                >
                  {/* Content Side */}
                  <div className="space-y-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${tabs.find(t => t.id === activeTab)?.color} text-white`}>
                      {tabs.find(t => t.id === activeTab)?.icon && (
                        <span>{(() => { const Icon = tabs.find(t => t.id === activeTab)!.icon; return <Icon className="w-4 h-4" />; })()}</span>
                      )}
                      {tabs.find(t => t.id === activeTab)?.label} Coach
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      {tabContent[activeTab].title}
                    </h3>
                    
                    <p className="text-muted-foreground text-lg">
                      {tabContent[activeTab].description}
                    </p>
                    
                    <ul className="space-y-3">
                      {tabContent[activeTab].features.map((feature, idx) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3 text-foreground"
                        >
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${tabs.find(t => t.id === activeTab)?.color} flex items-center justify-center`}>
                            <span className="text-white text-xs">✓</span>
                          </div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="mt-4"
                      variant="outline"
                    >
                      {language === 'ro' ? 'Explorează' : 'Explore'} {tabs.find(t => t.id === activeTab)?.label}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  
                  {/* Preview Side - Placeholder for Dashboard Images */}
                  <div className="n8n-dashboard-preview p-6 rounded-2xl aspect-video flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${tabs.find(t => t.id === activeTab)?.color} flex items-center justify-center`}>
                        {(() => { const Icon = tabs.find(t => t.id === activeTab)!.icon; return <Icon className="w-10 h-10 text-white" />; })()}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {language === 'ro' ? 'Preview Dashboard' : 'Dashboard Preview'}
                        <br />
                        <span className="text-xs opacity-60">{language === 'ro' ? '(Imagine dashboard aici)' : '(Dashboard image here)'}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Trust Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
          >
            <div className="n8n-trust-badge">
              <span className="text-lg">⭐</span>
              <div>
                <div className="font-semibold text-foreground">4.9/5</div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
            </div>
            <div className="n8n-trust-badge">
              <span className="text-lg">👥</span>
              <div>
                <div className="font-semibold text-foreground">500+</div>
                <div className="text-xs text-muted-foreground">{language === 'ro' ? 'Antreprenori' : 'Entrepreneurs'}</div>
              </div>
            </div>
            <div className="n8n-trust-badge">
              <span className="text-lg">📈</span>
              <div>
                <div className="font-semibold text-foreground">92%</div>
                <div className="text-xs text-muted-foreground">{language === 'ro' ? 'Mai multă claritate' : 'More clarity'}</div>
              </div>
            </div>
            <div className="n8n-trust-badge">
              <span className="text-lg">🎯</span>
              <div>
                <div className="font-semibold text-foreground">48h</div>
                <div className="text-xs text-muted-foreground">{language === 'ro' ? 'Primele rezultate' : 'First results'}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src="https://voomly.com/embed/6820dc8d21c07b00225e9e86?autoplay=1"
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};
