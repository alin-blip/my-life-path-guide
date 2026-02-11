

# Implementare Personal Power Plus: Zilele 6-10

## Ce avem din PDF (pagini 1-50)
Am extras integral conținutul pentru Zilele 6-10. Pentru Zilele 11-30 PDF-ul nu a fost parsat (limita de 50 pagini), deci le vom implementa intr-un pas urmator cand vei putea retrimite restul continutului.

## Zilele de implementat acum

### Ziua 6 -- Strengthen Your Foundation (Integration Day)
- **Titlu RO**: Intareste-ti Fundatia
- **Citat**: "Identitatea ta este modelata de ceea ce faci in mod repetat. Nu primesti ceea ce vrei -- primesti ceea ce practici." -- Tony Robbins
- **Lectie**: Recapitularea Zilelor 1-5, practica trigger-elor de stare (fiziologie), observarea starilor pe parcursul zilei
- **Exercitii**: 
  1. Review Days 1-5 -- ce nu ai completat? ce merita mai multa atentie?
  2. Practica trigger-ele de stare de cel putin 2 ori azi (text/paragraph)
  3. Observa-ti starile pe parcursul zilei -- "Cand eu ___, starea mea ___"
- **AI Coaching**: Verifica care exercitii din Zilele 1-5 sunt complete, practica trigger-ele fiziologice, intareste momentumul
- **Breakthrough**: Ce ai descoperit revizuind prima saptamana? Ce instrument functioneaza cel mai bine pentru tine?

### Ziua 7 -- Lock It In: Building Momentum (Integration Day)
- **Titlu RO**: Fixeaza-l: Construieste Momentum
- **Citat**: "Nu ceea ce facem o data la un timp ne modeleaza viata. Ci ceea ce facem constant." -- Tony Robbins
- **Lectie**: Completarea primei saptamani, evaluarea consistentei, reangajarea
- **Exercitii**:
  1. Pe o scara de la 1-10, cat de consistent ai folosit instrumentele? (scale)
  2. La ce te angajezi sa lucrezi mai constant? (paragraph)
  3. Cum vrei sa te prezinti saptamana aceasta? In ce stare emotionala? (paragraph)
- **AI Coaching**: Evalueaza consistenta, identifica 1-2 practici de mentinut, clarifica focusul pentru saptamana 2
- **Breakthrough**: Ce lectie din prima saptamana a avut cel mai mare impact? De ce?

### Ziua 8 -- The Power of Focus
- **Titlu RO**: Puterea Focusului
- **Citat**: "Intrebarile sunt laserul constiintei umane. Ele ne concentreaza focusul si determina ce simtim si ce facem." -- Tony Robbins
- **Definitii**: Focus (Focusul determina starea emotionala)
- **Lectie**: Focusul ca al doilea vehicul de gestionare a starii (dupa fiziologie), procesul de "stergere", 2 moduri de control al focusului (ce imagini si cum), intrebarile determina gandurile, Morning Power Questions, Evening Power Questions
- **Exercitii**:
  1. Dezvolta 5 intrebari pe care sa ti le pui in fiecare dimineata (list x5)
  2. In fiecare dimineata pune-ti cele 5 intrebari si gaseste cel putin 2 raspunsuri (paragraph)
- **AI Coaching**: Dezvolta Morning Power Questions personale, fa-le profund personale, practica raspunsurile cu intensitate emotionala, creeaza angajament zilnic
- **Breakthrough**: Ce Morning Power Questions ai creat? Cum te-au facut sa te simti?

### Ziua 9 -- Values and Beliefs: The Source of Success or Failure
- **Titlu RO**: Valori si Credinte: Sursa Succesului sau a Esecului
- **Citat**: "Trebuie sa fim clari in privinta a ceea ce este cel mai important in vietile noastre si sa decidem sa traim dupa aceste valori, indiferent de ce." -- Tony Robbins
- **Definitii**: Valori, Credinte, Valori Moving-Toward, Valori Moving-Away-From, Credinte Globale, Reguli
- **Lectie**: Valorile ca stari emotionale ierarhizate, Moving-Toward vs Moving-Away-From, Ends vs Means values, Puterea credintelor, 2 tipuri de credinte (globale si reguli)
- **Exercitii** (6 pasi, primii 2 azi, restul pe parcursul saptamanii):
  1. Determina valorile Moving-Toward: "Ce este cel mai important pentru mine?" (list x10)
  2. Rescrie valorile in ordinea importantei (list x12)
  3. Determina valorile Moving-Away-From (list x10)
  4. Rescrie valorile Moving-Away-From in ordinea importantei (list x12)
  5. Determina regulile pentru valorile Moving-Toward (paragraph)
  6. Ai descoperit reguli care limiteaza calitatea vietii tale? Care esti dispus sa le schimbi? (paragraph)
- **AI Coaching**: Identifica si ierarhizeaza valorile, descopera regulile, vezi care reguli te imputernicesc si care te limiteaza
- **Breakthrough**: Ce ai descoperit despre ierarhia ta de valori? Exista conflicte?

### Ziua 10 -- How to Take Complete Control of Your Life
- **Titlu RO**: Cum sa Preiei Controlul Complet al Vietii Tale
- **Citat**: "Trecutul nu este egal cu viitorul." -- Tony Robbins
- **Definitii**: Dickens Pattern
- **Lectie**: Cum sa schimbi o credinta (5 pasi), 2 credinte de baza de adoptat, Dickens Pattern
- **Exercitii**:
  1. Identifica o credinta limitanta pe care vrei sa o schimbi (text)
  2. Conecteaza durere la credinta actuala -- ce te-a costat? (paragraph)
  3. Identifica noua credinta imputernicatoare (text)
  4. Conecteaza placere masiva la noua credinta (paragraph)
  5. Conditioneaza noua credinta -- vizualizeaza cum va fi viata ta (paragraph)
- **AI Coaching**: Ghideaza prin Dickens Pattern, ajuta sa vada costul credintei limitante in trecut/prezent/viitor, instaleaza noua credinta
- **Breakthrough**: Ce credinta limitanta ai decis sa schimbi? Cu ce ai inlocuit-o?

## Implementare tehnica

### Fisier nou: `src/data/personalPowerDays6to10.ts`
- Exporta un array `personalPowerDays6to10` cu cele 5 zile
- Fiecare zi urmeaza exact structura `PersonalPowerDay` interface
- Continut tradus in romana fidel dupa PDF, cu referinte la "mentorul nostru" in loc de referinte directe

### Fisier modificat: `src/data/personalPowerContent.ts`
- Import `personalPowerDays6to10`
- Concateneaza in array-ul `personalPowerDays`: `[...zilele existente, ...personalPowerDays6to10]`
- `implementedDays` se calculeaza automat din `personalPowerDays.length`

### Fara alte modificari
Toate componentele existente (PersonalPowerLesson, PersonalPowerExercise, PersonalPowerCoach, PersonalPowerBreakthrough, PersonalPowerSidebar, PersonalPowerOverview) functioneaza automat cu zilele noi.

## Pasul urmator
Dupa implementarea Zilelor 6-10, vei retrimite continutul PDF pentru paginile 51+ (Zilele 11-30) si le implementam in acelasi stil.

