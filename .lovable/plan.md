

# Plan: Ebook Funnel — RO + EN (4 pagini)

## Rezumat

Construim un funnel complet de ebook cu 4 pagini (x2 limbi = 8 rute), folosind imaginile uploadate si continutul din PDF-ul "De la Burnout la Peak Performance". Designul reproduce fidel paginile de referinta de pe manus.space (dark theme, gold accents, tipografie premium).

---

## Structura Funnel

```text
Landing (email capture) → Thank You (download + redirect upsell)
                              ↓
                     Upsell (audiobook + challenge 99 LEI)
                              ↓
                     Payment Success (acces complet)
```

### Rute

| Pagina | RO | EN |
|--------|----|----|
| Landing Ebook | `/ebook` | `/ebook-en` |
| Thank You | `/ebook-multumesc` | `/ebook-thank-you` |
| Upsell Accelerator | `/ebook-upsell` | `/ebook-upsell-en` |
| Payment Success | `/ebook-plata-reusita` | `/ebook-payment-success` |

---

## Pagina 1: Landing Ebook (`/ebook` + `/ebook-en`)

Design identic cu referinta manus.space:
- **Navbar**: Logo CEO Mind OS + tagline
- **Hero**: Split layout — stanga: headline "Afacerea ta are un sistem de operare. Tu nu." + form (nume + email) + CTA gold; dreapta: imaginea cartii (hero_landing webp)
- **Sectiunea Diagnostic**: "Recunosti asta?" — simptome burnout
- **Sectiunea Poveste**: "Am fost acolo" — povestea lui Alin
- **Sectiunea Continut**: 7 capitole cheie (6 Gaps, 4B, The Door, Rutina, The Stack, Vision Board AI, Plan 90 zile)
- **Sectiunea Target**: Pentru cine este / Nu este
- **Testimoniale**: 3 citate
- **CTA Final**: Repeat form + "Descarca GRATUIT"

La submit: salveaza in `email_leads` cu `lead_magnet: 'ebook_burnout'`, redirect catre `/ebook-multumesc` (sau `/ebook-thank-you`)

---

## Pagina 2: Thank You (`/ebook-multumesc` + `/ebook-thank-you`)

Design identic cu referinta:
- Hero cu background imagine + icon download
- "Cartea ta este gata de descarcare" + buton download PDF
- 3 pasi urmatori (Citeste Prefata, Completeaza Test Burnout, Urmareste pe social)
- **Auto-redirect**: Dupa 5 secunde, redirect automat catre pagina de Upsell

---

## Pagina 3: Upsell Accelerator (`/ebook-upsell` + `/ebook-upsell-en`)

Design identic cu referinta:
- **Countdown timer** (24h, vizual) + badge "Oferta exclusiva"
- Headline: "Felicitari! Cartea ta e pe drum."
- Subtext: "Cartea iti da cunoasterea. Dar cunoasterea fara executie este inutila."
- Imaginea hero_upsell (audiobook + headphones + tablet)
- **4 componente** cu valori barate:
  1. Audiobook Complet (149 lei)
  2. Challenge 90 de Zile (249 lei)
  3. Template-uri Printabile (99 lei)
  4. Comunitate Privata 30 zile (97 lei)
- **Value Stack**: Total 594 lei → Pretul tau: 99 lei (economisesti 495 lei)
- **CTA Gold**: "Da! Vreau Pachetul Accelerator" → Stripe checkout via `create-checkout` cu plan `ebook-accelerator`
- **Dismiss**: "Nu, multumesc. Vreau doar cartea gratuita." → redirect catre thank you
- **Garantie**: 30 zile, banii inapoi

---

## Pagina 4: Payment Success (`/ebook-plata-reusita` + `/ebook-payment-success`)

- Icon checkmark gold
- "Plata a fost confirmata!" cu italic gold
- "Ai acum acces complet la Pachetul Accelerator"
- 4 carduri acces: Cartea PDF, Audiobook, Challenge 90 zile, Template-uri + Comunitate
- CTA: "Deschide Challenge-ul 90 de Zile" → redirect catre `/challenge-7-zile`
- Social links (Instagram, YouTube, Website)

---

## Imagini

Se copiaza cele 4 imagini uploadate in `src/assets/ebook/`:
- `hero_landing.webp` (coperta carte)
- `hero_upsell.webp` (pachet accelerator)
- `logo_main.png` (logo CEO Mind OS)
- `hero_landing.png` (backup PNG)

---

## Fisiere noi (10)

| Fisier | Descriere |
|--------|-----------|
| `src/pages/EbookLanding.tsx` | Landing page RO+EN cu form email |
| `src/pages/EbookThankYou.tsx` | Thank you page cu download + 3 pasi |
| `src/pages/EbookUpsell.tsx` | Upsell accelerator cu countdown + Stripe |
| `src/pages/EbookPaymentSuccess.tsx` | Confirmare plata cu acces |
| `src/components/ebook/EbookHero.tsx` | Hero section cu form |
| `src/components/ebook/EbookContent.tsx` | Sectiunile diagnostic + poveste + capitole |
| `src/components/ebook/EbookTestimonials.tsx` | Testimoniale |
| `src/components/ebook/EbookNav.tsx` | Navbar simplu (logo + tagline) |
| `src/components/ebook/CountdownTimer.tsx` | Timer 24h pentru upsell |
| `src/components/ebook/ValueStack.tsx` | Tabel value stack pentru upsell |

## Fisiere modificate (1)

| Fisier | Modificare |
|--------|-----------|
| `src/App.tsx` | Adauga 8 rute publice noi |

---

## Detalii tehnice

- **Stripe**: Checkout via `create-checkout` edge function cu plan `ebook-accelerator` (99 LEI, one-time payment). Va necesita crearea produsului Stripe.
- **Email leads**: Salveaza cu `lead_magnet: 'ebook_burnout'` si `source` din URL params
- **PDF Download**: PDF-ul va fi stocat in storage bucket sau servit ca link direct
- **i18n**: Fiecare componenta primeste prop `language` bazat pe ruta (`/ebook` = RO, `/ebook-en` = EN)
- **Dark theme**: Fortat pe toate paginile (pattern identic cu B2BLanding)
- **SEO**: Helmet cu meta tags + JSON-LD Book schema

