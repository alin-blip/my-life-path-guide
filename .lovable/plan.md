

# Plan: Îmbunătățiri Admin CRM - Challenge Stats Interactiv + Vizualizare Obiective în Door Preview

## Rezumat

Două îmbunătățiri principale pentru Admin CRM:
1. **Challenge Stats Clickable** - Poți da click pe fiecare zi și vezi lista de utilizatori care au completat-o
2. **Door Preview cu Obiective** - Adaugă vizualizarea obiectivelor Anuale, 90 Zile și Lunare lângă Domino Door

---

## Partea 1: Challenge Stats Interactiv

### Starea Actuală
- Zilele sunt afișate ca bare de progres statice
- Nu poți vedea cine a completat fiecare zi

### Soluția
- Fiecare zi devine clickable
- La click, se deschide un panel/dialog cu lista utilizatorilor
- Se arată: email, nume, data completării

### Fișier de Modificat

**`src/components/admin/crm/ChallengeDropOffStats.tsx`**

#### Modificări:
1. Adaugă state pentru ziua selectată
2. La click pe o zi, încarcă utilizatorii din `challenge_progress` JOIN `crm_contact_profiles`
3. Afișează un dialog/panel cu lista

#### Preview UI:

```text
┌─────────────────────────────────────────────────────────────┐
│  Ziua 2 - Identitate                    2 începuți  1 ✓    │
│  ████████████████░░░░░░░░░░░░░░  50%              [CLICK]  │
└─────────────────────────────────────────────────────────────┘
                              ↓ click ↓
┌─────────────────────────────────────────────────────────────┐
│  📋 Utilizatori Ziua 2                                     │
├─────────────────────────────────────────────────────────────┤
│  ✓ alin@eduforyou.co.uk          03 Feb 2026, 04:57       │
│  ✓ alinflorinradu@icloud.com     11 Ian 2026, 11:21       │
│  ⏳ user@example.com              Început, necompletat     │
└─────────────────────────────────────────────────────────────┘
```

---

## Partea 2: Door Preview cu Obiective

### Starea Actuală
- `AdminClientDoorPreview` arată doar: HIT/DO Lists, Ideas Bank
- Nu sunt vizibile obiectivele (Annual, 90 Days, Monthly)

### Soluția
- Adaugă o nouă secțiune "Obiective Client" în preview
- Grupează după: Anual → 90 Zile → Lunar
- Include și `weekly_planning` (Domino Door data) dacă există

### Fișier de Modificat

**`src/components/admin/crm/AdminClientDoorPreview.tsx`**

#### Modificări:
1. Adaugă fetch din `missions` pentru userId
2. Adaugă fetch din `weekly_planning` pentru weekKey curent
3. Afișează secțiune nouă cu obiectivele grupate

#### Preview UI:

```text
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Obiective Client                                         │
├─────────────────────────────────────────────────────────────┤
│ ┌── ANUAL 2026 ─────────────────────────────────────────┐  │
│ │ Body:     90 kg și 7% bodyfat                         │  │
│ │ Being:    Meditez zilnic 20 minute                    │  │
│ │ Balance:  Timp de calitate cu familia                 │  │
│ │ Business: 1000 studenți înrolați                      │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌── 90 ZILE (Q1-2026) ──────────────────────────────────┐  │
│ │ Body:     10% Bodyfat - 94 kg                         │  │
│ │ Business: 400 studenți + 50 Agenți                    │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌── LUNAR (2026-02) ────────────────────────────────────┐  │
│ │ Body:     12% - 96 kg                                 │  │
│ │ Business: 100 studenți cu oferte                      │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌── DOMINO DOOR (Săptămâna curentă) ────────────────────┐  │
│ │ 🎯 Titlu: "Lansare campanie recruitment"               │  │
│ │ 📌 Obiectiv: "50 aplicanți noi"                        │  │
│ │ 🔑 Cheie 1: Email marketing - 500 contacte            │  │
│ │ 🔑 Cheie 2: Social media - 10 postări                 │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Detalii Tehnice

### ChallengeDropOffStats.tsx - Cod Nou

```typescript
// State nou
const [selectedDay, setSelectedDay] = useState<number | null>(null);
const [dayUsers, setDayUsers] = useState<{
  email: string;
  name: string | null;
  completed: boolean;
  completed_at: string | null;
}[]>([]);
const [loadingUsers, setLoadingUsers] = useState(false);

// Funcție nouă pentru a încărca utilizatorii unei zile
const loadDayUsers = async (dayNumber: number) => {
  setLoadingUsers(true);
  setSelectedDay(dayNumber);
  
  const { data, error } = await supabase
    .from('challenge_progress')
    .select(`
      user_id,
      completed,
      completed_at,
      crm_contact_profiles!inner(email, name)
    `)
    .eq('day_number', dayNumber)
    .order('completed_at', { ascending: false });
  
  if (!error && data) {
    setDayUsers(data.map(d => ({
      email: d.crm_contact_profiles.email,
      name: d.crm_contact_profiles.name,
      completed: d.completed,
      completed_at: d.completed_at
    })));
  }
  setLoadingUsers(false);
};

// UI: Fiecare zi devine clickable
<div 
  key={day.day} 
  className="space-y-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg"
  onClick={() => loadDayUsers(day.day)}
>
  {/* ... existing day content */}
</div>

// Dialog/Sheet pentru afișarea utilizatorilor
{selectedDay && (
  <Sheet open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Utilizatori Ziua {selectedDay}</SheetTitle>
      </SheetHeader>
      <div className="space-y-2 mt-4">
        {dayUsers.map((user, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded">
            {user.completed ? <CheckCircle /> : <Clock />}
            <div>
              <p className="font-medium">{user.email}</p>
              {user.name && <p className="text-sm text-muted-foreground">{user.name}</p>}
              {user.completed_at && (
                <p className="text-xs text-muted-foreground">
                  Completat: {format(new Date(user.completed_at), 'dd MMM yyyy, HH:mm')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SheetContent>
  </Sheet>
)}
```

### AdminClientDoorPreview.tsx - Cod Nou

```typescript
// State nou pentru obiective
const [missions, setMissions] = useState<{
  annual: Mission[];
  quarterly: Mission[];
  monthly: Mission[];
}>({ annual: [], quarterly: [], monthly: [] });
const [weeklyPlanning, setWeeklyPlanning] = useState<WeeklyPlanning | null>(null);

// În loadClientData, adaugă:
// Fetch missions
const { data: missionsData } = await supabase
  .from('missions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Grupează după mission_type
const grouped = {
  annual: missionsData?.filter(m => m.mission_type === 'annual') || [],
  quarterly: missionsData?.filter(m => m.mission_type === 'quarterly') || [],
  monthly: missionsData?.filter(m => m.mission_type === 'monthly') || []
};
setMissions(grouped);

// Fetch weekly planning (Domino Door)
const { data: planningData } = await supabase
  .from('weekly_planning')
  .select('*')
  .eq('user_id', userId)
  .eq('week_key', weekKey)
  .single();

if (planningData) setWeeklyPlanning(planningData);

// UI nouă - secțiune Obiective
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Crown className="h-5 w-5 text-yellow-500" />
      Obiective Client
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Annual */}
    {missions.annual.length > 0 && (
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">📅 Anual 2026</h4>
        <div className="grid grid-cols-2 gap-2">
          {missions.annual.map(m => (
            <Badge key={m.id} variant="outline">{m.category}: {m.title}</Badge>
          ))}
        </div>
      </div>
    )}
    
    {/* 90 Days */}
    {missions.quarterly.length > 0 && (
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">🎯 90 Zile</h4>
        {/* Similar structure */}
      </div>
    )}
    
    {/* Monthly */}
    {missions.monthly.length > 0 && (
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">🚀 Lunar</h4>
        {/* Similar structure */}
      </div>
    )}
    
    {/* Domino Door */}
    {weeklyPlanning && (
      <div className="border-t pt-4 mt-4">
        <h4 className="font-semibold text-sm mb-2">🎲 Domino Door</h4>
        <p><strong>Titlu:</strong> {weeklyPlanning.domino_title}</p>
        <p><strong>Obiectiv:</strong> {weeklyPlanning.week_goal}</p>
        {weeklyPlanning.key_points?.length > 0 && (
          <div className="mt-2">
            {weeklyPlanning.key_points.map((kp, i) => (
              <Badge key={i} className="mr-1">🔑 {kp.title}</Badge>
            ))}
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>
```

---

## Bonus: Fix Statistici Challenge (din issue anterior)

Query-ul pentru lead-uri trebuie să includă toate sursele:

```typescript
// Înlocuiește:
.eq('lead_magnet', 'challenge_7_zile')

// Cu:
.ilike('lead_magnet', 'challenge%')

// Și deduplicare pe email:
const uniqueEmails = new Set(challengeLeads?.map(l => l.email.toLowerCase()));
const totalParticipants = uniqueEmails.size;
```

---

## Pași de Implementare

1. **ChallengeDropOffStats.tsx**
   - Adaugă state pentru ziua selectată și utilizatori
   - Adaugă funcția `loadDayUsers`
   - Fă zilele clickable
   - Adaugă Sheet/Dialog pentru afișarea utilizatorilor
   - Fix query pentru a include toate lead_magnet-urile challenge

2. **AdminClientDoorPreview.tsx**
   - Adaugă interfețe pentru Mission și WeeklyPlanning
   - Extinde `loadClientData` cu fetch pentru missions și weekly_planning
   - Adaugă secțiunea UI pentru obiective
   - Grupează și afișează obiectivele după tip

---

## Timp Estimat

- Challenge Stats Interactiv: ~20 minute
- Door Preview cu Obiective: ~25 minute
- Total: ~45 minute

