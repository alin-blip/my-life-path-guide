import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getPersonalPowerDay, implementedDays } from '@/data/personalPowerContent';
import { PersonalPowerLesson } from '@/components/personal-power/PersonalPowerLesson';
import { PersonalPowerExercise } from '@/components/personal-power/PersonalPowerExercise';
import { PersonalPowerCoach } from '@/components/personal-power/PersonalPowerCoach';
import { PersonalPowerBreakthrough } from '@/components/personal-power/PersonalPowerBreakthrough';
import { PersonalPowerSidebar } from '@/components/personal-power/PersonalPowerSidebar';
import { LessonCommunityPost } from '@/components/programs/LessonCommunityPost';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ClipboardList, Sparkles, Lightbulb, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PersonalPowerDayPage: React.FC = () => {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const dayNumber = parseInt(day || '1', 10);
  const dayData = getPersonalPowerDay(dayNumber);

  const [progress, setProgress] = useState<{
    lesson_completed: boolean;
    exercise_completed: boolean;
    coaching_completed: boolean;
    breakthrough_completed: boolean;
    exercise_responses: Record<string, string>;
    breakthrough_text: string;
  }>({
    lesson_completed: false,
    exercise_completed: false,
    coaching_completed: false,
    breakthrough_completed: false,
    exercise_responses: {},
    breakthrough_text: '',
  });

  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('lesson');

  // Fetch progress
  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      const { data } = await supabase
        .from('personal_power_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_number', dayNumber)
        .maybeSingle();

      if (data) {
        setProgress({
          lesson_completed: data.lesson_completed || false,
          exercise_completed: data.exercise_completed || false,
          coaching_completed: data.coaching_completed || false,
          breakthrough_completed: data.breakthrough_completed || false,
          exercise_responses: (data.exercise_responses as Record<string, string>) || {},
          breakthrough_text: data.breakthrough_text || '',
        });
      }

      // Fetch all completed days for sidebar
      const { data: allProgress } = await supabase
        .from('personal_power_progress')
        .select('day_number')
        .eq('user_id', user.id)
        .eq('lesson_completed', true);

      setCompletedDays(allProgress?.map(p => p.day_number) || []);
    };

    fetchProgress();
  }, [user, dayNumber]);

  const updateProgress = async (updates: Partial<typeof progress>) => {
    if (!user) return;

    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);

    const { error } = await supabase
      .from('personal_power_progress')
      .upsert({
        user_id: user.id,
        day_number: dayNumber,
        lesson_completed: newProgress.lesson_completed,
        exercise_completed: newProgress.exercise_completed,
        coaching_completed: newProgress.coaching_completed,
        breakthrough_completed: newProgress.breakthrough_completed,
        exercise_responses: newProgress.exercise_responses,
        breakthrough_text: newProgress.breakthrough_text,
      }, { onConflict: 'user_id,day_number' });

    if (error) {
      console.error('Error saving progress:', error);
    }
  };

  if (!dayData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            {language === 'ro' ? 'Această zi nu este disponibilă încă.' : 'This day is not available yet.'}
          </p>
          <Button onClick={() => navigate('/personal-power')} variant="outline">
            {language === 'ro' ? 'Înapoi la curs' : 'Back to course'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <PersonalPowerSidebar currentDay={dayNumber} completedDays={completedDays} />

          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Header */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-1">
                Personal Power Plus • {language === 'ro' ? 'Ziua' : 'Day'} {dayNumber}/30
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                {language === 'ro' ? dayData.title : dayData.titleEn}
              </h1>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full flex overflow-x-auto">
                <TabsTrigger value="lesson" className="flex-1 gap-1 text-xs sm:text-sm">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'ro' ? 'Lecția' : 'Lesson'}</span>
                </TabsTrigger>
                <TabsTrigger value="exercise" className="flex-1 gap-1 text-xs sm:text-sm">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'ro' ? 'Exerciții' : 'Exercises'}</span>
                </TabsTrigger>
                <TabsTrigger value="coach" className="flex-1 gap-1 text-xs sm:text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Coach</span>
                </TabsTrigger>
                <TabsTrigger value="breakthrough" className="flex-1 gap-1 text-xs sm:text-sm">
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden sm:inline">Breakthrough</span>
                </TabsTrigger>
                <TabsTrigger value="discussion" className="flex-1 gap-1 text-xs sm:text-sm">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'ro' ? 'Discuții' : 'Discussion'}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lesson">
                <PersonalPowerLesson
                  dayData={dayData}
                  completed={progress.lesson_completed}
                  onComplete={() => { updateProgress({ lesson_completed: true }); setActiveTab('exercise'); }}
                />
              </TabsContent>

              <TabsContent value="exercise">
                <PersonalPowerExercise
                  dayData={dayData}
                  exerciseResponses={progress.exercise_responses}
                  completed={progress.exercise_completed}
                  onSave={(responses) => updateProgress({ exercise_responses: responses })}
                  onComplete={() => { updateProgress({ exercise_completed: true }); setActiveTab('coach'); }}
                />
              </TabsContent>

              <TabsContent value="coach">
                <PersonalPowerCoach
                  dayData={dayData}
                  exerciseResponses={progress.exercise_responses}
                  completed={progress.coaching_completed}
                  onComplete={() => { updateProgress({ coaching_completed: true }); setActiveTab('breakthrough'); }}
                />
              </TabsContent>

              <TabsContent value="breakthrough">
                <PersonalPowerBreakthrough
                  dayData={dayData}
                  breakthroughText={progress.breakthrough_text}
                  completed={progress.breakthrough_completed}
                  onSave={(text) => updateProgress({ breakthrough_text: text, breakthrough_completed: true })}
                />
              </TabsContent>

              <TabsContent value="discussion">
                <LessonCommunityPost
                  dayNumber={dayNumber}
                  dayTitle={language === 'ro' ? dayData.title : dayData.titleEn}
                  courseName="Personal Power Plus"
                  sourcePrefix="personal-power"
                  postCategory="general"
                />
              </TabsContent>
            </Tabs>

            {/* Nav buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => navigate(`/personal-power/${dayNumber - 1}`)}
                disabled={dayNumber <= 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {language === 'ro' ? 'Ziua anterioară' : 'Previous day'}
              </Button>
              <Button
                onClick={() => navigate(`/personal-power/${dayNumber + 1}`)}
                disabled={dayNumber >= implementedDays}
                className="gap-2"
              >
                {language === 'ro' ? 'Ziua următoare' : 'Next day'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day 1 CTA */}
            {dayNumber === 1 && (
              <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <p className="text-foreground font-medium mb-3">
                  {language === 'ro'
                    ? '👋 Prezintă-te în comunitate! Spune-ne cine ești, de unde ești și ce te-a adus aici.'
                    : '👋 Introduce yourself in the community! Tell us who you are, where you\'re from, and what brought you here.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/programs?tab=community')}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {language === 'ro' ? 'Mergi la Comunitate' : 'Go to Community'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalPowerDayPage;
