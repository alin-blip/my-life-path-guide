import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, History, User, Heart, AlertTriangle, Plus } from 'lucide-react';
import { useMarriageProfile, useMarriageSessions } from '@/hooks/useMarriageStack';
import { AxisDiagnosisRadar } from '@/components/marriage/AxisDiagnosisRadar';
import { formatDistanceToNow } from 'date-fns';
import { ro as roLocale, enUS as enLocale } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';

export default function Marriage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile, loading: pLoad } = useMarriageProfile();
  const { sessions, loading: sLoad } = useMarriageSessions();
  const dateLocale = language === 'en' ? enLocale : roLocale;

  const titleParts = t('marriage.dashboard.title').split(' ');
  const titleLead = titleParts.slice(0, -2).join(' ');
  const titleTail = titleParts.slice(-2).join(' ');

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
          </Button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge variant="outline" className="mb-2 gap-1">
                <Heart className="h-3 w-3 text-primary" /> EXECUTIVE MARRIAGE AUDIT
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
                {titleLead} <em className="text-primary not-italic italic">{titleTail}</em>
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {t('marriage.dashboard.subtitle')}
              </p>
            </div>
            <Button size="lg" onClick={() => navigate('/marriage/audit')}>
              <Plus className="h-4 w-4 mr-2" /> {t('marriage.dashboard.newAnalysis')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {!pLoad && !profile?.partner_name && (
          <Card className="p-5 bg-card border-l-4 border-l-yellow-500/60 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold">{t('marriage.dashboard.setupProfile')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('marriage.dashboard.setupProfileDesc')}
              </p>
              <Button variant="link" className="px-0 h-auto mt-1" onClick={() => navigate('/marriage/profile')}>
                {t('marriage.dashboard.setupProfileCta')}
              </Button>
            </div>
          </Card>
        )}

        {profile?.partner_name && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-card md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {language === 'en' ? 'Partner' : 'Partener'}
                </span>
              </div>
              <div className="font-display text-lg font-semibold">{profile.partner_name}</div>
              <div className="text-sm text-muted-foreground">
                {profile.relationship_years || '?'} {language === 'en' ? 'years' : 'ani'} • {profile.children_count || 0} {language === 'en' ? 'children' : 'copii'}
              </div>
              {profile.partner_love_language && (
                <Badge variant="outline" className="mt-2 text-[10px]">{profile.partner_love_language}</Badge>
              )}
              <Button variant="ghost" size="sm" className="mt-3 -ml-2" onClick={() => navigate('/marriage/profile')}>
                {language === 'en' ? 'Edit profile' : 'Editează profil'}
              </Button>
            </Card>

            <div className="md:col-span-2">
              {profile.axis_scores && Object.keys(profile.axis_scores).length > 0 ? (
                <AxisDiagnosisRadar axisScores={profile.axis_scores} />
              ) : (
                <Card className="p-5 bg-card h-full flex items-center justify-center text-center">
                  <div>
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'en'
                        ? 'Run your first analysis to see your 6-axis score'
                        : 'Rulează prima analiză pentru a vedea scorul pe 6 axe'}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* No-But Apreciere CTA — Credința Iubirii de Oameni */}
        <Card className="p-5 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent border-l-4 border-l-rose-500">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-rose-500" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {language === 'en'
                    ? 'Love Belief — Appreciation without BUT'
                    : 'Credința Iubirii — Apreciere fără DAR'}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold">
                {language === 'en' ? 'Before the next hard conversation' : 'Înainte de următoarea conversație grea'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'en'
                  ? `Write the appreciation you want to give ${profile?.partner_name || 'your partner'}. Coach detects the hidden "BUT" and reframes it PURE.`
                  : `Scrie aprecierea pe care vrei să i-o spui ${profile?.partner_name || 'partenerului'}. Coach detectează "DAR"-ul ascuns și o reformulează PUR.`}
              </p>
            </div>
            <Button size="sm" variant="default" className="gap-2" onClick={() => navigate('/credinte/apreciere-fara-dar')}>
              {language === 'en' ? 'Reframe' : 'Reformulează'} <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </Card>

        {profile?.recurring_patterns && profile.recurring_patterns.length > 0 && (
          <Card className="p-5 bg-card">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> {t('marriage.dashboard.recurringPatterns')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.recurring_patterns.slice(-10).map((p: any, i: number) => (
                <Badge key={i} variant={p.count > 2 ? 'destructive' : 'outline'} className="gap-1">
                  {p.key} · {p.count}x
                </Badge>
              ))}
            </div>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-semibold">{t('marriage.dashboard.historyTitle')}</h2>
            {sessions.length > 0 && (
              <Button variant="link" size="sm" onClick={() => navigate('/marriage/timeline')}>
                {language === 'en' ? 'See full timeline →' : 'Vezi timeline complet →'}
              </Button>
            )}
          </div>
          {sLoad ? (
            <Card className="p-5 bg-card text-sm text-muted-foreground">{t('marriage.dashboard.loading')}</Card>
          ) : sessions.length === 0 ? (
            <Card className="p-8 bg-card text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{t('marriage.dashboard.historyEmpty')}</p>
              <Button onClick={() => navigate('/marriage/audit')}>
                <Plus className="h-4 w-4 mr-2" /> {t('marriage.dashboard.newAnalysis')}
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map(s => (
                <Card key={s.id} className="p-4 bg-card hover:border-primary cursor-pointer transition-colors" onClick={() => navigate(`/marriage/audit?session=${s.id}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold truncate">{s.title}</h4>
                        {s.primary_destructured_axis && (
                          <Badge variant="outline" className="text-[10px]">{t('marriage.timeline.axis')} {s.primary_destructured_axis}</Badge>
                        )}
                        {s.pattern_recurrence > 1 && (
                          <Badge variant="destructive" className="text-[10px]">{language === 'en' ? 'Pattern' : 'Tipar'} {s.pattern_recurrence}x</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.factual_situation}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: dateLocale })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
