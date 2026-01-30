export const getQuestions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return [
      "What title will you give this introspection session?",
      
      // Self-awareness
      "What is the most important thing you learned about yourself in the last week?",
      "What predominant emotion did you feel today and why do you think it appeared?",
      "What are the 3 fundamental values that guide you in life?",
      
      // Growth & Development
      "In what area of your life do you feel you have stagnated and why?",
      "What fear prevents you most from advancing?",
      "If you had complete courage, what would you do differently in your life?",
      
      // Relationships
      "How have you behaved lately with the important people in your life?",
      "What relationship in your life needs more attention and why?",
      
      // Purpose & Meaning
      "What gives you the most meaning in daily life?",
      "What is your unique contribution that you can bring to the world?",
      
      // Self-improvement
      "What negative habit do you want to eliminate and why haven't you succeeded yet?",
      "What personal quality do you want to develop in the next 90 days?",
      
      // Reflection & Action
      "What is the most important realization from this introspection session?",
      "What concrete action will you take as a result of this reflection?",
      "Do you want to add this action to the HIT list? (YES or NO)",
      "Are there other actions you want to add? (YES or NO)"
    ];
  }
  
  return [
    "Ce titlu vei da acestei sesiuni de introspecție?",
    
    // Self-awareness
    "Care este cel mai important lucru pe care l-ai învățat despre tine în ultima săptămână?",
    "Ce emoție predominantă ai simțit azi și de ce crezi că a apărut?",
    "Care sunt cele 3 valori fundamentale care te ghidează în viață?",
    
    // Growth & Development
    "În ce domeniu al vieții tale simți că ai stagnat și de ce?",
    "Ce frică te împiedică cel mai mult să avansezi?",
    "Dacă ai avea curajul deplin, ce ai face diferit în viața ta?",
    
    // Relationships
    "Cum te-ai comportat în ultima vreme cu persoanele importante din viața ta?",
    "Ce relație din viața ta necesită mai multă atenție și de ce?",
    
    // Purpose & Meaning
    "Ce îți dă cel mai mult sens în viața de zi cu zi?",
    "Care este contribuția ta unică pe care o poți aduce lumii?",
    
    // Self-improvement
    "Ce obicei negativ vrei să elimini și de ce nu ai reușit încă?",
    "Ce calitate personală vrei să dezvolți în următoarele 90 de zile?",
    
    // Reflection & Action
    "Care este cea mai importantă realizare din această sesiune de introspecție?",
    "Ce acțiune concretă vei întreprinde ca rezultat al acestei reflecții?",
    "Vrei să adaugi această acțiune la HIT list? (DA sau NU)",
    "Mai există și alte acțiuni pe care vrei să le adaugi? (DA sau NU)"
  ];
};

export const getIntrospectionCategories = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return {
      selfAwareness: { start: 1, end: 3, label: "🔍 Self-Awareness" },
      growth: { start: 4, end: 6, label: "🌱 Personal Growth" },
      relationships: { start: 7, end: 8, label: "💕 Relationships" },
      purpose: { start: 9, end: 10, label: "🎯 Purpose & Meaning" },
      improvement: { start: 11, end: 12, label: "⚡ Self-Improvement" }
    };
  }
  
  return {
    selfAwareness: { start: 1, end: 3, label: "🔍 Conștientizare de Sine" },
    growth: { start: 4, end: 6, label: "🌱 Creștere Personală" },
    relationships: { start: 7, end: 8, label: "💕 Relații" },
    purpose: { start: 9, end: 10, label: "🎯 Scop & Sens" },
    improvement: { start: 11, end: 12, label: "⚡ Auto-Îmbunătățire" }
  };
};
