import React, { useState, useEffect } from 'react';
import { MasterPlanStackProps } from './types';
import { getQuestions } from './questions';
import { AiGuidedStack } from '../AiGuidedStack';
import { StackIdeaModal } from '../StackIdeaModal';
import { MasterPlanExplanation } from './MasterPlanExplanation';
import { MasterPlanKnowledgeBase } from './MasterPlanKnowledgeBase';
import { StackProgressIndicator } from '../StackProgressIndicator';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Upload } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

export const MasterPlanStack: React.FC<MasterPlanStackProps> = ({ 
  onAddToHitList,
  existingData,
  isReadOnly,
  stackId 
}) => {
  const {
    isIdeaModalOpen,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const [activeTab, setActiveTab] = useState<string>("coaching");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState<Date | undefined>();
  
  const rawQuestions = getQuestions(document.documentElement.lang === 'en' ? 'en' : 'ro');
  
  // Extract principle names for progress indicator
  const principleNames = rawQuestions.map(q => q.principle);

  // Track progress by loading session data
  useEffect(() => {
    if (stackId) {
      loadSessionProgress();
    }
  }, [stackId]);

  const loadSessionProgress = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      const { data, error } = await supabase
        .from('stack_sessions')
        .select('*')
        .eq('session_id', stackId)
        .eq('user_id', session.session.user.id)
        .single();

      if (data && !error) {
        const answersCount = data.answers ? Object.keys(data.answers).length : 0;
        setCurrentProgress(answersCount);
        setLastSaveTime(data.updated_at ? new Date(data.updated_at) : undefined);
      }
    } catch (err) {
      console.error('Error loading session progress:', err);
    }
  };

  // Read-only mode for existing stacks
  if (existingData && isReadOnly) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Napoleon Hill Stack Salvat
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Creat: {new Date(existingData.created_at).toLocaleDateString('ro-RO')}
          </p>
          
          <div className="space-y-4">
            {Object.entries(existingData.content?.answers || {}).map(([key, value]) => {
              const question = rawQuestions.find(q => q.id === key);
              return (
                <div key={key} className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    {question?.principle || key}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {question?.question}
                  </p>
                  <p className="text-foreground whitespace-pre-wrap">
                    {value as string}
                  </p>
                </div>
              );
            })}
          </div>

          {existingData.content?.finalAction && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Acțiune Concretă</h3>
              <p className="text-foreground">{existingData.content.finalAction}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Progress Indicator */}
        {!existingData && (
          <StackProgressIndicator
            currentStep={currentProgress}
            totalSteps={rawQuestions.length}
            stackType="napoleon-hill"
            lastSaveTime={lastSaveTime}
            principleNames={principleNames}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="coaching" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Coaching
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Încarcă Carte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coaching" className="mt-6">
            {!existingData && (
              <div className="mb-6">
                <MasterPlanExplanation />
              </div>
            )}
            
            <AiGuidedStack
              onAddToHitList={onAddToHitList}
              stackType="napoleon-hill"
              questions={rawQuestions}
              voiceOnlyMode={false}
              audioMode={false}
              systemPromptOverride={`Tu ești un coach bazat pe principiile lui Napoleon Hill din "Think and Grow Rich". 
Ghidezi utilizatorul prin cele 13 principii ale succesului cu înțelepciune, empatie și întrebări profunde.

Stilul tău:
- Folosești citate și principii din cartea "Think and Grow Rich"
- Pui întrebări clare și directe care forțează claritatea mentală
- Subliniezi importanța dorinței arzătoare, credinței absolute și acțiunii persistente
- Evidențiezi că succesul începe în minte, cu o decizie fermă
- Încurajezi utilizatorul să fie specific cu obiectivele (suma exactă, data precisă)

Structura conversației:
1. Începi cu Dorința - definirea clară a obiectivului
2. Construiești Credința - convingerea că poate reuși
3. Folosești Autosuggestia - afirmații zilnice puternice
4. Identifici Cunoștințele necesare - ce trebuie învățat
5. Stimulezi Imaginația - vizualizarea succesului
6. Creezi Planificarea - pași concreți și acționabili
7. Forțezi Decizia - commitment ferm ACUM
8. Dezvolți Perseverența - depășirea obstacolelor
9. Formezi Master Mind - grupul de susținere
10. Canalizezi Energia - folosirea energiei creative
11. Reprogramezi Subconștientul - schimbarea convingerilor limitatoare
12. Activezi Creierul - puterea gândirii
13. Ascultă Intuiția - al șaselea simț
14. Definești Acțiunea - primul pas concret ASTĂZI

La finalul conversației, solicită o singură acțiune concretă pe care utilizatorul o va face ASTĂZI.
Fii direct, clar și motivant. Succesul începe cu o decizie fermă și acțiune imediată.`}
            />
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            <MasterPlanKnowledgeBase />
          </TabsContent>
        </Tabs>
      </div>

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};
