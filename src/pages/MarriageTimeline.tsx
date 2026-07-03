import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, Sparkles, History } from 'lucide-react';
import { useMarriageTimeline, useMarriageSessions } from '@/hooks/useMarriageStack';
import { format } from 'date-fns';
import { ro as roLocale, enUS as enLocale } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';

export default function MarriageTimeline() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { events, loading } = useMarriageTimeline();
  const { sessions } = useMarriageSessions();
  const dateLocale = language === 'en' ? enLocale : roLocale;

  const sessionMap = new Map(sessions.map(s => [s.id, s]));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/marriage')} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('marriage.profile.page.back')}
          </Button>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <History className="h-7 w-7 text-primary" /> {t('marriage.timeline.title')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('marriage.timeline.subtitle')}</p>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <Card className="p-5 bg-card text-sm text-muted-foreground">{t('marriage.timeline.loading')}</Card>
        ) : events.length === 0 ? (
          <Card className="p-8 bg-card text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t('marriage.timeline.empty')}</p>
          </Card>
        ) : (
          <div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {events.map((e: any) => {
              const session = e.session_id ? sessionMap.get(e.session_id) : null;
              return (
                <div key={e.id} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 text-primary" />
                  </div>
                  <Card className="p-4 bg-card cursor-pointer hover:border-primary transition-colors" onClick={() => session && navigate(`/marriage/audit?session=${session.id}`)}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-muted-foreground">{format(new Date(e.created_at), 'd MMM yyyy HH:mm', { locale: dateLocale })}</span>
                      {e.axis_affected && <Badge variant="outline" className="text-[10px]">{t('marriage.timeline.axis')} {e.axis_affected}</Badge>}
                      {e.distortion && <Badge variant="destructive" className="text-[10px]">{e.distortion}</Badge>}
                    </div>
                    <p className="text-sm">{e.description || session?.title || t('marriage.timeline.analyzedConflict')}</p>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
