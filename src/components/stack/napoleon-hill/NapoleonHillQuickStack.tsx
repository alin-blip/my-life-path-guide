import React, { useState, useEffect } from 'react';
import { NapoleonHillStackProps } from './types';
import { AiGuidedStack } from '../AiGuidedStack';
import { StackIdeaModal } from '../StackIdeaModal';
import { KnowledgeBaseUploader } from '../KnowledgeBaseUploader';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Target, Flame, Brain, Lightbulb, Users, Zap, Heart, Eye, ArrowRight, RotateCcw, BookOpen, ChevronDown, FileText, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NAPOLEON_HILL_PRINCIPLES = [
  { id: 1, name: "Dorința", icon: Flame, description: "Definirea clară a obiectivului tău arzător", color: "bg-orange-500" },
  { id: 2, name: "Credința", icon: Heart, description: "Convingerea absolută că vei reuși", color: "bg-pink-500" },
  { id: 3, name: "Autosuggestia", icon: Brain, description: "Programarea subconștientului cu afirmații", color: "bg-purple-500" },
  { id: 4, name: "Cunoștințe Specializate", icon: Lightbulb, description: "Ce trebuie să înveți pentru obiectiv", color: "bg-yellow-500" },
  { id: 5, name: "Imaginația", icon: Eye, description: "Vizualizarea succesului în detaliu", color: "bg-cyan-500" },
  { id: 6, name: "Planificarea Organizată", icon: Target, description: "Pașii concreți spre obiectiv", color: "bg-blue-500" },
  { id: 7, name: "Decizia", icon: Zap, description: "Commitment ferm și irevocabil", color: "bg-amber-500" },
  { id: 8, name: "Perseverența", icon: ArrowRight, description: "Depășirea obstacolelor cu tenacitate", color: "bg-green-500" },
  { id: 9, name: "Master Mind", icon: Users, description: "Grupul de susținere și colaborare", color: "bg-indigo-500" },
  { id: 10, name: "Transmutarea Energiei", icon: Zap, description: "Canalizarea energiei creative", color: "bg-red-500" },
  { id: 11, name: "Subconștientul", icon: Brain, description: "Reprogramarea convingerilor", color: "bg-violet-500" },
  { id: 12, name: "Creierul", icon: Lightbulb, description: "Puterea gândirii concentrate", color: "bg-teal-500" },
  { id: 13, name: "Al Șaselea Simț", icon: Eye, description: "Intuiția și inspirația", color: "bg-rose-500" },
  { id: 14, name: "Cele 6 Frici", icon: Target, description: "Depășirea fricilor care te blochează", color: "bg-slate-500" },
];

export const NapoleonHillQuickStack: React.FC<NapoleonHillStackProps> = ({ 
  onAddToHitList,
  existingData,
  isReadOnly,
  stackId 
}) => {
  const [selectedPrinciple, setSelectedPrinciple] = useState<number | null>(null);
  const [mode, setMode] = useState<'select' | 'full' | 'coaching'>('select');
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<string[]>([]);
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: string, file_name: string, file_path: string}>>([]);
  const { toast } = useToast();

  const {
    isIdeaModalOpen,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  // Fetch knowledge base files on mount
  useEffect(() => {
    fetchKnowledgeBaseFiles();
  }, []);

  const fetchKnowledgeBaseFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('knowledge_base_files')
        .select('id, file_name, file_path')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setUploadedFiles(data);
        // Auto-select Napoleon Hill related files
        const napoleonFiles = data.filter(f => 
          f.file_name.toLowerCase().includes('napoleon') || 
          f.file_name.toLowerCase().includes('think') ||
          f.file_name.toLowerCase().includes('grow') ||
          f.file_name.toLowerCase().includes('rich')
        );
        if (napoleonFiles.length > 0) {
          setKnowledgeBaseFiles(napoleonFiles.map(f => f.file_path));
        }
      }
    } catch (error) {
      console.error('Error fetching knowledge base files:', error);
    }
  };

  const toggleFileSelection = (filePath: string) => {
    setKnowledgeBaseFiles(prev => 
      prev.includes(filePath) 
        ? prev.filter(f => f !== filePath)
        : [...prev, filePath]
    );
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from('knowledge-base').remove([filePath]);
      
      // Delete from database
      await supabase.from('knowledge_base_files').delete().eq('id', fileId);
      
      // Update local state
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      setKnowledgeBaseFiles(prev => prev.filter(f => f !== filePath));
      
      toast({
        title: "Fișier șters",
        description: "Fișierul a fost eliminat din knowledge base",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut șterge fișierul",
        variant: "destructive"
      });
    }
  };

  const getQuickStackPrompt = (principleId: number) => {
    const principle = NAPOLEON_HILL_PRINCIPLES.find(p => p.id === principleId);
    
    const principleContext: Record<number, string> = {
      1: 'DORINȚA este punctul de pornire al tuturor realizărilor. Napoleon Hill spune: "The starting point of all achievement is desire."',
      2: 'CREDINȚA este capul de pod între gândire și realitate. "Faith is the head chemist of the mind."',
      3: 'AUTOSUGGESTIA este tehnica prin care îți programezi subconștientul. "Any idea, plan, or purpose may be placed in the mind through repetition of thought."',
      4: 'CUNOȘTINȚELE SPECIALIZATE sunt cele care produc bogăție când sunt organizate și aplicate inteligent.',
      5: 'IMAGINAȚIA este atelierul în care toate planurile sunt create. Imaginația sintetică și creativă sunt cele două forme.',
      6: 'PLANIFICAREA ORGANIZATĂ transformă dorința în acțiune concretă prin pași clari și măsurabili.',
      7: 'DECIZIA este opusul amânării. Oamenii de succes iau decizii rapid și le schimbă încet.',
      8: 'PERSEVERENȚA este factorul comun tuturor oamenilor de succes. "Persistence is to character what carbon is to steel."',
      9: 'MASTER MIND este coordonarea cunoștințelor și efortului între două sau mai multe persoane pentru un scop definit.',
      10: 'TRANSMUTAREA ENERGIEI înseamnă canalizarea energiei creative și pasionale către obiectivul tău principal.',
      11: 'SUBCONȘTIENTUL este legătura dintre mintea conștientă și Inteligența Infinită.',
      12: 'CREIERUL funcționează ca o stație de emisie și recepție pentru gânduri.',
      13: 'AL ȘASELEA SIMȚ este "templul înțelepciunii" - intuiția care vine din experiență și cunoaștere acumulată.',
      14: 'CELE 6 FRICI (sărăcie, critică, boală, pierderea iubirii, bătrânețe, moarte) sunt inamicii succesului care trebuie eliminați.'
    };
    
    return `Ești un coach EXCLUSIV bazat pe principiile lui Napoleon Hill din "Think and Grow Rich".
IMPORTANT: Ești NAPOLEON HILL COACH, nu orice alt tip de coach. Toate răspunsurile trebuie ancorate în filosofia sa.

Astăzi te concentrezi pe PRINCIPIUL ${principleId}: ${principle?.name?.toUpperCase()}.

${principleContext[principleId] || ''}

=== FRAMEWORK QUICK STACK - ${principle?.name} ===

Acest stack rapid te ajută să te deblochezi și să acționezi ASTĂZI folosind principiul ${principle?.name}.

STRUCTURA CONVERSAȚIEI (5-7 întrebări scurte):

1. "Ce obiectiv specific ai în minte astăzi legat de ${principle?.name}?"
2. "${getSpecificQuestion(principleId, 1)}"
3. "${getSpecificQuestion(principleId, 2)}"
4. "Ce te blochează ACUM să faci progres în această direcție?"
5. "Conform lui Napoleon Hill, cum poți aplica principiul ${principle?.name} pentru a depăși acest blocaj?"
6. "Ce SINGURĂ ACȚIUNE poți face în următoarele 2 ore?"
7. "Vrei să adaugi această acțiune la HIT list?"

INSTRUCȚIUNI STRICTE:
- Fii DIRECT și orientat spre ACȚIUNE
- Fiecare răspuns maxim 2-3 propoziții
- Focus pe ASTĂZI, nu pe planuri pe termen lung
- Pune O SINGURĂ întrebare per mesaj
- Citează din Napoleon Hill în fiecare răspuns - folosește CITATE EXACTE din carte dacă ai acces la knowledge base
- Dacă ai acces la documente de referință, citează pasaje relevante din "Think and Grow Rich"
- La final, extrage o acțiune concretă pentru HIT list

CITATE NAPOLEON HILL:
- "Whatever the mind can conceive and believe, it can achieve."
- "A goal is a dream with a deadline."
- "Action is the real measure of intelligence."
- "Every adversity carries with it the seed of an equal or greater benefit."

Începe ACUM: "Bun venit la Stack-ul Napoleon Hill pentru ${principle?.name}! ${principleContext[principleId]?.split('.')[0] || ''} Ce obiectiv specific ai în minte astăzi legat de acest principiu?"`;
  };

  const getFullStackPrompt = () => {
    return `Ești un coach EXCLUSIV bazat pe principiile lui Napoleon Hill din "Think and Grow Rich".
Ghidezi utilizatorul printr-un STACK RAPID DE DIMINEAȚĂ prin toate cele 14 principii.

IMPORTANT: Ești NAPOLEON HILL COACH, nu altceva. Răspunsurile tale trebuie să fie ancorate în filosofia lui Napoleon Hill.

=== FRAMEWORK STACK COMPLET RAPID (14 principii, 1 întrebare per principiu) ===

Pentru FIECARE principiu, pune O SINGURĂ întrebare cheie și treci la următorul:

1. DORINȚA: "Ce îți dorești cel mai mult să realizezi? Fii SPECIFIC (sumă, dată, detalii)."
2. CREDINȚA: "Pe o scară de 1-10, cât de convins ești că vei reuși? De ce?"
3. AUTOSUGGESTIA: "Ce afirmație pozitivă îți vei repeta astăzi despre acest obiectiv?"
4. CUNOȘTINȚE: "Ce SINGUR lucru trebuie să înveți săptămâna aceasta pentru a avansa?"
5. IMAGINAȚIA: "Descrie în 2-3 propoziții cum arată viața ta când ai atins acest obiectiv."
6. PLANIFICARE: "Care sunt cei 3 PAȘI CONCREȚI pe care îi vei face această săptămână?"
7. DECIZIA: "Ești 100% HOTĂRÂT să faci asta? DA sau NU?"
8. PERSEVERENȚA: "Care e cel mai mare obstacol și cum îl vei depăși?"
9. MASTER MIND: "Cine te poate ajuta? Cui poți cere sfat sau sprijin?"
10. ENERGIA: "Cum îți vei canaliza energia și motivația astăzi?"
11. SUBCONȘTIENTUL: "Ce convingere limitatoare trebuie să înlocuiești?"
12. CREIERUL: "La ce oră vei dedica 15 minute de gândire concentrată pe obiectiv?"
13. INTUIȚIA: "Ce îți spune instinctul despre primul pas?"
14. FRICILE: "Care dintre cele 6 frici (sărăcie, critică, boală, pierderea iubirii, bătrânețe, moarte) te blochează cel mai mult?"

FINAL:
- "Care e SINGURA ACȚIUNE pe care o faci ASTĂZI, în următoarele 2 ore?"
- "Vrei să o adaugi la HIT list?"

INSTRUCȚIUNI STRICTE:
- O SINGURĂ întrebare per mesaj
- Răspunsuri AI maxim 2-3 propoziții
- Citează din Napoleon Hill la finalul fiecărui principiu - folosește CITATE EXACTE din carte dacă ai acces la knowledge base
- Dacă ai acces la documente de referință, citează pasaje relevante din "Think and Grow Rich"
- Ritm rapid, fără filosofări lungi
- Focus pe ACȚIUNE IMEDIATĂ
- Întregul stack în 15-20 minute maximum

CITATE NAPOLEON HILL DE FOLOSIT:
- "Whatever the mind can conceive and believe, it can achieve."
- "A goal is a dream with a deadline."
- "Action is the real measure of intelligence."
- "Every adversity carries with it the seed of an equal or greater benefit."
- "The starting point of all achievement is desire."

Începe cu: "Hai să facem un reset matinal rapid bazat pe Napoleon Hill! PRINCIPIUL 1 - DORINȚA: Ce îți dorești cel mai mult să realizezi? Fii SPECIFIC."`;
  };

  const handleSelectPrinciple = (principleId: number) => {
    setSelectedPrinciple(principleId);
    setMode('coaching');
  };

  const handleStartFullStack = () => {
    setSelectedPrinciple(null);
    setMode('full');
  };

  const handleReset = () => {
    setSelectedPrinciple(null);
    setMode('select');
  };

  // Selection screen
  if (mode === 'select') {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-amber-300">
              <Flame className="w-8 h-8" />
              Napoleon Hill Quick Stack
            </CardTitle>
            <CardDescription className="text-amber-100/80 text-base">
              Stack rapid de dimineață bazat pe "Think and Grow Rich" - deblochează-te și acționează ASTĂZI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Stack Option */}
            <Button 
              onClick={handleStartFullStack}
              className="w-full h-auto p-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-left flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6" />
                <span className="text-lg font-bold">Stack Complet Rapid (15-20 min)</span>
              </div>
              <span className="text-sm opacity-90 font-normal">
                Parcurge toate cele 14 principii cu câte o întrebare cheie pentru fiecare
              </span>
            </Button>

            {/* Knowledge Base Section */}
            <Collapsible open={knowledgeBaseOpen} onOpenChange={setKnowledgeBaseOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Knowledge Base - Cartea "Think and Grow Rich"</span>
                    {knowledgeBaseFiles.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {knowledgeBaseFiles.length} fișier{knowledgeBaseFiles.length > 1 ? 'e' : ''} selectat{knowledgeBaseFiles.length > 1 ? 'e' : ''}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${knowledgeBaseOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Încarcă cartea "Think and Grow Rich" sau notițe pentru ca AI-ul să citeze direct din ea în timpul coaching-ului.
                </p>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Fișiere disponibile:</p>
                    {uploadedFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className={`flex items-center justify-between p-2 rounded border ${
                          knowledgeBaseFiles.includes(file.file_path) 
                            ? 'border-amber-500 bg-amber-900/20' 
                            : 'border-border'
                        }`}
                      >
                        <button
                          onClick={() => toggleFileSelection(file.file_path)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm truncate">{file.file_name}</span>
                          {knowledgeBaseFiles.includes(file.file_path) && (
                            <Badge className="bg-amber-600 text-white text-xs">Selectat</Badge>
                          )}
                        </button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteFile(file.id, file.file_path)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <KnowledgeBaseUploader onUploadComplete={fetchKnowledgeBaseFiles} />
              </CollapsibleContent>
            </Collapsible>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-700/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-card text-amber-300 text-sm">sau alege un principiu specific</span>
              </div>
            </div>

            {/* Principle Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {NAPOLEON_HILL_PRINCIPLES.map((principle) => {
                const Icon = principle.icon;
                return (
                  <Button
                    key={principle.id}
                    variant="outline"
                    onClick={() => handleSelectPrinciple(principle.id)}
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-amber-900/20 hover:border-amber-500 transition-all group"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`p-2 rounded-lg ${principle.color} text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs">
                        #{principle.id}
                      </Badge>
                    </div>
                    <span className="font-semibold text-foreground group-hover:text-amber-300 transition-colors">
                      {principle.name}
                    </span>
                    <span className="text-xs text-muted-foreground text-left">
                      {principle.description}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Coaching mode
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Înapoi la selecție
          </Button>
          
          {selectedPrinciple && (
            <Badge className={`${NAPOLEON_HILL_PRINCIPLES[selectedPrinciple - 1]?.color} text-white`}>
              Principiul {selectedPrinciple}: {NAPOLEON_HILL_PRINCIPLES[selectedPrinciple - 1]?.name}
            </Badge>
          )}
          
          {mode === 'full' && (
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
              Stack Complet - 14 Principii
            </Badge>
          )}
        </div>

        <AiGuidedStack
          key={mode === 'full' ? 'full-stack' : `principle-${selectedPrinciple}`}
          onAddToHitList={onAddToHitList}
          stackType="napoleon-hill"
          questions={[]}
          voiceOnlyMode={false}
          audioMode={false}
          systemPromptOverride={mode === 'full' ? getFullStackPrompt() : getQuickStackPrompt(selectedPrinciple!)}
          welcomeMessage={mode === 'full' 
            ? "Hai să facem un reset matinal rapid bazat pe Napoleon Hill! PRINCIPIUL 1 - DORINȚA: Ce îți dorești cel mai mult să realizezi? Fii SPECIFIC (sumă exactă, dată precisă, detalii concrete)."
            : `Bun venit la Stack-ul Napoleon Hill pentru Principiul ${selectedPrinciple}: ${NAPOLEON_HILL_PRINCIPLES[selectedPrinciple! - 1]?.name}! ${NAPOLEON_HILL_PRINCIPLES[selectedPrinciple! - 1]?.description}. Ce obiectiv specific ai în minte astăzi legat de acest principiu?`
          }
          knowledgeBaseFiles={knowledgeBaseFiles}
        />
      </div>

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};

// Helper function for principle-specific questions
function getSpecificQuestion(principleId: number, questionNum: number): string {
  const questions: Record<number, string[]> = {
    1: ["Cât de specific este acest obiectiv? (sumă, dată, detalii)", "Ce sacrificii ești dispus să faci pentru el?"],
    2: ["Ce dovezi ai că poți reuși?", "Ce afirmație îți întărește credința?"],
    3: ["Ce afirmație pozitivă îți vei repeta astăzi?", "Când și cum o vei practica?"],
    4: ["Ce informație îți lipsește pentru a avansa?", "Unde poți găsi această cunoaștere?"],
    5: ["Cum arată succesul în detaliu?", "Ce simți când ți-l imaginezi?"],
    6: ["Care e următorul pas concret?", "Când îl vei face?"],
    7: ["Ești 100% hotărât? DA sau NU?", "Ce te-ar face să renunți?"],
    8: ["Care e cel mai mare obstacol?", "Cum îl vei depăși?"],
    9: ["Cine te poate ajuta?", "Cui poți cere sfat astăzi?"],
    10: ["Cum îți vei canaliza energia?", "Ce te motivează cel mai mult?"],
    11: ["Ce convingere limitatoare ai?", "Cu ce o înlocuiești?"],
    12: ["Când vei dedica timp gândirii concentrate?", "Cât timp?"],
    13: ["Ce îți spune intuiția?", "Care e primul impuls?"],
    14: ["Care frică te blochează cel mai mult?", "Cum o vei depăși astăzi?"],
  };
  
  return questions[principleId]?.[questionNum - 1] || "Care e următorul pas?";
}

export default NapoleonHillQuickStack;
