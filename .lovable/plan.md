# Plan de Remediere Stripe Webhook

## Problema Identificata
Eroare critica in `stripe-webhook`: foloseste `constructEvent()` sincron in loc de `constructEventAsync()` care este necesar in Deno/Edge Functions.

## Eroare din Logs
```
SubtleCryptoProvider cannot be used in a synchronous context.
Use `await constructEventAsync(...)` instead of `constructEvent(...)`
```

## Pasi de Implementare

### Pas 1: Reparare stripe-webhook/index.ts
Inlocuire:
```typescript
// GRESIT (sincron)
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

// CORECT (async)
const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
```

### Pas 2: Actualizare config.toml
Adaugare toate functiile Stripe care lipsesc:
```toml
[functions.stripe-webhook]
verify_jwt = false

[functions.create-checkout]
verify_jwt = false

[functions.check-subscription]
verify_jwt = false

[functions.customer-portal]
verify_jwt = false
```

### Pas 3: Imbunatatire error handling
- Adaugare logging mai detaliat pentru debugging
- Tratare corecta a erorilor de verificare semnatura

## Rezultat Asteptat
- Webhook-urile Stripe vor fi procesate corect
- Subscriptiile se vor actualiza automat la evenimente (creare, update, anulare)
- Nu mai depinde exclusiv de `check-subscription` pentru actualizari

## Note
- Plata recenta (sarah@eduforyou.co.uk) a functionat doar pentru ca `check-subscription` verifica direct cu Stripe API
- Build error-ul "bun install timeout" este temporar si nu afecteaza implementarea
