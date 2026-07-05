import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, Phone } from 'lucide-react';

export const SmsPreferencesCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    phone_e164: '',
    sms_consent: false,
    onboarding_opt_in: true,
    checkout_recovery_opt_in: true,
    routine_reminder_opt_in: true,
    marketing_opt_in: false,
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      const { data } = await supabase.from('user_sms_preferences').select('*').eq('user_id', user.id).maybeSingle();
      if (data) setPrefs({
        phone_e164: data.phone_e164 ?? '',
        sms_consent: data.sms_consent,
        onboarding_opt_in: data.onboarding_opt_in,
        checkout_recovery_opt_in: data.checkout_recovery_opt_in,
        routine_reminder_opt_in: data.routine_reminder_opt_in,
        marketing_opt_in: data.marketing_opt_in,
      });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nu ești autentificat');
      if (prefs.phone_e164 && !/^\+[1-9]\d{6,14}$/.test(prefs.phone_e164)) {
        throw new Error('Număr invalid. Folosește format E.164 (+40712345678)');
      }
      const { error } = await supabase.from('user_sms_preferences').upsert({
        user_id: user.id,
        phone_e164: prefs.phone_e164 || null,
        sms_consent: prefs.sms_consent,
        sms_consent_at: prefs.sms_consent ? new Date().toISOString() : null,
        onboarding_opt_in: prefs.onboarding_opt_in,
        checkout_recovery_opt_in: prefs.checkout_recovery_opt_in,
        routine_reminder_opt_in: prefs.routine_reminder_opt_in,
        marketing_opt_in: prefs.marketing_opt_in,
      });
      if (error) throw error;
      toast({ title: 'Preferințe SMS salvate' });
    } catch (e) {
      toast({ title: 'Eroare', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading) return <Card><CardContent className="pt-6 flex justify-center"><Loader2 className="animate-spin" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5" />Notificări SMS</CardTitle>
        <CardDescription>Primește reminder-uri și update-uri prin SMS. Poți răspunde STOP oricând.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Număr telefon (format internațional)</Label>
          <Input placeholder="+40712345678" value={prefs.phone_e164} onChange={e => setPrefs(p => ({ ...p, phone_e164: e.target.value }))} />
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <Label className="text-base">Consimțământ SMS</Label>
            <p className="text-xs text-muted-foreground">Sunt de acord să primesc SMS-uri de la CEO Mind OS.</p>
          </div>
          <Switch checked={prefs.sms_consent} onCheckedChange={v => setPrefs(p => ({ ...p, sms_consent: v }))} />
        </div>
        {prefs.sms_consent && (
          <div className="space-y-3 pl-3 border-l-2 border-primary">
            <div className="flex items-center justify-between">
              <Label>Onboarding & welcome</Label>
              <Switch checked={prefs.onboarding_opt_in} onCheckedChange={v => setPrefs(p => ({ ...p, onboarding_opt_in: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Reminder plată / checkout</Label>
              <Switch checked={prefs.checkout_recovery_opt_in} onCheckedChange={v => setPrefs(p => ({ ...p, checkout_recovery_opt_in: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Reminder rutină zilnică</Label>
              <Switch checked={prefs.routine_reminder_opt_in} onCheckedChange={v => setPrefs(p => ({ ...p, routine_reminder_opt_in: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Marketing & oferte</Label>
              <Switch checked={prefs.marketing_opt_in} onCheckedChange={v => setPrefs(p => ({ ...p, marketing_opt_in: v }))} />
            </div>
          </div>
        )}
        <Button onClick={save} disabled={saving} className="w-full">
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Salvează preferințe
        </Button>
      </CardContent>
    </Card>
  );
};
