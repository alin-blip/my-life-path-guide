import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Star } from "lucide-react";

export const TestimonialCarousel = () => {
  const { language } = useLanguage();

  const testimonials = [
    {
      name: "Alexandru M.",
      handle: "@alexandru_m",
      avatar: "🧔",
      quote: language === 'ro'
        ? "Am trecut de la 70h/săptămână la 45h cu rezultate mai bune. CEO Mind OS m-a ajutat să înțeleg că productivitatea nu înseamnă ore, ci claritate."
        : "I went from 70h/week to 45h with better results. CEO Mind OS helped me understand that productivity is not about hours, but clarity.",
      rating: 5,
    },
    {
      name: "Maria D.",
      handle: "@maria_founder",
      avatar: "👩‍💼",
      quote: language === 'ro'
        ? "Pentru prima dată am simțit că am control asupra vieții mele. Rutinele de dimineață mi-au transformat complet energia și focusul."
        : "For the first time I felt in control of my life. Morning routines completely transformed my energy and focus.",
      rating: 5,
    },
    {
      name: "Dan C.",
      handle: "@dan_ecom",
      avatar: "👨‍💻",
      quote: language === 'ro'
        ? "Am recuperat relația cu familia și am crescut profitul cu 35%. Nu credeam că e posibil să le am pe amândouă."
        : "I recovered my relationship with family and grew profit by 35%. I didn't believe it was possible to have both.",
      rating: 5,
    },
    {
      name: "Ioana T.",
      handle: "@ioana_consult",
      avatar: "👩‍🔬",
      quote: language === 'ro'
        ? "Stack-urile emoționale au fost game-changer. Am procesat ani de burnout și acum mă simt cu adevărat liberă."
        : "Emotional stacks were a game-changer. I processed years of burnout and now I feel truly free.",
      rating: 5,
    },
    {
      name: "Andrei P.",
      handle: "@andrei_tech",
      avatar: "🧑‍💻",
      quote: language === 'ro'
        ? "Cel mai bun sistem de productivitate pe care l-am folosit vreodată. AI Coaches sunt geniali."
        : "The best productivity system I've ever used. AI Coaches are brilliant.",
      rating: 5,
    },
    {
      name: "Elena R.",
      handle: "@elena_coach",
      avatar: "👩‍🏫",
      quote: language === 'ro'
        ? "Recomand tuturor clienților mei. E exact ce lipsea din piața de coaching digital."
        : "I recommend it to all my clients. It's exactly what was missing from the digital coaching market.",
      rating: 5,
    },
  ];

  // Duplicate for seamless scroll
  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="n8n-section overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="n8n-badge mb-4 mx-auto w-fit">
            <Star className="w-4 h-4" />
            {language === 'ro' ? 'Testimoniale' : 'Testimonials'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {language === 'ro' 
              ? 'Ce spun antreprenorii despre noi' 
              : 'What entrepreneurs say about us'}
          </h2>
        </motion.div>
      </div>

      {/* Horizontal Scroll */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <div className="flex overflow-hidden py-4">
          <motion.div
            className="flex gap-6 testimonial-scroll"
            style={{ minWidth: 'max-content' }}
          >
            {allTestimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="w-[350px] flex-shrink-0 n8n-card p-6 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.handle}</div>
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-foreground leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
