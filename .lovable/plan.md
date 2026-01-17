# Plan: Actualizare STRIPE_WEBHOOK_SECRET

## Obiectiv
Actualizarea secretului `STRIPE_WEBHOOK_SECRET` cu noua valoare din Stripe Dashboard pentru verificarea corecta a webhook-urilor.

## Pasi de implementare

### Pas 1: Actualizare secret
- Se va folosi tool-ul de actualizare secrete pentru a inlocui valoarea existenta a `STRIPE_WEBHOOK_SECRET`
- Vei primi un formular unde sa introduci noua valoare

### De unde obtii valoarea

1. Mergi la **Stripe Dashboard** -> **Developers** -> **Webhooks**
2. Click pe endpoint-ul tau: `https://exsbnfmaadjyfblperas.supabase.co/functions/v1/stripe-webhook`
3. In sectiunea **Signing secret**, click **Reveal** sau **Click to reveal**
4. Copiaza valoarea care incepe cu `whsec_...`

### Dupa actualizare
- Edge function-ul `stripe-webhook` va folosi automat noua valoare
- Nu sunt necesare modificari de cod
- Webhook-urile vor fi verificate corect cu noua semnatura

## Nota
Build error-ul de `bun install timeout` este o problema temporara de infrastructura si nu afecteaza aceasta actualizare.
