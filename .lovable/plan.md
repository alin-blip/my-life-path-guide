
# Implementare Verificare HIBP (Leaked Password Protection)

## Obiectiv
Verificarea în timp real dacă parola aleasă de utilizator a fost compromisă în breșe de securitate cunoscute, folosind API-ul Have I Been Pwned (HIBP) cu protecție k-anonymity.

---

## Cum Funcționează HIBP API

API-ul HIBP folosește **k-anonymity** pentru a nu expune niciodată parola completă:
1. Se calculează hash-ul SHA-1 al parolei
2. Se trimit doar primele 5 caractere ale hash-ului către API
3. API-ul returnează toate hash-urile care încep cu acele 5 caractere
4. Verificarea se face local - parola nu părăsește niciodată dispozitivul utilizatorului

---

## Plan de Implementare

### Pasul 1: Crearea Serviciului HIBP
**Fișier nou: `src/services/hibpService.ts`**

Funcționalitate:
- Calcul SHA-1 hash folosind Web Crypto API (nativ în browser)
- Trimitere request către API-ul HIBP cu primele 5 caractere
- Verificare locală dacă hash-ul complet se găsește în răspuns
- Return: numărul de apariții în breșe sau 0 dacă e sigură

### Pasul 2: Actualizare AuthForm.tsx
**Modificări în formularul principal de autentificare:**

- Adăugare stare pentru verificare HIBP (`isCheckingPassword`, `passwordBreached`)
- Verificare asincronă când utilizatorul termină de tastat parola (debounce 500ms)
- Indicator vizual cu icon și mesaj de avertizare (portocaliu/roșu)
- Blocare submit dacă parola e compromisă (cu opțiune de a ignora)

### Pasul 3: Actualizare InlineAuthModal.tsx
**Aceleași modificări pentru modal-ul de autentificare:**

- Integrare serviciu HIBP
- Indicator vizual pentru parole compromise
- Blocare înregistrare cu parole compromise

---

## Detalii Tehnice

### Serviciu HIBP (hibpService.ts)
```typescript
// Algoritm k-anonymity:
// 1. SHA-1("password123") = "CBFDAC6008F9CAB4083784CBD1874F76618D2A97"
// 2. Trimite request: GET api.pwnedpasswords.com/range/CBFDA
// 3. Primește lista de sufixe + count
// 4. Caută local dacă C6008F9CAB4083784CBD1874F76618D2A97 există
```

### Indicator Vizual în Formular
- **Verde**: Parola verificată, nu apare în breșe
- **Roșu/Portocaliu**: "Această parolă a fost expusă în X breșe de securitate. Te recomandăm să alegi alta."
- **Spinner**: "Se verifică securitatea parolei..."

### Comportament
- Verificarea se face doar la REGISTER, nu la LOGIN
- Debounce de 500ms pentru a nu spama API-ul
- Timeout de 3 secunde - dacă API-ul nu răspunde, permite înregistrarea (fail-open)
- Logare event de securitate când utilizatorul ignoră avertismentul

---

## Fișiere Afectate

| Fișier | Acțiune |
|--------|---------|
| `src/services/hibpService.ts` | Nou |
| `src/components/AuthForm.tsx` | Modificat |
| `src/components/life-score/InlineAuthModal.tsx` | Modificat |

---

## Mesaje UI (RO/EN)

| Context | Română | Engleză |
|---------|--------|---------|
| Verificare | Se verifică securitatea parolei... | Checking password security... |
| Compromisă | Această parolă a fost expusă în breșe de securitate. Alege altă parolă. | This password has been exposed in data breaches. Choose a different password. |
| Sigură | Parola nu apare în breșe cunoscute | Password not found in known breaches |
| Blocare | Nu poți folosi o parolă compromisă | Cannot use a compromised password |

---

## Beneficii

1. **Securitate sporită** - Blochează parolele cunoscute ca fiind compromise
2. **Privacitate** - Parola nu părăsește niciodată dispozitivul (k-anonymity)
3. **UX bun** - Verificare în timp real, feedback clar
4. **Fail-safe** - Dacă API-ul e offline, permite înregistrarea
