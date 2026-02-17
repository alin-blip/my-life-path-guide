

# Pagina /b2b - Landing Page pentru Coachi si Consultanti + Audit Platforma

## Rezumat

Cream o pagina publica `/b2b` care atrage coachi si consultanti sa foloseasca platforma ca "sistem de operare" pentru clientii lor. In paralel, facem un audit la ce exista vs ce lipseste din functionalitati.

---

## AUDIT: Ce exista deja vs Ce lipseste

### Ce EXISTA (functional):
- **Coach Profiles** -- profil cu Stripe Connect, referral code, comision 50%
- **Coach Dashboard** -- statistici, clienti, earnings, mesaje
- **Tribe Manager** -- comunitate privata per coach (creare + gestionare membri)
- **Content Manager** -- coach poate crea resurse/cursuri/ebooks cu pret
- **Referral System** -- link unic, tracking referrals, comisioane automate via Stripe
- **Client Progress** -- coach vede progresul clientilor
- **Coach Inbox** -- mesaje intre coach si clienti
- **Stripe Connect** -- onboarding Express, payouts automate
- **CoachOnboarding** -- pagina de inregistrare cu value stack (deja foarte bine facuta)

### Ce LIPSESTE (de construit):

| Feature | Prioritate | Complexitate |
|---------|-----------|-------------|
| 1. **Personalizare Rutina per Grup** -- coach sa creeze rutina custom (pasi, ordine, durata) pentru grupul lui | MARE | Medie |
| 2. **Programe de Antrenament** -- coach sa creeze programe de fitness cu exercitii pe zile | MARE | Mare |
| 3. **Plan de Mese** -- coach sa creeze planuri nutritionale pentru clienti | MEDIE | Mare |
| 4. **Pagina /b2b** -- landing page public pentru atragerea coachilor | MARE | Mica |
| 5. **Admin Community (tip Skool)** -- posturi, discutii, anunturi in Tribe | MEDIE | Mare |
| 6. **Onboarding Flow mai clar** -- coach sa inteleaga pasii: Profil -> Stripe -> Link -> Primul Client | MICA | Mica |
| 7. **Analytics avansate** -- retention rate clienti, revenue forecast, MRR per coach | MICA | Medie |

---

## PLAN: Pagina /b2b Landing Page

### Structura paginii (public, fara autentificare)

**Sectiune 1 -- Hero**
- Headline: "Transforma-ti Practica de Coaching intr-un Business Scalabil"
- Subheadline: "Platforma all-in-one care face clientii tai sa EXECUTE -- nu doar sa asculte"
- CTA principal: "Aplica ca Partner Coach" (scroll la formular sau redirect /auth)
- Social proof: "X coachi activi | Y clienti in executie"

**Sectiune 2 -- Problema vs Solutie**
- Reutilizam structura din CoachOnboarding.tsx (fail vs win points)
- Adaptam pentru audienta B2B (focus pe scalabilitate si revenue)

**Sectiune 3 -- Ce Primeste Coach-ul (Value Stack)**
- 50% comision recurent FOREVER
- Dashboard cu progresul clientilor in timp real
- AI Coach 24/7 care lucreaza pentru clientii tai
- Comunitate privata (Tribe) cu brand propriu
- Cursuri si content -- monetizare suplimentara
- Rutina personalizata per grup (coming soon badge)

**Sectiune 4 -- Cum Functioneaza (3 pasi)**
1. Creeaza profil de coach (30 secunde)
2. Conecteaza Stripe si primeste link-ul unic
3. Trimite link-ul clientilor -- ei se inscriu, tu castigi

**Sectiune 5 -- Instrumente pentru Clienti**
- Lista completa a tool-urilor: Stacks, Door, Obiective, Harta Realitatii, etc.
- Capturi de ecran / mockup-uri

**Sectiune 6 -- Testimoniale / Social Proof**
- Placeholder pentru testimoniale de la coachi

**Sectiune 7 -- Calculator Revenue**
- Input: cati clienti ai?
- Output: la 97 EUR/luna x 50% = venit lunar estimat

**Sectiune 8 -- CTA Final + Formular**
- Buton "Incepe Acum" -> redirect la /coach (unde se face onboarding)
- Sau formular de aplicare (email + nisa)

**Sectiune 9 -- FAQ pentru Coachi**
- Cat castig? Cum se face plata? Ce primesc clientii? etc.

### Design
- Stil n8n (consistent cu landing page-ul existent)
- Dark theme cu accente primary
- Animatii framer-motion
- Responsive complet

---

## Fisiere noi si modificate

### Fisiere NOI:
1. `src/pages/B2BLanding.tsx` -- pagina principala /b2b
2. `src/components/b2b/B2BHero.tsx` -- hero section
3. `src/components/b2b/B2BValueStack.tsx` -- ce primeste coachul
4. `src/components/b2b/B2BHowItWorks.tsx` -- cei 3 pasi
5. `src/components/b2b/B2BRevenueCalculator.tsx` -- calculator interactiv
6. `src/components/b2b/B2BToolsShowcase.tsx` -- instrumente pentru clienti
7. `src/components/b2b/B2BFAQ.tsx` -- intrebari frecvente
8. `src/components/b2b/B2BCta.tsx` -- sectiunea finala cu CTA

### Fisiere MODIFICATE:
1. `src/App.tsx` -- adaugare ruta `/b2b` (publica, fara ProtectedRoute)
2. `src/components/landing/` -- optional, link catre /b2b din footer sau nav

### NU se modifica baza de date
- Infrastructura de coach profiles, referrals, commissions exista deja complet
- Pagina /b2b este pur frontend, nu necesita tabele noi

---

## Detalii tehnice

- Pagina /b2b este **publica** (nu necesita autentificare)
- Reutilizam componente din landing page existente (stiluri n8n, animatii)
- CTA-ul redirecteaza la `/coach` unde CoachOnboarding se ocupa de creare profil
- Calculator revenue: componenta client-side cu state React, fara backend
- Bilingual RO/EN folosind `useLanguage()` existent
- Toate componentele folosesc Tailwind + framer-motion pentru consistenta

