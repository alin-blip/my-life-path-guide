

# Plan: Continuare Integrare WarriorOS - 3 Task-uri Rămase

## Task 1: Adaugă articole noi de blog din outline-ul cărții

Adaug 5 articole noi in `src/data/blogPosts.ts`, fiecare extras din capitolele cheie ale cartii WARRIOR SYSTEM:

| # | Slug | Titlu RO | Categorie |
|---|------|----------|-----------|
| 1 | `walking-dead-antreprenor` | Walking Dead: De Ce Majoritatea Antreprenorilor Trăiesc o Zi pe Repeat | Mindset |
| 2 | `de-ce-sistemele-esueaza` | De Ce Sistemele Eșuează: Diferența Dintre Informație și Transformare | Training |
| 3 | `viziune-napoleon-hill-ceo` | Viziunea După Napoleon Hill: Cum Să-ți Creezi Scopul Definit ca CEO | Mindset, Training |
| 4 | `framework-4b-body-being-balance-business` | Framework-ul 4B: Corp, Minte, Echilibru și Business — Totul Într-un Sistem | Training |
| 5 | `domino-door-planificare-strategica` | Domino Door: Planificarea Strategică Săptămânală Care Îți Triplează Rezultatele | Training, Business |

Fiecare articol va avea:
- 4-6 sectiuni cu continut detaliat (300-500 cuvinte total)
- Meta description + keywords SEO
- Autor: Alin Florin Radu
- Reading time estimat
- Categorii relevante (Training, Mindset, Business, Relationships)

**Fisiere modificate:** `src/data/blogPosts.ts`

---

## Task 2: Actualizează ProblemSection cu cele 6 Gaps

ProblemSection-ul actual are 5 probleme. Documentul WarriorOS defineste 6 Gaps. Adaug **Burnout Trap** (Capcana Burnout-ului) ca a 6-a problema, intre Identity Trap si Sacrifice Myth.

**Noua problema:**
- Icon: `Flame` (din lucide-react)
- Titlu RO: "Capcana Burnout-ului"
- Titlu EN: "The Burnout Trap"
- Desc RO: "Lucrezi non-stop fara pauza. Corpul, mintea si relatiile sufera iar tu numesti asta 'dedicare'."
- Desc EN: "You work nonstop without breaks. Your body, mind and relationships suffer while you call it 'dedication'."
- Color: `text-rose-500`

Actualizez si subtitlul de la "Cele 5 probleme" la "Cele 6 probleme".

**Fisiere modificate:** `src/components/landing/ProblemSectionNew.tsx`

---

## Task 3: Salvează documentul WarriorOS ca referinta

Creez fisierul `src/docs/warrior-os-master-project.md` cu un rezumat structurat al documentului master (Brand DNA, 13 capitole carte, pricing tiers, funnel strategy, stack tehnic). Serveste ca referinta interna pentru dezvoltare viitoare.

**Fisiere noi:** `src/docs/warrior-os-master-project.md`

---

## Task 4: Adaugă link Burnout Test in footer

Adaug link-ul catre `/burnout-test` in sectiunea "Resurse" din footer, alaturi de Blog.

**Fisiere modificate:** `src/components/landing/NewFooter.tsx`

