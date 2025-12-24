export const getDailyMasterQuestions = () => {
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

export const getDailyMasterSections = () => [
  { key: 'awakening', title: '🌅 Trezire & Intenție', icon: '🌅', duration: '2-3 min' },
  { key: 'spiritual', title: '🧘 Centrare Spirituală', icon: '🧘', duration: '2-3 min' },
  { key: 'gratitude', title: '🙏 Recunoștință Rapidă', icon: '🙏', duration: '2 min' },
  { key: 'mentalPower', title: '💪 Putere Mentală', icon: '💪', duration: '3 min' },
  { key: 'goalSetting', title: '🎯 Obiective & Plan', icon: '🎯', duration: '5 min' },
  { key: 'divinePrayer', title: '✨ Rugăciune Divină', icon: '✨', duration: '1 min' },
  { key: 'commitment', title: '🚀 Angajament & Lansare', icon: '🚀', duration: '2 min' }
];

export const getDivinePrayerText = () => `Doamne, te rog, elimină toate obstacolele din calea mea. 
Fă această cale ușoară și simplă. 
Lasă lucrurile să vină sincronizat către mine pentru realizarea acestui obiectiv. 
Ghidează-mi pașii și deschide-mi drumul. 
Amin.`;
