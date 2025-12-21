import { NapoleonHillQuestion } from './types';

export const getQuestions = (language: 'en' | 'ro' = 'ro'): NapoleonHillQuestion[] => {
  if (language === 'ro') {
    return [
      {
        id: 'desire',
        principle: 'Principiul 1: Dorința',
        question: 'Ce vrei să obții cu adevărat? Descrie obiectivul tău concret - suma exactă de bani sau rezultatul specific pe care îl urmărești.',
        subQuestions: [
          'Care este suma exactă pe care vrei să o obții?',
          'Până când vrei să obții acest rezultat?',
          'Ce ești dispus să dai în schimb pentru a obține acest lucru?'
        ]
      },
      {
        id: 'faith',
        principle: 'Principiul 2: Credința',
        question: 'Crezi cu adevărat că poți obține acest obiectiv? Ce convingeri îți susțin sau îți blochează drumul către succes?',
        subQuestions: [
          'Pe o scară de la 1 la 10, cât de mult crezi că vei reuși?',
          'Ce te face să crezi/nu crezi în reușita ta?'
        ]
      },
      {
        id: 'autosuggestion',
        principle: 'Principiul 3: Autosuggestia',
        question: 'Ce îți spui în mod repetat despre capacitățile tale? Ce afirmații folosești zilnic?',
        subQuestions: [
          'Repetă afirmația ta principală aici.',
          'Când o recită în fiecare zi?'
        ]
      },
      {
        id: 'knowledge',
        principle: 'Principiul 4: Cunoaștere Specializată',
        question: 'Ce cunoștințe sau abilități îți lipsesc pentru a-ți atinge obiectivul? Cum le vei dobândi?',
        subQuestions: [
          'Ce trebuie să înveți?',
          'De la cine poți învăța?',
          'Când vei începe?'
        ]
      },
      {
        id: 'imagination',
        principle: 'Principiul 5: Imaginația',
        question: 'Cum ar arăta viața ta dacă ai fi deja reușit? Descrie în detaliu ziua ta perfectă după ce ai atins obiectivul.',
        subQuestions: [
          'Unde locuiești?',
          'Cu cine petreci timpul?',
          'Ce faci în fiecare zi?'
        ]
      },
      {
        id: 'planning',
        principle: 'Principiul 6: Planificare Organizată',
        question: 'Care este planul tău concret și detaliat pentru a atinge obiectivul? Descrie pașii specifici.',
        subQuestions: [
          'Care sunt primii 3 pași concreți?',
          'Ce resurse îți trebuie?',
          'Când începi fiecare pas?'
        ]
      },
      {
        id: 'decision',
        principle: 'Principiul 7: Decizia',
        question: 'Ce decizie majoră trebuie să iei ACUM pentru a avansa? De ce ai amânat-o până acum?',
        subQuestions: [
          'Care este decizia concretă?',
          'Când o vei lua?',
          'Ce te-a oprit până acum?'
        ]
      },
      {
        id: 'persistence',
        principle: 'Principiul 8: Perseverența',
        question: 'Ce te-a oprit în trecut să perseverezi? Ce obstacole întâmpini mereu și cum le vei depăși de data asta?',
        subQuestions: [
          'Care este cel mai mare obstacol?',
          'Cum l-ai depășit în alte situații?',
          'Ce vei face diferit acum?'
        ]
      },
      {
        id: 'mastermind',
        principle: 'Principiul 9: Puterea Master Mind',
        question: 'Cine sunt oamenii care te pot ajuta? Formează-ți grupul Master Mind - cine îl compune și ce îți oferă fiecare?',
        subQuestions: [
          'Cine sunt primii 3 oameni din grupul tău?',
          'Ce îți oferă fiecare?',
          'Când vei organiza prima întâlnire?'
        ]
      },
      {
        id: 'transmutation',
        principle: 'Principiul 10: Transmutarea Energiei Sexuale',
        question: 'Cum îți canalizezi energia creativă și pasiunea către obiectivul tău? Ce te motivează profund?',
        subQuestions: [
          'Care este sursa ta principală de energie?',
          'Cum o transformi în acțiune productivă?'
        ]
      },
      {
        id: 'subconscious',
        principle: 'Principiul 11: Subconștientul',
        question: 'Ce convingeri limitatoare ai despre bani, succes și tine însuți? Ce mesaje primești de la subconștientul tău?',
        subQuestions: [
          'Ce crezi despre bani?',
          'Ce crezi despre oamenii bogați?',
          'Ce crezi că meriți cu adevărat?'
        ]
      },
      {
        id: 'brain',
        principle: 'Principiul 12: Creierul',
        question: 'Ce idei noi, conexiuni sau perspective ai descoperit recent? Cum folosești puterea creierului tău?',
        subQuestions: [
          'Ce idee nouă ai avut recent?',
          'Cu cine ai împărtășit-o?',
          'Cum o vei implementa?'
        ]
      },
      {
        id: 'sixth-sense',
        principle: 'Principiul 13: Al Șaselea Simț',
        question: 'Ce îți spune intuiția despre următorul tău pas? Când ai urmat ultima dată intuiția și ce s-a întâmplat?',
        subQuestions: [
          'Care este primul lucru care îți vine în minte când te gândești la succes?',
          'Ce semne ai ignorat recent?',
          'Ce îți spune vocea interioară acum?'
        ]
      },
      {
        id: 'action',
        principle: 'Acțiunea Concretă',
        question: 'Pe baza întregii discuții, care este PRIMA acțiune concretă pe care o vei face astăzi pentru a-ți îndeplini obiectivul?',
        subQuestions: [
          'Care este acțiunea concretă?',
          'Când exact o vei face?',
          'Cum vei măsura rezultatul?'
        ]
      }
    ];
  }

  // English version
  return [
    {
      id: 'desire',
      principle: 'Principle 1: Desire',
      question: 'What do you truly want to achieve? Describe your concrete goal - the exact amount of money or specific result you are pursuing.',
      subQuestions: [
        'What is the exact amount you want to achieve?',
        'By when do you want to achieve this result?',
        'What are you willing to give in return to achieve this?'
      ]
    },
    {
      id: 'faith',
      principle: 'Principle 2: Faith',
      question: 'Do you truly believe you can achieve this goal? What beliefs support or block your path to success?',
      subQuestions: [
        'On a scale of 1 to 10, how much do you believe you will succeed?',
        'What makes you believe/not believe in your success?'
      ]
    },
    {
      id: 'autosuggestion',
      principle: 'Principle 3: Autosuggestion',
      question: 'What do you repeatedly tell yourself about your capabilities? What affirmations do you use daily?',
      subQuestions: [
        'Repeat your main affirmation here.',
        'When do you recite it each day?'
      ]
    },
    {
      id: 'knowledge',
      principle: 'Principle 4: Specialized Knowledge',
      question: 'What knowledge or skills are you missing to achieve your goal? How will you acquire them?',
      subQuestions: [
        'What do you need to learn?',
        'From whom can you learn?',
        'When will you start?'
      ]
    },
    {
      id: 'imagination',
      principle: 'Principle 5: Imagination',
      question: 'What would your life look like if you had already succeeded? Describe in detail your perfect day after achieving your goal.',
      subQuestions: [
        'Where do you live?',
        'Who do you spend time with?',
        'What do you do every day?'
      ]
    },
    {
      id: 'planning',
      principle: 'Principle 6: Organized Planning',
      question: 'What is your concrete and detailed plan to achieve your goal? Describe specific steps.',
      subQuestions: [
        'What are the first 3 concrete steps?',
        'What resources do you need?',
        'When do you start each step?'
      ]
    },
    {
      id: 'decision',
      principle: 'Principle 7: Decision',
      question: 'What major decision do you need to make NOW to move forward? Why have you postponed it until now?',
      subQuestions: [
        'What is the concrete decision?',
        'When will you make it?',
        'What has stopped you so far?'
      ]
    },
    {
      id: 'persistence',
      principle: 'Principle 8: Persistence',
      question: 'What has stopped you from persisting in the past? What obstacles do you always face and how will you overcome them this time?',
      subQuestions: [
        'What is your biggest obstacle?',
        'How have you overcome it in other situations?',
        'What will you do differently now?'
      ]
    },
    {
      id: 'mastermind',
      principle: 'Principle 9: Power of the Master Mind',
      question: 'Who are the people who can help you? Form your Master Mind group - who comprises it and what does each offer you?',
      subQuestions: [
        'Who are the first 3 people in your group?',
        'What does each offer you?',
        'When will you organize the first meeting?'
      ]
    },
    {
      id: 'transmutation',
      principle: 'Principle 10: Sex Transmutation',
      question: 'How do you channel your creative energy and passion toward your goal? What deeply motivates you?',
      subQuestions: [
        'What is your main source of energy?',
        'How do you transform it into productive action?'
      ]
    },
    {
      id: 'subconscious',
      principle: 'Principle 11: The Subconscious Mind',
      question: 'What limiting beliefs do you have about money, success, and yourself? What messages do you receive from your subconscious?',
      subQuestions: [
        'What do you believe about money?',
        'What do you believe about wealthy people?',
        'What do you truly believe you deserve?'
      ]
    },
    {
      id: 'brain',
      principle: 'Principle 12: The Brain',
      question: 'What new ideas, connections, or perspectives have you recently discovered? How do you use the power of your brain?',
      subQuestions: [
        'What new idea have you had recently?',
        'With whom have you shared it?',
        'How will you implement it?'
      ]
    },
    {
      id: 'sixth-sense',
      principle: 'Principle 13: The Sixth Sense',
      question: 'What does your intuition tell you about your next step? When was the last time you followed your intuition and what happened?',
      subQuestions: [
        'What is the first thing that comes to mind when you think about success?',
        'What signs have you ignored recently?',
        'What is your inner voice telling you now?'
      ]
    },
    {
      id: 'action',
      principle: 'Concrete Action',
      question: 'Based on the entire discussion, what is the FIRST concrete action you will take today to fulfill your goal?',
      subQuestions: [
        'What is the concrete action?',
        'When exactly will you do it?',
        'How will you measure the result?'
      ]
    }
  ];
};
