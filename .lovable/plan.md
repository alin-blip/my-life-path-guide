# Plan: Flux Fluid pentru Onboarding -> Annual Wizard

## Problema Identificata
Cand utilizatorul apasa "Configureaza Acum" in OnboardingWizard pentru obiective anuale, este redirectionat la `/door?tab=annual` dar wizardul de obiective NU se deschide. Utilizatorul ramane blocat pe pagina cu carduri de categorii.

## Solutia Propusa
Crearea unui flux fluid care:
1. Deschide automat un dialog de selectie categorie
2. Dupa selectie, deschide direct wizardul AI pentru acea categorie

---

## Pasi de Implementare

### Pas 1: Modificare navigare din OnboardingWizard
**Fisier:** `src/components/onboarding/OnboardingWizard.tsx`

Schimbare de la:
```typescript
route: '/door?tab=annual'
```
La:
```typescript
route: '/door?tab=annual&startWizard=true'
```

### Pas 2: Creare componenta CategorySelectionDialog
**Fisier nou:** `src/components/goal-wizard/CategorySelectionDialog.tsx`

Componenta va afisa:
- Titlu: "Cu ce categorie vrei sa incepi?"
- 4 carduri mari pentru cele 4 categorii (Body, Being, Balance, Business)
- Fiecare card cu icon, nume, si descriere scurta
- Design atractiv cu gradient-uri specifice fiecarei categorii
- La click pe o categorie: se inchide dialogul si se deschide GoalWizardModal

### Pas 3: Modificare AnnualVisionTab pentru detectie parametri URL
**Fisier:** `src/components/door/tabs/AnnualVisionTab.tsx`

Adaugare useEffect pentru a detecta parametrul `startWizard=true`:
```typescript
// Adaugare state pentru dialog selectie
const [showCategorySelection, setShowCategorySelection] = useState(false);

// Detectie parametru URL
useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('startWizard') === 'true') {
    // Deschide dialogul de selectie categorie
    setShowCategorySelection(true);
    // Curata parametrul din URL pentru a evita re-deschiderea
    const newParams = new URLSearchParams(location.search);
    newParams.delete('startWizard');
    // Update URL fara refresh
    window.history.replaceState({}, '', `${location.pathname}?tab=annual`);
  }
}, [location.search]);
```

### Pas 4: Integrare CategorySelectionDialog in AnnualVisionTab
Adaugare render pentru noul dialog:
```typescript
<CategorySelectionDialog
  isOpen={showCategorySelection}
  onClose={() => setShowCategorySelection(false)}
  onSelectCategory={(category) => {
    setShowCategorySelection(false);
    setWizardCategory(category);
    setWizardOpen(true);
  }}
/>
```

---

## Design CategorySelectionDialog

### Structura UI:
```
+------------------------------------------+
|          Cu ce categorie vrei            |
|              sa incepi?                  |
|                                          |
|  +----------------+  +----------------+  |
|  |   [Dumbbell]   |  |    [Brain]     |  |
|  |     CORP       |  | SPIRITUALITATE |  |
|  |  Sanatate &    |  |   Mindset &    |  |
|  |   Fitness      |  |    Crestere    |  |
|  +----------------+  +----------------+  |
|                                          |
|  +----------------+  +----------------+  |
|  |    [Heart]     |  |  [Briefcase]   |  |
|  |    RELATII     |  |   BUSINESS     |  |
|  |   Familie &    |  |   Cariera &    |  |
|  |    Prieteni    |  |    Finante     |  |
|  +----------------+  +----------------+  |
|                                          |
|  [Skip - Le voi seta mai tarziu]         |
+------------------------------------------+
```

### Caracteristici:
- Dialog modal cu backdrop blur
- Carduri cu hover effect si scale transform
- Gradient-uri specifice fiecarei categorii
- Iconite mari si vizibile
- Buton secundar pentru a sari peste (inchide dialogul)
- Suport bilingv (romana/engleza)

---

## Flux Complet Dupa Implementare

1. Utilizatorul creaza cont sau se logheaza prima data
2. Se deschide OnboardingWizard
3. La pasul "Obiective Anuale", apasa "Configureaza Acum"
4. Este redirectionat la `/door?tab=annual&startWizard=true`
5. **NOU:** Se deschide automat CategorySelectionDialog
6. Utilizatorul selecteaza o categorie (ex: Business)
7. Se deschide GoalWizardModal pentru categoria selectata
8. Utilizatorul parcurge wizardul AI pentru a-si seta obiectivele
9. Dupa salvare, poate reveni la CategorySelectionDialog pentru alta categorie sau poate naviga liber

---

## Fisiere Afectate

1. `src/components/onboarding/OnboardingWizard.tsx` - modificare mica (adaugare parametru URL)
2. `src/components/goal-wizard/CategorySelectionDialog.tsx` - **fisier nou**
3. `src/components/door/tabs/AnnualVisionTab.tsx` - adaugare logica detectie si integrare dialog

---

## Note Tehnice

- Parametrul `startWizard` va fi curatat din URL dupa deschiderea dialogului pentru a evita re-deschiderea la refresh
- Dialogul de selectie categorie va fi refolosibil si pentru alte fluxuri (ex: buton "Add New Category" pe pagina annual)
- Se pastreaza comportamentul existent pentru utilizatorii care navigheaza direct la `/door?tab=annual` fara parametrul `startWizard`
