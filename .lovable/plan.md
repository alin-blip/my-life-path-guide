

# Plan: Task Reminders cu Notificări Sonore în Accountability Coach

## Rezumat

Implementăm un sistem de remindere periodice pentru taskurile de astăzi în Accountability Coach, care va:
1. Afișa taskurile de azi direct în tab-ul "Plan" (chiar dacă ai setat Domino Door)
2. Trimite notificări periodice cu sunet pentru taskurile rămase
3. Permite configurarea frecvenței de reminder

---

## Arhitectură

```text
┌─────────────────────────────────────────────────────────────┐
│              AccountabilityCoachWidget                       │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Tab: PLAN                             │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │  📋 Taskuri Astăzi                                 │  │ │
│  │  │  ┌──────────────────────────────────────────────┐ │  │ │
│  │  │  │ ○ Finalizează prezentarea                    │ │  │ │
│  │  │  │ ✓ Trimite email la client                    │ │  │ │
│  │  │  │ ○ Revizuie contractul                        │ │  │ │
│  │  │  └──────────────────────────────────────────────┘ │  │ │
│  │  │  Progress: 1/3 completate                         │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │  🔔 Remindere de completat                        │  │ │
│  │  │  • Completează obiectivele anuale                 │  │ │
│  │  │  • Începe Rutina de Campion                       │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ⚙️ Reminder Settings                                    │ │
│  │  La fiecare: [15 min ▾] [30 min] [1 oră] [Off]          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Hook Nou: `useTaskReminders`

Creez un hook dedicat pentru gestionarea reminderelor de taskuri:

**Funcționalități:**
- Încarcă taskurile de azi din `user_tasks` via `useTodaysTasks`
- Verifică periodic dacă mai sunt taskuri necompletate
- Trimite notificări sonore la interval configurat
- Persistă configurările în localStorage

**Logica:**
```typescript
interface TaskReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // 15, 30, 60, sau 0 (off)
  soundEnabled: boolean;
}

const useTaskReminders = () => {
  const { tasks, completedCount, totalCount } = useTodaysTasks();
  const [settings, setSettings] = useLocalStorage('task-reminder-settings', defaultSettings);
  const [lastReminderAt, setLastReminderAt] = useState<Date | null>(null);
  
  // Interval pentru verificare
  useEffect(() => {
    if (!settings.enabled || settings.intervalMinutes === 0) return;
    
    const interval = setInterval(() => {
      const remainingTasks = tasks.filter(t => !t.completed);
      if (remainingTasks.length > 0) {
        triggerReminder(remainingTasks);
      }
    }, settings.intervalMinutes * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [settings, tasks]);
  
  const triggerReminder = (remainingTasks) => {
    // Redă sunet
    if (settings.soundEnabled) {
      playNotificationSound();
    }
    
    // Arată notificare browser (dacă e permis)
    showBrowserNotification(remainingTasks);
    
    // Deschide widgetul accountability
    dispatchEvent(new CustomEvent('open-accountability-coach', { detail: { tab: 'plan' } }));
  };
  
  return { tasks, remainingTasks, settings, updateSettings };
};
```

---

## 2. Sunet de Notificare

**Opțiuni de implementare:**

### Opțiunea A: Generare programatică (Web Audio API)
- Nu necesită fișiere externe
- Sunet "ding" simplu și elegant
- Funcționează instant

```typescript
const playNotificationSound = () => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
  oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.1); // C6
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};
```

### Opțiunea B: Fișier audio extern
- Sunet mai profesionist
- Necesită adăugarea unui fișier în `/public/sounds/`

**Recomand Opțiunea A** - nu necesită resurse externe și funcționează imediat.

---

## 3. Componentă Nouă: `TodaysTasksList`

Afișează taskurile de astăzi direct în tab-ul Plan:

```typescript
interface TodaysTasksListProps {
  onToggleTask: (taskId: string) => void;
  showAddButton?: boolean;
}

const TodaysTasksList = ({ onToggleTask }) => {
  const { tasks, completedCount, totalCount, toggleTask } = useTodaysTasks();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          Taskuri Astăzi
        </h3>
        <Badge variant="outline">
          {completedCount}/{totalCount}
        </Badge>
      </div>
      
      {/* Progress bar */}
      <Progress value={(completedCount / totalCount) * 100} />
      
      {/* Task list */}
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} />
        ))}
      </div>
      
      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p>Nu ai taskuri pentru azi.</p>
          <Button variant="link" onClick={() => navigate('/door')}>
            Planifică în Domino Door →
          </Button>
        </div>
      )}
    </div>
  );
};
```

---

## 4. Componentă Nouă: `ReminderSettings`

Permite configurarea intervalului de remindere:

```typescript
const ReminderSettings = () => {
  const { settings, updateSettings } = useTaskReminders();
  
  const intervals = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 oră' },
    { value: 120, label: '2 ore' },
    { value: 0, label: 'Off' },
  ];
  
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <Bell className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm">Remind la fiecare:</span>
      <ToggleGroup value={settings.intervalMinutes} onValueChange={...}>
        {intervals.map(int => (
          <ToggleGroupItem key={int.value} value={int.value}>
            {int.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
      >
        {settings.soundEnabled ? <Volume2 /> : <VolumeX />}
      </Button>
    </div>
  );
};
```

---

## 5. Actualizare `CoachReminders.tsx`

Integrăm lista de taskuri în componenta existentă:

**Înainte:**
- Arată doar foundation items (obiective, rutină, vision board)

**După:**
- Arată ÎNTÂI taskurile de azi (prioritate maximă)
- Apoi foundation items rămase
- La final, opțiuni de configurare reminder

---

## 6. Fișiere de Creat

| Fișier | Scop |
|--------|------|
| `src/hooks/useTaskReminders.ts` | Hook pentru gestionarea reminderelor periodice |
| `src/utils/notificationSound.ts` | Utilitar pentru generarea sunetului de notificare |
| `src/components/accountability/TodaysTasksList.tsx` | Lista de taskuri pentru azi |
| `src/components/accountability/ReminderSettings.tsx` | Configurări interval reminder |

## 7. Fișiere de Modificat

| Fișier | Modificări |
|--------|------------|
| `src/components/accountability/CoachReminders.tsx` | Adaug TodaysTasksList și ReminderSettings |
| `src/components/accountability/AccountabilityCoachWidget.tsx` | Integrare useTaskReminders pentru periodic checks |

---

## 8. Flow de Notificare

```text
1. Utilizator are taskuri pentru azi (din Domino Door sau manual)
2. Hook verifică la fiecare X minute (configurat de user)
3. Dacă există taskuri necompletate:
   a. Redă sunet "ding" (Web Audio API)
   b. Încearcă să arate notificare browser (dacă e permis)
   c. Afișează toast în aplicație cu "Ai X taskuri rămase"
   d. Opțional: Deschide automat widgetul Accountability Coach
4. Click pe notificare → deschide tab Plan cu lista de taskuri
5. Utilizatorul poate bifat taskurile direct din widget
6. Când toate sunt completate → felicitări + sunet celebrare
```

---

## 9. Browser Notifications

Adăugăm suport pentru notificări native browser:

```typescript
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

const showBrowserNotification = (remainingTasks: Task[]) => {
  if (Notification.permission !== 'granted') return;
  
  new Notification('📋 Taskuri Rămase', {
    body: `Ai ${remainingTasks.length} taskuri de completat astăzi`,
    icon: '/favicon.ico',
    tag: 'task-reminder', // Previne duplicate
    requireInteraction: false,
  });
};
```

---

## 10. Persistența Setărilor

Setările se salvează în localStorage:

```typescript
const defaultSettings: TaskReminderSettings = {
  enabled: true,
  intervalMinutes: 60, // default: la fiecare oră
  soundEnabled: true,
  browserNotifications: false, // trebuie permisiune explicită
};
```

---

## 11. Ordinea Implementării

1. **Pas 1:** Creez `notificationSound.ts` - sunet Web Audio API
2. **Pas 2:** Creez `useTaskReminders.ts` - hook complet cu setări
3. **Pas 3:** Creez `TodaysTasksList.tsx` - lista de taskuri
4. **Pas 4:** Creez `ReminderSettings.tsx` - configurări
5. **Pas 5:** Actualizez `CoachReminders.tsx` - integrare componente
6. **Pas 6:** Actualizez `AccountabilityCoachWidget.tsx` - hook reminder
7. **Pas 7:** Testare end-to-end

---

## 12. UX Îmbunătățiri Incluse

- **Badge dinamic** pe butonul Accountability Coach care arată numărul de taskuri rămase
- **Progress ring** vizual în jurul iconului
- **Sunet diferit** pentru reminder vs completare task
- **Animație** când se deschide widgetul din notificare
- **Smart timing** - nu trimite reminder dacă utilizatorul tocmai a interacționat cu app-ul

