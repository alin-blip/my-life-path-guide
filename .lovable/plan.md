# Plan de Remediere: CRM + Stripe + Lead Magnet Tracking

## Probleme Identificate

### Problema 1: CRM nu reflecta platile Stripe
**Cauza:** `sync-crm-contacts` nu citeste din tabelul `subscribers`
- sarah@eduforyou.co.uk are `subscribed=true, tier=Pro` in `subscribers`
- Dar in `crm_contact_profiles` apare ca `funnel_stage=lead, lifetime_value=0`

### Problema 2: Lead Magnet Vision-2026 nu are tracking vizibil
**Cauza:** Datele exista in `email_leads` dar nu sunt agregate/afisate in CRM
- 22 leads cu `vision_2026_quiz`
- 17 leads cu `vision_board`

### Problema 3: Funnel stage "customer" nu detecteaza subscriberi Stripe
**Cauza:** Se verifica doar `course_purchases`, nu `subscribers`

---

## Pasi de Implementare

### Pas 1: Actualizare sync-crm-contacts/index.ts
Adaugare citire din tabelul `subscribers` pentru a detecta clientii platitori:

```typescript
// Adaugare dupa linia care preia purchases (linia 94-111)

// Get Stripe subscribers for customer identification
const { data: subscribers } = await supabase
  .from("subscribers")
  .select("email, subscribed, subscription_tier, created_at, subscription_end");

const subscriberMap = new Map(
  subscribers?.filter(s => s.subscribed).map(s => [
    s.email.toLowerCase(), 
    { 
      tier: s.subscription_tier, 
      since: s.created_at,
      tierValue: s.subscription_tier === 'Elite' ? 1990 : (s.subscription_tier === 'Pro' ? 990 : 0)
    }
  ]) || []
);
```

Modificare logica de calcul lead score si funnel stage:
```typescript
// In bucla de procesare leads (linia 162+)
const subscription = subscriberMap.get(emailLower);

// Add subscription to lead score
if (subscription) {
  leadScore += 100;
  funnelStage = 'customer';
}

// Update lifetime_value to include subscription
const subscriptionValue = subscription?.tierValue || 0;
const purchaseValue = purchaseData?.total || 0;
const totalLifetimeValue = subscriptionValue + purchaseValue;
```

### Pas 2: Adaugare camp subscription_tier in crm_contact_profiles
Creare migratie SQL pentru a adauga campul:

```sql
ALTER TABLE crm_contact_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT NULL;

ALTER TABLE crm_contact_profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL;
```

### Pas 3: Actualizare sync pentru a popula subscription data
```typescript
const contactData = {
  // ... existing fields
  subscription_tier: subscription?.tier || null,
  subscription_status: subscription ? 'active' : null,
  lifetime_value: totalLifetimeValue,
  total_purchases: (purchaseData?.count || 0) + (subscription ? 1 : 0),
};
```

### Pas 4: Adaugare Lead Source Analytics in CRM Dashboard
Creare componenta noua `LeadSourceStats.tsx` care afiseaza:
- Breakdown pe lead_source/lead_magnet
- Numar leads per sursa
- Conversion rate per sursa
- Top performing lead magnets

### Pas 5: Adaugare filtru in FunnelPipeline pentru lead source
```typescript
// Adaugare dropdown pentru filtrare dupa lead_source
<Select onValueChange={setSourceFilter}>
  <SelectTrigger>
    <SelectValue placeholder="Toate sursele" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Toate sursele</SelectItem>
    <SelectItem value="vision_2026_quiz">Vision 2026 Quiz</SelectItem>
    <SelectItem value="vision_board">Vision Board</SelectItem>
    <SelectItem value="warrior_power">Warrior Power</SelectItem>
    <SelectItem value="direct_signup">Direct Signup</SelectItem>
  </SelectContent>
</Select>
```

### Pas 6: Adaugare indicator vizual pentru subscriberi in ContactCard
In `ContactCard.tsx`, adaugare badge pentru subscription tier:
```typescript
{contact.subscription_tier && (
  <Badge className={contact.subscription_tier === 'Elite' ? 'bg-purple-500' : 'bg-blue-500'}>
    {contact.subscription_tier}
  </Badge>
)}
```

---

## Fisiere Afectate

1. `supabase/functions/sync-crm-contacts/index.ts` - integrare subscribers
2. `src/components/admin/crm/FunnelPipeline.tsx` - adaugare filtre
3. `src/components/admin/crm/ContactCard.tsx` - badge subscription
4. `src/components/admin/crm/LeadSourceStats.tsx` - componenta noua
5. `src/components/admin/crm/CRMAnalytics.tsx` - integrare stats
6. Migratie SQL pentru campuri noi in crm_contact_profiles

---

## Rezultat Asteptat

1. **Sarah** si toti subscriberii vor aparea ca **Customer** cu **Pro/Elite badge**
2. **Lifetime Value** va include valoarea subscriptiei
3. **Lead Magnet Stats** vor fi vizibile in dashboard
4. **Filtrare** dupa sursa lead (Vision 2026, Warrior Power, etc.)
5. **Sync automat** intre Stripe payments si CRM

---

## Test Verificare

Dupa implementare:
1. Apasa "Sync Contacte" in CRM
2. Verifica ca sarah@eduforyou.co.uk apare ca Customer cu badge Pro
3. Verifica ca lifetime_value = 990 (sau pretul planului Pro)
4. Verifica statisticile pe lead source Vision 2026