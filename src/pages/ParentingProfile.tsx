import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, ArrowLeft, Baby, Plus } from 'lucide-react';
import { useParentingChildren, useParentingProfile } from '@/hooks/useParenting';
import { getAgeContext } from '@/services/parentingService';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const childSchema = z.object({
  name: z.string().trim().min(1, 'Nume obligatoriu').max(80),
  birth_year: z.number().int().min(1990).max(new Date().getFullYear()),
  birth_month: z.number().int().min(1).max(12).optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'undisclosed']).optional().nullable(),
  strengths: z.string().max(500).optional().nullable(),
  challenges: z.string().max(500).optional().nullable(),
});

const ParentingProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { children, loading, createChild, removeChild } = useParentingChildren();
  const { profile } = useParentingProfile();
  const lang = profile?.preferred_language || 'ro';

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    birth_year: new Date().getFullYear() - 5,
    birth_month: '' as string,
    gender: '' as string,
    strengths: '',
    challenges: '',
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsed = childSchema.parse({
        name: form.name,
        birth_year: Number(form.birth_year),
        birth_month: form.birth_month ? Number(form.birth_month) : null,
        gender: form.gender ? (form.gender as any) : null,
        strengths: form.strengths || null,
        challenges: form.challenges || null,
      });
      await createChild(parsed as any);
      toast({ title: lang === 'en' ? 'Child added' : 'Copil adăugat' });
      setForm({ name: '', birth_year: currentYear - 5, birth_month: '', gender: '', strengths: '', challenges: '' });
      setShowForm(false);
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err?.message || 'Error';
      toast({ title: 'Eroare', description: msg, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(lang === 'en' ? `Remove ${name}?` : `Elimini profilul lui ${name}?`)) return;
    try {
      await removeChild(id);
      toast({ title: lang === 'en' ? 'Removed' : 'Șters' });
    } catch (e: any) {
      toast({ title: 'Eroare', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/parenting')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {lang === 'en' ? 'Back' : 'Înapoi'}
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="w-6 h-6 text-primary" />
            {lang === 'en' ? 'Children Profiles' : 'Profilurile Copiilor'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'en'
              ? 'Add each child. Age determines the developmental protocol (Piaget + Erikson).'
              : 'Adaugă fiecare copil. Vârsta determină protocolul de dezvoltare (Piaget + Erikson).'}
          </p>
        </div>

        {/* Existing children */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-3">
            {children.map((c) => {
              const ctx = getAgeContext(c.birth_year, c.birth_month);
              return (
                <Card key={c.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Baby className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{c.name}</span>
                        <Badge variant="secondary">{ctx.age} {lang === 'en' ? 'y' : 'ani'}</Badge>
                        <Badge variant="outline" className="text-xs">{ctx.piagetLabel[lang]}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {ctx.eriksonLabel[lang]}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(c.id, c.name)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add form */}
        {!showForm && children.length < 8 && (
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Add child' : 'Adaugă copil'}
          </Button>
        )}

        {children.length >= 8 && (
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Maximum 8 active children reached.' : 'Ai atins limita de 8 copii activi.'}
          </p>
        )}

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{lang === 'en' ? 'New child' : 'Copil nou'}</CardTitle>
              <CardDescription>
                {lang === 'en' ? 'Only name and birth year are required.' : 'Doar numele și anul nașterii sunt obligatorii.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">{lang === 'en' ? 'Name' : 'Nume'} *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      maxLength={80}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth_year">{lang === 'en' ? 'Birth year' : 'Anul nașterii'} *</Label>
                    <Select value={String(form.birth_year)} onValueChange={(v) => setForm({ ...form, birth_year: Number(v) })}>
                      <SelectTrigger id="birth_year"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="birth_month">{lang === 'en' ? 'Birth month (optional)' : 'Luna (opțional)'}</Label>
                    <Select value={form.birth_month} onValueChange={(v) => setForm({ ...form, birth_month: v })}>
                      <SelectTrigger id="birth_month"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gender">{lang === 'en' ? 'Gender (optional)' : 'Gen (opțional)'}</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger id="gender"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{lang === 'en' ? 'Male' : 'Băiat'}</SelectItem>
                        <SelectItem value="female">{lang === 'en' ? 'Female' : 'Fată'}</SelectItem>
                        <SelectItem value="other">{lang === 'en' ? 'Other' : 'Altul'}</SelectItem>
                        <SelectItem value="undisclosed">{lang === 'en' ? 'Prefer not to say' : 'Nu spun'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="strengths">{lang === 'en' ? 'Strengths' : 'Puncte tari'}</Label>
                  <Textarea
                    id="strengths"
                    value={form.strengths}
                    onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                    maxLength={500}
                    rows={2}
                    placeholder={lang === 'en' ? 'What lights him/her up?' : 'Ce îl/o luminează?'}
                  />
                </div>
                <div>
                  <Label htmlFor="challenges">{lang === 'en' ? 'Current challenges' : 'Provocări actuale'}</Label>
                  <Textarea
                    id="challenges"
                    value={form.challenges}
                    onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                    maxLength={500}
                    rows={2}
                    placeholder={lang === 'en' ? 'What are you struggling with?' : 'Cu ce te lupți cu el/ea?'}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? '...' : lang === 'en' ? 'Save' : 'Salvează'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    {lang === 'en' ? 'Cancel' : 'Anulează'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ParentingProfilePage;
