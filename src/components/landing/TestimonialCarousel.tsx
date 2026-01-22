import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

export const TestimonialCarousel = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Alexandru M.",
      role: language === 'ro' ? "CEO, Tech Startup" : "CEO, Tech Startup",
      image: "🧔",
      quote: language === 'ro'
        ? "Am trecut de la 70h/săptămână la 45h cu rezultate mai bune. WarriorOS m-a ajutat să înțeleg că productivitatea nu înseamnă ore, ci claritate."
        : "I went from 70h/week to 45h with better results. WarriorOS helped me understand that productivity is not about hours, but clarity.",
      result: language === 'ro' ? "+40% timp liber" : "+40% free time",
      rating: 5,
    },
    {
      name: "Maria D.",
      role: language === 'ro' ? "Founder, Agency" : "Founder, Agency",
      image: "👩‍💼",
      quote: language === 'ro'
        ? "Pentru prima dată am simțit că am control asupra vieții mele. Rutinele de dimineață mi-au transformat complet energia și focusul."
        : "For the first time I felt in control of my life. Morning routines completely transformed my energy and focus.",
      result: language === 'ro' ? "+60% energie" : "+60% energy",
      rating: 5,
    },
    {
      name: "Dan C.",
      role: language === 'ro' ? "E-commerce, €2M/an" : "E-commerce, €2M/year",
      image: "👨‍💻",
      quote: language === 'ro'
        ? "Am recuperat relația cu familia și am crescut profitul cu 35%. Nu credeam că e posibil să le am pe amândouă."
        : "I recovered my relationship with family and grew profit by 35%. I didn't believe it was possible to have both.",
      result: language === 'ro' ? "+35% profit" : "+35% profit",
      rating: 5,
    },
    {
      name: "Ioana T.",
      role: language === 'ro' ? "Consultant, Freelancer" : "Consultant, Freelancer",
      image: "👩‍🔬",
      quote: language === 'ro'
        ? "Stack-urile emoționale au fost game-changer. Am procesat ani de burnout și acum mă simt cu adevărat liberă."
        : "Emotional stacks were a game-changer. I processed years of burnout and now I feel truly free.",
      result: language === 'ro' ? "Burnout → Clarity" : "Burnout → Clarity",
      rating: 5,
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            {language === 'ro' ? 'Testimoniale' : 'Testimonials'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro' 
              ? 'Transformări reale de la oameni reali' 
              : 'Real transformations from real people'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Descoperă cum antreprenori ca tine și-au transformat viața și business-ul.'
              : 'Discover how entrepreneurs like you transformed their life and business.'}
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden"
              >
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-16 h-16 text-primary/10" />

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-foreground mb-8 leading-relaxed">
                  "{testimonials[currentIndex].quote}"
                </blockquote>

                {/* Author & Result */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                      {testimonials[currentIndex].image}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonials[currentIndex].name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonials[currentIndex].role}
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium">
                    ✨ {testimonials[currentIndex].result}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'bg-primary w-8'
                        : 'bg-border hover:bg-muted-foreground'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid of mini testimonials */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setCurrentIndex(idx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{t.image}</span>
                <div>
                  <div className="font-medium text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.result}</div>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
