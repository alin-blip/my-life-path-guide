
# Adaugare Welcome Banner in Comunitate + Update Mesaj

## Problema

`CommunityWelcomeBanner` exista si functioneaza, dar nu apare in noul `CommunityFeedTab.tsx` (componenta activa). Era folosit doar in vechiul `CommunityTab.tsx`. Mesajul din baza de date exista deja, dar trebuie actualizat pentru a pune mai mult accent pe Challenge ca punct de start.

## Ce se face

### 1. CommunityFeedTab.tsx - Adaugare CommunityWelcomeBanner

Import si randare `CommunityWelcomeBanner` deasupra feed-ului (`GroupFeed`), exact cum era in vechiul `CommunityTab.tsx`.

### 2. Update mesaj welcome in baza de date

Actualizam `community_settings.setting_value` cu un mesaj mai focusat pe Challenge:

```
🔥 Bine ai venit in comunitatea WarriorOS!

Esti gata sa ai TOTUL — corp puternic, minte clara, relatii armonioase si business in crestere?

👉 PASUL 1: Incepe "Have It All Challenge" — provocarea de 7 zile care iti seteaza intreaga platforma:
• Ziua 1: Iti clarifici viziunea si scrii Declaratia ta
• Ziua 2-3: Setezi obiective concrete pe toate ariile
• Ziua 4: Configurezi Rutina Campionului
• Ziua 5: Viziune AI + meditatie personalizata
• Ziua 6-7: Accountability + integrare completa

Mergi la Cursuri > Have It All Challenge si porneste din Ziua 1!

🙋 Dupa ce incepi, prezinta-te aici si spune-ne ce te-a adus!
Hai sa crestem impreuna! 💪
```

### 3. Fix build errors (daca exista)

Verific si rezolv orice erori de build din editarile anterioare.

## Fisiere modificate

| Fisier | Modificare |
|---|---|
| `src/components/programs/CommunityFeedTab.tsx` | Import + randare `CommunityWelcomeBanner` deasupra `GroupFeed` |
| Migrare SQL | Update `community_settings` cu mesajul nou |
