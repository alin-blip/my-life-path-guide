
# Plan: Optimizari Hormozi-Style pentru Landing Page

## 1. Fix Inconsistenta Trial (Hero = 7 zile, Pricing = 5 zile)

**NewHeroSection.tsx**: Schimba "Challenge-ul Gratuit de 7 Zile" -> "Trial-ul Gratuit de 5 Zile" (pentru a fi consistent cu pricing-ul de 5 zile).

## 2. Value Stack in PricingComparison

Adauga anchoring de valoare deasupra pretului fiecarui plan:

- **Basic**: Valoare totala ~2.500 LEI/luna -> Tu platesti doar 249 LEI
- **Pro**: Valoare totala ~5.000 LEI/luna -> Tu platesti doar 490 LEI  
- **Elite**: Valoare totala ~15.000 LEI/luna -> Tu platesti doar 1.490 LEI

Se afiseaza ca text strikethrough deasupra pretului real (pattern clasic Hormozi).

## 3. CTA-uri intermediare (2 noi componente inline)

Creez o componenta reutilizabila `InlineCTA.tsx` si o inserez in Index.tsx in 2 locuri:

- **Dupa ProblemSectionNew** - "Ai recunoscut problema? Instaleaza solutia." + buton CTA
- **Dupa ComparisonSection** - "Alege partea cu rezultate." + buton CTA

Componenta e simpla: un banner cu text + buton care duce la `/auth`.

## 4. Guarantee Section dedicata

Creez `GuaranteeSection.tsx` - o sectiune mica plasata intre ComparisonSection si TestimonialCarousel:

- Headline: "Garantie 100% - 90 de Zile"
- Text: "Daca in 90 de zile nu vezi rezultate masurabile, iti dam banii inapoi. Fara intrebari."
- Icon: Shield mare
- Design: border verde, bg-green/5

## 5. Founder Section - Adauga metrici concrete

In **FounderSectionNew.tsx**, adaug o linie cu rezultate concrete:
- "€100K+ investiti in dezvoltare personala"
- "500+ fondatori transformati" (sau numarul real)
- "16+ instrumente construite"

Se afiseaza ca 3 stat badges sub textul principal.

## 6. Social proof langa CTA-urile principale

In **NewHeroSection.tsx**, adaug un micro-social-proof sub butonul CTA:
- Avatar stack (3 cercuri) + "Alaturat de 100+ fondatori" (sau numarul real din DB)

---

## Rezumat fisiere

| Fisier | Modificare |
|--------|-----------|
| NewHeroSection.tsx | Fix "7 zile" -> "5 zile", adauga micro social proof sub CTA |
| PricingComparison.tsx | Adauga value stack anchoring deasupra pretului |
| FounderSectionNew.tsx | Adauga 3 stat badges cu metrici concrete |
| InlineCTA.tsx (NOU) | Componenta reutilizabila de CTA intermediar |
| GuaranteeSection.tsx (NOU) | Sectiune dedicata garantiei de 90 zile |
| Index.tsx | Insereaza InlineCTA (x2) si GuaranteeSection in ordinea corecta |

**Ordinea noua in Index.tsx:**
```text
StickyHeader
NewHeroSection
LogoCloud
ProblemSectionNew
InlineCTA #1 ("Ai recunoscut problema?")
MethodologySection
FounderSectionNew (cu stats)
TargetAudienceSection
ComparisonSection
InlineCTA #2 ("Alege partea cu rezultate")
GuaranteeSection (NOU)
TestimonialCarousel
PricingComparison (cu value stack)
FAQSection
NewFooter
```

**Total: 4 fisiere modificate + 2 fisiere noi**
