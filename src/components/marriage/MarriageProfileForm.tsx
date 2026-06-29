import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMarriageProfile } from '@/hooks/useMarriageStack';

interface Props {
  onSaved?: () => void;
  compact?: boolean;
}

export const MarriageProfileForm: React.FC<Props> = ({ onSaved, compact = false }) => {
  const { profile, save } = useMarriageProfile();
  const [form, setForm] = useState({
    partner_name: profile?.partner_name || '',
    partner_pronoun: profile?.partner_pronoun || 'ea',
    relationship_years: profile?.relationship_years?.toString() || '',
    children_count: profile?.children_count?.toString() || '0',
    partner_love_language: profile?.partner_love_language || '',
    relationship_context: profile?.relationship_context || '',
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setForm({
        partner_name: profile.partner_name || '',
        partner_pronoun: profile.partner_pronoun || 'ea',
        relationship_years: profile.relationship_years?.toString() || '',
        children_count: profile.children_count?.toString() || '0',
        partner_love_language: profile.partner_love_language || '',
        relationship_context: profile.relationship_context || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        partner_name: form.partner_name || null,
        partner_pronoun: form.partner_pronoun || null,
        relationship_years: form.relationship_years ? Number(form.relationship_years) : null,
        children_count: form.children_count ? Number(form.children_count) : 0,
        partner_love_language: form.partner_love_language || null,
        relationship_context: form.relationship_context || null,
      });
      toast.success('Profil relațional salvat');
      onSaved?.();
    } catch (e: any) {
      toast.error('Eroare: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={compact ? 'p-4 space-y-3 bg-card' : 'p-6 space-y-4 bg-card'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="partner_name">Nume partener</Label>
          <Input id="partner_name" value={form.partner_name} onChange={(e) => setForm({ ...form, partner_name: e.target.value })} placeholder="ex. Maria" />
        </div>
        <div>
          <Label htmlFor="partner_pronoun">Pronume</Label>
          <select
            id="partner_pronoun"
            value={form.partner_pronoun}
            onChange={(e) => setForm({ ...form, partner_pronoun: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="ea">ea</option>
            <option value="el">el</option>
            <option value="ei">ei (neutru)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="years">Ani împreună</Label>
          <Input id="years" type="number" min="0" value={form.relationship_years} onChange={(e) => setForm({ ...form, relationship_years: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="children">Copii</Label>
          <Input id="children" type="number" min="0" value={form.children_count} onChange={(e) => setForm({ ...form, children_count: e.target.value })} />
        </div>
      </div>

      <div>
        <Label htmlFor="love_language">Limbaj iubire partener (Gary Chapman)</Label>
        <select
          id="love_language"
          value={form.partner_love_language}
          onChange={(e) => setForm({ ...form, partner_love_language: e.target.value })}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="">— alege —</option>
          <option value="Cuvinte de afirmare">Cuvinte de afirmare</option>
          <option value="Timp de calitate">Timp de calitate</option>
          <option value="Cadouri">Cadouri</option>
          <option value="Servicii">Servicii</option>
          <option value="Atingere fizică">Atingere fizică</option>
        </select>
      </div>

      <div>
        <Label htmlFor="ctx">Context relație (1-3 fraze)</Label>
        <Textarea
          id="ctx"
          value={form.relationship_context}
          onChange={(e) => setForm({ ...form, relationship_context: e.target.value })}
          placeholder="ex: căsătoriți de 8 ani, ea e antreprenor și ea, copil mic, ea simte că am devenit distant de când am lansat compania nouă..."
          className="min-h-[80px]"
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Salvează profilul relațional
      </Button>
    </Card>
  );
};
