
# Jurnal complet in Rutina Razboinicului

## Ce se schimba

Pasul de Jurnaling din rutina va fi inlocuit cu experienta completa de jurnal (lista + intrare noua + detalii), exact ca pe pagina `/journal` din Tools -- in loc de sesiunea de introspecție cu IntrospectionStack.

## Ce se modifica

### Fisier: `src/components/champion-routine/steps/JournalingStep.tsx`

Componenta actuala foloseste `IntrospectionStack` pentru o sesiune ghidata. Voi inlocui complet continutul cu:

1. **Ecran start** -- buton "Deschide Jurnalul" (pastrez stilul vizual cu card orange)
2. **Dupa click** -- se afiseaza interfata completa de jurnal cu tabs:
   - Tab "Istoric" -- reutilizez componenta `JournalList` existenta
   - Tab "Intrare noua" -- reutilizez componenta `JournalEntry` existenta
   - Tab "Detalii" -- reutilizez componenta `JournalDetail` (apare cand selectezi o intrare)
3. **Buton "Finalizeaza"** -- marcheaza pasul ca completat (fix ca acum, dar dupa ce utilizatorul a interactionat cu jurnalul)

### Logica

- Starea interna gestioneaza: `activeTab` (list/new/detail), `selectedEntry`, `refreshTrigger` -- identic cu pagina Journal.tsx
- Componentele `JournalList`, `JournalEntry`, `JournalDetail` sunt reutilizate direct, fara modificari
- Butonul "Finalizeaza Jurnaling" ramane fix in josul ecranului pentru a marca pasul ca terminat
- Ecranul de "completat" ramane la fel (cu check verde si butonul "Continua")

### Rezultat

Utilizatorul va vedea in rutina exact aceeasi experienta ca in Tools > Jurnal: poate citi intrari vechi, crea intrari noi, si vedea detalii -- totul inline in pasul de jurnaling.
