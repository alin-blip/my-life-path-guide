import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { TodayDashboard } from '@/components/today/TodayDashboard';
import { DailyCheckinModal } from '@/components/today/DailyCheckinModal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Today = () => {
  const { user } = useAuth();
  const [showCheckin, setShowCheckin] = useState(false);

  useEffect(() => {
    const checkTodayCheckin = async () => {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
      
      if (!data) {
        setShowCheckin(true);
      }
    };

    checkTodayCheckin();
  }, [user]);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <TodayDashboard />
        <DailyCheckinModal 
          open={showCheckin} 
          onOpenChange={setShowCheckin} 
        />
      </div>
    </Layout>
  );
};

export default Today;
