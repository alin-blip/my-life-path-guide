

# Plan: Backend Security Hardening

## Probleme Identificate (Scanare Securitate)

Scanarea a identificat **5 probleme**, dintre care **2 critice (error)** si **3 avertismente (warn)**:

### Critice (trebuie rezolvate imediat)

1. **Datele financiare ale coachilor sunt publice** — Tabelul `coach_profiles` expune `total_earnings`, `pending_payout`, `commission_rate`, `stripe_connect_id` oricui (inclusiv vizitatori neautentificati)
2. **Orice utilizator logat poate vedea toate rolurile** — Politica RLS pe `user_roles` permite oricui autentificat sa vada toti adminii si rolurile lor

### Avertismente

3. **Extensii in schema public** — risc minor de securitate
4. **Protectia parolelor compromise dezactivata** — nu se verifica daca parola e intr-o baza de date de leak-uri
5. **Comentariile personale de coaching sunt publice** — `warriors_way_comments` e citibil de oricine, inclusiv neautentificati

---

## Solutii Propuse

### Fix 1: Coach Profiles — Restrictioneaza datele financiare
- Sterge politica `Public can view verified coach profiles`
- Creeaza 2 politici noi:
  - **Publica**: doar coloanele sigure (display_name, bio, avatar_url, referral_code) — implementat prin view restrictionat
  - **Privata**: coachii isi vad propriile date financiare (`auth.uid() = user_id`)

### Fix 2: User Roles — Opreste enumerarea
- Sterge politica `Service role can check all roles` (care e de fapt pe `authenticated`)
- Pastreaza doar `Users can view own roles` existenta
- Functia `has_role()` (SECURITY DEFINER) nu e afectata — functioneaza independent de RLS

### Fix 3: Warriors Way Comments — Restrictioneaza la autentificati
- Modifica politica de la `public` la `authenticated`

### Fix 4: Leaked Password Protection
- Activare prin configurarea auth

### Fix 5: CORS Headers Update
- Actualizeaza CORS headers pe edge functions critice (`create-checkout`, `check-subscription`, `stripe-webhook`) sa includa headerele platform-specific cerute de Supabase client

---

## Fisiere Modificate

| Element | Actiune |
|---------|---------|
| Migrare SQL | 4 modificari RLS (coach_profiles, user_roles, warriors_way_comments) |
| Auth config | Activare leaked password protection |
| Edge functions | CORS headers update pe 3 functii critice |

## Impact

- Zero downtime — doar politici RLS si configuratie
- Nu afecteaza functionalitatile existente (coachii isi vad in continuare datele, adminii functioneaza prin `has_role()`)
- Protejeaza datele financiare, rolurile admin si continutul personal

