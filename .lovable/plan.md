
# Inlocuire Facebook cu Skool in Challenge

## Rezumat
Toate referintele la grupul Facebook din challenge vor fi inlocuite cu link-ul Skool: `https://www.skool.com/warriorsos`. Se modifica URL-ul centralizat, textele si iconitele aferente.

## Fisiere afectate

### 1. `src/config/socialLinks.ts`
- Redenumire constanta din `FACEBOOK_GROUP_URL` in `COMMUNITY_URL` (sau pastram numele si schimbam doar valoarea)
- URL nou: `https://www.skool.com/warriorsos`
- Actualizare comentariu

### 2. `src/components/challenge/day1/Day1Commitment.tsx`
- Textele "Alaturat-te Grupului Facebook" / "Join Our Facebook Group" devin "Alaturat-te Comunitatii Skool" / "Join Our Skool Community"
- Iconita `f` (Facebook) inlocuita cu iconita `S` sau Users
- Culorile cardului raman similare (gradient albastru-indigo)

### 3. `src/components/challenge/day1/Day1VisionDeclaration.tsx`
- Textul "Distribuie declaratia in Grupul Facebook" devine "Distribuie declaratia in Comunitatea Skool"
- EN: "Share declaration in Facebook Group" devine "Share declaration in Skool Community"

### 4. `src/pages/Challenge.tsx`
- Sectiunea "Facebook Community" -- textele "Alaturat-te comunitatii pe Facebook" / "Join our Facebook community" devin referinte la Skool
- Butonul pastreaza functionalitatea de `window.open` cu noul URL

### 5. `src/pages/ChallengeDay.tsx` si `src/pages/ChallengeDayEnglish.tsx`
- Import-ul `FACEBOOK_GROUP_URL` se actualizeaza la noul nume (daca se redenumeste constanta)

## Detalii tehnice

- Constanta centralizata in `socialLinks.ts` face ca schimbarea URL-ului sa se propage automat in toate fisierele
- Redenumesc constanta din `FACEBOOK_GROUP_URL` in `COMMUNITY_URL` pentru a fi agnostica fata de platforma
- Toate referintele la "Facebook" din texte devin "Skool"
- Iconita rotunda albastra cu "f" devine o iconita cu "S" pentru Skool
