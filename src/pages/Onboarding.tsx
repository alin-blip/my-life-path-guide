import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          if (data.is_completed) {
            navigate('/azi');
            return;
          }
          setCurrentDay(data.current_day);
          setCompletedDays(data.completed_days || []);
        } else {
          // Create initial onboarding record
          await supabase.from('onboarding_progress').insert({
            user_id: user.id,
            current_day: 1,
            completed_days: [],
          });
        }
      } catch (error) {
        console.error('Error fetching onboarding progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, navigate]);

  const handleDayComplete = async (day: number) => {
    if (!user) return;

    const newCompletedDays = [...completedDays, day];
    const nextDay = day + 1;
    const isComplete = nextDay > 7;

    try {
      await supabase
        .from('onboarding_progress')
        .update({
          completed_days: newCompletedDays,
          current_day: isComplete ? 7 : nextDay,
          is_completed: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
        })
        .eq('user_id', user.id);

      setCompletedDays(newCompletedDays);
      
      if (isComplete) {
        navigate('/azi');
      } else {
        setCurrentDay(nextDay);
      }
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <OnboardingFlow
          currentDay={currentDay}
          completedDays={completedDays}
          onDayComplete={handleDayComplete}
        />
      </div>
    </Layout>
  );
};

export default Onboarding;
