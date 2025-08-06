
import React from 'react';
import { Layout } from '@/components/Layout';
import { Stack as PowerStack } from '@/components/Stack';
import { StackExplanation } from '@/components/stack/StackExplanation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { useDoorContent } from '@/hooks/useDoorContent';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { AngerStack } from '@/components/stack/AngerStack';
import { AiLiveCoaching } from '@/components/stack/AiLiveCoaching';
import { HormoziCoachingStack } from '@/components/stack/HormoziCoachingStack';
import { GodsSchoolStack } from '@/components/stack/gods-school/GodsSchoolStack';
import { useLocation } from 'react-router-dom';
import { DivinePrayerStack } from '@/components/stack/divine-stack/DivinePrayerStack';

const CoachingPage = () => {
  const [activeTab, setActiveTab] = useState<string>("power-stacks");
  const [activeStack, setActiveStack] = useState<string>("divine-prayer");
  const { hitList, setHitList } = useDoorContent();
  const { toast } = useToast();
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    if (supabase) {
      setIsSupabaseAvailable(true);
      createRequiredTables();
    }
    
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type');
    
    if (typeParam) {
      switch (typeParam) {
        case 'anger':
          setActiveStack('anger');
          break;
        case 'divine-prayer':
          setActiveStack('divine-prayer');
          break;
        case 'ai-live':
          setActiveStack('ai-live');
          break;
        case 'hormozi-coaching':
          setActiveStack('hormozi-coaching');
          break;
        case 'gods-school':
          setActiveStack('gods-school');
          break;
        default:
          setActiveStack('divine-prayer');
      }
    }
  }, [location]);
  
  const createRequiredTables = async () => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('divine_coaching_sessions')
        .select('count')
        .limit(1);
      
      if (error) {
        console.info("Table divine_coaching_sessions might not exist. This is expected if it's a new project.");
      }
    } catch (error) {
      console.error("Error checking for divine_coaching_sessions table:", error);
    }
  };
  
  const addActionToHitList = (actionText: string) => {
    if (actionText.trim()) {
      try {
        console.log("Adding action to HIT list:", actionText);
        
        const newHitItem = {
          id: `stack-${Date.now()}`,
          text: actionText,
          day: 'M' as any,
          completed: false
        };
        
        setHitList(prev => [...prev, newHitItem]);
        
        try {
          const currentWeekKey = `door-week-${new Date().getFullYear()}-${Math.ceil((new Date().getDate() + new Date().getDay()) / 7)}`;
          const savedWeekData = localStorage.getItem(currentWeekKey);
          
          if (savedWeekData) {
            const weekData = JSON.parse(savedWeekData);
            weekData.hitList = [...(weekData.hitList || []), newHitItem];
            localStorage.setItem(currentWeekKey, JSON.stringify(weekData));
          }
        } catch (error) {
          console.error("Error saving to local storage:", error);
        }
        
        toast({
          title: "Action added to HIT list",
          description: "Your committed action has been successfully added to your HIT list.",
        });
      } catch (error) {
        console.error("Error adding action to HIT list:", error);
        toast({
          title: "Error",
          description: "Could not add action to HIT list. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const renderActiveStack = () => {
    console.log("Rendering active stack:", activeStack);
    switch(activeStack) {
      case "anger":
        return <AngerStack onAddToHitList={addActionToHitList} />;
      case "ai-live":
        return <AiLiveCoaching onAddToHitList={addActionToHitList} />;
      case "hormozi-coaching":
        return <HormoziCoachingStack onAddToHitList={addActionToHitList} />;
      case "gods-school":
        return <GodsSchoolStack onAddToHitList={addActionToHitList} />;
      case "divine-prayer":
        return <DivinePrayerStack onAddToHitList={addActionToHitList} />;
      default:
        return <DivinePrayerStack onAddToHitList={addActionToHitList} />;
    }
  };
  
  return (
    <Layout>
      <div className="min-h-screen w-full">
        {renderActiveStack()}
      </div>
    </Layout>
  );
};

export default CoachingPage;
