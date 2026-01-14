import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const SocialProofNew = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { language } = useLanguage();

  const testimonials = [
    {
      name: "Alexandru M.",
      role: language === 'en' ? 'E-commerce Founder' : 'Fondator E-commerce',
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      quote: language === 'en'
        ? "In 90 days I went from 70-hour work weeks to 45 hours, while revenue grew 30%. The Warrior Routine changed everything."
        : "În 90 de zile am trecut de la săptămâni de 70 ore la 45 ore, iar veniturile au crescut cu 30%. Rutina Războinicului a schimbat totul.",
      result: "+30% revenue, -35% work hours",
    },
    {
      name: "Maria D.",
      role: language === 'en' ? 'SaaS CEO' : 'CEO SaaS',
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      quote: language === 'en'
        ? "The AI coaches helped me see blind spots I couldn't see alone. My relationship with my husband improved dramatically."
        : "Coachii AI m-au ajutat să văd puncte oarbe pe care nu le vedeam singură. Relația cu soțul s-a îmbunătățit dramatic.",
      result: language === 'en' ? "Saved her marriage" : "Și-a salvat căsnicia",
    },
    {
      name: "Andrei P.",
      role: language === 'en' ? 'Agency Owner' : 'Proprietar Agenție',
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      quote: language === 'en'
        ? "I was on the edge of burnout. After 60 days with WarriorOS, I lost 8kg, sleep 7 hours/night, and actually enjoy weekends with my kids."
        : "Eram la limita burnout-ului. După 60 de zile cu WarriorOS, am slăbit 8kg, dorm 7 ore/noapte și chiar mă bucur de weekenduri cu copiii.",
      result: "-8kg, +2h sleep/night",
    },
  ];

  const stats = [
    { value: "92%", label: language === 'en' ? 'Report mental clarity in week 1' : 'Raportează claritate mentală în săptămâna 1' },
    { value: "+23%", label: language === 'en' ? 'Average profit increase' : 'Creștere medie a profitului' },
    { value: "87%", label: language === 'en' ? 'Exercise daily after 30 days' : 'Fac exerciții zilnic după 30 zile' },
    { value: "4.9★", label: language === 'en' ? 'Average rating from users' : 'Rating mediu de la utilizatori' },
  ];

  return (
    <section 
      ref={elementRef}
      className={`py-16 md:py-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {language === 'en' ? 'Real Results from Real Entrepreneurs' : 'Rezultate Reale de la Antreprenori Reali'}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {language === 'en' 
            ? 'Join entrepreneurs who transformed their lives without sacrificing their business.'
            : 'Alătură-te antreprenorilor care și-au transformat viața fără să-și sacrifice business-ul.'
          }
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-12">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card border-2 border-border p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-card border-2 border-border p-6 md:p-8 relative">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
            
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            
            {/* Quote */}
            <p className="text-foreground mb-4 leading-relaxed italic">
              "{testimonial.quote}"
            </p>
            
            {/* Result Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
              ✓ {testimonial.result}
            </div>
            
            {/* Author */}
            <div className="flex items-center gap-3">
              <img 
                src={testimonial.image} 
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Industries */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'en' ? 'Trusted by entrepreneurs in:' : 'Folosit de antreprenori în:'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {['E-commerce', 'SaaS', 'Consulting', 'Agencies', 'Real Estate', 'Coaching'].map((industry) => (
            <span 
              key={industry}
              className="px-4 py-2 bg-muted text-muted-foreground text-sm rounded-full"
            >
              {industry}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
