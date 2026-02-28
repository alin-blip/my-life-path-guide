

# Plan: Upgrade Landing Page (Index) cu Copy-ul Nou CEO Mind OS

## Ce se schimba

Pagina din referinta are o structura complet diferita fata de cea actuala. Iata comparatia si ce preluam:

### Sectiuni NOI de creat (5 sectiuni noi):

1. **ProblemSection** - "Nu iti lipsesc informatii. Iti lipseste un sistem de operare." cu cele 5 probleme critice (Capcana Identitatii, Mitul Sacrificiului, Prapastia Executiei, Deficitul Emotional, Bariera Accesibilitatii)

2. **MethodologySection** - Cei 4 piloni: The Warrior Routine, The Door, The Stack, AI Coaches + citatul lui Alin Radu

3. **FounderSection** - Povestea fondatorului Alin Radu ("De la operator blocat la CEO suveran")

4. **TargetAudienceSection** - "Pentru cine este" cu 3 persona cards (Antreprenorul Blocat, Freelancerul Ambitios, Coach-ul/Mentorul)

5. **ComparisonSection** - "Diferenta este sistemul tau de operare" - tabel Fara CEO Mind OS vs Cu CEO Mind OS

### Sectiuni MODIFICATE:

6. **StickyHeader** - Nav items actualizate: "Metodologia" si "Pentru cine" in loc de "Features" si "How it works"

7. **NewHeroSection** - Rescrierea completa:
   - Badge: "THE FIRST FOUNDER OPERATING SYSTEM"
   - Headline: "Afacerea ta are un sistem de operare. Tu inca rulezi pe haos."
   - Sub-copy cu pozitionarea "Nu mai fi cel mai bun angajat din propria firma..."
   - Diferentiatori: "Nu e un curs / Nu e coaching / Nu e o aplicatie de productivitate"
   - CTA: "Instaleaza CEO Mind OS"
   - Sub-CTA: "Incepe Challenge-ul Gratuit de 7 Zile"
   - Garantii: 90 zile, Anulezi oricand, Fara card la trial
   - Stat: "16+ Instrumente de Executie"
   - Video-ul Voomly se pastreaza

8. **PricingComparison** - Extins la 3 planuri (Basic + Pro + Elite), cu preturile in LEI, "5 Zile Trial", "Garantie 90 zile"

9. **FAQSection** - Intrebari noi din referinta:
   - Ce este CEO Mind OS exact?
   - Este un curs online sau o aplicatie?
   - Cat timp dureaza sa vad rezultate?
   - Pot anula oricand?
   - Ce include Challenge-ul gratuit de 7 zile?
   - Functioneaza pentru orice tip de business?

10. **NewFooter** - Pre-footer CTA actualizat: "Esti gata sa operezi viata si business-ul cu claritate, control si certitudine?" + "Instaleaza singurul sistem care integreaza transformarea personala cu executia profesionala."

### Sectiuni RAMASE (pastrate asa cum sunt):
- **LogoCloud** (stats + industrii) - functioneaza bine
- **TestimonialCarousel** - deja bun

### Sectiuni INLOCUITE:
- **FeatureShowcase** (carousel cu 9 features) -> inlocuit cu ProblemSection + MethodologySection (mai clare si mai persuasive)
- **InteractiveTimeline** (Day 1, Days 2-7...) -> inlocuit cu TargetAudienceSection + ComparisonSection

### Ordinea noua a sectiunilor in Index.tsx:

```text
StickyHeader (modificat)
NewHeroSection (rescris)
LogoCloud (pastrat)
ProblemSection (NOU)
MethodologySection (NOU)
FounderSection (NOU)
TargetAudienceSection (NOU)
ComparisonSection (NOU)
TestimonialCarousel (pastrat)
PricingComparison (modificat - 3 planuri)
FAQSection (intrebari noi)
NewFooter (CTA actualizat)
```

---

## Detalii tehnice

**Fisiere noi de creat:** 5
- `src/components/landing/ProblemSection.tsx`
- `src/components/landing/MethodologySection.tsx`
- `src/components/landing/FounderSection.tsx`
- `src/components/landing/TargetAudienceSection.tsx`
- `src/components/landing/ComparisonSection.tsx`

**Fisiere de modificat:** 6
- `src/pages/Index.tsx` - ordinea noua a sectiunilor
- `src/components/landing/StickyHeader.tsx` - nav items
- `src/components/landing/NewHeroSection.tsx` - rescris complet
- `src/components/landing/PricingComparison.tsx` - adaugat Elite + preturi LEI
- `src/components/landing/FAQSection.tsx` - intrebari noi
- `src/components/landing/NewFooter.tsx` - CTA actualizat

**Fisiere vechi ramase in codebase** (nu se sterg, doar nu mai sunt importate in Index):
- `FeatureShowcase.tsx` - folosit posibil in alte pagini
- `InteractiveTimeline.tsx` - folosit posibil in alte pagini

**Nota:** Toate textele vor fi bilingve (RO/EN) conform pattern-ul existent cu `language === 'ro'`. Animatiile Framer Motion se pastreaza in stilul existent.

