
# 🔧 Plan: Sistem Permanent de Idei cu Analiză AI

## 📋 Rezumat

Implementăm un **Idea Bank** persistent în pagina `/door` care:
1. Salvează permanent toate ideile (nu se pierd niciodată)
2. Include un buton de **Analiză AI** pentru fiecare idee
3. AI-ul evaluează ideea în raport cu obiectivele tale

---

## 🔴 Problema Actuală

### Ce nu funcționează:
1. **Ideile nu apar în UI** - serviciul caută idei cu `week_key = NULL`, dar toate au `week_key` setat
2. **Lipsa persistenței permanente** - ideile sunt tratate ca task-uri săptămânale
3. **Lipsește analiza AI** - nu există wizard de evaluare a relevanței ideilor

### Date din baza de date:
- Există ~20+ idei `hot` pentru user, dar toate au `week_key = 'door-week-2026-04'` (greșit)
- Query-ul pentru Hot List caută `week_key IS NULL` → returnează 0 rezultate
- Există deja un tabel `idea_empowerment` dar e diferit (e pentru clarificarea motivației, nu analiză AI)

---

## ✅ Soluția Propusă

### Pasul 1: Creez tabel dedicat `ideas_bank`

Tabel nou pentru stocare permanentă a ideilor:

```text
ideas_bank
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── text (text, ideea propriu-zisă)
├── category (text: 'work' | 'personal' | 'urgent' | 'project')
├── priority (int: 0-4)
├── status (text: 'new' | 'analyzed' | 'approved' | 'rejected' | 'archived')
├── analysis_result (jsonb: { relevance_score, is_aligned, recommendation, reasoning })
├── linked_objective_id (uuid, opțional - legătură cu missions)
├── created_at (timestamp)
├── updated_at (timestamp)
└── analyzed_at (timestamp, nullable)
```

### Pasul 2: Fix pentru ideile existente

Migrare SQL:
- Copiez toate ideile `hot` din `user_tasks` în noul tabel `ideas_bank`
- Actualizez serviciul să folosească noul tabel

### Pasul 3: Creez Edge Function `analyze-idea`

AI Wizard care primește o idee și:
1. Citește obiectivele utilizatorului (annual/90z/lunar)
2. Analizează relevanța ideii în raport cu acestea
3. Returnează un verdict structurat:

```typescript
{
  relevance_score: 0-100,
  is_aligned: boolean,
  recommendation: 'pursue' | 'defer' | 'discard',
  reasoning: string,
  linked_objective?: { id, title, type }
}
```

### Pasul 4: Creez componentă `IdeaAnalysisModal`

Modal AI conversațional similar cu `DoorPlanningModal`:
- Streaming responses cu Lovable AI (Gemini)
- Întrebări ghidate pentru clarificare
- Verdict final cu scor și recomandare
- Opțiuni: "Mută în HIT", "Mută în DO", "Arhivează", "Continuă analiza"

### Pasul 5: Actualizez UI-ul HotList

- Buton "🧠 Analizează" pe fiecare idee
- Badge pentru idei analizate (✅ Aprobată, ⚠️ De revăzut, ❌ Respinsă)
- Filtru pentru status (Noi, Analizate, Aprobate)

---

## 📁 Fișiere de Creat/Modificat

### Fișiere Noi:
1. `supabase/functions/analyze-idea/index.ts` - Edge function pentru analiza AI
2. `src/components/door/IdeaAnalysisModal.tsx` - Modal wizard AI
3. `src/services/ideasBankService.ts` - Serviciu pentru CRUD idei

### Fișiere Modificate:
1. `src/components/door/HotList.tsx` - Adaug buton "Analizează"
2. `src/hooks/useDoorLists.tsx` - Integrez noul serviciu
3. `supabase/migrations/` - Migrare pentru tabel nou + fix date

---

## 🔄 Flow-ul Utilizatorului

```text
1. User adaugă idee nouă în secțiunea "Idei"
   ↓
2. Ideea se salvează în ideas_bank cu status='new'
   ↓
3. User apasă "🧠 Analizează" pe idee
   ↓
4. Se deschide IdeaAnalysisModal cu AI conversațional
   ↓
5. AI întreabă câteva întrebări de clarificare:
   - "Poți detalia mai mult ce vrei să obții?"
   - "Care e termenul limită?"
   - "Câte ore estimezi că necesită?"
   ↓
6. AI analizează în raport cu obiectivele tale:
   - Obiectiv anual: "1000 studenți Eduforyou"
   - 90 zile: "400 studenți + 50 agenți"
   - Lunar: "100 studenți cu oferte"
   ↓
7. AI returnează verdict:
   "Relevanță: 85% | Recomandare: PURSUE
    Aceasta idee este aliniată cu obiectivul tău lunar..."
   ↓
8. User alege acțiune: Mută în HIT / Mută în DO / Arhivează
```

---

## 🤖 Prompt AI pentru Analiză

Promptul va include:
1. Contextul complet al obiectivelor (din tabelul `missions`)
2. Focus-ul săptămânal curent (din `weekly_planning`)
3. Criteriile de evaluare:
   - Aliniere cu obiectivele (0-100)
   - Potențial de impact
   - Resurse necesare estimate
   - Urgența vs importanța
   - Risc de "busy work" (pierdere de timp)

---

## 📊 Structura Răspunsului AI

```json
{
  "analysis": {
    "relevance_score": 85,
    "alignment": {
      "annual": { "aligned": true, "objective": "1000 studenți Eduforyou" },
      "quarterly": { "aligned": true, "objective": "400 studenți" },
      "monthly": { "aligned": true, "objective": "100 studenți" }
    },
    "recommendation": "pursue",
    "reasoning": "Această idee contribuie direct la obiectivul tău lunar...",
    "estimated_effort": "medium",
    "urgency": "high",
    "is_busy_work": false
  }
}
```

---

## 🛡️ Securitate

- RLS policies pe `ideas_bank`: utilizatorul vede doar propriile idei
- Edge function autentificată
- Validare input cu Zod

---

## ⏱️ Estimare Implementare

| Pas | Componenta | Timp Estimat |
|-----|------------|--------------|
| 1 | Tabel `ideas_bank` + migrare | 10 min |
| 2 | Fix date existente | 5 min |
| 3 | Serviciu `ideasBankService` | 15 min |
| 4 | Edge function `analyze-idea` | 20 min |
| 5 | Modal `IdeaAnalysisModal` | 30 min |
| 6 | Integrare UI HotList | 15 min |
| **Total** | | **~1.5 ore** |

---

## 🎯 Rezultat Final

După implementare:
1. ✅ Toate ideile sunt salvate permanent în `ideas_bank`
2. ✅ Buton "🧠 Analizează" pe fiecare idee
3. ✅ AI evaluează relevanța față de obiectivele tale
4. ✅ Verdict clar: Pursue / Defer / Discard
5. ✅ Istoric al analizelor pentru fiecare idee
6. ✅ Filtrare idei după status (Noi / Analizate / Aprobate)
