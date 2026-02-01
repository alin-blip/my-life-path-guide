
# Plan: Internationalizare Completă Decision Breakthrough

## Problema Identificată

Conținutul cursului este **amestecat** între română și engleză deoarece:

| Element | Starea Actuală | Problemă |
|---------|----------------|----------|
| UI (butoane, labels) | ✅ Tradus cu `language === 'ro'` | OK |
| `courseModules` (conținut curs) | ❌ Doar în engleză | Nu citește limba |
| `weeklyPrompts` (prompturi săptămânale) | ❌ Doar în engleză | Nu citește limba |
| `gettingStartedPrompt` | ❌ Doar în engleză | Nu citește limba |

## Soluția

Restructurăm `decisionBreakthroughContent.ts` cu getters care primesc parametrul `language`:

```typescript
// Înainte (problematic)
export const courseModules: CourseModule[] = [...]

// După (corect)
export const getCourseModules = (language: 'en' | 'ro'): CourseModule[] => {...}
export const getWeeklyPrompts = (language: 'en' | 'ro'): WeeklyPrompt[] => {...}
export const getGettingStartedPrompt = (language: 'en' | 'ro'): string => {...}
```

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `src/data/decisionBreakthroughContent.ts` | Adaug versiuni RO/EN pentru toate modulele și prompturile |
| `src/components/learn/CourseTextReader.tsx` | Folosesc `getCourseModules(language)` în loc de `courseModules` |
| `src/components/learn/DecisionCoach.tsx` | Folosesc `getWeeklyPrompts(language)` și `getGettingStartedPrompt(language)` |

## Conținut de Tradus în Română

### Module Curs (8 module)
1. **The Creator's Playbook** → "Ghidul Creatorului"
2. **My Personal Playbook** → "Ghidul Meu Personal"
3. **Mastering Invisible Forces** → "Stăpânirea Forțelor Invizibile"
4. **Part 1: Decide** → "Partea 1: Decide"
5. **Part 2: Commit** → "Partea 2: Angajează-te"
6. **Part 3: Resolve** → "Partea 3: Rezolvă"
7. **The Cost of Not Deciding** → "Costul Indeciziei"
8. **Closing** → "Încheiere"

### Weekly Prompts (4 săptămâni)
- Week 1: "Ajută-mă să clarific cine sunt acum versus cine trebuie să devin..."
- Week 2: "Ajută-mă să identific fricile, credințele și pattern-urile..."
- Week 3: "Ajută-mă să evaluez ce funcționează, ce nu..."
- Week 4: "Ajută-mă să transform acest momentum în obiceiuri zilnice..."

### Getting Started Prompt
RO: "Înainte să începem, ajută-mă să clarific cine sunt acum, ce vreau cel mai mult, ce obiective contează pentru mine și ce provocări sau pattern-uri m-au ținut pe loc. Pune-mi întrebările de care ai nevoie pentru a mă ghida eficient."

## Implementare Tehnică

```typescript
// decisionBreakthroughContent.ts
export const getCourseModules = (language: 'en' | 'ro'): CourseModule[] => {
  if (language === 'en') {
    return [
      {
        id: 'intro',
        title: "The Creator's Playbook",
        content: `We are living through...`,
        // ... restul în engleză
      }
    ];
  }
  
  // Română
  return [
    {
      id: 'intro',
      title: "Ghidul Creatorului",
      content: `Trăim cel mai extraordinar moment din istoria umanității...`,
      // ... restul în română
    }
  ];
};

// CourseTextReader.tsx
const { language } = useLanguage();
const modules = getCourseModules(language);
const prompts = getWeeklyPrompts(language);
```

## Rezultat Așteptat

- Dacă utilizatorul are limba setată pe **RO** → tot conținutul apare în română
- Dacă utilizatorul are limba setată pe **EN** → tot conținutul apare în engleză
- Schimbarea limbii din LanguageSelector → actualizează instant tot conținutul
