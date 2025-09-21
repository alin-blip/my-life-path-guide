
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
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { AngerStack } from '@/components/stack/AngerStack';
import { AiLiveCoaching } from '@/components/stack/AiLiveCoaching';
import { HormoziCoachingStack } from '@/components/stack/HormoziCoachingStack';
import { GodsSchoolStack } from '@/components/stack/gods-school/GodsSchoolStack';
import { useLocation } from 'react-router-dom';
import { DivinePrayerStack } from '@/components/stack/divine-stack/DivinePrayerStack';
import { getWeek } from 'date-fns';

const CoachingPage = () => {
  const [activeTab, setActiveTab] = useState<string>("power-stacks");
  const [activeStack, setActiveStack] = useState<string>("divine-prayer");
  const [stackId, setStackId] = useState<string | null>(null);
  const [existingStack, setExistingStack] = useState<any>(null);
  const [isLoadingStack, setIsLoadingStack] = useState(false);
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
    const idParam = searchParams.get('id');
    const sharedParam = searchParams.get('shared');
    
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
      console.log("🔍 Loading existing stack:", stackId);
      
      // Try loading from Supabase first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: stackData, error } = await supabase
          .from('stack_library')
          .select('*')
          .eq('id', stackId)
          .single();
          
        if (stackData && !error) {
          console.log("📥 Stack loaded from Supabase:", stackData);
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
        console.log("📥 Stack loaded from localStorage:", foundStack);
        setExistingStack(foundStack);
        setActiveStack(foundStack.type || 'divine-prayer');
      } else {
        console.warn("⚠️ Stack not found:", stackId);
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
      console.log("🎯 Adding action to HIT list:", actionText);
      
      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.warn("⚠️ User not authenticated for HIT list save");
        toast({
          title: "Autentificare necesară",
          description: "Trebuie să fiți autentificat pentru a salva acțiuni.",
          variant: "destructive",
        });
        return;
      }
      
      const newHitItem = {
        id: `stack-${Date.now()}`,
        text: actionText,
        day: 'M' as any,
        completed: false
      };
      
      // Update local state immediately
      setHitList(prev => [...prev, newHitItem]);
      console.log("✅ Local HIT list updated");
      
      // Save to database with better error handling
      try {
        const now = new Date();
        const currentWeekKey = `door-week-${now.getFullYear()}-${getWeek(now)}`;
        
        console.log("💾 Saving to database with week key:", currentWeekKey);
        
        await doorUserTasksService.addIdeaToWeek(currentWeekKey, {
          id: newHitItem.id,
          text: newHitItem.text,
          category: 'hit',
          priority: 'none' as any,
          day: newHitItem.day
        });
        
        console.log("✅ Saved to Supabase successfully");
        
        // Update localStorage for immediate UI sync
        const savedWeekData = localStorage.getItem(currentWeekKey);
        let weekData = savedWeekData ? JSON.parse(savedWeekData) : {};
        weekData.hitList = [...(weekData.hitList || []), newHitItem];
        localStorage.setItem(currentWeekKey, JSON.stringify(weekData));
        
        console.log("✅ localStorage updated");
        
        // Trigger event for Door interface updates
        window.dispatchEvent(new CustomEvent('doorDataUpdated', { 
          detail: { type: 'ideaAdded', idea: newHitItem } 
        }));
        
        console.log("✅ Door update event dispatched");
        
        toast({
          title: "✅ Acțiune adăugată cu succes",
          description: "Acțiunea a fost salvată în lista ta HIT și se va sincroniza cu Door.",
        });
        
      } catch (dbError: any) {
        console.error("❌ Database save error:", dbError);
        
        // Remove from local state since DB save failed
        setHitList(prev => prev.filter(item => item.id !== newHitItem.id));
        
        toast({
          title: "⚠️ Eroare la salvare",
          description: `Nu s-a putut salva în baza de date: ${dbError.message || 'Eroare necunoscută'}`,
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error("❌ General error adding to HIT list:", error);
      toast({
        title: "❌ Eroare generală",
        description: `Nu s-a putut adăuga acțiunea: ${error.message || 'Eroare necunoscută'}`,
        variant: "destructive",
      });
    }
  };

  const renderActiveStack = () => {
    console.log("🎨 Rendering active stack:", activeStack, "with existing data:", !!existingStack);
    
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
      stackId: stackId
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
