

# Corectare Planuri Challenge 7 Zile

## Cele 3 Planuri (corecte de data asta)

| # | Plan | Pret | Trial | Original | CTA | Plan ID |
|---|------|------|-------|----------|-----|---------|
| 1 | Basic | €49/luna | 7 zile trial gratuit | ~~€97~~ | "Incepe 7 Zile Trial" | `basic` |
| 2 | Pro | €97/luna | FARA trial (plata directa) | ~~€197~~ | "Activeaza Pro - Early Bird" | `pro` |
| 3 | Pro 3 Luni (FEATURED) | €29/luna (apoi €99/luna dupa 3 luni) | FARA trial | ~~€97~~ | "Plateste €29 - Oferta Limitata" | `pro-challenge-3mo` |

## Beneficii (preluate din pricing.ts)

### Basic (toate 5 beneficiile):
- Harta Realitatii - Evaluarea vietii tale
- Warrior Routine completa (4 domenii)
- Door - Sistem de planificare saptamanala
- Stacks (Furie, Claritate, Focus) pentru reset rapid
- Jurnal de progres si rapoarte saptamanale

### Pro (toate 11 beneficiile):
- Tot ce include planul Basic
- AI Accountability Coach - tracking zilnic
- AI Mind Coach - transforma emotiile in putere
- Comunitate VIP cu membri Pro Warriors
- Sesiune Q&A exclusiva lunara
- Sprint de 90 de zile cu KPIs
- Napoleon Hill Software Implementation
- Breakthrough Tools and Applied Courses
- Support VIP dedicat
- Acces prioritar la functionalitati noi
- PROGRAM REFERRAL - Castiga 50% comision

### Pro 3 Luni (beneficii Pro + extras):
- Aceleasi beneficii ca Pro (toate 11)
- Primele 3 luni doar €29/luna
- Dupa 3 luni: €99/luna
- Sticker "Warrior88 APLICAT" in colt

## Modificari Vizuale

### Sticker Warrior88 (doar pe planul 3)
- Pozitionat absolute in coltul dreapta-sus al cardului
- Background gradient amber-to-orange
- Text "Warrior88" + "APLICAT" alb, bold
- Rotatie -12deg pentru efect de sticker
- Box shadow pentru adancime

### Preturi taiate
- Basic: ~~€97~~ -> €49
- Pro: ~~€197~~ -> €97
- Pro 3 Luni: ~~€97~~ -> €29

### Badge-uri discount
- Basic: badge "-50%"
- Pro: badge "-50% Early Bird"
- Pro 3 Luni: badge "-70%"

## Fisiere Modificate

| Fisier | Ce se modifica |
|--------|---------------|
| `src/components/challenge/ChallengePremiumOffer.tsx` | Inlocuiesc PLANS array cu cele 3 planuri corecte, beneficii complete din pricing.ts, pret original taiat, sticker Warrior88 pe planul 3 |
| `src/components/challenge/ChallengeUpgradeGate.tsx` | Aceeasi restructurare - UPGRADE_PLANS cu datele corecte |

## Detalii Tehnice

- Importam `plans` din `src/data/pricing.ts` pentru a prelua beneficiile Basic si Pro
- Planul Pro 3 Luni foloseste beneficiile Pro + pret custom (29 EUR) + subtitle "apoi €99/luna dupa 3 luni"
- Basic are `trialDays: 7` (nu 5 ca in pricing.ts general)
- Pro NU are trial - plata directa la €97
- Pro 3 Luni NU are trial - plata directa €29
