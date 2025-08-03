
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
import { StackTodoWidget } from '@/components/stack/StackTodoWidget';

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
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AngerStack onAddToHitList={addActionToHitList} />
            </div>
            <div className="lg:col-span-1">
              <StackTodoWidget onAddToHitList={addActionToHitList} />
            </div>
          </div>
        );
      case "ai-live":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AiLiveCoaching onAddToHitList={addActionToHitList} />
            </div>
            <div className="lg:col-span-1">
              <StackTodoWidget onAddToHitList={addActionToHitList} />
            </div>
          </div>
        );
      case "divine-prayer":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DivinePrayerStack onAddToHitList={addActionToHitList} />
            </div>
            <div className="lg:col-span-1">
              <StackTodoWidget onAddToHitList={addActionToHitList} />
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DivinePrayerStack onAddToHitList={addActionToHitList} />
            </div>
            <div className="lg:col-span-1">
              <StackTodoWidget onAddToHitList={addActionToHitList} />
    </div>
          </div>
        );
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Introspecție
          </h1>
          <p className="text-muted-foreground max-w-md">
            Use our AI coaching tools to gain clarity, transform challenges, and create breakthroughs in your life.
          </p>
        </div>
        
        <StackExplanation />
        
        <div className="space-y-8">
          <Card className="dashboard-card border-[#273043] overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="p-4 bg-gradient-to-br from-[#1e2943] to-[#131a2c] border-b border-[#273043]">
                <Tabs defaultValue="power-stacks" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-[#1a2135]/60 border border-blue-500/10 w-full mb-6 backdrop-blur-sm">
                    <TabsTrigger 
                      value="power-stacks" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-blue-400/10 data-[state=active]:text-blue-400 transition-all duration-300"
                    >
                      Power Stacks
                    </TabsTrigger>
                  </TabsList>
                
                  <TabsContent value="power-stacks" className="p-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 mb-4">
                      Power Stacks
                    </h2>
                    <p className="text-gray-300 text-sm mb-6">
                      Gain clarity, perspective and breakthrough insights through guided coaching
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      <button 
                        onClick={() => setActiveStack("anger")}
                        className={`px-4 py-2 rounded-md transition-all ${activeStack === "anger" ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                      >
                        Stack de Furie
                      </button>
                      <button 
                        onClick={() => setActiveStack("divine-prayer")}
                        className={`px-4 py-2 rounded-md transition-all ${activeStack === "divine-prayer" ? 'bg-indigo-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                      >
                        Stack de Rugăciune
                      </button>
                      <button 
                        onClick={() => setActiveStack("ai-live")}
                        className={`px-4 py-2 rounded-md transition-all ${activeStack === "ai-live" ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                      >
                        Stack de Deblocare
                      </button>
                    </div>
                    
                    {!isSupabaseAvailable && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 mb-6">
                        <p className="text-yellow-300 text-sm">
                          Note: For enhanced features including session history and cloud backup, connect your account to Supabase.
                        </p>
                      </div>
                    )}
                    
                    {renderActiveStack()}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Widget flotant pentru mobile */}
        <div className="lg:hidden">
          <StackTodoWidget onAddToHitList={addActionToHitList} isMinimized={true} />
        </div>
      </div>
    </Layout>
  );
};

export default CoachingPage;
