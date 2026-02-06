

# Salvare si Vizualizare Conversatii AI Coach in CRM

## Problema identificata

Challenge AI Coach-ul functioneaza, dar conversatiile (ce intreaba clientii, ce raspunsuri primesc) **nu se salveaza nicaieri**. Mesajele sunt doar in memoria browser-ului si se pierd la refresh. Din CRM nu poti vedea ce intreaba clientii.

## Ce se implementeaza

### 1. Tabel nou: `challenge_coach_conversations`

Un tabel care stocheaza fiecare mesaj din chat-ul AI Coach:

```text
id              | uuid (PK)
user_id         | uuid (ref auth.users)
day_number      | integer (ziua 0-7)
role            | text ('user' sau 'assistant')
content         | text (mesajul)
session_id      | text (grupeaza mesajele din aceeasi conversatie)
created_at      | timestamp
```

RLS: Adminii pot citi totul, utilizatorii doar propriile conversatii.

### 2. Edge Function `challenge-coach` - salvare mesaje

Dupa ce primeste raspunsul de la AI, Edge Function-ul salveaza atat mesajul utilizatorului cat si raspunsul AI-ului in tabelul nou. Se face server-side (nu client) pentru a garanta ca totul se inregistreaza.

### 3. Tab nou "Conversatii AI" in ContactProfile360

In profilul fiecarui contact din CRM, se adauga un tab "AI Chat" care afiseaza:
- Lista conversatiilor grupate pe sesiune/zi
- Fiecare mesaj user + assistant, cu timestamp
- Filtru rapid pe zi (Day 1-7 + Overview)

### 4. Dashboard global "Conversatii" in CRM

Un tab nou in CRM Dashboard care arata:
- Ultimele conversatii din toate zilele
- Ce intrebari pun clientii cel mai des
- Conversatii recente cu preview

## Detalii tehnice

### Tabel SQL

```sql
CREATE TABLE public.challenge_coach_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  day_number integer NOT NULL DEFAULT 0,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Index pentru cautare rapida
CREATE INDEX idx_challenge_coach_conv_user ON challenge_coach_conversations(user_id);
CREATE INDEX idx_challenge_coach_conv_session ON challenge_coach_conversations(session_id);
CREATE INDEX idx_challenge_coach_conv_day ON challenge_coach_conversations(day_number);

-- RLS
ALTER TABLE challenge_coach_conversations ENABLE ROW LEVEL SECURITY;

-- Utilizatorii pot citi/insera propriile mesaje
CREATE POLICY "Users can read own conversations"
  ON challenge_coach_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON challenge_coach_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin poate citi toate
CREATE POLICY "Admins can read all conversations"
  ON challenge_coach_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );
```

### Edge Function `challenge-coach` - modificari

- Dupa streaming complet, salveaza mesajul user-ului si raspunsul AI in `challenge_coach_conversations`
- Foloseste un `session_id` primit de la client (deja exista in `sessionStorage`)
- Salvarea se face cu service role key (server-side) pentru a nu depinde de RLS

### Componenta `ChallengeConversationsTab.tsx`

- Afiseaza conversatiile unui contact specific, grupate pe zi/sesiune
- Chat bubbles similare cu cele din `ChallengeInlineChat`
- Filtru per zi (dropdown)

### Tab in `ContactProfile360.tsx`

- Adauga un nou `TabsTrigger` "AI Chat" cu iconita `MessageSquare`
- Afiseaza `ChallengeConversationsTab` cu `userId` din contact

### Componenta `CRMConversationsDashboard.tsx`

- Tab nou in `CRMDashboard` - "Conversatii"
- Lista ultimele conversatii din toate zilele, cu email contact, ziua, si preview primul mesaj
- Click pe o conversatie deschide detaliile complete

### Hook `useChallengeCoach.ts` - trimite session_id

- Adauga `session_id` din `sessionStorage` in request-ul catre Edge Function
- Fara alte schimbari la client

## Ordine implementare

1. Creare tabel `challenge_coach_conversations`
2. Actualizare Edge Function `challenge-coach` sa salveze mesajele
3. Componenta `ChallengeConversationsTab` (per contact)
4. Adaugare tab "AI Chat" in `ContactProfile360`
5. Componenta `CRMConversationsDashboard` (global)
6. Adaugare tab "Conversatii" in `CRMDashboard`

