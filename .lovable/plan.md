
# Reset Breathing Step pentru Testare

## Problema
Pasul de respirație apare ca "completat" pentru azi, iar tu vrei să-l testezi din nou cu noile funcționalități (muzică + ritm custom).

## Soluție
Voi adăuga temporar un buton "Reset pentru test" vizibil doar în pasul de respirație, care va seta `breathing_completed = false` în baza de date pentru log-ul de azi. Astfel poți re-testa exercițiul complet.

## Detalii tehnice
- **Fișier modificat:** `src/components/champion-routine/steps/BreathingStep.tsx`
- Se adaugă un buton mic "Reset test" care apelează `onComplete(false)` pentru a marca pasul ca nefăcut
- Butonul va fi vizibil doar când `completed === true`
- După testare, butonul poate fi eliminat
