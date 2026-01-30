export const getDailyMasterQuestions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return {
      awakening: [
        "Welcome to a new day full of possibilities! How do you feel right now, physically and emotionally?",
        "What powerful intention do you want to set for today? What do you want this day to represent for you?"
      ],
      spiritual: [
        "Let's connect with your inner source. Close your eyes for a few seconds and breathe deeply... What message do you receive from your higher self for today?",
        "Who or what are you praying for this morning? What blessing do you ask for?"
      ],
      gratitude: [
        "What are 3 things you are deeply grateful for right now, in this moment?",
        "How does this gratitude make you feel? Let your heart fill with this energy."
      ],
      mentalPower: [
        "What is a limiting belief you choose to abandon today? What has been holding you back?",
        "What is the NEW powerful belief that will guide you today? What do you now believe about yourself?",
        "Tell me a powerful affirmation - your mantra for today. Something that energizes you!"
      ],
      goalSetting: [
        "What is the BIG GOAL you want to achieve today? (One major thing)",
        "What are 2-3 sub-goals or steps for this big goal?",
        "Is there another important goal for today? (if yes, what is it?)",
        "What is your concrete PLAN? What steps will you follow, in what order?",
        "WHY do you want to do this? What is your deep motivation?",
        "What is the POSITIVE IMPACT if you succeed? What changes in your life?",
        "What is the NEGATIVE IMPACT if you DON'T do this? What do you lose?",
        "What should your main FOCUS be? What do you need to concentrate on most?",
        "What are the DISTRACTIONS you need to eliminate? What could lead you astray?"
      ],
      divinePrayer: [
        "Now let's ask for divine help. Repeat after me or adapt with your own words: 'Lord, please remove all obstacles from my path. Make this way easy and simple. Let things come synchronized to me for achieving this goal. Guide my steps and open my path. Amen.'"
      ],
      commitment: [
        "On a scale of 1 to 10, how determined are you to make today an extraordinary day?",
        "What would help you raise that number by 1-2 points? What do you need?",
        "Do you want to add today's goals and actions to the HIT List? (YES or NO)"
      ]
    };
  }
  
  return {
    awakening: [
      "Bun venit într-o nouă zi plină de posibilități! Cum te simți chiar în acest moment, fizic și emoțional?",
      "Ce intenție puternică vrei să setezi pentru ziua de azi? Ce vrei să reprezinte această zi pentru tine?"
    ],
    spiritual: [
      "Hai să ne conectăm cu sursa interioară. Închide ochii pentru câteva secunde și respiră adânc... Ce mesaj primești de la sinele tău superior pentru ziua de azi?",
      "Pentru ce sau pentru cine te rogi în această dimineață? Ce binecuvântare ceri?"
    ],
    gratitude: [
      "Care sunt 3 lucruri pentru care ești profund recunoscător chiar acum, în acest moment?",
      "Cum te face să te simți această recunoștință? Lasă-ți inima să se umple de această energie."
    ],
    mentalPower: [
      "Care este o credință limitantă pe care alegi să o abandonezi astăzi? Ce te-a ținut pe loc?",
      "Care este NOUA credință puternică care te va ghida azi? Ce crezi acum despre tine?",
      "Spune-mi o afirmație puternică - mantra ta pentru ziua de azi. Ceva care te energizează!"
    ],
    goalSetting: [
      "Care este OBIECTIVUL MARE pe care vrei să-l atingi astăzi? (Un singur lucru major)",
      "Care sunt 2-3 sub-obiective sau pași pentru acest obiectiv mare?",
      "Mai există și ALT obiectiv important pentru azi? (dacă da, care este?)",
      "Care este PLANUL tău concret? Ce pași vei urma, în ce ordine?",
      "DE CE vrei să faci asta? Care este motivația ta profundă?",
      "Care este IMPACTUL POZITIV dacă reușești? Ce se schimbă în viața ta?",
      "Care este IMPACTUL NEGATIV dacă NU faci asta? Ce pierzi?",
      "Care trebuie să fie FOCUSUL tău principal? Pe ce trebuie să te concentrezi cel mai mult?",
      "Care sunt DISTRAGERILE pe care trebuie să le elimini? Ce te poate abate de la drum?"
    ],
    divinePrayer: [
      "Acum hai să cerem ajutorul divin. Repetă după mine sau adaptează cu cuvintele tale: 'Doamne, te rog, elimină toate obstacolele din calea mea. Fă această cale ușoară și simplă. Lasă lucrurile să vină sincronizat către mine pentru realizarea acestui obiectiv. Ghidează-mi pașii și deschide-mi drumul. Amin.'"
    ],
    commitment: [
      "Pe o scară de la 1 la 10, cât de hotărât ești să faci din azi o zi extraordinară?",
      "Ce te-ar ajuta să urci acel număr cu 1-2 puncte? Ce ai nevoie?",
      "Vrei să adaugi obiectivele și acțiunile de azi la HIT List? (DA sau NU)"
    ]
  };
};

export const getDailyMasterSections = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return [
      { key: 'awakening', title: '🌅 Awakening & Intention', icon: '🌅', duration: '2-3 min' },
      { key: 'spiritual', title: '🧘 Spiritual Centering', icon: '🧘', duration: '2-3 min' },
      { key: 'gratitude', title: '🙏 Quick Gratitude', icon: '🙏', duration: '2 min' },
      { key: 'mentalPower', title: '💪 Mental Power', icon: '💪', duration: '3 min' },
      { key: 'goalSetting', title: '🎯 Goals & Plan', icon: '🎯', duration: '5 min' },
      { key: 'divinePrayer', title: '✨ Divine Prayer', icon: '✨', duration: '1 min' },
      { key: 'commitment', title: '🚀 Commitment & Launch', icon: '🚀', duration: '2 min' }
    ];
  }
  
  return [
    { key: 'awakening', title: '🌅 Trezire & Intenție', icon: '🌅', duration: '2-3 min' },
    { key: 'spiritual', title: '🧘 Centrare Spirituală', icon: '🧘', duration: '2-3 min' },
    { key: 'gratitude', title: '🙏 Recunoștință Rapidă', icon: '🙏', duration: '2 min' },
    { key: 'mentalPower', title: '💪 Putere Mentală', icon: '💪', duration: '3 min' },
    { key: 'goalSetting', title: '🎯 Obiective & Plan', icon: '🎯', duration: '5 min' },
    { key: 'divinePrayer', title: '✨ Rugăciune Divină', icon: '✨', duration: '1 min' },
    { key: 'commitment', title: '🚀 Angajament & Lansare', icon: '🚀', duration: '2 min' }
  ];
};

export const getDivinePrayerText = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return `Lord, please remove all obstacles from my path. 
Make this way easy and simple. 
Let things come synchronized to me for achieving this goal. 
Guide my steps and open my path. 
Amen.`;
  }
  
  return `Doamne, te rog, elimină toate obstacolele din calea mea. 
Fă această cale ușoară și simplă. 
Lasă lucrurile să vină sincronizat către mine pentru realizarea acestui obiectiv. 
Ghidează-mi pașii și deschide-mi drumul. 
Amin.`;
};
