
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
      case "divine-prayer":
        return <DivinePrayerStack onAddToHitList={addActionToHitList} />;
      default:
        return <DivinePrayerStack onAddToHitList={addActionToHitList} />;
    }
  };
  
  return (
    <Layout>
      <div className="w-full min-h-screen">
        {/* Header complet pentru mobile și desktop */}
        <div className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 bg-gradient-to-br from-[#1e2943] to-[#131a2c] border-b border-[#273043]">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Introspecție
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-full sm:max-w-md">
                Use our AI coaching tools to gain clarity, transform challenges, and create breakthroughs in your life.
              </p>
            </div>
            
            {/* Stack selector - optimizat pentru mobile */}
            <div className="w-full">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button 
                  onClick={() => setActiveStack("anger")}
                  className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-all flex-1 sm:flex-none min-w-0 ${
                    activeStack === "anger" 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  Stack de Furie
                </button>
                <button 
                  onClick={() => setActiveStack("divine-prayer")}
                  className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-all flex-1 sm:flex-none min-w-0 ${
                    activeStack === "divine-prayer" 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  Stack de Rugăciune
                </button>
                <button 
                  onClick={() => setActiveStack("ai-live")}
                  className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-all flex-1 sm:flex-none min-w-0 ${
                    activeStack === "ai-live" 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  Stack de Deblocare
                </button>
              </div>
            </div>
            
            {!isSupabaseAvailable && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 sm:p-4">
                <p className="text-yellow-300 text-xs sm:text-sm">
                  Note: For enhanced features including session history and cloud backup, connect your account to Supabase.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Explanation section - ascuns pe mobile pentru a economisi spațiu */}
        <div className="hidden md:block px-2 sm:px-4 lg:px-6 py-3 bg-background/50">
          <StackExplanation />
        </div>
        
        {/* Main stack content - full width */}
        <div className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="w-full max-w-none">
            {renderActiveStack()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoachingPage;
