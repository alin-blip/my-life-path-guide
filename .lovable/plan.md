

# Plan: Finalizare Rebranding CEO Mind OS + Audit Complet

## Ce s-a facut deja
LanguageContext, GlobalTopBar, AuthForm, TermsOfService, PrivacyPolicy, About, HeroSection, NewFooter, ProofSection, Core4SectionNew, pricing.ts, ~15 alte componente frontend si ~18 edge functions au fost rebranduite.

## Ce mai lipseste

### 1. Frontend - Fisiere cu referinte vechi ramase (8 fisiere)

**StickyHeader.tsx** (pagina Index - logo header):
- Linia 52: `"W"` icon si `Warrior<span>OS</span>` -> `CEO Mind<span>OS</span>` sau logo text corespunzator

**FAQSection.tsx** (pagina Index):
- 3 referinte "WarriorOS" in raspunsuri FAQ (liniile 22, 46, 78)

**SideMenu.tsx** (meniul lateral in-app):
- Linia 347: alt text `"WarriorOS logo"`
- Linia 352: text afisat `"WarriorOS"` -> `"CEO Mind OS"`

**Pricing.tsx** (pagina /pricing):
- Liniile 45-49: meta title/description cu "WarriorOS Memberships"
- Linia 51: "Choose Your Warrior Path" -> "Choose Your Path"

**WarriorAcceleratorThankYou.tsx**:
- Linia 84: meta description "platforma WarriorOS"
- Linia 157: "Exploreaza Platforma WarriorOS"
- Linia 193: email `support@warrioros.com` -> `support@ceomindos.com`

**InteractiveROI.tsx**:
- Liniile 92, 96: "Fara RoWarrior" / "Cu RoWarrior" -> "Fara CEO Mind OS" / "Cu CEO Mind OS"

**ContentTemplates.tsx** (admin):
- Liniile 201-202: social handles `@lifeos` -> `@ceomindos`

**FeatureShowcase.tsx** (pagina Index):
- Linia 74: title "Warrior Launch Accelerator" (feature name - poate ramane sau se schimba)

### 2. Landing page components - referinte "Warrior" ca feature names (5 fisiere)

Acestea sunt NUMELE de feature-uri, nu brand-ul principal. Propun sa le pastram ca atare ("Rutina Razboinicului", "Warrior Routine") deoarece sunt denumiri de produs intern, NU referinte la brand. Daca vrei sa le schimbi si pe acestea, spune-mi cum sa le numesc.

Fisiere afectate:
- `FeaturesShowcase.tsx` - "Warrior Routine"
- `HowItWorks.tsx` - "Warrior Routine"
- `BentoFeatures.tsx` - "warriors" in descriere comunitate
- `FeatureShowcase.tsx` - "Rutina Razboinicului", "Warrior Launch Accelerator"
- `SocialProofNew.tsx` - "Warrior Routine" in testimonial

### 3. Edge Functions ramase (2 fisiere)

**accountability-coach/index.ts**:
- Liniile 135, 157: system prompt `"platforma LifeOS"` -> `"platforma CEO Mind OS"`

**send-challenge-recovery/index.ts**:
- Linia 57: `"Echipa WarriorOS"` -> `"Echipa CEO Mind OS"`

### 4. Tracking - Neimplementat

`trackLogin` exista in `useActivityTracker.ts` dar NU este apelat nicaieri la SIGNED_IN. `trackCheckoutInitiated` este deja implementat in 5 locuri. `trackPurchase` nu este apelat la return din Stripe.

Implementare:
- In `AuthContext.tsx`: import si apel `trackLogin` la evenimentul SIGNED_IN (necesita un mecanism simplu deoarece `useActivityTracker` e un hook React dar AuthContext nu-l poate folosi direct - va trebui o solutie cu event dispatch sau direct DB insert)
- In pagina de success Stripe: apel `trackPurchase` (de verificat daca exista o pagina de return)

### 5. Pagina Index - Audit

Pagina `Index.tsx` in sine este curata - foloseste `t('indexMetaTitle')` din LanguageContext (deja rebranduit). Componentele sub-pagina care mai au probleme sunt:
- **StickyHeader** - logo text "WarriorOS" (CRITIC - e vizibil pe landing)
- **FAQSection** - 3 referinte "WarriorOS" in text

Celelalte componente din Index (NewHeroSection, FeatureShowcase, PricingComparison, InteractiveTimeline, TestimonialCarousel, NewFooter) sunt fie deja rebranduite, fie folosesc LanguageContext.

---

## Rezumat actiuni

| Prioritate | Fisier | Ce se schimba |
|-----------|--------|---------------|
| CRITIC | StickyHeader.tsx | Logo "WarriorOS" -> "CEO Mind OS" |
| CRITIC | SideMenu.tsx | Logo "WarriorOS" -> "CEO Mind OS" |
| CRITIC | FAQSection.tsx | 3x "WarriorOS" -> "CEO Mind OS" |
| CRITIC | Pricing.tsx | Meta + heading "WarriorOS" |
| MEDIU | WarriorAcceleratorThankYou.tsx | 3 referinte + email |
| MEDIU | InteractiveROI.tsx | "RoWarrior" -> "CEO Mind OS" |
| MEDIU | ContentTemplates.tsx | Social handles |
| MEDIU | accountability-coach/index.ts | System prompt |
| MEDIU | send-challenge-recovery/index.ts | Semnatura email |
| LOW | platformKnowledge.ts | Comentarii cod (3 comments "LifeOS Rebrand") |
| DECIZIE | 5 fisiere landing | Feature names "Warrior Routine" etc - pastram sau schimbam? |
| TODO | AuthContext.tsx | Implementare trackLogin |
| TODO | Stripe return page | Implementare trackPurchase |

**Total: ~11 fisiere de editat + 2 implementari tracking**

