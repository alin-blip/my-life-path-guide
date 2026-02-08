import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, MessageSquare, Mail, Shield, FileText, Info } from 'lucide-react';

type SettingKey =
  | 'welcome_message'
  | 'welcome_email_enabled'
  | 'welcome_email_subject'
  | 'welcome_email_body'
  | 'community_rules'
  | 'community_description'
  | 'allow_member_posts'
  | 'require_post_approval';

interface SettingsState {
  welcome_message: string;
  welcome_email_enabled: string;
  welcome_email_subject: string;
  welcome_email_body: string;
  community_rules: string;
  community_description: string;
  allow_member_posts: string;
  require_post_approval: string;
}

const defaultSettings: SettingsState = {
  welcome_message: '',
  welcome_email_enabled: 'false',
  welcome_email_subject: '',
  welcome_email_body: '',
  community_rules: '',
  community_description: '',
  allow_member_posts: 'true',
  require_post_approval: 'false',
};

export const CommunitySettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isRo = language === 'ro';

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('community_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Error fetching settings:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const mapped: Partial<SettingsState> = {};
        data.forEach((row) => {
          const key = row.setting_key as SettingKey;
          if (key in defaultSettings) {
            mapped[key] = row.setting_value || '';
          }
        });
        setSettings((prev) => ({ ...prev, ...mapped }));
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from('community_settings')
          .upsert(
            {
              setting_key: key,
              setting_value: value,
              updated_by: user.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'setting_key' }
          )
      );

      await Promise.all(updates);

      toast({
        title: isRo ? 'Salvat!' : 'Saved!',
        description: isRo ? 'Setările au fost actualizate.' : 'Settings have been updated.',
      });
    } catch (err: any) {
      toast({
        title: isRo ? 'Eroare' : 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: SettingKey, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: SettingKey) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true',
    }));
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold">
          {isRo ? 'Acces restricționat' : 'Access restricted'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isRo
            ? 'Doar administratorii pot accesa setările comunității.'
            : 'Only admins can access community settings.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">
          {isRo ? 'Setări Comunitate' : 'Community Settings'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRo
            ? 'Configurează mesajele, regulile și opțiunile de moderare.'
            : 'Configure messages, rules, and moderation options.'}
        </p>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-primary" />
            {isRo ? 'Mesaj de Bun Venit' : 'Welcome Message'}
          </CardTitle>
          <CardDescription>
            {isRo
              ? 'Mesajul fixat afișat în partea de sus a feed-ului.'
              : 'The pinned message shown at the top of the feed.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.welcome_message}
            onChange={(e) => updateSetting('welcome_message', e.target.value)}
            placeholder={isRo ? 'Scrie mesajul de bun venit...' : 'Write welcome message...'}
            className="min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Welcome Email */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-primary" />
            {isRo ? 'Email de Bun Venit' : 'Welcome Email'}
          </CardTitle>
          <CardDescription>
            {isRo
              ? 'Emailul trimis noilor membri când se alătură.'
              : 'Email sent to new members when they join.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-toggle">
              {isRo ? 'Trimite email de bun venit' : 'Send welcome email'}
            </Label>
            <Switch
              id="email-toggle"
              checked={settings.welcome_email_enabled === 'true'}
              onCheckedChange={() => toggleSetting('welcome_email_enabled')}
            />
          </div>

          {settings.welcome_email_enabled === 'true' && (
            <>
              <div className="space-y-2">
                <Label>{isRo ? 'Subiect email' : 'Email subject'}</Label>
                <Input
                  value={settings.welcome_email_subject}
                  onChange={(e) => updateSetting('welcome_email_subject', e.target.value)}
                  placeholder={isRo ? 'Subiectul emailului...' : 'Email subject...'}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRo ? 'Conținut email' : 'Email body'}</Label>
                <Textarea
                  value={settings.welcome_email_body}
                  onChange={(e) => updateSetting('welcome_email_body', e.target.value)}
                  placeholder={isRo ? 'Conținutul emailului...' : 'Email body...'}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Community Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            {isRo ? 'Descriere Comunitate' : 'Community Description'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.community_description}
            onChange={(e) => updateSetting('community_description', e.target.value)}
            placeholder={isRo ? 'Descrierea comunității...' : 'Community description...'}
            className="min-h-[80px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Community Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            {isRo ? 'Regulile Comunității' : 'Community Rules'}
          </CardTitle>
          <CardDescription>
            {isRo
              ? 'Regulile afișate membrilor în sidebar.'
              : 'Rules displayed to members in the sidebar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.community_rules}
            onChange={(e) => updateSetting('community_rules', e.target.value)}
            placeholder={isRo ? '1. Fii respectuos\n2. ...' : '1. Be respectful\n2. ...'}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Moderation Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            {isRo ? 'Moderare' : 'Moderation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{isRo ? 'Permite membrilor să posteze' : 'Allow members to post'}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRo
                  ? 'Dacă este dezactivat, doar adminii pot posta.'
                  : 'If disabled, only admins can post.'}
              </p>
            </div>
            <Switch
              checked={settings.allow_member_posts === 'true'}
              onCheckedChange={() => toggleSetting('allow_member_posts')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>{isRo ? 'Aprobarea postărilor' : 'Require post approval'}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRo
                  ? 'Postările trebuie aprobate înainte de publicare.'
                  : 'Posts must be approved before publishing.'}
              </p>
            </div>
            <Switch
              checked={settings.require_post_approval === 'true'}
              onCheckedChange={() => toggleSetting('require_post_approval')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[140px]">
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving
            ? isRo
              ? 'Se salvează...'
              : 'Saving...'
            : isRo
              ? 'Salvează setările'
              : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
