import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, 
  Calendar, 
  Sunrise, 
  ImageIcon, 
  Users, 
  Zap,
  Gift
} from 'lucide-react';

interface ChallengeBonusSectionProps {
  language?: 'ro' | 'en';
}

const challengeDays = [
  {
    day: 1,
    title: { ro: 'Viziune și Declarație', en: 'Vision & Declaration' },
    icon: Target,
    pain: { 
      ro: 'Te trezești dimineața fără să știi CE vrei și DE CE contează.', 
      en: 'You wake up not knowing WHAT you want and WHY it matters.' 
    },
    action: { 
      ro: 'Scrii Declarația ta oficială pentru Corp, Spirit, Relații și Business.', 
      en: 'Write your official Declaration for Body, Spirit, Relationships and Business.' 
    },
    pleasure: { 
      ro: 'Claritate cristalină. Fiecare decizie devine simplă.', 
      en: 'Crystal clarity. Every decision becomes simple.' 
    },
    gradient: 'from-red-500/20 to-orange-500/20',
  },
  {
    day: '2-3',
    title: { ro: 'Obiective Complete', en: 'Complete Objectives' },
    icon: Calendar,
    pain: { 
      ro: 'Confuzie și haos. Visele rămân vise, lunile trec.', 
      en: 'Confusion and chaos. Dreams stay dreams, months pass.' 
    },
    action: { 
      ro: 'Obiective anuale → 90 zile → lunar → săptămânal.', 
      en: 'Annual goals → 90 days → monthly → weekly.' 
    },
    pleasure: { 
      ro: 'Știi EXACT ce ai de făcut în fiecare zi.', 
      en: 'You know EXACTLY what to do every day.' 
    },
    gradient: 'from-orange-500/20 to-yellow-500/20',
  },
  {
    day: 4,
    title: { ro: 'Rutina Campionului', en: 'Champion Routine' },
    icon: Sunrise,
    pain: { 
      ro: '"Nu am chef" e scuza zilnică. Dimineața haotică.', 
      en: '"I don\'t feel like it" is the daily excuse.' 
    },
    action: { 
      ro: 'Morning Stack: Intenție → Centrare → Recunoștință → Putere.', 
      en: 'Morning Stack: Intention → Centering → Gratitude → Power.' 
    },
    pleasure: { 
      ro: 'Fiecare dimineață începi cu ENERGIE și FOCUS.', 
      en: 'Every morning starts with ENERGY and FOCUS.' 
    },
    gradient: 'from-yellow-500/20 to-green-500/20',
  },
  {
    day: 5,
    title: { ro: 'Viziune AI', en: 'AI Vision' },
    icon: ImageIcon,
    pain: { 
      ro: 'Mintea nu urmărește ce nu poate vedea.', 
      en: 'The mind doesn\'t chase what it can\'t see.' 
    },
    action: { 
      ro: 'AI generează imagini pentru obiective + meditație ghidată.', 
      en: 'AI generates images for goals + guided meditation.' 
    },
    pleasure: { 
      ro: 'Subconștientul lucrează pentru tine 24/7.', 
      en: 'Your subconscious works for you 24/7.' 
    },
    gradient: 'from-green-500/20 to-teal-500/20',
  },
  {
    day: 6,
    title: { ro: 'Accountability', en: 'Accountability' },
    icon: Users,
    pain: { 
      ro: 'Singur cedezi. 92% din obiective eșuează.', 
      en: 'Alone, you give in. 92% of goals fail.' 
    },
    action: { 
      ro: 'Notificări, remindere + partener accountability.', 
      en: 'Notifications, reminders + accountability partner.' 
    },
    pleasure: { 
      ro: 'Nu mai poți fugi de tine. Sistemul te împinge înainte.', 
      en: 'You can\'t run from yourself anymore.' 
    },
    gradient: 'from-teal-500/20 to-blue-500/20',
  },
  {
    day: 7,
    title: { ro: 'Integrare Completă', en: 'Complete Integration' },
    icon: Zap,
    pain: { 
      ro: 'Ai piesele dar nu funcționează împreună.', 
      en: 'You have the pieces but they don\'t work together.' 
    },
    action: { 
      ro: 'Conectare Corp → Spirit → Relații → Business.', 
      en: 'Connecting Body → Spirit → Relationships → Business.' 
    },
    pleasure: { 
      ro: 'CICLUL VIRTUOS activat: totul funcționează în armonie.', 
      en: 'VIRTUOUS CYCLE activated: everything works in harmony.' 
    },
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
];

export function ChallengeBonusSection({ language = 'ro' }: ChallengeBonusSectionProps) {
  return (
    <section className="py-10 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1.5 rounded-full border border-amber-500/30 mb-3">
            <Gift className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-500">
              {language === 'ro' ? 'BONUS EXCLUSIV' : 'EXCLUSIVE BONUS'}
            </span>
          </div>
          
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            <span className="n8n-gradient-text">7-Day Transformation Challenge</span>
          </h2>
          
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            {language === 'ro'
              ? 'Înscrie-te azi și primești GRATUIT provocarea completă'
              : 'Sign up today and get the complete challenge FREE'}
          </p>
        </motion.div>

        {/* Challenge Days - Simplified Mobile-First Layout */}
        <div className="space-y-3 md:space-y-4">
          {challengeDays.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`overflow-hidden border-0 bg-gradient-to-r ${day.gradient} backdrop-blur-sm`}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Day indicator */}
                    <div className="flex flex-col items-center justify-center min-w-[50px] md:min-w-[60px] text-center shrink-0">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {language === 'ro' ? 'Ziua' : 'Day'}
                      </span>
                      <span className="text-lg md:text-xl font-bold">{day.day}</span>
                      <day.icon className="h-4 w-4 md:h-5 md:w-5 text-primary mt-1" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-semibold mb-2">
                        {day.title[language]}
                      </h3>

                      {/* Simplified 3-row content with symbols */}
                      <div className="space-y-1.5 text-xs md:text-sm">
                        <p className="text-muted-foreground flex items-start gap-2">
                          <span className="text-red-400/80 shrink-0">•</span>
                          <span>{day.pain[language]}</span>
                        </p>
                        <p className="text-muted-foreground flex items-start gap-2">
                          <span className="text-primary shrink-0">→</span>
                          <span>{day.action[language]}</span>
                        </p>
                        <p className="text-muted-foreground flex items-start gap-2">
                          <span className="text-green-400/80 shrink-0">✓</span>
                          <span>{day.pleasure[language]}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-6"
        >
          <p className="text-xs text-muted-foreground">
            💡 {language === 'ro'
              ? 'Disponibil doar pentru membri noi care se înscriu azi.'
              : 'Available only for new members who sign up today.'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
