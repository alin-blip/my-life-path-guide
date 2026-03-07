import React from 'react';
import { AlertTriangle, Zap, Target, Brain, Flame, Eye, Calendar } from 'lucide-react';

interface EbookContentProps {
  language: 'ro' | 'en';
}

export const EbookContent: React.FC<EbookContentProps> = ({ language }) => {
  const t = language === 'ro'
    ? {
        diagTitle: 'Recunoști asta?',
        diagDesc: 'Te trezești dimineața deja epuizat. Telefonul vibrează cu urgențe. Inbox-ul explodează. Ai 47 de tab-uri deschise în minte și niciun sistem care să le proceseze.',
        diagP2: 'Afacerea merge — dar tu te prăbușești. Lucrezi 60+ ore pe săptămână. Ai sacrificat sănătatea, relațiile, liniștea interioară. Și cel mai dureros lucru? Cu cât muncești mai mult, cu atât te simți mai blocat.',
        diagP3: 'Nu ești leneș. Nu ești slab. Ești un procesor puternic care rulează pe un sistem de operare defect.',
        storyTitle: 'Am fost acolo. Exact acolo unde ești tu acum.',
        storyP1: 'Acum câțiva ani, sistemul meu intern a suferit o eroare catastrofală. Spital. Diagnostic: "irecuperabil." Afacerea pe care o construisem cu sânge și sudoare se prăbușea.',
        storyP2: 'Dar în acel pat de spital, am înțeles ceva crucial: nu eu eram defect — ci sistemul pe care rulam.',
        storyP3: 'Am petrecut următorii ani studiind neuroștiința performanței, psihologia execuției și sistemele celor mai buni performeri din lume. Am construit un sistem de operare complet — pentru mine. Apoi l-am testat pe sute de antreprenori.',
        storyP4: 'Rezultatul? CEO Mind OS — primul sistem de operare pentru fondatori.',
        storyAuthor: '— Alin F. Radu, Fondator CEO Mind OS',
        chapTitle: '13 capitole. Un singur sistem. Transformare completă.',
        forTitle: 'Această carte este pentru tine dacă:',
        notTitle: 'Această carte NU este pentru tine dacă:',
        forItems: [
          'Ești antreprenor și simți că muncești mai mult decât ar trebui',
          'Ai sacrificat sănătatea sau relațiile pentru afacere',
          'Știi că trebuie să schimbi ceva, dar nu știi CUM',
          'Ai încercat coaching, cursuri, cărți — dar nimic nu a funcționat pe termen lung',
          'Vrei un SISTEM, nu motivație temporară',
        ],
        notItems: [
          'Cauți o soluție magică fără efort',
          'Nu ești dispus să-ți asumi responsabilitatea pentru rezultatele tale',
          'Preferi să te plângi în loc să acționezi',
        ],
      }
    : {
        diagTitle: 'Recognize this?',
        diagDesc: 'You wake up already exhausted. Your phone vibrates with urgencies. Inbox exploding. You have 47 tabs open in your mind and no system to process them.',
        diagP2: 'Business is running — but you\'re crashing. Working 60+ hours a week. You\'ve sacrificed health, relationships, inner peace. And the most painful thing? The harder you work, the more stuck you feel.',
        diagP3: 'You\'re not lazy. You\'re not weak. You\'re a powerful processor running on a broken operating system.',
        storyTitle: 'I was there. Exactly where you are now.',
        storyP1: 'A few years ago, my internal system suffered a catastrophic failure. Hospital. Diagnosis: "unrecoverable." The business I built with blood and sweat was collapsing.',
        storyP2: 'But in that hospital bed, I understood something crucial: I wasn\'t broken — the system I was running on was.',
        storyP3: 'I spent the next years studying performance neuroscience, execution psychology, and the systems of the world\'s top performers. I built a complete operating system — for myself. Then tested it on hundreds of entrepreneurs.',
        storyP4: 'The result? CEO Mind OS — the first operating system for founders.',
        storyAuthor: '— Alin F. Radu, Founder CEO Mind OS',
        chapTitle: '13 chapters. One system. Complete transformation.',
        forTitle: 'This book is for you if:',
        notTitle: 'This book is NOT for you if:',
        forItems: [
          'You\'re an entrepreneur who feels you work more than you should',
          'You\'ve sacrificed health or relationships for business',
          'You know something needs to change, but you don\'t know HOW',
          'You\'ve tried coaching, courses, books — but nothing worked long-term',
          'You want a SYSTEM, not temporary motivation',
        ],
        notItems: [
          'You\'re looking for a magic solution without effort',
          'You\'re not willing to take responsibility for your results',
          'You prefer to complain instead of taking action',
        ],
      };

  const chapters = language === 'ro'
    ? [
        { icon: AlertTriangle, title: 'Cele 6 Gap-uri Invizibile', desc: 'Care te țin blocat — și cum să le elimini definitiv' },
        { icon: Target, title: 'Framework-ul 4B', desc: 'Body, Being, Balance, Business — cele 4 domenii pe care trebuie să le stăpânești simultan' },
        { icon: Calendar, title: 'The Door', desc: 'Planificatorul Săptămânal care îți dă claritate absolută în 30 de minute' },
        { icon: Zap, title: 'Rutina Războinicului CEO', desc: 'Ritualul zilnic anti-burnout în 5 pași care îți resetează sistemul' },
        { icon: Flame, title: 'The Stack', desc: 'Cum să transformi furia, anxietatea și frica în combustibil productiv' },
        { icon: Eye, title: 'Vision Board AI', desc: 'Cum să-ți vizualizezi viitorul cu precizie chirurgicală' },
        { icon: Brain, title: 'Planul de 90 de Zile', desc: 'Pas cu pas, de la haos la control total — cu checklist-uri și template-uri' },
      ]
    : [
        { icon: AlertTriangle, title: 'The 6 Invisible Gaps', desc: 'That keep you stuck — and how to eliminate them for good' },
        { icon: Target, title: 'The 4B Framework', desc: 'Body, Being, Balance, Business — the 4 domains you must master simultaneously' },
        { icon: Calendar, title: 'The Door', desc: 'The Weekly Planner that gives you absolute clarity in 30 minutes' },
        { icon: Zap, title: 'The CEO Warrior Routine', desc: 'The daily anti-burnout ritual in 5 steps that resets your system' },
        { icon: Flame, title: 'The Stack', desc: 'How to transform anger, anxiety, and fear into productive fuel' },
        { icon: Eye, title: 'Vision Board AI', desc: 'How to visualize your future with surgical precision' },
        { icon: Brain, title: 'The 90-Day Plan', desc: 'Step by step, from chaos to total control — with checklists and templates' },
      ];

  return (
    <div className="px-6 md:px-12">
      <div className="max-w-5xl mx-auto space-y-24 py-16">
        {/* Diagnostic */}
        <section>
          <p className="text-xs tracking-[0.2em] text-amber-400/60 uppercase mb-2">01 &nbsp; {language === 'ro' ? 'Diagnosticul' : 'Diagnosis'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.diagTitle}</h2>
          <div className="space-y-4 text-white/60 text-lg max-w-3xl">
            <p>{t.diagDesc}</p>
            <p>{t.diagP2}</p>
            <p className="text-amber-400/90 font-medium">{t.diagP3}</p>
          </div>
        </section>

        {/* Story */}
        <section>
          <p className="text-xs tracking-[0.2em] text-amber-400/60 uppercase mb-2">02 &nbsp; {language === 'ro' ? 'Povestea' : 'The Story'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.storyTitle}</h2>
          <div className="space-y-4 text-white/60 text-lg max-w-3xl">
            <p>{t.storyP1}</p>
            <p><strong className="text-white">{t.storyP2}</strong></p>
            <p>{t.storyP3}</p>
            <p className="text-amber-400">{t.storyP4}</p>
          </div>
          <p className="text-white/40 mt-4 italic">{t.storyAuthor}</p>
        </section>

        {/* Chapters */}
        <section>
          <p className="text-xs tracking-[0.2em] text-amber-400/60 uppercase mb-2">03 &nbsp; {language === 'ro' ? 'Ce vei descoperi' : 'What you\'ll discover'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">{t.chapTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapters.map((ch, idx) => (
              <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:border-amber-400/20 transition-colors">
                <ch.icon className="w-6 h-6 text-amber-400 mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">{ch.title}</h3>
                <p className="text-white/50 text-sm">{ch.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For whom */}
        <section>
          <p className="text-xs tracking-[0.2em] text-amber-400/60 uppercase mb-2">04 &nbsp; {language === 'ro' ? 'Pentru cine este' : 'Who it\'s for'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">{t.forTitle}</h2>
          <div className="space-y-3 mb-12 max-w-2xl">
            {t.forItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-white/70">{item}</span>
              </div>
            ))}
          </div>
          <h3 className="text-xl font-bold text-white/60 mb-4">{t.notTitle}</h3>
          <div className="space-y-3 max-w-2xl">
            {t.notItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✕</span>
                <span className="text-white/40">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
