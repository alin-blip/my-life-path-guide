

# Plan: Diferențiere Comisioane PRO vs ELITE

## Rezumat Modificare

| Plan | Comision | Când se aplică |
|------|----------|----------------|
| **PRO** | 50% o singură dată | Doar la prima plată (checkout inițial) |
| **ELITE** | 50% lifetime | La fiecare plată recurentă (pe viață) |

---

## Modificări Necesare

### 1. `supabase/functions/stripe-webhook/index.ts`

**Problema actuală:** `invoice.paid` apelează `processCoachCommission` pentru TOȚI utilizatorii, indiferent de tier.

**Modificare în `invoice.paid` (liniile 401-435):**

```typescript
case "invoice.paid": {
  const invoice = event.data.object as Stripe.Invoice;
  
  // Skip initial invoice
  if (invoice.billing_reason === "subscription_create") {
    log("Skipping initial invoice - already processed", { invoiceId: invoice.id });
    break;
  }

  // DETERMINE SUBSCRIPTION TIER
  const customerId = invoice.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted || !("email" in customer) || !customer.email) {
    log("Customer not found or no email");
    break;
  }

  // Get subscriber tier from database
  const { data: subscriber } = await supabaseService
    .from("subscribers")
    .select("subscription_tier")
    .eq("email", customer.email)
    .single();

  const userTier = subscriber?.subscription_tier || "basic";

  // CRITICAL: Only process recurring commission for ELITE tier
  // PRO gets 50% only on first payment (handled in checkout.session.completed)
  if (userTier !== "elite") {
    log("Skipping recurring commission - not elite tier", { 
      email: customer.email, 
      tier: userTier 
    });
    break;
  }

  log("Processing ELITE recurring commission", { 
    customer: invoice.customer,
    amount: invoice.amount_paid,
    tier: userTier
  });

  // Find user and process commission (only for ELITE)
  const { data: invoiceUserData } = await supabaseService.auth.admin.listUsers();
  const invoiceUser = invoiceUserData?.users?.find(u => u.email === customer.email);

  if (invoiceUser?.id && invoice.amount_paid) {
    const paymentAmountEur = invoice.amount_paid / 100;
    await processCoachCommission(invoiceUser.id, paymentAmountEur, invoice.currency || "eur", invoice.id);
  }

  break;
}
```

---

### 2. `src/data/pricing.ts` - Actualizare Beneficii

**PRO (linia 90 și 100):**
```typescript
// benefitsEn:
"**REFERRAL PROGRAM** - Earn 50% one-time commission",

// benefitsRo:
"**PROGRAM REFERRAL** - Câștigă 50% comision (prima lună)",
```

**ELITE (linia 132 și 141) - Adaugă:**
```typescript
// benefitsEn:
"**COACH OPPORTUNITY** - Earn 50% lifetime commission from your clients",
"**COACH DASHBOARD** - Manage clients, track progress, build your tribe",

// benefitsRo:
"🔥 **OPORTUNITATE COACH** - Câștigă 50% comision pe viață (lifetime)",
"🔥 **COACH DASHBOARD** - Gestionează clienții și construiește-ți echipa",
```

---

### 3. `src/data/pricing.ts` - Actualizare Prețuri și Beneficii Complete

**BASIC (fără referral deloc):**
```typescript
benefitsRo: [
  "Harta Realității - Evaluarea vieții tale",
  "Warrior Routine completă (4 domenii)",
  "Door - Sistem de planificare săptămânală",
  "Stacks (Furie, Claritate, Focus) pentru reset rapid",
  "Jurnal de progres și rapoarte săptămânale",
],
```

**PRO (AI + Comunitate + 50% o singură dată):**
```typescript
benefitsRo: [
  "✓ Tot ce include planul Basic",
  "AI Accountability Coach - tracking zilnic",
  "AI Mind Coach - transformă emoțiile în putere",
  "Comunitate VIP cu membri Pro Warriors",
  "Sesiune Q&A exclusivă lunară",
  "Sprint de 90 de zile cu KPIs",
  "Napoleon Hill Software Implementation",
  "Breakthrough Tools and Applied Courses",
  "Support VIP dedicat",
  "Acces prioritar la funcționalități noi",
  "**PROGRAM REFERRAL** - 50% comision (prima lună)",
],
```

**ELITE (Accelerator + Coach + 50% Lifetime):**
```typescript
originalPriceEn: "€970",
originalPriceRo: "4850 LEI",
benefitsRo: [
  "✓ Tot ce include planul Pro",
  "Warrior Launch Accelerator (€2.497 valoare)",
  "Coaching de grup LIVE săptămânal cu Alin Radu (90 min - Hot Seats)",
  "Elite Brotherhood - comunitate exclusivă",
  "47+ lecții video premium - Execution Done With You",
  "Framework de implementare daily",
  "Acces complet la toate cursurile noi",
  "Coaching 1-on-1 lunar (30 min)",
  "🔥 **OPORTUNITATE COACH** - 50% comision pe viață (lifetime)",
  "🔥 **COACH DASHBOARD** - Gestionează echipa și clienții",
],
```

---

### 4. Planuri Anuale - Sincronizare

**PRO Annual (liniile 203 și 210):**
```typescript
// benefitsEn:
"**REFERRAL PROGRAM** - Earn 50% one-time commission",

// benefitsRo:
"**PROGRAM REFERRAL** - 50% comision (prima lună)",
```

**ELITE Annual (liniile 239 și 247) - Adaugă:**
```typescript
// benefitsEn:
"**COACH OPPORTUNITY** - Earn 50% lifetime commission from your clients",

// benefitsRo:
"🔥 **OPORTUNITATE COACH** - 50% comision pe viață (lifetime)",
```

---

## Fișiere de Modificat

| Fișier | Modificare |
|--------|------------|
| `supabase/functions/stripe-webhook/index.ts` | Adaugă verificare tier în `invoice.paid` - skip pentru non-elite |
| `src/data/pricing.ts` | Actualizare beneficii PRO/ELITE + preț normal Elite €970 |
| `src/components/membership/MembershipUpsellCards.tsx` | Sincronizare cu pricing.ts |
| `src/components/challenge/ChallengeDay7Upgrade.tsx` | Actualizare whatYouGet |

---

## Logica Finală

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUX COMISIOANE                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   checkout.session.completed                                        │
│         ↓                                                           │
│   processCoachCommission() → 50% pentru TOȚI (prima plată)         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   invoice.paid (plăți recurente)                                    │
│         ↓                                                           │
│   Verifică subscription_tier                                        │
│         ↓                                                           │
│   tier === "elite" ?                                                │
│         ├── DA → processCoachCommission() (50% lifetime)            │
│         └── NU → SKIP (PRO/Basic nu primesc comision recurent)      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Rezultat Business

| Tier | Prima Plată | Plăți Recurente | Total Potențial/An |
|------|-------------|-----------------|-------------------|
| **BASIC** | - | - | €0 |
| **PRO** | 50% × €97 = **€48.50** | - | €48.50 (o dată) |
| **ELITE** | 50% × €297 = **€148.50** | 50% × €297 × 11 = **€1,633.50** | **€1,782/an** |

Diferența masivă face upgrade-ul la ELITE extrem de atractiv pentru coachi/afiliați.

