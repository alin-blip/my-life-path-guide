

# Postari Seed Complete + Instructiuni Pinned per Zi

## Probleme Curente

1. **Postarile seed sunt trunchiate pe wall** -- textul e prea lung si se taie cu "Show more". Trebuie rescrise mai scurt si cu impact.
2. **Nu exista o "postare de bun venit" per zi** -- ca in Skool, fiecare lectie ar trebui sa aiba un mesaj fixat (pinned) care explica CE trebuie sa faci in acea zi, ca un ghid vizual.
3. **Engagement-ul nu e clar** -- userii nu stiu exact ce sa posteze.

---

## Solutie

### 1. Componenta noua: `LessonWelcomePost`

O componenta pinned (cu Pin icon, ca `CommunityWelcomeBanner`) care apare prima in sectiunea de comunitate a fiecarei zile. Afiseaza:

- Titlu: "Bine ai venit in Ziua X!"
- Lista de task-uri specifice zilei (din `challengeContent`)
- Call-to-action clar: "Posteaza declaratia ta / obiectivele tale / Domino Door-ul / etc."
- Stil amber/orange consistent cu tema

Aceasta componenta va fi integrata in `LessonCommunityPost` -- apare FIX DEASUPRA postarilor, ca un banner pinned.

Continutul per zi:

**Ziua 1**: "Bine ai venit in Ziua 1: Viziune + Declaratie! Treci prin Harta Realitatii, raspunde la cele 5 intrebari, scrie-ti Declaratia Anti-Burnout si posteaz-o aici. Momentul tau AHA conteaza!"

**Ziua 2**: "Ziua 2: Corp + Spirit + Relatii. Seteaza obiective concrete pe 3 nivele (1 an, 90 zile, 30 zile) pentru fiecare arie. Posteaza 2-3 obiective cheie aici."

**Ziua 3**: "Ziua 3: Business + Domino Door. Deschide AI Wizard-ul, seteaza viziunea, targetele si Domino Door-ul. Posteaza milestone-ul tau aici."

**Ziua 4**: "Ziua 4: Warrior Routine. Genereaza imagini AI, creeaza meditatia personalizata, configureaza rutina. Posteaza momentul AHA."

**Ziua 5**: "Ziua 5: Accountability + Mind Coach. Verifica ce e facut, transforma emotiile blocante. Posteaza breakthrough-ul."

**Ziua 6**: "Ziua 6: Idea List. Parcheaza ideile, clasifica-le strategic. Protejeaza focusul."

**Ziua 7**: "Ziua 7: Integrare. Ai spart ciclul burnout-ului. Posteaza datele tale finale si planul de continuitate."

### 2. Actualizare postari seed in baza de date

Stergem cele 18 postari existente (trunchiate) si le inlocuim cu versiuni mai scurte, clare si cu impact:

- Max 2-3 propozitii per postare
- Contin rezultate concrete (scoruri, obiective)
- Se termina cu intrebare de engagement ("Voi ce ati descoperit?", "Cine mai e cu mine?")

Exemple noi:

**Ziua 1 - Andrei**: "Harta Realitatii: Corp 5/10, Spirit 4/10, Relatii 7/10, Business 6/10. Declaratia mea: 'Business de 7 cifre fara sa sacrific sanatatea.' Voi ce scoruri aveti? 💪"

**Ziua 1 - Elena**: "Am sacrificat relatiile pentru business. Acum aleg sa fiu prezenta. Declaratia mea: 'Echilibru in toate cele 4 zone.' 🌸"

**Ziua 2 - Ana**: "Obiective setate! Corp: alergare 5K in 3 luni. Spirit: meditatie zilnica. Relatii: o seara/saptamana pt familie. Cine a terminat? ⚡"

**Ziua 3 - Cristian**: "Domino Door setat: Lansare MVP in 60 zile. 4 chei definite. AI Wizard-ul a fost revelator! 📊"

### 3. Integrare in `LessonCommunityPost`

Adaugam `LessonWelcomePost` ca prim element in feed-ul de postari, inainte de postarile utilizatorilor. Va primi `dayNumber` si va afisa continutul corespunzator.

---

## Detalii Tehnice

### Fisiere noi
1. **`src/components/programs/LessonWelcomePost.tsx`** -- componenta pinned cu instructiuni per zi, stil amber/orange, cu Pin icon

### Fisiere modificate
1. **`src/components/programs/LessonCommunityPost.tsx`** -- import si randare `LessonWelcomePost` deasupra feed-ului de postari

### Operatii baza de date
1. **DELETE** postarile seed existente (cele 18 cu source_context challenge-day-*)
2. **INSERT** postari seed noi, mai scurte si cu engagement clar (~14 postari, 2 per zi)
