import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Sparkles, Target, Zap } from "lucide-react";
import { useState } from "react";

export const NewHeroSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const highlights = language === 'ro' 
    ? [
        { icon: Zap, text: "Rezultate în 48h" },
        { icon: Target, text: "Sistem AI personal" },
        { icon: Sparkles, text: "4 Piloni de viață" },
      ]
    : [
        { icon: Zap, text: "Results in 48h" },
        { icon: Target, text: "Personal AI System" },
        { icon: Sparkles, text: "4 Life Pillars" },
      ];

  return (
    <section className="relative min-h-[90vh] flex items-center py-12 md:py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        
        {/* Animated Glow Orbs */}
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              {language === 'ro' ? 'Sistemul #1 pentru antreprenori' : '#1 System for Entrepreneurs'}
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">
                {language === 'ro' ? 'Succes' : 'Success'}
              </span>
              <br />
              <span className="text-foreground">
                {language === 'ro' ? 'Fără' : 'Without'}{' '}
              </span>
              <span className="gradient-text">
                {language === 'ro' ? 'Sacrificiu' : 'Sacrifice'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
              {language === 'ro' 
                ? 'Transformă-ți viața în 4 dimensiuni: Corp, Spirit, Relații și Business. Un sistem AI care te ghidează zilnic către versiunea ta maximă.'
                : 'Transform your life across 4 dimensions: Body, Spirit, Relationships and Business. An AI system that guides you daily towards your best self.'}
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              {highlights.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 ring-4 ring-primary/20 hover:ring-primary/40 group"
              >
                {language === 'ro' ? 'Începe Gratuit - 7 Zile' : 'Start Free - 7 Days'}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsVideoPlaying(true)}
                className="text-lg px-8 py-6 border-2 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {language === 'ro' ? 'Vezi Demo' : 'Watch Demo'}
              </Button>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8 pt-8 border-t border-border/50"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['😊', '💪', '🚀', '⭐'].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm border-2 border-background">
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">500+</span> {language === 'ro' ? 'antreprenori' : 'entrepreneurs'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-500">★</span>
                ))}
                <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow Effect Behind Preview */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-3xl scale-95" />
            
            {/* Dashboard Mockup */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-background rounded-lg text-xs text-muted-foreground">
                    warriorsos.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content Preview */}
              <div className="p-6 bg-gradient-to-br from-background to-muted/30">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Body', value: '85%', color: 'from-green-500 to-emerald-500' },
                    { label: 'Being', value: '72%', color: 'from-purple-500 to-violet-500' },
                    { label: 'Balance', value: '90%', color: 'from-pink-500 to-rose-500' },
                    { label: 'Business', value: '78%', color: 'from-blue-500 to-indigo-500' },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="bg-card border border-border rounded-xl p-3 text-center"
                    >
                      <div className={`text-xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Today's Tasks */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">{language === 'ro' ? 'Astăzi' : 'Today'}</span>
                    <span className="text-xs text-primary">4/6 {language === 'ro' ? 'complete' : 'complete'}</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { text: language === 'ro' ? 'Rutină dimineață' : 'Morning routine', done: true },
                      { text: language === 'ro' ? 'Antrenament' : 'Workout', done: true },
                      { text: language === 'ro' ? 'Meditație' : 'Meditation', done: true },
                      { text: language === 'ro' ? 'Focus deep work' : 'Deep work focus', done: true },
                      { text: language === 'ro' ? 'Timp cu familia' : 'Family time', done: false },
                      { text: language === 'ro' ? 'Reflecție seară' : 'Evening reflection', done: false },
                    ].map((task, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + idx * 0.05 }}
                        className={`flex items-center gap-2 text-sm ${task.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${task.done ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                        {task.text}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
            >
              ✨ AI-Powered
            </motion.div>
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
