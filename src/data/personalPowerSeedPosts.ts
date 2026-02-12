// Seed posts for Personal Power Plus lessons
// Each day has 2 posts from rotating fictional personas

export interface SeedPost {
  userId: string;
  content: string;
  dayNumber: number;
}

// Persona UUIDs
const ANDREI = 'a1b2c3d4-1111-4000-8000-000000000001';
const ELENA = 'a1b2c3d4-2222-4000-8000-000000000002';
const MARIUS = 'a1b2c3d4-3333-4000-8000-000000000003';
const ANA = 'a1b2c3d4-4444-4000-8000-000000000004';
const CRISTIAN = 'a1b2c3d4-5555-4000-8000-000000000005';
const OANA = 'a1b2c3d4-6666-4000-8000-000000000006';

export const personalPowerSeedPosts: SeedPost[] = [
  // Day 1 - Cheia Puterii Personale / The Key to Personal Power
  { dayNumber: 1, userId: ANDREI, content: 'Puterea personală = abilitatea de a acționa. Simplu și puternic. Am realizat că tot ce lipsea era decizia. Formula Supremă a Succesului e exact ce aveam nevoie — decide, acționează, observă, ajustează. Ce decizie ați luat azi? 💪' },
  { dayNumber: 1, userId: ELENA, content: 'Citatul cu "Cere mai mult de la tine decât ar putea aștepta oricine altcineva" m-a lovit. Azi am decis: nu mai aștept condiții perfecte. Am scris toate cele 5 răspunsuri la întrebări și am simțit ceva deblocându-se. Scor energie: 7/10 🌸' },

  // Day 2 - Forțele care îți Controlează Viața
  { dayNumber: 2, userId: MARIUS, content: 'Pain vs. Pleasure — simplu dar devastator de adevărat. Am listat 4 acțiuni noi pe care le evitam și am descoperit că durerea pe care o asociam era complet inventată. Exercițiul cu costul inacțiunii pe 5 ani m-a trezit. ⚡' },
  { dayNumber: 2, userId: ANA, content: 'M-am gândit la ce durere asociez cu schimbarea și am realizat cât de mult mă limitează. "Ce te costă să NU faci asta?" — această întrebare m-a făcut să plâng. Am scris 3 pagini. Cine a mai avut revelații la exercițiul cu durerea? 🦋' },

  // Day 3 - Preluarea Controlului — Primul Pas
  { dayNumber: 3, userId: CRISTIAN, content: 'Neuro-asocierile sunt cheia! Am identificat 3 asocieri negative care mă sabotau în business fără să știu. NAC (Neuro-Associative Conditioning) e framework-ul pe care-l căutam de ani. Cele 4 Părți ale Destinului — mind-blowing. 🧠' },
  { dayNumber: 3, userId: OANA, content: 'Am desenat o hartă vizuală a neuro-asocierilor mele — cele pozitive în culori calde, cele negative în rece. Vizualizarea m-a ajutat enorm să înțeleg pattern-urile. Recomand tuturor să facă exercițiul vizual! 🎨' },

  // Day 4 - Știința Condiționării Succesului
  { dayNumber: 4, userId: ANDREI, content: 'Cele 3 Fundamentale ale NAC: Get Leverage, Interrupt the Pattern, Condition a New Association. Am scris 10 motive puternice pentru schimbare și 5 metode de întrerupere a pattern-urilor. Tracking-ul zilnic arată deja progres. 📊' },
  { dayNumber: 4, userId: ELENA, content: 'Pattern interrupts funcționează! Am folosit metoda fizică — de fiecare dată când vine gândul negativ, schimb poziția corpului, respir adânc și zâmbesc. Sună simplu dar efectul e incredibil. Cine a mai testat? 💚' },

  // Day 5 - Ce își Dorește Toată Lumea și Cum Poți Obține
  { dayNumber: 5, userId: MARIUS, content: 'Stările emoționale controlează totul. Fiziologia e cea mai rapidă cale de schimbare — am testat azi dimineață: 2 minute de mișcare intensă și energia s-a triplat. Power moves antes de fiecare call important. Rezultate imediate. ⚡' },
  { dayNumber: 5, userId: ANA, content: '"Tot ce fac oamenii este o încercare de a-și schimba starea" — wow, asta explică atât de multe. Am creat o listă cu 10 state triggers care funcționează pentru mine. Muzică, mișcare, respirație. Ce funcționează pentru voi? 🎵' },

  // Day 6 - Integration Day
  { dayNumber: 6, userId: CRISTIAN, content: 'Zi de integrare — am revizuit Zilele 1-5 și am realizat cât de mult s-a schimbat perspectiva mea în doar o săptămână. State triggers funcționează! Le practic de 3 ori pe zi acum. Consistența e cheia. 🔄' },
  { dayNumber: 6, userId: OANA, content: 'Am creat un jurnal vizual cu toate conceptele din prima săptămână — Formula Succesului, Pain/Pleasure, NAC, State Management. Totul se leagă frumos. Recomand să vă faceți un rezumat vizual! 🖼️' },

  // Day 7 - Integration Day 2
  { dayNumber: 7, userId: ANDREI, content: 'Evaluare săptămâna 1: Consistență 6/7 zile, state triggers practicate zilnic, 3 pattern interrupts reușite. KPI-uri clare pentru săptămâna 2. Cine face tracking? Datele nu mint. 📈' },
  { dayNumber: 7, userId: ELENA, content: 'Reflecție de final de săptămână: m-am angajat să fiu mai blândă cu mine dar și mai decisivă. Intenția pentru Săptămâna 2: curaj. "Nu trebuie să fii perfect, trebuie să fii în mișcare." Mergeți înainte! 🌟' },

  // Day 8 - Transformational Vocabulary
  { dayNumber: 8, userId: MARIUS, content: 'Vocabularul Transformațional — cuvintele pe care le folosesc chiar îmi modelează experiența. Am înlocuit "problemă" cu "provocare", "trebuie" cu "aleg". Diferența se simte instant în energie. Simplu și eficient. 💬' },
  { dayNumber: 8, userId: ANA, content: 'Am realizat că vocabularul meu era plin de cuvinte care mă micșorau! "Nu pot", "e greu", "nu e pentru mine"... Le-am rescris pe toate. Jurnalul de azi e plin de transformări lingvistice. Cuvintele creează lumi! ✨' },

  // Day 9 - The Power of Questions
  { dayNumber: 9, userId: CRISTIAN, content: 'Întrebările controlează focusul. "Ce pot face azi ca business-ul meu să crească?" vs "De ce nu merge?". Am creat Morning Power Questions — le pun în fiecare dimineață. Game changer pentru productivitate. 🎯' },
  { dayNumber: 9, userId: OANA, content: 'Puterea întrebărilor m-a inspirat să creez un set de "Beautiful Questions" pe care le pun dimineața. "Ce e frumos în viața mea azi?" "Cum pot aduce mai multă bucurie?" Energia se schimbă instant. 🌈' },

  // Day 10 - The Power of Metaphors
  { dayNumber: 10, userId: ANDREI, content: 'Metaforele pe care le folosim ne definesc realitatea. "Viața e o luptă" vs "Viața e o aventură" — am analizat metaforele mele principale și am schimbat 3 care mă limitau. Date interesante: productivitatea a crescut cu 20%. 📊' },
  { dayNumber: 10, userId: ELENA, content: 'Am descoperit că metafora mea pentru relații era "un câmp de mine" — no wonder că eram mereu în gardă! Am schimbat-o în "o grădină care are nevoie de îngrijire". Simt diferența fizic. Ce metafore folosiți voi? 🌻' },

  // Day 11 - Puterea lui „De Ce"
  { dayNumber: 11, userId: MARIUS, content: 'Fundamentele! Coach Wooden avea dreptate — detaliile minuscule fac diferența între campioni și aproape-campioni. Am revizuit de ce-ul meu și l-am legat de fiecare acțiune zilnică. Fără WHY puternic, discipline drops. 🏆' },
  { dayNumber: 11, userId: ANA, content: 'Legea Familiarității — ignorăm lucrurile care devin obișnuite. Am redescoperit azi de ce am început acest program. M-am emoționat recitind răspunsurile de la Ziua 1. Nu uitați să vă reconectați cu motivul vostru! 💫' },

  // Day 12 - Creează-ți Viitorul: Atelierul de Obiective
  { dayNumber: 12, userId: CRISTIAN, content: 'Goal-Setting Workshop — am setat obiective pe 1, 3, 5 și 10 ani. Diferența între a visa și a planifica e un deadline și pași concreți. Am 47 de obiective scrise, prioritizate, cu timeline. Cine e gata? 🎯' },
  { dayNumber: 12, userId: OANA, content: 'Am creat un vision board digital cu obiectivele mele! Fiecare obiectiv are o imagine asociată. Vizualizarea face totul mai real. Am 12 obiective majore și le privesc în fiecare dimineață. Funcționează! 🖼️' },

  // Day 13 - Cele 6 Nevoi Umane (Partea 1)
  { dayNumber: 13, userId: ANDREI, content: 'Cele 6 Nevoi Umane + 4 Clase de Experiență = framework incredibil. Am analizat activitățile mele favorite și toate satisfac minim 4 nevoi. Cele pe care le evit? Maximum 1-2 nevoi. Data-driven decision making! 📈' },
  { dayNumber: 13, userId: ELENA, content: 'Am descoperit că nevoia mea principală e Connection/Love, dar o satisfac uneori în moduri nesănătoase. Exercițiul cu cele 4 clase m-a ajutat să înțeleg de ce unele activități mă epuizează. Revelator! 💕' },

  // Day 14 - Cele 6 Nevoi Umane (Partea 2)
  { dayNumber: 14, userId: MARIUS, content: 'Am luat ceva ce DETEST — rapoartele lunare — și l-am redesignat să satisfacă mai multe nevoi. Am adăugat element de growth, varietate și contribuție. Acum chiar aștept să le fac. Metoda funcționează 100%. ✅' },
  { dayNumber: 14, userId: ANA, content: '"Poți satisface primele 4 nevoi în moduri distructive și totuși să te simți puțin împlinit" — asta m-a lovit puternic. Am analizat ce activități satisfac doar nevoile de bază și cum le pot transforma. Deep work azi! 🔮' },

  // Day 15 - Condiționarea Succesului: Puterea Ritualurilor
  { dayNumber: 15, userId: CRISTIAN, content: 'Ritualurile emoționale — avem "rețete" pentru fiecare stare. Am identificat rețeta mea de procrastinare: overwhelm → distragere → vinovăție → mai multă procrastinare. Am creat un ritual nou de start: 2 min breathing, then act. 🔥' },
  { dayNumber: 15, userId: OANA, content: 'Am creat un ritual artistic de dimineață: 5 min drawing + afirmații + muzică energizantă. E rețeta mea de creativitate. Identificarea pattern-urilor emoționale a fost ca și cum aș fi descoperit codul sursă al comportamentului meu. 🎭' },

  // Day 16 - Ancorarea pentru Succes
  { dayNumber: 16, userId: ANDREI, content: 'Anchoring — NLP la cel mai practic nivel. Am creat 3 ancore: una pentru focus (atingere pe încheietură), una pentru energie (pumn strâns), una pentru calm (respirație + atingere piept). Le practic de 10 ori pe zi. Measure & improve. 🎯' },
  { dayNumber: 16, userId: ELENA, content: 'Ancorarea funcționează! Am asociat un gest simplu cu starea de pace interioară. De fiecare dată când simt anxietate, activez ancora. E ca un buton de reset. Corpul memorează mai bine decât mintea. 🧘‍♀️' },

  // Day 17 - Cum să te Condiționezi pentru Bogăție
  { dayNumber: 17, userId: MARIUS, content: 'Mindset de bogăție: "Găsește o cale de a face mai mult pentru alții." Am auditat unde creez valoare reală și unde doar execut. Am identificat 3 zone unde pot 10x impactul. ROI pe atenție, nu pe ore. 💰' },
  { dayNumber: 17, userId: ANA, content: 'Relația mea cu banii era bazată pe frică, nu pe abundență. Exercițiul de azi m-a ajutat să rescriu povestea. "Banii sunt o extensie a valorii pe care o creez." Am simțit o eliberare fizică scriind asta. 🌊' },

  // Day 18 - Elimină Auto-Sabotajul Financiar
  { dayNumber: 18, userId: CRISTIAN, content: '"Banii sunt atrași, nu urmăriți" — Jim Rohn. Am identificat 3 moduri în care mă auto-sabotam financiar: sub-pricing, evitarea negocierii, cheltuieli emoționale. Plan de acțiune setat pentru fiecare. 📋' },
  { dayNumber: 18, userId: OANA, content: 'Am vizualizat relația mea cu banii ca un tablou — era întunecat și tensionat. L-am repictat mental în culori calde, cu abundență. Exercițiul de eliminare a auto-sabotajului a fost profund. Cine a mai avut revelații? 🎨' },

  // Day 19 - Depășirea Fricii de Eșec
  { dayNumber: 19, userId: ANDREI, content: '"Frica dispare când îi schimbi sensul." Am listat cele mai mari eșecuri din business și ce am învățat din fiecare. Concluzie: fiecare "eșec" a fost de fapt un pivot necesar. 0 regrete, 100% lecții. 📊' },
  { dayNumber: 19, userId: ELENA, content: 'Frica de eșec m-a ținut în zona de confort ani de zile. Azi am făcut exercițiul și am realizat că "eșecul" meu cel mai mare m-a dus la cea mai frumoasă perioadă din viață. Reframing is everything! 🦋' },

  // Day 20 - Depășirea Fricii de Succes
  { dayNumber: 20, userId: MARIUS, content: 'Frica de succes — nu credeam că o am, dar exercițiul de azi m-a dovedit greșit. "Creierul evită ceea ce crede că îi va cauza durere — chiar și succesul." Am identificat 4 credințe limitante pe care le asociam cu succesul. Fixed. ⚡' },
  { dayNumber: 20, userId: ANA, content: 'Am plâns la exercițiul de azi. Am realizat că mă temeam de succes pentru că asociam "a fi vizibilă" cu "a fi criticată". Am rescris povestea: vizibilitatea = impact = purpose. Transformare profundă. 💎' },

  // Day 26 - Calea spre Maestrie — Revizuire și Momentum
  { dayNumber: 26, userId: CRISTIAN, content: 'Revizuire completă — am trecut prin toate conceptele și am realizat cât de mult s-a transformat mindset-ul meu. Momentum-ul e real: decizii mai rapide, acțiuni mai clare, rezultate vizibile. Keep pushing! 🚀' },
  { dayNumber: 26, userId: OANA, content: 'Am creat un colaj cu toate insight-urile din program — e o capodoperă vizuală a transformării mele. De la ziua 1 până acum, diferența e enormă. Programul ăsta m-a schimbat la nivel profund. 🎨' },

  // Day 27 - Calea spre Maestrie — Obiective Imbatabile
  { dayNumber: 27, userId: ANDREI, content: 'Obiective imbatabile — am revizuit și rafinat toate obiectivele de la Ziua 12. Acum sunt SMART + emotional connected. Am eliminat 15 obiective slabe și le-am înlocuit cu 7 puternice. Quality over quantity. 🎯' },
  { dayNumber: 27, userId: ELENA, content: 'Am revizuit obiectivele și am adăugat componenta emoțională lipsă. Nu mai e doar "vreau X", ci "vreau X pentru că mă face să simt Y". Diferența e enormă în motivație. Mergeți înainte! 🌟' },

  // Day 28 - Calea spre Maestrie — Stăpânește-ți Instrumentele
  { dayNumber: 28, userId: MARIUS, content: 'Master Your Tools — am organizat toate instrumentele din program într-un sistem zilnic de 30 min. State triggers, power questions, anchoring, vocabulary. Totul automatizat. Sistemele bat motivația. ⚙️' },
  { dayNumber: 28, userId: ANA, content: 'Am personalizat fiecare instrument pentru mine — power questions dimineața, anchoring la prânz, vocabulary check seara. E ca o simfonie personală de creștere. Fiecare instrument cântă în armonie! 🎵' },

  // Day 29 - Calea spre Maestrie — Practică Zilnică
  { dayNumber: 29, userId: CRISTIAN, content: 'Daily Practice — am creat un protocol de 45 min care include toate elementele: 10 min reading, 10 min state management, 15 min deep work pe obiective, 10 min reflection. Consistența e maestrie. 📋' },
  { dayNumber: 29, userId: OANA, content: 'Practica zilnică e arta transformată în obicei. Am creat un ritual vizual: dimineața pictez starea pe care o vreau, seara reflectez prin desen. 30 de zile de artă + dezvoltare personală = magie! ✨' },

  // Day 30 - Calea spre Maestrie — Angajamentul CANI
  { dayNumber: 30, userId: ANDREI, content: 'CANI — Constant And Never-ending Improvement. Am setat KPI-uri pentru următoarele 90 de zile. Programul se termină dar journey-ul continuă. Măsurăm, ajustăm, creștem. Mulțumesc tuturor! 🏆' },
  { dayNumber: 30, userId: ELENA, content: 'Ultima zi, dar nu e un sfârșit — e un nou început. CANI = angajamentul de a deveni mai bun în fiecare zi. Am scris o scrisoare pentru mine din viitor. Mulțumesc acestei comunități pentru energie și suport! 💚' },
];

// Day titles mapping for source_label generation
export const personalPowerDayTitles: Record<number, { ro: string; en: string }> = {
  1: { ro: 'Cheia Puterii Personale', en: 'The Key to Personal Power' },
  2: { ro: 'Forțele care îți Controlează Viața', en: 'The Controlling Forces' },
  3: { ro: 'Preluarea Controlului — Primul Pas', en: 'Taking Control: The First Step' },
  4: { ro: 'Știința Condiționării Succesului', en: 'The Science of Success Conditioning' },
  5: { ro: 'Ce își Dorește Toată Lumea', en: 'What Everyone Wants' },
  6: { ro: 'Zi de Integrare', en: 'Integration Day' },
  7: { ro: 'Zi de Integrare 2', en: 'Integration Day 2' },
  8: { ro: 'Vocabularul Transformațional', en: 'Transformational Vocabulary' },
  9: { ro: 'Puterea Întrebărilor', en: 'The Power of Questions' },
  10: { ro: 'Puterea Metaforelor', en: 'The Power of Metaphors' },
  11: { ro: 'Puterea lui „De Ce"', en: 'The Power of Why' },
  12: { ro: 'Atelierul de Obiective', en: 'Goal-Setting Workshop' },
  13: { ro: 'Cele 6 Nevoi Umane (Partea 1)', en: 'The 6 Human Needs (Part 1)' },
  14: { ro: 'Cele 6 Nevoi Umane (Partea 2)', en: 'The 6 Human Needs (Part 2)' },
  15: { ro: 'Puterea Ritualurilor', en: 'The Power of Rituals' },
  16: { ro: 'Ancorarea pentru Succes', en: 'Anchoring Yourself to Success' },
  17: { ro: 'Condiționare pentru Bogăție', en: 'Conditioning for Wealth' },
  18: { ro: 'Elimină Auto-Sabotajul Financiar', en: 'Ending Financial Self-Sabotage' },
  19: { ro: 'Depășirea Fricii de Eșec', en: 'Overcoming Fear of Failure' },
  20: { ro: 'Depășirea Fricii de Succes', en: 'Overcoming Fear of Success' },
  26: { ro: 'Revizuire și Momentum', en: 'Review & Momentum' },
  27: { ro: 'Obiective Imbatabile', en: 'Unstoppable Goals' },
  28: { ro: 'Stăpânește-ți Instrumentele', en: 'Master Your Tools' },
  29: { ro: 'Practică Zilnică', en: 'Daily Practice' },
  30: { ro: 'Angajamentul CANI', en: 'The CANI Commitment' },
};
