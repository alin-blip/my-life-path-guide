
# Reparare Mesaje Directe + Mesaj Automat de Welcome pentru Coach-i

## Problema 1: Mesajele directe nu functioneaza

Tabelul `direct_messages` exista si are RLS corect configurat, dar este gol (0 mesaje). Infrastructura de cod (hook, componente) este completa. Trebuie verificat si reparat fluxul end-to-end.

Potentiale probleme identificate:
- In `Messages.tsx`, `handleSelectMultiple` apeleaza `handleSelectNewMember` dar acesta nu este in dependency array-ul `useCallback`
- `sendMessage` returneaza data dar `handleSend` nu face `fetchMessages` dupa trimitere - se bazeaza doar pe realtime, care poate avea delay
- Dupa trimitere, conversatia nu se actualizeaza in lista (depinde de realtime subscription care asculta doar pe INSERT)

## Problema 2: Mesaj automat de Welcome

Cand un membru nou se alatura unui grup (tribe), coach-ul/admin-ul vrea sa trimita automat un mesaj direct de bun venit. Exista deja UI pentru setarea `welcome_message` in `CommunitySettingsTab.tsx`, dar:
- Nu exista logica de trimitere automata
- Coach-ii nu au setari de welcome message per grup (exista doar la nivel de comunitate principala in `community_settings`)

## Solutia

### 1. Fix Mesaje Directe - `useDirectMessages.ts`

- Dupa `sendMessage`, adaugam mesajul local in state (optimistic update) pentru feedback instant
- Dupa `sendBulkMessage`, refresh conversations
- Fix `handleSelectMultiple` dependency in `Messages.tsx`

### 2. Welcome Message per Tribe - Migrare DB

Adaugam coloana `welcome_message` pe tabelul `tribes`:

```sql
ALTER TABLE public.tribes ADD COLUMN IF NOT EXISTS welcome_message text;
```

Aceasta permite fiecarui coach sa configureze un mesaj de bun venit specific grupului sau.

### 3. Trimitere automata Welcome DM - Trigger DB

Cream un trigger pe `tribe_members` care, la INSERT (cand un membru se alatura), trimite automat un mesaj direct din partea owner-ului grupului cu textul din `tribes.welcome_message`:

```sql
CREATE OR REPLACE FUNCTION public.send_tribe_welcome_dm()
RETURNS trigger AS $$
DECLARE
  _welcome_msg text;
  _owner_id uuid;
BEGIN
  SELECT t.welcome_message, t.created_by
  INTO _welcome_msg, _owner_id
  FROM public.tribes t
  WHERE t.id = NEW.tribe_id;

  IF _welcome_msg IS NOT NULL AND _welcome_msg != '' AND _owner_id != NEW.user_id THEN
    INSERT INTO public.direct_messages (sender_id, receiver_id, content)
    VALUES (_owner_id, NEW.user_id, _welcome_msg);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER on_tribe_member_joined_welcome
  AFTER INSERT ON public.tribe_members
  FOR EACH ROW
  EXECUTE FUNCTION public.send_tribe_welcome_dm();
```

### 4. UI pentru Welcome Message in GroupPage Settings

In pagina grupului (`GroupPage.tsx`), adaugam un camp in tab-ul Settings (vizibil pentru owner/admin) care permite editarea `welcome_message`.

### 5. Welcome Message pentru Comunitatea Principala

Conectam setarea `welcome_message` din `community_settings` cu acelasi mecanism - trigger-ul verifica si `community_settings` pentru grupul principal (ID hardcodat).

## Fisiere modificate

| Fisier | Modificare |
|---|---|
| Migrare SQL | Adaugare coloana `welcome_message` pe `tribes` + trigger `send_tribe_welcome_dm` |
| `src/hooks/useDirectMessages.ts` | Optimistic update dupa sendMessage, fix realtime handler |
| `src/pages/Messages.tsx` | Fix dependency array `handleSelectMultiple`, refresh dupa send |
| `src/pages/GroupPage.tsx` | Adaugare camp "Welcome Message" in settings tab pentru owner |

## Detalii tehnice

### useDirectMessages.ts - Optimistic Update

Dupa `sendMessage` cu succes, adaugam mesajul returnat direct in `messages` state si refacem `fetchConversations` pentru lista. Nu mai depindem exclusiv de realtime pentru feedback instant.

### Trigger SECURITY DEFINER

Trigger-ul foloseste `SECURITY DEFINER` pentru a insera mesaje direct (ocolind RLS care cere `auth.uid() = sender_id`), deoarece operatia se executa in context de server, nu in contextul utilizatorului.

### Flux complet

1. Coach seteaza "Welcome Message" in Settings-ul grupului
2. Noul membru se alatura grupului (INSERT in `tribe_members`)
3. Trigger-ul trimite automat un DM din partea coach-ului
4. Membrul vede mesajul in pagina Messages
