
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Check, Plus, Send, Clock, CheckCircle } from 'lucide-react';
import { useDoorContent } from '@/hooks/useDoorContent';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

interface DivineCoachingProps {
  onAddToHitList?: (actionText: string) => void;
}

export const DivineCoaching: React.FC<DivineCoachingProps> = ({ onAddToHitList }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [stackHistory, setStackHistory] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionAddedToHotList, setActionAddedToHotList] = useState(false);
  const [committedAction, setCommittedAction] = useState("");

  useEffect(() => {
    // Generate a new session ID when component mounts
    setSessionId(uuidv4());
    
    // Load stack history
    loadStackHistory();
    
    // Get current user if available through Supabase
    if (supabase) {
      getCurrentUser();
    }
  }, []);

  const getCurrentUser = async () => {
    if (!supabase) return;
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const loadStackHistory = async () => {
    setIsLoadingHistory(true);
    
    try {
      // Try to load from Supabase if available
      if (supabase) {
        const { data, error } = await supabase
          .from('divine_coaching_sessions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error loading divine coaching history:', error);
          fallbackToLocalStorage();
        } else {
          // Group sessions by session_id
          const sessions: Record<string, any> = {};
          data?.forEach(item => {
            if (!sessions[item.session_id]) {
              sessions[item.session_id] = {
                id: item.session_id,
                date: item.created_at,
                answers: item.answers || {},
                type: "divine",
                completed: true
              };
            }
          });
          
          setStackHistory(Object.values(sessions));
        }
      } else {
        fallbackToLocalStorage();
      }
    } catch (error) {
      console.error('Error loading divine coaching history:', error);
      fallbackToLocalStorage();
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fallbackToLocalStorage = () => {
    // Load from localStorage as fallback
    const savedHistory = localStorage.getItem('divine-stack-history');
    if (savedHistory) {
      try {
        setStackHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Error parsing divine stack history:", error);
        setStackHistory([]);
      }
    }
  };

  const saveDivineCoachingMessage = async (message: string, type: string) => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('divine_coaching_sessions')
        .insert([
          { 
            user_id: currentUser?.id,
            session_id: sessionId,
            message: message,
            created_at: new Date().toISOString(),
            type: type,
            question: '',
            step_number: 0
          }
        ]);
        
      if (error) {
        console.error('Error saving divine coaching message:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Error saving divine coaching message:', error);
      return { data: null, error };
    }
  };

  const steps = [
    {
      question: "Ce vrei să îl întrebi pe Dumnezeu astăzi?",
      placeholder: "Scrie întrebarea sau preocuparea ta aici...",
    },
    {
      question: "Dragă DOAMNE, Ce vrei să văd aici?",
      placeholder: "Ce crezi că Dumnezeu vrea să vezi în această situație...",
    },
    {
      question: "Ce vrei să aud?",
      placeholder: "Ce mesaj crezi că Dumnezeu vrea să auzi...",
    },
    {
      question: "Ce vrei să învăț?",
      placeholder: "Ce lecție crezi că Dumnezeu vrea să înveți din asta...",
    },
    {
      question: "Ce vrei să simt?",
      placeholder: "Ce emoții crezi că Dumnezeu vrea să experimentezi...",
    },
    {
      question: "Ce vrei să știu?",
      placeholder: "Ce adevăr crezi că Dumnezeu vrea să realizezi...",
    },
    {
      question: "Ce vrei să fac?",
      placeholder: "Ce acțiune crezi că Dumnezeu vrea să iei...",
    },
    {
      question: "Dumnezeu te-a auzit:",
      isResponse: true,
    },
    {
      question: "Ce acțiuni imediate te angajezi să faci când părăsești această sesiune?",
      placeholder: "Scrie acțiunile concrete pe care te angajezi să le faci...",
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Save current step to Supabase if available
      if (supabase) {
        // Save the user question/answer
        await saveDivineCoachingStep();
      }
      
      setCurrentStep(currentStep + 1);
      
      if (currentStep === 6) {
        // Simulate typing effect for God's response
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          
          // Save the system response if Supabase is available
          if (supabase) {
            const divineResponse = generateDivineResponseText();
            await saveDivineCoachingMessage(divineResponse, 'system');
          }
        }, 2000);
      }
    } else {
      // Set the committed action based on the user's answer to step 8
      setCommittedAction(answers[8] || "");
      
      // Complete the stack but don't add to hot list automatically
      completeStack(false); 
    }
  };

  const saveDivineCoachingStep = async () => {
    if (!supabase || !sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('divine_coaching_sessions')
        .insert([
          { 
            session_id: sessionId,
            step_number: currentStep,
            question: steps[currentStep].question,
            answer: answers[currentStep] || '',
            answers: JSON.stringify(answers),
            created_at: new Date().toISOString(),
            user_id: currentUser?.id
          }
        ]);
        
      if (error) {
        console.error('Error saving divine coaching step:', error);
      }
    } catch (error) {
      console.error('Error saving divine coaching step:', error);
    }
  };

  // Function to save to global stack history for dashboard display
  const saveToGlobalHistory = (stack: any) => {
    try {
      const existingHistory = localStorage.getItem('global-stack-history') || '[]';
      const parsedHistory = JSON.parse(existingHistory);
      
      // Add the new stack to global history
      const updatedHistory = [...parsedHistory, {
        ...stack,
        completedAt: new Date().toISOString()
      }];
      
      localStorage.setItem('global-stack-history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error saving to global stack history:", error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers({ ...answers, [currentStep]: e.target.value });
  };

  // Function to load a specific session
  const loadSession = (sessionId: string) => {
    const session = stackHistory.find(s => s.id === sessionId);
    if (session) {
      setAnswers(session.answers);
      setCurrentStep(7); // Jump to the divine response step
      toast({
        title: "Sesiune încărcată",
        description: "Sesiunea istorică a fost încărcată cu succes.",
      });
    }
  };

  // Function to add action to Hot List
  const addToHotList = () => {
    if (committedAction && !actionAddedToHotList) {
      try {
        const savedHotList = localStorage.getItem('door-hot-list') || "[]";
        const hotList = JSON.parse(savedHotList);

        const newItem = {
          id: `stack-${Date.now()}`,
          text: committedAction,
          selected: false,
          priority: 'none'
        };

        hotList.push(newItem);
        localStorage.setItem('door-hot-list', JSON.stringify(hotList));

        // Notify Door to refresh UI
        window.dispatchEvent(new CustomEvent('doorDataUpdated', { detail: { type: 'ideaAdded', idea: newItem } }));

        setActionAddedToHotList(true);
        toast({
          title: "Adăugat în Lista de idei",
          description: "Acțiunea a fost adăugată cu succes în Lista de idei.",
        });

        if (onAddToHitList) {
          onAddToHitList(committedAction);
        }
      } catch (error) {
        console.error("Error adding to Hot List:", error);
        if (onAddToHitList) {
          onAddToHitList(committedAction);
        }
      }
    }
  };

  // Helper: add arbitrary action text to Lista de idei (Hot List)
  const addActionTextToHotList = (actionText: string) => {
    const text = (actionText || '').trim();
    if (!text) return;
    try {
      const savedHotList = localStorage.getItem('door-hot-list') || "[]";
      const hotList = JSON.parse(savedHotList);
      const newItem = {
        id: `stack-${Date.now()}`,
        text,
        selected: false,
        priority: 'none'
      };
      hotList.push(newItem);
      localStorage.setItem('door-hot-list', JSON.stringify(hotList));
      window.dispatchEvent(new CustomEvent('doorDataUpdated', { detail: { type: 'ideaAdded', idea: newItem } }));
      toast({
        title: "Adăugat în Lista de idei",
        description: "Acțiunea a fost adăugată cu succes în Lista de idei.",
      });
    } catch (error) {
      console.error('Error adding pending action to Hot List:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga acțiunea. Încearcă din nou.',
        variant: 'destructive',
      });
    }
  };

  // Function to complete the stack and handle all necessary actions
  const completeStack = async (addToHotList: boolean) => {
    // Save the stack to history
    const newStack = {
      id: sessionId || Date.now().toString(),
      date: new Date().toISOString(),
      answers: { ...answers },
      type: "divine",
      completed: true
    };
    
    const updatedHistory = [...stackHistory, newStack];
    setStackHistory(updatedHistory);
    
    try {
      // Save to Supabase if available
      if (supabase) {
        const { data: systemResponse, error: systemError } = await supabase
          .from('divine_coaching_sessions')
          .insert([
            { 
              session_id: sessionId,
              step_number: 7,
              question: "Dumnezeu te-a auzit:",
              answer: generateDivineResponseText(),
              answers: JSON.stringify(answers),
              is_system_response: true,
              created_at: new Date().toISOString(),
              user_id: currentUser?.id
            }
          ]);
          
        const { data: actionStep, error: actionError } = await supabase
          .from('divine_coaching_sessions')
          .insert([
            { 
              session_id: sessionId,
              step_number: 8,
              question: steps[8].question,
              answer: answers[8] || '',
              answers: JSON.stringify(answers),
              created_at: new Date().toISOString(),
              user_id: currentUser?.id
            }
          ]);
          
        if (systemError || actionError) {
          console.error('Error saving divine coaching completion:', systemError || actionError);
        }
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('divine-stack-history', JSON.stringify(updatedHistory));
      
      // Reflect on dashboard by storing in global stack history
      saveToGlobalHistory(newStack);
      
      setIsCompleted(true);
      
      // If selected to add to hot list, do so with the action text (answer from step 8)
      if (addToHotList) {
        const actionText = answers[8] || "";
        
        if (actionText.trim()) {
          try {
            if (onAddToHitList) {
              onAddToHitList(actionText);
            }
            setActionAddedToHotList(true);
            
            toast({
              title: "Stack completat",
              description: "Acțiunea ta a fost adăugată în lista fierbinte și stack-ul a fost salvat.",
            });
          } catch (error) {
            console.error("Error adding action to Hot List:", error);
            toast({
              title: "Eroare",
              description: "Nu s-a putut adăuga acțiunea la lista fierbinte. Te rugăm să încerci din nou.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Atenție",
            description: "Nu s-a specificat nicio acțiune pentru lista fierbinte.",
          });
        }
      } else {
        toast({
          title: "Stack completat",
          description: "Sesiunea ta a fost salvată în istoric.",
        });
      }
      
    } catch (error) {
      console.error("Error completing stack:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la salvarea stack-ului. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    }
  };

  // Generate divine response text for saving to database
  const generateDivineResponseText = () => {
    const questionOne = answers[0] || "";
    const see = answers[1] || "";
    const hear = answers[2] || "";
    const learn = answers[3] || "";
    const feel = answers[4] || "";
    const know = answers[5] || "";
    const action = answers[6] || "";
    
    return `Copilul meu drag, te văd și te aud cu claritate. Înțeleg întrebarea ta despre "${questionOne.substring(0, 30)}...".
Vreau să vezi: ${see}
Vreau să auzi: ${hear}
Vreau să înveți: ${learn}
Vreau să simți: ${feel}
Vreau să știi: ${know}
Și te îndemn să: ${action}
Rămân mereu alături de tine, în orice provocare și victorie.`;
  };

  // Generate God's summary response based on previous answers
  const generateDivineResponse = () => {
    if (isTyping) {
      return <div className="flex justify-center my-4"><Sparkles className="animate-pulse text-purple-500 h-8 w-8" /></div>;
    }
    
    const questionOne = answers[0] || "";
    const see = answers[1] || "";
    const hear = answers[2] || "";
    const learn = answers[3] || "";
    const feel = answers[4] || "";
    const know = answers[5] || "";
    const action = answers[6] || "";
    
    return (
      <div className="text-white bg-purple-500/10 p-6 rounded-lg border border-purple-500/20 my-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-400" />
          <h3 className="text-purple-300 font-semibold">Rezumatul răspunsului divin:</h3>
        </div>
        <p className="italic text-gray-300 mb-3">Ai întrebat: "{questionOne}"</p>
        <div className="space-y-3">
          <p>Copilul meu drag, te văd și te aud cu claritate. Înțeleg întrebarea ta despre "{questionOne.substring(0, 30)}..."</p>
          <p>Vreau să vezi: {see}</p>
          <p>Vreau să auzi: {hear}</p>
          <p>Vreau să înveți: {learn}</p>
          <p>Vreau să simți: {feel}</p>
          <p>Vreau să știi: {know}</p>
          <p>Și te îndemn să: {action}</p>
          <p className="mt-4 text-purple-300">Rămân mereu alături de tine, în orice provocare și victorie.</p>
        </div>
      </div>
    );
  };

  // Reset the stack to start over
  const resetStack = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
    setSessionId(uuidv4()); // Generate a new session ID for the next stack
    setActionAddedToHotList(false);
    setCommittedAction("");
  };

  return (
    <div className="space-y-6">
      {isCompleted && committedAction && (
        <div className="bg-gradient-to-br from-[#2a1c3d] to-[#3a2c4d] rounded-lg border border-purple-500/20 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Acțiune angajată:</h3>
            <p className="text-white">{committedAction}</p>
            
            {actionAddedToHotList && (
              <div className="flex items-center text-green-400 text-sm mt-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                Această acțiune a fost adăugată în Lista de idei
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetStack}
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30"
            >
              Începe un nou stack
            </Button>
            
            {!actionAddedToHotList && (
              <Button
                onClick={addToHotList}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Adaugă la lista fierbinte
              </Button>
            )}
          </div>
        </div>
      )}
      
      {!isCompleted && (
        <div className="bg-gradient-to-br from-[#2a1c3d] to-[#3a2c4d] rounded-lg border border-purple-500/20 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">
              {steps[currentStep].question}
            </h3>
            
            {steps[currentStep].isResponse ? (
              generateDivineResponse()
            ) : (
              <Textarea
                ref={textareaRef}
                placeholder={steps[currentStep].placeholder}
                className="bg-purple-900/10 border-purple-500/30 focus:border-purple-500/50 min-h-[100px]"
                value={answers[currentStep] || ""}
                onChange={handleInputChange}
              />
            )}
          </div>

          {currentStep === 8 && (answers[8]?.trim()?.length > 0) && (
            <div className="mt-4 p-4 rounded-md border border-purple-500/30 bg-purple-900/10">
              <h4 className="text-sm font-medium text-purple-300 mb-2">Acțiune propusă pentru Lista de idei</h4>
              <p className="text-white mb-3 whitespace-pre-wrap">{answers[8]}</p>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => addActionTextToHotList(answers[8])} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Adaugă în Lista de idei
                </Button>
              </div>
            </div>
          )}
           
           <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-gray-400 border-gray-700 hover:bg-gray-800"
            >
              Înapoi
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!answers[currentStep] && !steps[currentStep].isResponse}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Continuă <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Finalizează <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {stackHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Istoricul sesiunilor</h3>
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {stackHistory.map((stack) => (
                <div 
                  key={stack.id} 
                  className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 cursor-pointer hover:bg-purple-900/20 transition-colors"
                  onClick={() => loadSession(stack.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-purple-300 font-medium">{new Date(stack.date).toLocaleDateString()}</p>
                      <p className="text-gray-400 text-sm truncate">{stack.answers[0] || "Sesiune fără titlu"}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {new Date(stack.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
