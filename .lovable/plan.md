
# Plan: Îmbunătățiri Accountability Coach Widget

## Probleme Identificate

Din screenshot și analiză cod:

1. **Taskurile sunt tăiate** - `ScrollArea` are `max-h-[200px]` care limitează vizibilitatea
2. **Lipsește buton Focus Room** - utilizatorul dorește navigare rapidă la Focus Room
3. **Eroare notificări neclară** - mesajul "Nu am primit permisiunea pentru notificări" nu explică ce trebuie făcut

---

## Soluții Propuse

### 1. Afișare Completă Taskuri

Voi mări limita de înălțime și voi adăuga opțiune "Vezi toate":

**Modificări în `TodaysTasksList.tsx`:**
- Măresc `max-h-[200px]` la `max-h-[280px]` pentru a arăta mai multe taskuri
- Afișez contorul total clar în header
- Dacă sunt > 6 taskuri, afișez un indicator "și încă X..."

### 2. Buton Focus Room

Adaug buton nou sub "Gestionează în Domino Door":

```text
┌─────────────────────────────────────┐
│  [Taskuri Astăzi]       2/6        │
│  ▢ Task 1                          │
│  ▢ Task 2                          │
│  ✓ Task 3                          │
│  ...                               │
│                                    │
│  [Gestionează în Domino Door →]    │  ← existent
│  [🎯 Implementează în Focus Room →] │  ← NOU
└─────────────────────────────────────┘
```

**Cod propus:**
```typescript
{/* Link to Focus Room - NEW */}
<Button 
  variant="ghost" 
  size="sm" 
  onClick={() => { navigate('/focus'); onClose?.(); }}
  className="w-full text-xs text-muted-foreground hover:text-primary"
>
  <Target className="w-3 h-3 mr-1" />
  {language === 'ro' ? 'Implementează în Focus Room' : 'Implement in Focus Room'}
  <ArrowRight className="w-3 h-3 ml-1" />
</Button>
```

### 3. Eroare Notificări Îmbunătățită

Problema: Browser-ul poate refuza permisiunea, dar utilizatorul nu știe cum să o rezolve.

**Modificări în `ReminderSettings.tsx`:**
- Verificare stare permisiune (`denied` vs `default`)
- Mesaj clar când e blocată de browser
- Link/instrucțiuni pentru deblocare

**Cod propus:**
```typescript
// Verificare permisiune
const permissionStatus = 'Notification' in window ? Notification.permission : 'default';
const hasBrowserPermission = permissionStatus === 'granted';
const isDenied = permissionStatus === 'denied';

// În UI:
{isDenied && (
  <div className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded flex items-start gap-2">
    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
    <span>
      {language === 'ro' 
        ? 'Notificările sunt blocate. Click pe 🔒 din bara de adresă → Permite notificări' 
        : 'Notifications blocked. Click 🔒 in address bar → Allow notifications'}
    </span>
  </div>
)}
```

**Modificări în `useTaskReminders.ts`:**
- Mesaj mai descriptiv la refuz

---

## Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/components/accountability/TodaysTasksList.tsx` | Măresc vizibilitate taskuri + adaug buton Focus Room |
| `src/components/accountability/ReminderSettings.tsx` | Adaug mesaj clar pentru notificări blocate |
| `src/hooks/useTaskReminders.ts` | Îmbunătățesc mesajul de eroare |

---

## Detalii Tehnice

### A. TodaysTasksList.tsx

1. **Măresc înălțimea maximă:**
```typescript
// Înainte:
<ScrollArea className="max-h-[200px]">

// După:
<ScrollArea className="max-h-[280px]">
```

2. **Adaug buton Focus Room după butonul Domino Door:**
```typescript
import { Target } from 'lucide-react';

// După butonul "Gestionează în Domino Door":
const handleGoToFocusRoom = () => {
  navigate('/focus');
  onClose?.();
};

// În JSX, după Link to Domino Door:
<Button 
  variant="ghost" 
  size="sm" 
  onClick={handleGoToFocusRoom}
  className="w-full text-xs text-muted-foreground hover:text-primary mt-1"
>
  <Target className="w-3 h-3 mr-1" />
  {language === 'ro' ? 'Implementează în Focus Room' : 'Implement in Focus Room'}
  <ArrowRight className="w-3 h-3 ml-1" />
</Button>
```

### B. ReminderSettings.tsx

1. **Adaug verificare stare permisiune:**
```typescript
import { AlertTriangle } from 'lucide-react';

// În component:
const permissionStatus = 'Notification' in window ? Notification.permission : 'default';
const hasBrowserPermission = permissionStatus === 'granted';
const isDenied = permissionStatus === 'denied';
```

2. **Adaug UI pentru starea "blocked":**
```typescript
{/* Notifications blocked warning */}
{isDenied && (
  <div className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded flex items-start gap-2 mt-2">
    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
    <span>
      {language === 'ro' 
        ? 'Notificările sunt blocate de browser. Apasă pe iconița 🔒 din bara de adresă și permite notificările.' 
        : 'Notifications are blocked. Click the 🔒 icon in address bar and allow notifications.'}
    </span>
  </div>
)}
```

3. **Ascund butonul "Activează notificări" când e blocat:**
```typescript
{/* Browser notifications - show only if not granted AND not denied */}
{!hasBrowserPermission && !isDenied && (
  <Button onClick={onEnableBrowserNotifications} ...>
    Activează notificări
  </Button>
)}
```

### C. useTaskReminders.ts

Îmbunătățesc mesajul de eroare:
```typescript
// Înainte:
toast.error('Nu am primit permisiunea pentru notificări');

// După:
if (Notification.permission === 'denied') {
  toast.error('Notificările sunt blocate. Verifică setările browserului (click pe 🔒 din bara de adresă).', {
    duration: 5000,
  });
} else {
  toast.error('Nu am primit permisiunea pentru notificări. Încearcă din nou.');
}
```

---

## UX Flow Îmbunătățit

### Taskuri:
1. Utilizatorul deschide Accountability Coach
2. Vede toate taskurile (sau primele 8-10, cu scroll pentru restul)
3. Poate naviga rapid la Focus Room cu noul buton

### Notificări:
1. Utilizatorul apasă "Activează notificări"
2. Dacă browserul întreabă → răspunde da/nu
3. Dacă e blocat:
   - Nu mai arată butonul
   - Arată mesaj clar cum să deblocheze
   - Toast mai descriptiv

---

## Testing

1. **Taskuri:** Verifică că se văd mai multe taskuri fără să fie tăiate
2. **Focus Room:** Click pe buton → te duce la /focus și închide widget-ul
3. **Notificări blocate:** Blochează manual în browser → verifică mesajul de avertizare
4. **Notificări permise:** Permite în browser → verifică că apare "Notificări active"
