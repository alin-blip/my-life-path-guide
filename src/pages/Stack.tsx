import React from 'react';
import { Layout } from '@/components/Layout';
import { Stack as PowerStack } from '@/components/Stack';
import { StackExplanation } from '@/components/stack/StackExplanation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { useDoor } from '@/context/DoorContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { AngerStack } from '@/components/stack/AngerStack';
import { AiLiveCoaching } from '@/components/stack/AiLiveCoaching';
import { HormoziCoachingStack } from '@/components/stack/HormoziCoachingStack';
import { GodsSchoolStack } from '@/components/stack/gods-school/GodsSchoolStack';
import { IntrospectionStack } from '@/components/stack/introspection-stack/IntrospectionStack';
import { useLocation } from 'react-router-dom';
import { DivinePrayerStack } from '@/components/stack/divine-stack/DivinePrayerStack';
import { MasterPlanStack } from '@/components/stack/master-plan/MasterPlanStack';
import { MasterPlanQuickStack } from '@/components/stack/master-plan/MasterPlanQuickStack';
import { GratitudeStack } from '@/components/stack/gratitude-stack/GratitudeStack';
import { DailyMasterStack } from '@/components/stack/daily-master/DailyMasterStack';
import { DivineGratitudeStack } from '@/components/stack/divine-gratitude/DivineGratitudeStack';
import { PathToSuccessStack } from '@/components/stack/path-to-success';
import { getWeek } from 'date-fns';

const CoachingPage = () => {
  const [activeTab, setActiveTab] = useState<string>("power-stacks");
  const [activeStack, setActiveStack] = useState<string>("divine-prayer");
  const [stackId, setStackId] = useState<string | null>(null);
  const [existingStack, setExistingStack] = useState<any>(null);
  const [isLoadingStack, setIsLoadingStack] = useState(false);
  const [stackMode, setStackMode] = useState<'audio' | 'text' | 'selecting'>('selecting');
  const [initialPrinciple, setInitialPrinciple] = useState<number | null>(null);
  const [challengeDay, setChallengeDay] = useState<number | null>(null);
  const { hitList, setHitList, hotList, setHotList } = useDoor();
  const { toast } = useToast();
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    if (supabase) {
      setIsSupabaseAvailable(true);
      createRequiredTables();
    }
    
    // Load saved stack mode preference
    const savedMode = localStorage.getItem('stack-preferred-mode') as 'audio' | 'text' | null;
    if (savedMode && !existingStack) {
      setStackMode(savedMode);
    }
    
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type');
    const idParam = searchParams.get('id');
    const sharedParam = searchParams.get('shared');
    const principleParam = searchParams.get('principle');
    const challengeDayParam = searchParams.get('challengeDay');
    
    // Store principle in state to pass to component
    if (principleParam) {
      setInitialPrinciple(parseInt(principleParam, 10));
    } else {
      setInitialPrinciple(null);
    }
    
    // Store challengeDay in state to pass to component
    if (challengeDayParam) {
      setChallengeDay(parseInt(challengeDayParam, 10));
    } else {
      setChallengeDay(null);
    }
    
    // Handle existing stack loading
    if (idParam) {
      setStackId(idParam);
      loadExistingStack(idParam);
    } else if (sharedParam) {
      loadSharedStack(sharedParam);
    }
    
    // Handle stack type selection
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
          case 'gratitude':
            setActiveStack('gratitude');
            break;
          case 'daily-master':
            setActiveStack('daily-master');
            break;
          case 'divine-gratitude':
            setActiveStack('divine-gratitude');
            break;
          case 'introspection':
            setActiveStack('introspection');
            break;
          case 'adaptive-transform':
            setActiveStack('adaptive-transform');
            break;
          case 'path-to-success':
            setActiveStack('path-to-success');
            break;

          // Backwards-compatible URLs
          case 'napoleon-hill':
          case 'master-plan':
            setActiveStack('napoleon-hill');
            break;
          case 'napoleon-hill-quick':
          case 'master-plan-quick':
            setActiveStack('napoleon-hill-quick');
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
  
  const loadExistingStack = async (stackId: string) => {
    setIsLoadingStack(true);
    try {
      if (import.meta.env.DEV) {
        console.log("🔍 Loading existing stack:", stackId);
      }
      
      // Try loading from Supabase first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: stackData, error } = await supabase
          .from('stack_library')
          .select('*')
          .eq('id', stackId)
          .single();
          
        if (stackData && !error) {
          if (import.meta.env.DEV) {
            console.log("📥 Stack loaded from Supabase:", stackData);
          }
          setExistingStack(stackData);
          setActiveStack(stackData.type || 'divine-prayer');
          setIsLoadingStack(false);
          return;
        }
      }
      
      // Fallback to localStorage
      const stackLibrary = JSON.parse(localStorage.getItem('stack_library') || '[]');
      const foundStack = stackLibrary.find((s: any) => s.id === stackId);
      
      if (foundStack) {
        if (import.meta.env.DEV) {
          console.log("📥 Stack loaded from localStorage:", foundStack);
        }
        setExistingStack(foundStack);
        setActiveStack(foundStack.type || 'divine-prayer');
      } else {
        if (import.meta.env.DEV) {
          console.warn("⚠️ Stack not found:", stackId);
        }
        toast({
          title: "Stack nu a fost găsit",
          description: "Stack-ul solicitat nu există sau nu aveți acces la el.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error loading stack:", error);
      toast({
        title: "Eroare la încărcare",
        description: "Nu s-a putut încărca stack-ul. Încercați din nou.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStack(false);
    }
  };

  const loadSharedStack = async (shareId: string) => {
    // Implementation for shared stacks - can be added later
    console.log("Loading shared stack:", shareId);
  };

  const addActionToHitList = async (actionText: string) => {
    if (!actionText.trim()) {
      toast({
        title: "Text gol",
        description: "Vă rugăm să introduceți o acțiune validă.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (import.meta.env.DEV) {
        console.log("🔥 Adding action to HOT list:", actionText);
      }
      
      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (import.meta.env.DEV) {
          console.warn("⚠️ User not authenticated for HOT list save");
        }
        toast({
          title: "Autentificare necesară",
          description: "Trebuie să fiți autentificat pentru a salva acțiuni.",
          variant: "destructive",
        });
        return;
      }
      
      const newHotItem = {
        id: `stack-${Date.now()}`,
        text: actionText,
        priority: 'none' as any,
        selected: false,
        isKeyPoint: false
      };
      
      // Update local state immediately
      setHotList(prev => [...prev, newHotItem]);
      if (import.meta.env.DEV) {
        console.log("✅ Local HOT list updated");
      }
      
      // Save to database with better error handling
      try {
        const now = new Date();
        const currentWeekKey = `door-week-${now.getFullYear()}-${getWeek(now)}`;
        
        if (import.meta.env.DEV) {
          console.log("💾 Saving to database with week key:", currentWeekKey);
        }
        
        await doorUserTasksService.addIdeaToWeek(currentWeekKey, {
          id: newHotItem.id,
          text: newHotItem.text,
          category: 'hot',
          priority: 'none' as any
        });
        
        if (import.meta.env.DEV) {
          console.log("✅ Saved to Supabase successfully");
        }
        
        // Update localStorage for immediate UI sync
        const savedWeekData = localStorage.getItem(currentWeekKey);
        let weekData = savedWeekData ? JSON.parse(savedWeekData) : {};
        weekData.hotList = [...(weekData.hotList || []), newHotItem];
        localStorage.setItem(currentWeekKey, JSON.stringify(weekData));
        
        if (import.meta.env.DEV) {
          console.log("✅ localStorage updated");
        }
        
        // Trigger event for Door interface updates
        window.dispatchEvent(new CustomEvent('doorDataUpdated', { 
          detail: { type: 'ideaAdded', idea: newHotItem } 
        }));
        
        if (import.meta.env.DEV) {
          console.log("✅ Door update event dispatched");
        }
        
        toast({
          title: "✅ Acțiune adăugată cu succes",
          description: "Acțiunea a fost salvată în Hot List și se va sincroniza cu Door.",
        });
        
      } catch (dbError: any) {
        console.error("❌ Database save error:", dbError);
        
        // Remove from local state since DB save failed
        setHotList(prev => prev.filter(item => item.id !== newHotItem.id));
        
        toast({
          title: "⚠️ Eroare la salvare",
          description: `Nu s-a putut salva în baza de date: ${dbError.message || 'Eroare necunoscută'}`,
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error("❌ General error adding to HOT list:", error);
      toast({
        title: "❌ Eroare generală",
        description: `Nu s-a putut adăuga acțiunea: ${error.message || 'Eroare necunoscută'}`,
        variant: "destructive",
      });
    }
  };

  const handleModeSelection = (selectedMode: 'audio' | 'text') => {
    setStackMode(selectedMode);
    localStorage.setItem('stack-preferred-mode', selectedMode);
  };

const renderActiveStack = () => {
    if (import.meta.env.DEV) {
      console.log("🎨 Rendering active stack:", activeStack, "with existing data:", !!existingStack);
    }
    
    if (isLoadingStack) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span className="ml-4 text-white">Se încarcă stack-ul...</span>
        </div>
      );
    }
    
    const stackProps = {
      onAddToHitList: addActionToHitList,
      existingData: existingStack,
      isReadOnly: !!existingStack,
      stackId: stackId,
      mode: stackMode === 'selecting' ? 'text' : stackMode
    };
    
    switch(activeStack) {
      case "anger":
        return <AngerStack {...stackProps} />;
      case "ai-live":
        return <AiLiveCoaching {...stackProps} />;
      case "hormozi-coaching":
        return <HormoziCoachingStack {...stackProps} />;
      case "gods-school":
        return <GodsSchoolStack {...stackProps} />;
      case "divine-prayer":
        return <DivinePrayerStack {...stackProps} />;
      case "gratitude":
        return <GratitudeStack {...stackProps} />;
      case "daily-master":
        return <DailyMasterStack {...stackProps} />;
      case "divine-gratitude":
        return <DivineGratitudeStack {...stackProps} />;
      case "introspection":
        return <IntrospectionStack {...stackProps} />;
      case "adaptive-transform":
        return <AiLiveCoaching {...stackProps} stackType="adaptive-transform" />;
      case "path-to-success":
        return <PathToSuccessStack onAddToHitList={stackProps.onAddToHitList} />;
      case "napoleon-hill":
        return <MasterPlanStack {...stackProps} />;
      case "napoleon-hill-quick":
        return <MasterPlanQuickStack {...stackProps} initialPrinciple={initialPrinciple} challengeDay={challengeDay} />;
      default:
        return <DivinePrayerStack {...stackProps} />;
    }
  };
  
  return (
    <Layout>
      <div className="min-h-screen w-full">
        {existingStack && (
          <div className="bg-blue-900/20 border-b border-blue-700 p-4 mb-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-blue-300 mb-2">
                📖 Vizualizare Stack Salvat
              </h2>
              <p className="text-blue-200 text-sm mb-3">
                Acest stack a fost salvat la {new Date(existingStack.created_at).toLocaleDateString('ro-RO')}. 
                Poți vedea răspunsurile și să creezi un stack nou bazat pe acesta.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setExistingStack(null);
                    setStackId(null);
                    window.history.replaceState({}, '', '/stack');
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  ✨ Creează Stack Nou
                </button>
                <button 
                  onClick={() => {
                    window.history.back();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  ← Înapoi la Bibliotecă
                </button>
              </div>
            </div>
          </div>
        )}
        {renderActiveStack()}
      </div>
    </Layout>
  );
};

export default CoachingPage;
