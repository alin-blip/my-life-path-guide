import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Sparkles, Zap, Target, Heart } from 'lucide-react';
import { MindCoachChat } from '@/components/mind-coach/MindCoachChat';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getISOWeek, getYear, startOfWeek } from 'date-fns';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureLimitBanner } from '@/components/FeatureLimitBanner';

export default function MindCoach() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { status: accessStatus, consume: consumeMindCoach } = useFeatureAccess('mind_coach');
  const sessionConsumedRef = useRef(false);

  const handleAddToHitList = async (task: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current week key using correct ISO week calculation
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekNum = getISOWeek(weekStart);
      const year = getYear(weekStart);
      const weekKey = `door-week-${year}-${String(weekNum).padStart(2, '0')}`;
      
      // Get day abbreviation
      const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
      const dayOfWeek = days[now.getDay()];

      await supabase.from('user_tasks').insert({
        user_id: user.id,
        title: task,
        task_type: 'hit',
        list_type: 'hit',
        day_of_week: dayOfWeek,
        week_key: weekKey,
        priority: 1,
        completed: false,
      });

      toast.success('Acțiune adăugată în HIT List! 🎯');
    } catch (error) {
      console.error('Error adding to HIT list:', error);
      toast.error('Eroare la adăugarea în HIT List');
    }
  };

  const handleAddHabit = async (name: string, category: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('daily_habits').insert({
        user_id: user.id,
        name: name,
        category: category,
        habit_group: 'custom',
        is_active: true,
      });

      toast.success('Obicei nou adăugat! 💪');
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Eroare la adăugarea obiceiului');
    }
  };

  const handleComplete = (breakthrough: any) => {
    console.log('Breakthrough complete:', breakthrough);
    toast.success('Transformare completă! 🎉');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            navigate(-1);
          }}
          className="mb-6"
          type="button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'ro' ? 'Înapoi' : 'Back'}
        </Button>

        {/* Unified premium shell: header + 4-step + chat, joined by gold hairline dividers */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-[0_1px_0_0_hsl(var(--primary)/0.15)_inset,0_20px_60px_-30px_hsl(var(--primary)/0.35)]">
          {/* top gold hairline */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          {/* subtle radial gold glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />

          {/* Header */}
          <div className="relative px-6 md:px-10 pt-10 pb-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-1.5 rounded-full">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-mono text-xs uppercase tracking-[0.2em] text-primary">Mind Coach</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
              {language === 'ro'
                ? <>Transformă orice emoție <em className="text-primary not-italic font-display italic">în putere</em></>
                : <>Transform any emotion <em className="text-primary not-italic font-display italic">into power</em></>}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {language === 'ro'
                ? 'Metodologia Tony Robbins pentru a transforma frica, furia, tristețea sau procrastinarea în energie și acțiune concretă.'
                : 'Tony Robbins methodology to transform fear, anger, sadness, or procrastination into energy and concrete action.'}
            </p>
          </div>

          {/* gold divider */}
          <div className="mx-6 md:mx-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* 4-step grid */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-px bg-primary/15 mx-6 md:mx-10 my-6 rounded-lg overflow-hidden border border-primary/15">
            {[
              { icon: Target, label: language === 'ro' ? 'Identifică' : 'Identify', desc: language === 'ro' ? 'Ce simți' : 'What you feel' },
              { icon: Sparkles, label: language === 'ro' ? 'Clarifică' : 'Clarify', desc: language === 'ro' ? 'Fapte vs Povești' : 'Facts vs Stories' },
              { icon: Zap, label: language === 'ro' ? 'Transformă' : 'Transform', desc: language === 'ro' ? 'În putere' : 'Into power' },
              { icon: Heart, label: language === 'ro' ? 'Acționează' : 'Act', desc: language === 'ro' ? 'Concret' : 'Concretely' },
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-4 bg-card">
                <feature.icon className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-mono text-xs uppercase tracking-wider text-foreground">{feature.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* gold divider */}
          <div className="mx-6 md:mx-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Chat */}
          <div className="relative px-4 md:px-8 py-8">
            <div className="max-w-2xl mx-auto space-y-4">
              <FeatureLimitBanner
                status={accessStatus}
                featureLabel={language === 'ro' ? 'sesiuni Mind Coach' : 'Mind Coach sessions'}
              />
              {accessStatus && !accessStatus.unlimited && !accessStatus.allowed ? (
                <div className="rounded-xl border border-border/60 bg-card/50 p-8 text-center text-sm text-muted-foreground">
                  {language === 'ro'
                    ? 'Ai folosit toate sesiunile Mind Coach din plan. Fă upgrade pentru acces nelimitat.'
                    : 'You\'ve used all Mind Coach sessions in your plan. Upgrade for unlimited access.'}
                </div>
              ) : (
                <div
                  onClickCapture={async () => {
                    if (sessionConsumedRef.current) return;
                    if (!accessStatus || accessStatus.unlimited) {
                      sessionConsumedRef.current = true;
                      return;
                    }
                    sessionConsumedRef.current = true;
                    const allowed = await consumeMindCoach();
                    if (!allowed) {
                      toast.error(
                        language === 'ro'
                          ? 'Ai atins limita lunară pentru Mind Coach.'
                          : 'You reached this month\'s Mind Coach limit.',
                      );
                    }
                  }}
                >
                  <MindCoachChat
                    onAddToHitList={handleAddToHitList}
                    onAddHabit={handleAddHabit}
                    onComplete={handleComplete}
                    language={language === 'ro' ? 'ro' : 'en'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 border border-border/60 bg-card/60 rounded-lg p-4 text-center max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            {language === 'ro'
              ? 'Mind Coach folosește metodologia Tony Robbins în 5 pași: Identificare → Investigare → Clarificare → Transformare → Acțiune'
              : 'Mind Coach uses Tony Robbins methodology in 5 steps: Identification → Investigation → Clarification → Transformation → Action'}
          </p>
        </div>
      </div>
    </div>
  );
}
