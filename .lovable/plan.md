
# Plan: Burnout Test - Lead Magnet Public

## Ce se creaza

Un **test de burnout cu 20 de intrebari** la `/burnout-test`, public, fara autentificare pentru quiz, cu gate la rezultate (signup obligatoriu pentru a vedea rezultatele detaliate). Urmeaza pattern-ul existent din `/life-score`.

---

## Structura Quiz-ului

### 20 Intrebari pe 4 categorii (5 intrebari/categorie)

**Body (Corp)** - 5 intrebari:
1. Cat de des te simti obosit fizic la finalul zilei?
2. Cum dormi noaptea?
3. Cat de des faci miscare/sport?
4. Cum te alimentezi in general?
5. Cat de des ai dureri fizice (spate, cap, tensiune)?

**Being (Minte/Spirit)** - 5 intrebari:
1. Cat de des te simti coplesit de ganduri?
2. Ai momente de liniste si claritate mentala?
3. Cat de des te simti anxios sau stresat?
4. Ai un scop clar in viata?
5. Cat de des practici recunostinta sau meditatie?

**Balance (Relatii/Echilibru)** - 5 intrebari:
1. Cat de conectat te simti cu familia?
2. Ai timp de calitate cu oamenii importanti?
3. Cat de des spui "nu" cand trebuie?
4. Cum e balanta munca-viata personala?
5. Te simti sustinut emotional de cei din jur?

**Business (Cariera/Afacere)** - 5 intrebari:
1. Cat de satisfacut esti de progresul profesional?
2. Cat de des lucrezi peste program?
3. Simti ca munca ta are impact real?
4. Cat de clar iti sunt prioritatile la munca?
5. Cat de des amani taskuri importante?

### Scala Likert (1-5 puncte per intrebare)
- 1 = Aproape niciodata / Foarte rau
- 2 = Rar / Rau
- 3 = Uneori / Mediocru
- 4 = Des / Bine
- 5 = Mereu / Excelent

### Scoring (max 100 puncte)
- 80-100: Thriving (verde) - Esti in forma excelenta
- 60-79: Growing (albastru) - Fundatie buna, mici ajustari
- 40-59: Warning (galben) - Semne de burnout, actioneaza acum
- 20-39: Burnout (rosu) - Burnout activ, ai nevoie de ajutor
- 0-19: Critical (rosu inchis) - Situatie critica

---

## Design & UX Flow

1. **Landing page** `/burnout-test` - Hero dark gradient (ca LifeScore), CTA "Incepe Testul Gratuit"
2. **Quiz** - O intrebare pe ecran, progress bar, animatii framer-motion, emoji per raspuns
3. **Preview rezultate** - Scor total + radar chart pe 4 categorii (recharts RadarChart) - vizibil partial
4. **Gate**: Signup form (nume, email, parola) pentru rezultate complete + recomandari personalizate
5. **Rezultate complete** - Radar chart, scor pe categorie, nivel burnout, recomandari, CTA catre dashboard

---

## Fisiere noi

| Fisier | Descriere |
|--------|-----------|
| `src/data/burnoutTestQuestions.ts` | 20 intrebari cu scala Likert, RO+EN, scoring |
| `src/pages/BurnoutTest.tsx` | Pagina principala (landing + quiz toggle) |
| `src/components/burnout-test/BurnoutQuiz.tsx` | Componenta quiz (intrebari, progress, signup gate) |
| `src/components/burnout-test/BurnoutResults.tsx` | Rezultate cu radar chart si recomandari |
| `src/components/burnout-test/BurnoutSEO.tsx` | Meta tags, JSON-LD (Quiz schema) |

## Fisiere modificate

| Fisier | Modificare |
|--------|-----------|
| `src/App.tsx` | Adauga ruta publica `/burnout-test` |

---

## Detalii tehnice

### Radar Chart (recharts)
- Foloseste `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `Radar` din recharts (deja instalat)
- 4 axe: Body, Being, Balance, Business
- Gradient fill pe zona scorului
- Responsive, animat

### Signup Gate
- Acelasi pattern ca LifeScoreQuiz: quiz gratuit -> signup form -> rezultate complete
- Salveaza in `email_leads` cu `lead_magnet: 'burnout_test'`
- Creeaza cont + trial 3 zile
- Redirect catre `/dashboard` sau `/challenge` dupa signup

### SEO
- JSON-LD Quiz schema
- Meta tags: "Test Burnout Gratuit | CEO Mind OS"
- Open Graph cu preview al radar chart-ului
- Canonical URL

### Integrare cu ecosistemul existent
- Reutilizeaza `categoryLabels` din `lifeScoreQuestions.ts` pentru consistenta culorilor
- Foloseste aceeasi logica de trial din `LifeScoreQuiz`
- Link in footer sub "Resurse" alaturi de Blog
