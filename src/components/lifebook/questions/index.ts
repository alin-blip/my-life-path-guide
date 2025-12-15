import { LifebookSubcategory, LifebookSection } from '../types';

export interface SectionQuestions {
  section: LifebookSection;
  questions: string[];
  examples?: string[];
}

export interface SubcategoryQuestions {
  subcategory: LifebookSubcategory;
  sections: SectionQuestions[];
}

// Health & Fitness Questions
export const healthFitnessQuestions: SubcategoryQuestions = {
  subcategory: 'health_fitness',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale fundamentale despre sănătate și fitness? Ce crezi că este adevărat despre corpul tău?',
        'Cum vezi relația dintre alimentație și energie? Mănânci pentru combustibil sau pentru plăcere?',
        'Ce principii non-negociabile ai când vine vorba de sănătatea ta fizică?',
        'Cum influențează sănătatea ta fizică celelalte arii ale vieții tale?'
      ],
      examples: [
        'Exemplu: "Mănânc pentru energie, gustul e un bonus. Am nevoie de nutrienți, nu de calorii."',
        'Exemplu: "Sunt făcut din apă și energie, așa că beau multă apă. Când sunt emoțional, procesez emoțiile, nu mănânc."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Cum te vezi fizic peste 1 an? 5 ani? 10 ani? Descrie corpul tău ideal în detaliu.',
        'Ce greutate, procent de grăsime corporală și nivel de energie îți dorești?',
        'Cum arată stilul tău de viață sănătos în mod ideal?',
        'Ce realizări fizice vrei să atingi (maraton, competiții, aspecte specifice)?'
      ],
      examples: [
        'Exemplu: "A fi în formă atletică fizică și mentală este identitatea mea. Sunt mereu sub 10% grăsime corporală și peste 80kg."',
        'Exemplu: "Planific să am 120 de ani și să arăt la 70 ca la 40 - muscular și atletic, competind cu copiii nepoților mei."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE este important pentru tine să fii în cea mai bună formă fizică?',
        'Ce pierzi dacă NU ești sănătos? Cum te afectează asta emoțional și în relații?',
        'Pentru cine vrei să fii un model de urmat când vine vorba de sănătate?',
        'Cum contribuie sănătatea ta la fericirea și calitatea vieții tale generale?'
      ],
      examples: [
        'Exemplu: "Vreau pentru că nu vreau să-mi distrug momentele pentru că mă simt rău din cauza felului în care arăt."',
        'Exemplu: "Scopul meu este să rămân sexy, sub 10% grăsime, departe de medici și pastile!"'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce acțiuni concrete vei lua ZILNIC pentru sănătatea ta (alimentație, exerciții, somn)?',
        'Care este programul tău de antrenament ideal pe săptămână?',
        'Ce obiceiuri de recovery practici (saună, băi reci, meditație, masaj)?',
        'Cum îți vei monitoriza progresul și performanța?'
      ],
      examples: [
        'Exemplu: "Post intermitent (24h odată pe săptămână), verdeață zilnic, dietă 2500kcal max, HIIT o zi, alergare 10km+ 2 zile, PLP workout 3 zile"',
        'Exemplu: "Saună, baie cu gheață, respirație profundă, meditație, expunere la soare, masaj și terapie cu lumină roșie săptămânal"'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri, idei sau inspirații ai despre sănătatea și fitness-ul tău?',
        'Ce resurse, cărți sau mentori te-au inspirat în această arie?'
      ]
    }
  ]
};

// Intellectual Life Questions
export const intellectualLifeQuestions: SubcategoryQuestions = {
  subcategory: 'intellectual_life',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale fundamentale despre mintea ta și potențialul ei?',
        'Ce crezi despre relația dintre gândire și realitate?',
        'Cum vezi rolul învățării continue în viața ta?',
        'Ce principii ai despre ce informații permiți să intre în mintea ta?'
      ],
      examples: [
        'Exemplu: "Mintea mea este cel mai mare activ pe care îl dețin. Mintea mi-a construit corpul, viața, bunăstarea, relațiile, fericirea."',
        'Exemplu: "Nu pun gunoi în mintea mea așa cum nu pun gunoi în corpul meu. Pot alege să gândesc și CE să gândesc."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Cum te vezi intelectual? Ce nivel de înțelepciune și cunoaștere vrei să atingi?',
        'Cum vei folosi intelectul tău pentru a rezolva probleme reale din lume?',
        'Ce practici intelectuale zilnice vezi că fac parte din rutina ta?',
        'Cum iei decizii? Ce proces mental folosești?'
      ],
      examples: [
        'Exemplu: "Sunt o persoană foarte inteligentă, sunt strălucit, iau decizii bune, am încredere în mintea mea."',
        'Exemplu: "Pentru fiecare gând negativ petrec doar 3 secunde, pentru fiecare gând pozitiv folosesc 10 secunde sau 5 propoziții."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE este important pentru tine să-ți dezvolți intelectul?',
        'Cum contribuie inteligența ta la atingerea viselor tale?',
        'Ce moștenire intelectuală vrei să lași?'
      ],
      examples: [
        'Exemplu: "Cu cât gândesc și acționez mai bine, cu atât viața mea cu tot ce conține va fi mai bună."',
        'Exemplu: "Scopul meu este să trăiesc cea mai bună viață pe care o pot, să fiu cea mai bună versiune a mea și să fiu un model pentru alții."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce practici intelectuale vei face ZILNIC (lectură, meditație, studiu)?',
        'Cum îți vei analiza gândurile și comportamentele în mod regulat?',
        'Cu cine vei petrece timp pentru a învăța de la oameni mai inteligenți?',
        'Cum vei aplica ce înveți în viața reală?'
      ],
      examples: [
        'Exemplu: "În fiecare dimineață încep cu meditația celor 6 faze pentru a mă pune într-o stare de câștig."',
        'Exemplu: "Zilnic învăț și studiez cel puțin o oră și aplic ce învăț. Săptămânal analizez calitatea vieții."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre viața ta intelectuală?'
      ],
      examples: [
        'Exemplu: "Activarea Legii Atracției: Nu există nimic ce nu poți fi, face sau avea. Ești un creator magnific."'
      ]
    }
  ]
};

// Emotional Life Questions
export const emotionalLifeQuestions: SubcategoryQuestions = {
  subcategory: 'emotional_life',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale despre emoții și controlul lor?',
        'Ce crezi despre fericire - este o alegere sau o circumstanță?',
        'Cum vezi relația dintre intuiție și emoții?',
        'Ce înseamnă inteligența emoțională pentru tine?'
      ],
      examples: [
        'Exemplu: "Fericirea este o stare de spirit, eu îmi controlez emoțiile. Cred în intuiție - intuiția este înțelegerea emoțiilor mele."',
        'Exemplu: "Bucuria și fericirea sunt starea mea naturală consistentă. Pot alege și controla cu ușurință emoțiile."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Cum te vezi din punct de vedere emoțional? Ce nivel de stăpânire emoțională vrei să atingi?',
        'De ce dependențe vrei să te eliberezi?',
        'Ce emoții vrei să experimentezi în mod constant?',
        'Cum vrei să vezi lumea - din ce poziție emoțională?'
      ],
      examples: [
        'Exemplu: "Mă văd ca având o inteligență emoțională ridicată. Sunt liber de dependențe de fumat, mâncare și jocuri de noroc."',
        'Exemplu: "FERICIREA ESTE SENSUL ȘI SCOPUL VIEȚII și practica mea zilnică."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE este important pentru tine să-ți stăpânești emoțiile?',
        'Cum afectează emoțiile tale oamenii din jurul tău?',
        'Ce câștigi când ai emoții de calitate superioară constant?'
      ],
      examples: [
        'Exemplu: "O victorie aici e o victorie peste tot în viața mea! Emoții constant grozave = viață constant grozavă."',
        'Exemplu: "Vreau să dovedesc că emoțiile de înaltă calitate sunt disponibile tuturor în fiecare zi."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Cum îți vei monitoriza și analiza emoțiile zilnic?',
        'Ce emoții vei cultiva activ și care sunt cele pe care refuzi să le permiți în viața ta?',
        'Ce practici folosești pentru a genera emoții pozitive?'
      ],
      examples: [
        'Exemplu: "Emoții pe care vreau să le experimentez: Fericire, Bucurie, Iubire, Pasiune, Împlinire, Încredere, Curaj."',
        'Exemplu: "Emoții pe care refuz să le permit: Anxietate și îngrijorare, Stres, Furie, Resentiment."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre viața ta emoțională?'
      ]
    }
  ]
};

// Character Questions
export const characterQuestions: SubcategoryQuestions = {
  subcategory: 'character',
  sections: [
    {
      section: 'premise',
      questions: [
        'Ce crezi despre importanța caracterului în viață?',
        'Cum vezi relația dintre caracter și succes?',
        'Ce înseamnă auto-disciplina pentru tine?',
        'Caracterul se naște sau se construiește?'
      ],
      examples: [
        'Exemplu: "Am nevoie de un CARACTER mare pentru a avea o viață mare. Un caracter bun îți îmbunătățește viața, un caracter rău o distruge."',
        'Exemplu: "Auto-disciplina este abilitatea de a te face să faci ce trebuie să faci când trebuie să faci, fie că vrei sau nu!"'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Ce trăsături de caracter vrei să construiești în viața ta?',
        'Cum te vezi comportându-te în situații dificile?',
        'Ce tip de om vrei să fii cunoscut că ești?'
      ],
      examples: [
        'Exemplu: "Curaj, Bunătate, Determinare, Disciplină. POTENȚIALUL MEU ESTE NELIMITAT - tot ce am nevoie este determinare să continui."',
        'Exemplu: "Cumpătare, Tăcere, Ordine, Rezoluție, Frugalitate, Liniște. ADEVĂRUL - puterea de astăzi este adevărul!"'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE vrei să dezvolți aceste trăsături de caracter?',
        'Cum îți afectează caracterul familia și cei din jur?',
        'Ce exemplu vrei să fii pentru copiii tăi și pentru alții?'
      ],
      examples: [
        'Exemplu: "Vreau să obțin totul în viață și asta se va întâmpla dacă dezvolt un caracter bun."',
        'Exemplu: "Scopul meu este să devin cea mai bună versiune umană pentru a fi un exemplu excepțional de urmat."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce practici zilnice vei face pentru a-ți dezvolta caracterul?',
        'Cum îți vei testa și întări trăsăturile de caracter?',
        'Cum vei răspunde când lucrurile devin dificile?'
      ],
      examples: [
        'Exemplu: "Fii omul cuvântului tău. Practică zilnic 5 trăsături de caracter: onestitate, fiabilitate, încredere, auto-disciplină, bunătate."',
        'Exemplu: "Fiecare persoană pe care o întâlnesc, mă voi întreba: ce valoare pot adăuga acestei persoane?"'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre caracterul tău?'
      ]
    }
  ]
};

// Spiritual Life Questions
export const spiritualLifeQuestions: SubcategoryQuestions = {
  subcategory: 'spiritual_life',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale spirituale fundamentale?',
        'Ce crezi despre relația dintre lumea spirituală și cea fizică?',
        'Cum vezi rolul intuiției în viața ta?',
        'Ce înseamnă conexiunea spirituală pentru tine?'
      ],
      examples: [
        'Exemplu: "Mai întâi este lumea spirituală, apoi lumea fizică. Toată informația este disponibilă în mintea mea superioară."',
        'Exemplu: "Cred în Unitate, Iubire Necondiționată și în a deveni tot ce pot fi ca ființă umană."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Cum te vezi spiritual? Ce nivel de conexiune vrei să atingi?',
        'Ce practici spirituale vrei să integrezi în viața ta?',
        'Cum vrei să te simți conectat zilnic?'
      ],
      examples: [
        'Exemplu: "Vreau să aduc cerul pe pământ și apoi să învăț pe alții că spiritualitatea nu înseamnă pedeapsa lui Dumnezeu."',
        'Exemplu: "Mă conectez în fiecare zi cu sursa a Tot. Dumnezeu, universul, mintea superioară."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'Care este scopul tău spiritual în viață?',
        'DE CE este important pentru tine să crești spiritual?',
        'Cum vrei să ajuți pe alții prin spiritualitatea ta?'
      ],
      examples: [
        'Exemplu: "Sunt aici pentru a ajuta pe alții să se trezească. Voi străluci lumină, adevăr, pasiune, bunătate, magie."',
        'Exemplu: "Să ajung la iluminare, să învăț pe alții despre lumea interioară."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce practici spirituale vei face ZILNIC?',
        'Cum vei petrece timp în natură și conectat cu universul?',
        'Ce ritualuri de recunoștință practici?'
      ],
      examples: [
        'Exemplu: "Meditez profund zilnic. Practic iertarea în fiecare zi prin meditația celor 6 faze."',
        'Exemplu: "Petrec timp în natură, lucrez desculț de trei ori pe săptămână, alerg în natură o dată pe săptămână, privesc stelele o dată pe săptămână."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre viața ta spirituală?'
      ]
    }
  ]
};

// Love Relationship Questions
export const loveRelationshipQuestions: SubcategoryQuestions = {
  subcategory: 'love_relationship',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale despre relația ta de iubire?',
        'Ce crezi despre cum trebuie să funcționeze o relație ideală?',
        'Ce principii non-negociabile ai în relația ta?'
      ],
      examples: [
        'Exemplu: "Relația mea cu soția mea poate fi și uneori este uimitoare, ne potrivim, ne iubim și trebuie să ne conectăm mai mult."',
        'Exemplu: "Suntem suflete pereche. Împreună vom experimenta tot ce are viața de oferit."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Cum arată relația ta de vis? Descrie-o în detaliu.',
        'Ce nivel de comunicare, intimitate și conexiune vrei să aveți?',
        'Cum vreți să fiți văzuți ca cuplu de ceilalți?'
      ],
      examples: [
        'Exemplu: "Ne punem pe primul loc reciproc! Ne angajăm unul față de celălalt și aceasta este prioritatea noastră #1."',
        'Exemplu: "Vreau o viață sexuală uimitoare și pasionată, vreau să experimentez următorul nivel de energie sexuală și iubire necondiționată."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE este relația ta atât de importantă pentru tine?',
        'Ce vrei să experimentați împreună în această viață?',
        'Cum vrei să vă vadă copiii și prietenii relația?'
      ],
      examples: [
        'Exemplu: "Vreau o iubire profundă, diferită de orice altă relație. Vreau ca copiii și prietenii noștri să vorbească despre iubirea noastră ca fiind legendară."',
        'Exemplu: "Să experimentăm tot ce poate oferi viața împreună - pasiune, iubire necondiționată, sex, abundență, recunoștință."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce acțiuni concrete vei face ZILNIC pentru relația ta?',
        'Cum vă veți conecta și comunica în mod regulat?',
        'Ce ritualuri de cuplu veți avea?'
      ],
      examples: [
        'Exemplu: "Ne dăm jos măștile în fiecare zi până când rămâne doar vulnerabilitatea unul față de celălalt."',
        'Exemplu: "O seară de întâlnire pe săptămână. O oră doar pentru noi, fără ecrane, fără muncă. Vedem lumea împreună."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre relația ta de iubire? Ce iubești la partenerul tău?'
      ],
      examples: [
        'Exemplu: "Te iubesc pentru că ești amabil/ă, frumos/frumoasă, senzual/ă, feminin/ă, natural/ă..."'
      ]
    }
  ]
};

// Parenting Questions
export const parentingQuestions: SubcategoryQuestions = {
  subcategory: 'parenting',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale fundamentale despre parenting?',
        'Ce valori vrei să transmiți copiilor tăi?',
        'Ce tip de părinte vrei să fii?'
      ],
      examples: [
        'Exemplu: "Relația noastră ca cuplu este fundația vieții noastre. Copiii vor moșteni și îmbrățișa această relație."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Cum arată familia ta ideală?',
        'Ce relație vrei să ai cu copiii tăi?',
        'Cum vrei să te vadă copiii tăi?'
      ],
      examples: [
        'Exemplu: "Copiii mei mă admiră și mă respectă pentru persoana care sunt - și am câștigat acel respect."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE este important pentru tine să fii un părinte excepțional?',
        'Ce moștenire vrei să lași copiilor tăi?',
        'Cum vrei să-i influențezi pe copiii tăi?'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce acțiuni concrete vei face pentru a fi un părinte mai bun?',
        'Cum îți vei petrece timpul de calitate cu familia?',
        'Ce tradiții de familie vrei să creezi?'
      ],
      examples: [
        'Exemplu: "Avem grijă de familia noastră și le schimbăm mentalitatea."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre parenting?'
      ]
    }
  ]
};

// Social Life Questions
export const socialLifeQuestions: SubcategoryQuestions = {
  subcategory: 'social_life',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale despre prietenii și relații sociale?',
        'Ce crezi despre influența anturajului asupra ta?',
        'Ce principii ai când vine vorba de alegerea prietenilor?'
      ],
      examples: [
        'Exemplu: "Prietenii mei sunt familia pe care o aleg! O persoană va fi media celor 5 oameni cu care petrece timp."',
        'Exemplu: "Îmi aleg prietenii și cercul interior foarte înțelept și selectiv."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Cum arată prieteniile tale ideale?',
        'Cu ce tip de oameni vrei să te înconjori?',
        'Ce fel de prieten vrei să fii tu?'
      ],
      examples: [
        'Exemplu: "Vreau să am prieteni care ne împuternicesc. Prieteni veseli și loiali care ne ajută să creștem."',
        'Exemplu: "Vreau să fiu înconjurat de oameni la fel de succes sau mai succes decât mine."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE sunt prieteniile importante pentru tine?',
        'Cum contribuie relațiile sociale la succesul și fericirea ta?',
        'Ce vrei să experimentezi prin prietenii?'
      ],
      examples: [
        'Exemplu: "Relațiile calde personale au un impact major asupra CARIEREI și succesului FINANCIAR."',
        'Exemplu: "Prieteniile de calitate sunt una dintre cele mai bune modalități de a te BUCURA de VIAȚĂ."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Cum vei selecta și cultiva prieteniile de calitate?',
        'De ce tip de oameni te vei îndepărta?',
        'Cum vei petrece timp cu prietenii și vei construi relații noi?'
      ],
      examples: [
        'Exemplu: "Scapă de oamenii care te trag în jos cu negativitate. Acceptă doar oameni pozitivi care îți îmbunătățesc viața."',
        'Exemplu: "Călătorește cu prietenii. Petrece mai mult timp cu oamenii pe care îi admiri."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre viața ta socială?'
      ],
      examples: [
        'Exemplu: "Oricine poate fi cum vrea - dar nu are voie să fie așa cu noi!"'
      ]
    }
  ]
};

// Financial Life Questions
export const financialLifeQuestions: SubcategoryQuestions = {
  subcategory: 'financial_life',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale despre bani?',
        'Ce crezi despre relația dintre bani și valoarea pe care o creezi?',
        'Ce înseamnă libertatea financiară pentru tine?'
      ],
      examples: [
        'Exemplu: "Banii sunt un lucru bun și este OK să-i iubești. Cu cât am mai mulți bani, cu atât mai mult bine pot face."',
        'Exemplu: "Bogăția este EFECTUL, cauza este crearea de valoare. Pentru a face bani trebuie să găsești probleme de rezolvat."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Ce nivel de bogăție vrei să atingi și în ce interval de timp?',
        'Ce afaceri sau surse de venit vrei să ai?',
        'Cum arată independența ta financiară?'
      ],
      examples: [
        'Exemplu: "300.000£ până la Crăciun 2022. 2 milioane până în 2023. 10 milioane până în 2024."',
        'Exemplu: "Vreau independență financiară pentru 5 generații."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE vrei să fii bogat?',
        'Cum vei folosi banii pentru a ajuta pe alții?',
        'Ce libertate îți oferă abundența financiară?'
      ],
      examples: [
        'Exemplu: "Să ajut 1 milion de oameni în timp ce devin miliardar."',
        'Exemplu: "Banii fac mai ușor să-mi ating obiectivele în celelalte 11 categorii. Scopul meu este Calitatea Vieții."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce strategii financiare vei implementa?',
        'Cum vei investi și economisi?',
        'Ce educație financiară vei urmări?'
      ],
      examples: [
        'Exemplu: "Învață despre imobiliare și investește în ele. Nu investi niciodată în ceva ce nu înțelegi bine."',
        'Exemplu: "Plătește-te pe tine mai întâi și fă diferența dintre venituri și cheltuieli tot mai mare."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre viața ta financiară?'
      ]
    }
  ]
};

// Career Questions
export const careerQuestions: SubcategoryQuestions = {
  subcategory: 'career',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale despre carieră și muncă?',
        'Ce crezi că face o carieră de succes?',
        'Cum vezi relația dintre carieră și celelalte arii ale vieții?'
      ],
      examples: [
        'Exemplu: "Este una dintre cele mai importante arii din viața noastră pentru că petrecem 70% din orele de veghe pe ea."',
        'Exemplu: "Pentru o carieră de succes: 1. Alege munca pe care o iubești. 2. Devino foarte bun la ea. 3. Fă o contribuție semnificativă."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Cum arată cariera ta ideală?',
        'Ce impact vrei să ai prin munca ta?',
        'Ce abilități și competențe vrei să dezvolți?'
      ],
      examples: [
        'Exemplu: "Iubesc ce fac și fac ce iubesc. Este cariera perfectă pentru mine. Ce fac face diferență în viețile altora."',
        'Exemplu: "Cariera ta este locul unde creșterea personală, contribuția, bogăția și calitatea vieții se întâlnesc."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE este cariera ta importantă pentru tine?',
        'Ce moștenire vrei să lași prin munca ta?',
        'Cum contribuie cariera ta la scopul tău mai mare în viață?'
      ],
      examples: [
        'Exemplu: "A face o contribuție semnificativă în această lume înseamnă a lăsa o moștenire reală."',
        'Exemplu: "Scopul meu este să fiu cel mai bun la ceea ce fac spunând adevărul tot timpul."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce acțiuni vei lua pentru a-ți dezvolta cariera?',
        'Cum vei găsi mentori și vei învăța de la experți?',
        'Ce rețea profesională vei construi?'
      ],
      examples: [
        'Exemplu: "Voi găsi un mentor! Voi lua șansa, voi face abordarea și voi întreba oamenii de succes dacă pot învăța de la ei."',
        'Exemplu: "Voi rămâne prezent. Cu cât sunt mai prezent, cu atât îmi fac treaba mai bine."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre cariera ta?'
      ],
      examples: [
        'Exemplu: "Drumul către fericire stă în două principii simple: găsește ce te interesează și la ce ești bun, și când găsești, pune tot sufletul în asta."'
      ]
    }
  ]
};

// Quality of Life Questions
export const qualityOfLifeQuestions: SubcategoryQuestions = {
  subcategory: 'quality_of_life',
  sections: [
    {
      section: 'premise',
      questions: [
        'Care sunt convingerile tale despre calitatea vieții?',
        'Ce crezi că merită în viață?',
        'Cum vezi relația dintre a avea, a face și a fi?'
      ],
      examples: [
        'Exemplu: "Calitatea vieții este preferata mea pentru că este scopul meu în viață - să experimentez toate cele mai bune lucruri pe care viața le poate oferi."',
        'Exemplu: "Știu că merit totul în viață și știu că pot avea. Cel mai bun lucru pe care îl pot face pentru lume este să fac viața mea cât mai bună."'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Ce LUCRURI materiale vrei să ai?',
        'Ce EXPERIENȚE vrei să creezi?',
        'Ce MEDIU vrei să te înconjoare?'
      ],
      examples: [
        'Exemplu: "Casa de vis în Dumbravița, Porsche și Tesla, centru de leisure privat, avion privat, barcă."',
        'Exemplu: "Scufundări, parașutism, balon, maraton, călătorii în lume, nopți romantice în Paris."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE vrei aceste lucruri și experiențe?',
        'Cum contribuie calitatea vieții la cine ești?',
        'Ce înseamnă să trăiești la maxim pentru tine?'
      ],
      examples: [
        'Exemplu: "Aceasta este o viață demnă de trăit - să ai tot ce îți dorești cu adevărat și să ajuți pe alții să facă la fel."',
        'Exemplu: "Scopul meu este să experimentez și să împărtășesc cea mai frumoasă viață imaginabilă."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce acțiuni vei lua pentru a-ți îmbunătăți calitatea vieții?',
        'Cum vei crea casa și mediul pe care ți-l dorești?',
        'Ce experiențe vei planifica și executa?'
      ],
      examples: [
        'Exemplu: "Creez casa pe care o vreau, cu cascadă, șemineu, muzică ambientală, aromaterapie."',
        'Exemplu: "Voi trăi fiecare zi ca și cum ar fi ultima. Voi lucra în Lifebook-ul meu în fiecare zi."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri ai despre calitatea vieții tale?'
      ],
      examples: [
        'Exemplu: "Calitatea nu este niciodată un accident; este întotdeauna rezultatul intenției înalte, efortului sincer, direcției inteligente și execuției abilitate."'
      ]
    }
  ]
};

// Life Vision Questions
export const lifeVisionQuestions: SubcategoryQuestions = {
  subcategory: 'life_vision',
  sections: [
    {
      section: 'premise',
      questions: [
        'Aceasta este secțiunea finală unde unești toate cele 11 categorii într-o viziune coerentă a vieții tale.',
        'Descrie CASA TA de vis. Cum arată? Unde locuiești? Ce simți când ești acolo?'
      ]
    },
    {
      section: 'vision',
      questions: [
        'Descrie ZIUA TA IDEALĂ. Cum îți petreci timpul? Ce ritualuri ai dimineața și seara?',
        'Care este nivelul tău de SĂNĂTATE și FITNESS? Ești în cea mai bună formă?',
        'Cum te ÎMPINGI intelectual? Cum te educi?',
        'Ce EMOȚII experimentezi constant, zilnic?',
        'Ce trăsături de CARACTER ai construit?',
        'Ce faci pentru a te simți CONECTAT spiritual?',
        'Descrie RELAȚIA ta ideală de iubire.',
        'Descrie viața ta de FAMILIE.',
        'Descrie PRIETENIILE tale.',
        'Descrie viața ta FINANCIARĂ nouă și îmbunătățită.',
        'Descrie CARIERA ta de vis.',
        'Descrie stilul tău de viață de ÎNALTĂ CALITATE.'
      ],
      examples: [
        'Exemplu: "Viziunea mea este să trăiesc o viață de 12 categorii. Să fiu în cea mai bună formă, sănătos, sexy, energic și în extaz tot timpul."'
      ]
    },
    {
      section: 'purpose',
      questions: [
        'DE CE această viziune a vieții merită efortul?',
        'Ce moștenire lași pentru generațiile viitoare?'
      ],
      examples: [
        'Exemplu: "Această viziune a vieții merită să te confrunți cu provocările vieții pentru a trăi o viață pe care o creezi tu pentru tine, familia ta și 5 generații de acum înainte."'
      ]
    },
    {
      section: 'strategy',
      questions: [
        'Ce vei face ZILNIC pentru a trăi această viziune?',
        'Cum vei revizui și rafina acest Life Book în mod regulat?'
      ],
      examples: [
        'Exemplu: "Voi lucra în Lifebook-ul meu în fiecare zi cel puțin 30 de minute. O dată pe an, voi lua soția și vom rafina lifebook-ul pentru anul următor."'
      ]
    },
    {
      section: 'notes',
      questions: [
        'Ce alte gânduri finale ai despre viziunea vieții tale?'
      ]
    }
  ]
};

// Export all questions mapped by subcategory
export const ALL_QUESTIONS: Record<LifebookSubcategory, SubcategoryQuestions> = {
  health_fitness: healthFitnessQuestions,
  intellectual_life: intellectualLifeQuestions,
  emotional_life: emotionalLifeQuestions,
  character: characterQuestions,
  spiritual_life: spiritualLifeQuestions,
  love_relationship: loveRelationshipQuestions,
  parenting: parentingQuestions,
  social_life: socialLifeQuestions,
  financial_life: financialLifeQuestions,
  career: careerQuestions,
  quality_of_life: qualityOfLifeQuestions,
  life_vision: lifeVisionQuestions
};

export const getQuestionsForSection = (
  subcategory: LifebookSubcategory, 
  section: LifebookSection
): SectionQuestions | undefined => {
  const subcategoryQuestions = ALL_QUESTIONS[subcategory];
  if (!subcategoryQuestions) return undefined;
  return subcategoryQuestions.sections.find(s => s.section === section);
};
