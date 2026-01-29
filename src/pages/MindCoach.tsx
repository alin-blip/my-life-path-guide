import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Sparkles, Zap, Target, Heart } from 'lucide-react';
import { MindCoachChat } from '@/components/mind-coach/MindCoachChat';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function MindCoach() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleAddToHitList = async (task: string, priority?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current week key
      const now = new Date();
      const weekKey = `door-week-${now.getFullYear()}-${String(Math.ceil((now.getDate() + now.getDay()) / 7)).padStart(2, '0')}`;
      
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
        priority: priority === 'urgent' ? 1 : priority === 'important' ? 2 : 3,
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ro' ? 'Înapoi' : 'Back'}
          </Button>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Mind Coach</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">
              {language === 'ro' 
                ? 'Transformă Orice Emoție în Putere' 
                : 'Transform Any Emotion Into Power'}
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto">
              {language === 'ro'
                ? 'Metodologia Tony Robbins pentru a transforma frica, furia, tristețea sau procrastinarea în energie și acțiune concretă.'
                : 'Tony Robbins methodology to transform fear, anger, sadness, or procrastination into energy and concrete action.'}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Target, label: language === 'ro' ? 'Identifică' : 'Identify', desc: language === 'ro' ? 'Ce simți' : 'What you feel' },
              { icon: Sparkles, label: language === 'ro' ? 'Clarifică' : 'Clarify', desc: language === 'ro' ? 'Fapte vs Povești' : 'Facts vs Stories' },
              { icon: Zap, label: language === 'ro' ? 'Transformă' : 'Transform', desc: language === 'ro' ? 'În putere' : 'Into power' },
              { icon: Heart, label: language === 'ro' ? 'Acționează' : 'Act', desc: language === 'ro' ? 'Concret' : 'Concretely' },
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-3 rounded-xl bg-background/50 border">
                <feature.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="font-medium text-sm">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mind Coach Chat */}
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <MindCoachChat
          onAddToHitList={handleAddToHitList}
          onAddHabit={handleAddHabit}
          onComplete={handleComplete}
          language={language === 'ro' ? 'ro' : 'en'}
        />
      </div>

      {/* Bottom info */}
      <div className="container max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {language === 'ro'
              ? '💡 Mind Coach folosește metodologia Tony Robbins pentru transformare emoțională în 5 pași: Identificare → Investigare → Clarificare → Transformare → Acțiune'
              : '💡 Mind Coach uses Tony Robbins methodology for emotional transformation in 5 steps: Identification → Investigation → Clarification → Transformation → Action'}
          </p>
        </div>
      </div>
    </div>
  );
}
