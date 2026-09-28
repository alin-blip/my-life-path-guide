# Lead magnet „Cine are dreptate?” (RO + EN)

## Ce primește vizitatorul
1. **Pagină publică** `/cine-are-dreptate` (RO) și `/en/who-is-right` (EN) — titlu, scurtă promisiune, buton „Analizează conflictul”.
2. **Formular în 3 pași** (un singur partener completează):
   - Situația (ce s-a întâmplat, factual)
   - Perspectiva mea
   - Perspectiva partenerului (cum crezi că o vede el/ea)
3. **Captare lead**: nume + email înainte de verdict (cu acord GDPR).
4. **Verdict complet GRATUIT** (generat de Coach AI, ton mediator, neutru):
   - Fapte vs. interpretări
   - Nevoile emoționale ale fiecăruia (ce cere de fapt fiecare)
   - „Cine are dreptate?” — răspuns nuanțat (procent de responsabilitate + explicație, fără a învinovăți)
   - Distorsiuni cognitive detectate
   - O frază de reconectare pe care o poți spune azi
5. **Ofertă după verdict** — Protocol de de-escaladare personalizat:
   - **Plan 7 zile** — 5 € / 5 $ plată unică (acțiune + intenție pe zi, script de reparare, întrebări de explorare)
   - **Alternativ**: 9,97 € / 9,97 $ pe lună — acces continuu la Marriage Stack (analize nelimitate + planuri noi)
6. **După plată**: planul se deblochează imediat pe pagina rezultatului + email cu link; contul se creează automat (magic link), ca în funnel-ul Warrior.

## Emailuri
- Email imediat cu verdictul (RO/EN după limba aleasă).
- 2 emailuri de follow-up (ziua 1 și ziua 3) care reamintesc oferta planului de 7 zile.

## Admin
- Tab nou în panoul admin: leaduri „Cine are dreptate?”, conversii în plată, venit.

## Detalii tehnice
- Tabel nou `couple_verdict_leads` (nume, email, limbă, input-uri, verdict JSON, plan JSON, status plată, token public de acces) cu GRANT + RLS; acces public doar prin funcții backend cu token.
- Funcție backend `couple-verdict-analyze` (fără login, rate limit pe IP, validare Zod) → Lovable AI `openai/gpt-6-astra`, output structurat, streaming.
- Funcție `couple-verdict-plan` generează planul de 7 zile doar după confirmarea plății.
- Plată prin integrarea Stripe existentă (`create-checkout` + `stripe-webhook`): 2 produse noi (one-time 5 €/$ și abonament 9,97 €/$ lunar), mapate pe limbă/monedă.
- Reutilizare componente din Marriage Stack (RelationalTriangle) pentru afișarea verdictului.
- Meta Pixel: `Lead` la trimiterea formularului, `InitiateCheckout`, `Purchase`.
- SEO head + sitemap pentru ambele rute.
