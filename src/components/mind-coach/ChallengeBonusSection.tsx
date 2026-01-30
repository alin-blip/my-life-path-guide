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
  CheckCircle2,
  XCircle,
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
      ro: 'Te trezești dimineața fără să știi CE vrei și DE CE contează. Energia se risipește.', 
      en: 'You wake up not knowing WHAT you want and WHY it matters. Energy dissipates.' 
    },
    action: { 
      ro: 'Scrii Declarația ta oficială pentru Corp, Spirit, Relații și Business.', 
      en: 'Write your official Declaration for Body, Spirit, Relationships and Business.' 
    },
    pleasure: { 
      ro: 'Claritate cristalină. Fiecare decizie devine simplă când știi exact unde mergi.', 
      en: 'Crystal clarity. Every decision becomes simple when you know exactly where you\'re going.' 
    },
    gradient: 'from-red-500/20 to-orange-500/20',
  },
  {
    day: '2-3',
    title: { ro: 'Obiective Complete', en: 'Complete Objectives' },
    icon: Calendar,
    pain: { 
      ro: 'Confuzie și haos. Visele rămân vise, lunile trec, nimic nu se schimbă real.', 
      en: 'Confusion and chaos. Dreams stay dreams, months pass, nothing really changes.' 
    },
    action: { 
      ro: 'Obiective anuale → 90 zile → lunar → săptămânal. Plan structurat.', 
      en: 'Annual goals → 90 days → monthly → weekly. Structured plan.' 
    },
    pleasure: { 
      ro: 'Eliminarea completă a confuziei. Știi EXACT ce ai de făcut în fiecare zi.', 
      en: 'Complete elimination of confusion. You know EXACTLY what to do every day.' 
    },
    gradient: 'from-orange-500/20 to-yellow-500/20',
  },
  {
    day: 4,
    title: { ro: 'Rutina Campionului', en: 'Champion Routine' },
    icon: Sunrise,
    pain: { 
      ro: '"Nu am chef" e scuza zilnică. Dimineața haotică, seara te întrebi ce ai făcut.', 
      en: '"I don\'t feel like it" is the daily excuse. Chaotic mornings, evenings wondering what you did.' 
    },
    action: { 
      ro: 'Morning Stack: Intenție → Centrare → Recunoștință → Putere → Plan → Angajament.', 
      en: 'Morning Stack: Intention → Centering → Gratitude → Power → Plan → Commitment.' 
    },
    pleasure: { 
      ro: 'Fiecare dimineață începi cu ENERGIE și FOCUS. Motivația nu mai e opțională.', 
      en: 'Every morning starts with ENERGY and FOCUS. Motivation is no longer optional.' 
    },
    gradient: 'from-yellow-500/20 to-green-500/20',
  },
  {
    day: 5,
    title: { ro: 'Viziune AI', en: 'AI Vision' },
    icon: ImageIcon,
    pain: { 
      ro: 'Mintea nu urmărește ce nu poate vedea. Motivația scade în timp fără vizualizare.', 
      en: 'The mind doesn\'t chase what it can\'t see. Motivation fades over time without visualization.' 
    },
    action: { 
      ro: 'AI generează imagini pentru obiective + meditație ghidată personalizată.', 
      en: 'AI generates images for goals + personalized guided meditation.' 
    },
    pleasure: { 
      ro: 'Subconștientul lucrează pentru tine 24/7. Viziunea devine mai reală în fiecare zi.', 
      en: 'Your subconscious works for you 24/7. The vision becomes more real every day.' 
    },
    gradient: 'from-green-500/20 to-teal-500/20',
  },
  {
    day: 6,
    title: { ro: 'Accountability', en: 'Accountability' },
    icon: Users,
    pain: { 
      ro: 'Singur cedezi. 92% din obiective eșuează pentru că nimeni nu te ține responsabil.', 
      en: 'Alone, you give in. 92% of goals fail because no one holds you accountable.' 
    },
    action: { 
      ro: 'Notificări, remindere + partener accountability din comunitate.', 
      en: 'Notifications, reminders + accountability partner from the community.' 
    },
    pleasure: { 
      ro: 'Nu mai poți fugi de tine. Sistemul te împinge înainte când mintea vrea să renunțe.', 
      en: 'You can\'t run from yourself anymore. The system pushes you forward when the mind wants to quit.' 
    },
    gradient: 'from-teal-500/20 to-blue-500/20',
  },
  {
    day: 7,
    title: { ro: 'Integrare Completă', en: 'Complete Integration' },
    icon: Zap,
    pain: { 
      ro: 'Ai piesele dar nu funcționează împreună. Fără integrare, totul se destramă.', 
      en: 'You have the pieces but they don\'t work together. Without integration, everything falls apart.' 
    },
    action: { 
      ro: 'Conectare Corp → Spirit → Relații → Business într-un ciclu virtuos.', 
      en: 'Connecting Body → Spirit → Relationships → Business in a virtuous cycle.' 
    },
    pleasure: { 
      ro: 'CICLUL VIRTUOS activat: Corp puternic → Minte clară → Relații armonioase → Business în creștere.', 
      en: 'VIRTUOUS CYCLE activated: Strong body → Clear mind → Harmonious relationships → Growing business.' 
    },
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
];

export function ChallengeBonusSection({ language = 'ro' }: ChallengeBonusSectionProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 rounded-full border border-amber-500/30 mb-4">
            <Gift className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-semibold text-amber-500">
              {language === 'ro' ? 'BONUS EXCLUSIV' : 'EXCLUSIVE BONUS'}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'ro' 
              ? '7-Day Transformation Challenge' 
              : '7-Day Transformation Challenge'}
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro'
              ? 'Sign up TODAY și primești GRATUIT provocarea care transformă visele în realitate.'
              : 'Sign up TODAY and get FREE the challenge that transforms dreams into reality.'}
          </p>
        </motion.div>

        {/* Challenge Days Grid */}
        <div className="space-y-6">
          {challengeDays.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden border-0 bg-gradient-to-r ${day.gradient} backdrop-blur-sm`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Day indicator */}
                    <div className="bg-background/50 p-4 md:p-6 flex flex-col items-center justify-center min-w-[100px] border-b md:border-b-0 md:border-r border-border/50">
                      <span className="text-xs text-muted-foreground uppercase">
                        {language === 'ro' ? 'Ziua' : 'Day'}
                      </span>
                      <span className="text-2xl font-bold">{day.day}</span>
                      <day.icon className="h-6 w-6 mt-2 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        {day.title[language]}
                      </h3>

                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Pain */}
                        <div className="flex gap-3">
                          <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-medium text-destructive uppercase">
                              {language === 'ro' ? 'Durere' : 'Pain'} ❌
                            </span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {day.pain[language]}
                            </p>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex gap-3">
                          <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-medium text-primary uppercase">
                              {language === 'ro' ? 'Acțiune' : 'Action'} 🎯
                            </span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {day.action[language]}
                            </p>
                          </div>
                        </div>

                        {/* Pleasure */}
                        <div className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-medium text-green-500 uppercase">
                              {language === 'ro' ? 'Plăcere' : 'Pleasure'} ✅
                            </span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {day.pleasure[language]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-sm text-muted-foreground">
            💡 {language === 'ro'
              ? 'Disponibil doar pentru membri noi care se înscriu azi.'
              : 'Available only for new members who sign up today.'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
