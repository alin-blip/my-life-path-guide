import React from 'react';

interface EbookTestimonialsProps {
  language: 'ro' | 'en';
}

const testimonials = {
  ro: [
    { quote: 'Am crezut că burnout-ul e prețul succesului. CEO Mind OS mi-a arătat că e doar simptomul unui sistem defect.', author: 'M.D., Fondator SaaS' },
    { quote: 'În 30 de zile am recâștigat 2 ore pe zi și am redevenit prezent cu familia.', author: 'A.P., CEO Agenție' },
    { quote: 'Nu e o carte de dezvoltare personală. E un manual de operare. Urmezi pașii, obții rezultatele.', author: 'R.S., Serial Entrepreneur' },
  ],
  en: [
    { quote: 'I thought burnout was the price of success. CEO Mind OS showed me it\'s just a symptom of a broken system.', author: 'M.D., SaaS Founder' },
    { quote: 'In 30 days I reclaimed 2 hours a day and became present with my family again.', author: 'A.P., Agency CEO' },
    { quote: 'It\'s not a personal development book. It\'s an operating manual. Follow the steps, get the results.', author: 'R.S., Serial Entrepreneur' },
  ],
};

export const EbookTestimonials: React.FC<EbookTestimonialsProps> = ({ language }) => {
  const t = language === 'ro'
    ? { badge: 'Rezultate reale', title: 'Ce spun antreprenorii care au aplicat sistemul' }
    : { badge: 'Real results', title: 'What entrepreneurs who applied the system say' };

  return (
    <section className="px-6 md:px-12 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.2em] text-amber-400/60 uppercase mb-2">05 &nbsp; {t.badge}</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">{t.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials[language].map((item, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
              <span className="text-amber-400 text-3xl leading-none">"</span>
              <p className="text-white/70 text-sm mt-2 mb-4 italic">{item.quote}</p>
              <p className="text-white/70 text-xs">— {item.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
