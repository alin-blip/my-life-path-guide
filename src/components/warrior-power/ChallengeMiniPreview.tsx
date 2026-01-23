import { motion } from 'framer-motion';
import { Calendar, Zap } from 'lucide-react';

interface ChallengeMiniPreviewProps {
  weakestDimension: string;
}

const DIMENSION_NAMES: Record<string, string> = {
  body: 'Corp',
  being: 'Ființă',
  balance: 'Echilibru',
  business: 'Business'
};

const CHALLENGE_DAYS = [
  {
    day: "Ziua 1",
    title: "Declarația Ta",
    subtitle: "Viziune clară stil Napoleon Hill",
    problem: "Fără direcție clară, energia se risipește. Te trezești dimineața fără să știi exact CE vrei și DE CE contează.",
    action: "Scrii Declarația ta oficială pentru Corp, Spirit, Relații și Business — exact ce vei fi, ce vei avea și ce vei da în schimb.",
    benefit: "Claritate cristalină. Fiecare decizie devine simplă când știi exact unde mergi."
  },
  {
    day: "Ziua 2-3",
    title: "Obiective Complete",
    subtitle: "Planificare strategică pe toate ariile",
    problem: "Confuzie și haos. Nu ai un plan structurat — visele rămân vise, lunile trec, nu se schimbă nimic real.",
    action: "Setezi obiective ANUALE pentru toate 4 ariile, apoi le spargi în targeturi de 90 zile, planuri lunare și acțiuni săptămânale.",
    benefit: "Eliminarea completă a confuziei. Știi EXACT ce ai de făcut în fiecare zi."
  },
  {
    day: "Ziua 4",
    title: "Rutina Campionului",
    subtitle: "Morning Stack — De la 'nu am chef' la IMPARABIL",
    problem: "'Nu am chef' devine scuza zilnică. Dimineața începe haotic, ziua curge, seara te întrebi ce ai făcut.",
    action: "Configurezi ritualul tău de dimineață: Intenție → Centrare → Recunoștință → Putere Mentală → Plan → Angajament.",
    benefit: "Fiecare dimineață începi cu ENERGIE și FOCUS. Motivația nu mai e opțională."
  },
  {
    day: "Ziua 5",
    title: "Viziune AI",
    subtitle: "Vision Board + Meditație personalizată",
    problem: "Mintea nu poate urmări ce nu poate vedea. Fără vizualizare clară, motivația scade în timp.",
    action: "AI-ul generează imagini pentru obiectivele tale + meditație ghidată personalizată pentru fiecare arie.",
    benefit: "Subconștientul tău lucrează pentru tine 24/7. Viziunea devine mai reală în fiecare zi."
  },
  {
    day: "Ziua 6",
    title: "Accountability",
    subtitle: "Sistemul care te ține pe drumul cel bun",
    problem: "Singur cedezi. 92% din obiective eșuează pentru că nimeni nu te ține responsabil când e greu.",
    action: "Configurezi notificări, remindere zilnice și identifici un partener de accountability din comunitate.",
    benefit: "Nu mai poți fugi de tine. Sistemul te împinge înainte chiar când mintea vrea să renunțe."
  },
  {
    day: "Ziua 7",
    title: "Integrare Completă",
    subtitle: "Totul împreună + Upgrade la Mastery",
    problem: "Ai toate piesele dar nu funcționează împreună. Fără integrare, sistemul se destramă în câteva săptămâni.",
    action: "Recapitulare completă + conectare Corp→Spirit→Relații→Business într-un ciclu virtuos care se auto-alimentează.",
    benefit: "CICLUL VIRTUOS activat: Corp puternic → Minte clară → Relații armonioase → Business în creștere."
  }
];

export function ChallengeMiniPreview({ weakestDimension }: ChallengeMiniPreviewProps) {
  const weakName = DIMENSION_NAMES[weakestDimension] || weakestDimension;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <span className="text-base font-bold text-foreground">
          Ce primești în Challenge:
        </span>
      </div>
      
      <div className="space-y-3">
        {CHALLENGE_DAYS.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.08 }}
            className="bg-muted/30 border border-border/50 rounded-lg p-4"
          >
            {/* Day Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-foreground bg-primary px-2.5 py-1 rounded">
                {day.day}
              </span>
              <div>
                <span className="text-sm font-bold text-foreground">
                  {day.title}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  — {day.subtitle}
                </span>
              </div>
            </div>

            {/* Content - Clean typography-driven layout */}
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="text-muted-foreground/70">• Problema:</span>{' '}
                {day.problem}
              </p>
              <p className="text-muted-foreground">
                <span className="text-muted-foreground/70">→ Acțiunea:</span>{' '}
                {day.action}
              </p>
              <p className="text-foreground font-medium">
                <span className="text-primary">✓ Rezultat:</span>{' '}
                {day.benefit}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cycle Effect Callout - Simplified */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-muted/50 border border-border rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">
            Efectul Multiplicator
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Când îți întărești <span className="text-foreground font-medium">{weakName}</span>, toate celelalte arii 
          beneficiază automat. Corpul puternic aduce energie pentru Business. 
          Spiritul clar îmbunătățește Relațiile. Echilibrul susține totul.
        </p>
      </motion.div>
    </motion.div>
  );
}
