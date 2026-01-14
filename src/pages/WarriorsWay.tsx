import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  GraduationCap, 
  Play, 
  Lock, 
  CheckCircle2, 
  Clock,
  BookOpen,
  Sparkles,
  ChevronRight,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { WarriorVideoPlayer } from '@/components/warriors-way/WarriorVideoPlayer';
import { PremiumGate } from '@/components/warriors-way/PremiumGate';
import { useWarriorsCourse } from '@/hooks/useWarriorsCourse';
import { WarriorAiMentor, WarriorAiMentorButton } from '@/components/warriors-way/WarriorAiMentor';
import { supabase } from '@/integrations/supabase/client';

// Course structure - INTRO has 7 modules now
const COURSE_SECTIONS = [
  {
    id: 'intro',
    title: 'INTRO - Warrior Launch Accelerator',
    description: 'Introducere în Calea Războinicului - 7 Lecții Fundamentale',
    isFree: true,
    modules: [
      { id: 'intro-1', title: 'Punctul de Start - Groapa', duration: '15 min', order: 1, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=PI-nU1i6vo7AF0RdV1FiSMTC6GkmBF9tBxoHaAoVbPEKW0hQC&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'intro-2', title: 'Cele 6 Etape ale Creșterii și Expansiunii', duration: '12 min', order: 2 },
      { id: 'intro-3', title: 'Cele 7 Etape ale Ascensiunii Tale', duration: '14 min', order: 3, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=odU6l-9Gh1OVbAFYjRyBjUCFWt9zoRzqX3Wy4WIwcBk_BEdIP&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'intro-4', title: 'Cele 5 Investiții Esențiale ale Regelui Războinic', duration: '10 min', order: 4, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=AroPOR3eRYPE05OEAF8zdiByDO-tbEO5Oydc_RaBZB4SWjjwc&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'intro-5', title: 'Cele 5 Protocoale ale Războinicului', duration: '18 min', order: 5, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=FEaO0VFEEcDEOk_SUj4U6LTVigwGXhTc7dOCxosObKE941gCT&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'intro-6', title: 'Cele 5 Legi ale Războinicului', duration: '12 min', order: 6, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=ixE7kMVqXo3Y0gRGodFa6h1QU9zG0DrqQ9YdPR-pdaIKT1AEd&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'intro-7', title: 'Coeficientul Puterii & Warrior Time-Warp', duration: '10 min', order: 7, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=zsuXB6lSkHVvVFsFP3garLJoRRQTKGf4hgsBZUsIftyCGlUcA&videoRatio=1.766667&type=v&skinColor=%232758EB' },
    ]
  },
  {
    id: 'codul',
    title: 'MODUL 1 - CODUL',
    description: 'Principiile fundamentale ale transformării Warriors Way',
    isFree: false,
    modules: [
      { id: 'cod-1', title: 'Prăpastia Sărăciei', duration: '15 min', order: 8 },
      { id: 'cod-2', title: 'Vârful Prosperității', duration: '14 min', order: 9 },
      { id: 'cod-3', title: 'Principiile Puterii', duration: '16 min', order: 10 },
      { id: 'cod-4', title: 'Calea Producției', duration: '18 min', order: 11 },
      { id: 'cod-5', title: 'Propulsia Puterii', duration: '15 min', order: 12 },
    ]
  },
  {
    id: 'formula',
    title: 'FORMULA WARRIOR - FACT Framework',
    description: 'Fapte, Sentimente, Focus, Fructe',
    isFree: false,
    modules: [
      { id: 'form-1', title: 'FACT - Fapte Reale', duration: '12 min', order: 18 },
      { id: 'form-2', title: 'FEELINGS - Sentimente Sincere', duration: '15 min', order: 19 },
      { id: 'form-3', title: 'FOCUS - Focus Relevant', duration: '12 min', order: 20 },
      { id: 'form-4', title: 'FRUIT - Rezultate Tangibile', duration: '10 min', order: 21 },
    ]
  },
  {
    id: 'jocul',
    title: 'JOCUL - Hărțile Libertății',
    description: 'Jocurile Imposibile și Hărțile tale',
    isFree: false,
    modules: [
      { id: 'joc-1', title: 'Frame Map - Harta Realității', duration: '15 min', order: 22 },
      { id: 'joc-2', title: 'Freedom Map - Harta Libertății', duration: '18 min', order: 23 },
      { id: 'joc-3', title: 'Fire Map - Harta Focului', duration: '12 min', order: 24 },
      { id: 'joc-4', title: 'Focus Map - Harta Concentrării', duration: '14 min', order: 25 },
      { id: 'joc-5', title: 'The Great Tapestry', duration: '10 min', order: 26 },
    ]
  },
  {
    id: 'stack',
    title: 'STACK-UL - Arma Mentală',
    description: 'Cele 4 Etape ale Stack-ului',
    isFree: false,
    modules: [
      { id: 'stack-1', title: 'Stop - Oprește Haosul', duration: '12 min', order: 27 },
      { id: 'stack-2', title: 'Submit - Supunere Divină', duration: '15 min', order: 28 },
      { id: 'stack-3', title: 'Struggle - Lupta cu Sinele', duration: '18 min', order: 29 },
      { id: 'stack-4', title: 'Strike - Lovitura Finală', duration: '12 min', order: 30 },
    ]
  },
  {
    id: 'core4',
    title: 'CORE 4 - Cele 4 Domenii',
    description: 'Body, Being, Balance, Business',
    isFree: false,
    modules: [
      { id: 'core-1', title: 'Body - Puterea Corpului', duration: '15 min', order: 31 },
      { id: 'core-2', title: 'Being - Spiritualitatea', duration: '18 min', order: 32 },
      { id: 'core-3', title: 'Balance - Relațiile', duration: '15 min', order: 33 },
      { id: 'core-4', title: 'Business - Prosperitatea', duration: '20 min', order: 34 },
      { id: 'core-5', title: 'Jocul Zilnic Core 4', duration: '12 min', order: 35 },
    ]
  },
  {
    id: 'door',
    title: 'UȘA - Sistemul de Producție',
    description: 'Potențial, Plan, Producție, Profit',
    isFree: false,
    modules: [
      { id: 'door-1', title: 'Ușa - Stâlpul Perspectivei', duration: '15 min', order: 36 },
      { id: 'door-2', title: 'Ușa Posibilităților - Hot List', duration: '12 min', order: 37 },
      { id: 'door-3', title: 'Ușa Războiului - Cadranele Deciziei', duration: '18 min', order: 38 },
      { id: 'door-4', title: 'War Stack și Planificarea', duration: '15 min', order: 39 },
      { id: 'door-5', title: 'Blackjack - Scorul 21', duration: '12 min', order: 40 },
      { id: 'door-6', title: 'Jocul Final al Profitului', duration: '10 min', order: 41 },
      { id: 'door-7', title: 'Cortul Generalului', duration: '15 min', order: 42 },
    ]
  },
];

const WarriorsWay: React.FC = () => {
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [showAiMentor, setShowAiMentor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { progress, isModuleCompleted, markModuleComplete, overallProgress } = useWarriorsCourse();

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdminRole();
  }, [user]);

  const totalModules = COURSE_SECTIONS.reduce((acc, section) => acc + section.modules.length, 0);
  const completedModules = progress.filter(p => p.completed).length;

  const handleModuleClick = (moduleId: string, sectionIsFree: boolean) => {
    // Admin has full access
    if (isAdmin) {
      setSelectedModule(moduleId);
      return;
    }
    
    if (!sectionIsFree && !user) {
      setShowPremiumGate(true);
      return;
    }
    // For now, allow access to free content, show gate for premium
    if (!sectionIsFree) {
      setShowPremiumGate(true);
      return;
    }
    setSelectedModule(moduleId);
  };

  const handleCloseVideo = () => {
    setSelectedModule(null);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Learn the Warrior's Way</h1>
              <p className="text-muted-foreground">Transformă-ți viața prin Calea Războinicului</p>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Progresul tău</p>
                  <p className="text-2xl font-bold">{completedModules} / {totalModules} module</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-amber-500">{overallProgress}%</p>
                  <p className="text-sm text-muted-foreground">completat</p>
                </div>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </CardContent>
          </Card>
        </div>

        {/* Course Sections */}
        <div className="space-y-4">
          <Accordion type="multiple" defaultValue={['intro']} className="space-y-4">
            {COURSE_SECTIONS.map((section, sectionIndex) => {
              const sectionCompletedCount = section.modules.filter(m => 
                isModuleCompleted(m.id)
              ).length;
              const sectionProgress = (sectionCompletedCount / section.modules.length) * 100;

              return (
                <AccordionItem 
                  key={section.id} 
                  value={section.id}
                  className="border rounded-xl overflow-hidden bg-card"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg",
                        sectionProgress === 100 
                          ? "bg-green-500/20 text-green-500" 
                          : section.isFree 
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-muted text-muted-foreground"
                      )}>
                        {sectionProgress === 100 ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          sectionIndex + 1
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{section.title}</h3>
                          {section.isFree && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                              GRATUIT
                            </Badge>
                          )}
                          {!section.isFree && (
                            <Badge variant="secondary" className="bg-amber-500/20 text-amber-500">
                              <Lock className="h-3 w-3 mr-1" />
                              PREMIUM
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={sectionProgress} className="h-1.5 w-24" />
                          <span className="text-xs text-muted-foreground">
                            {sectionCompletedCount}/{section.modules.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-2 mt-2">
                      {section.modules.map((module, moduleIndex) => {
                        const isCompleted = isModuleCompleted(module.id);
                        const isLocked = !section.isFree;

                        return (
                          <button
                            key={module.id}
                            onClick={() => handleModuleClick(module.id, section.isFree)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-lg transition-all text-left",
                              isCompleted 
                                ? "bg-green-500/10 border border-green-500/20" 
                                : isLocked
                                  ? "bg-muted/30 hover:bg-muted/50 border border-transparent"
                                  : "bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/20"
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                              isCompleted 
                                ? "bg-green-500 text-white" 
                                : isLocked
                                  ? "bg-muted-foreground/20 text-muted-foreground"
                                  : "bg-primary/20 text-primary"
                            )}>
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : isLocked ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={cn(
                                "font-medium",
                                isCompleted && "text-green-500",
                                isLocked && "text-muted-foreground"
                              )}>
                                {module.order}. {module.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {module.duration}
                              </div>
                            </div>
                            <ChevronRight className={cn(
                              "h-5 w-5",
                              isLocked ? "text-muted-foreground/50" : "text-muted-foreground"
                            )} />
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Video Player Modal */}
        {selectedModule && (() => {
          // Find the module data for the selected module
          const allModules = COURSE_SECTIONS.flatMap(s => s.modules);
          const currentModule = allModules.find(m => m.id === selectedModule);
          const currentIndex = allModules.findIndex(m => m.id === selectedModule);
          const previousModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
          const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;
          
          // Check if next module is accessible (free section)
          const nextSection = COURSE_SECTIONS.find(s => s.modules.some(m => m.id === nextModule?.id));
          const canGoNext = nextSection?.isFree;
          
          return (
            <WarriorVideoPlayer
              moduleId={selectedModule}
              moduleTitle={currentModule?.title}
              moduleOrder={currentModule?.order}
              videoUrl={(currentModule as any)?.videoUrl}
              onClose={handleCloseVideo}
              onComplete={() => markModuleComplete(selectedModule)}
              hasPrevious={!!previousModule}
              hasNext={!!nextModule && canGoNext}
              onPrevious={() => previousModule && setSelectedModule(previousModule.id)}
              onNext={() => nextModule && canGoNext && setSelectedModule(nextModule.id)}
            />
          );
        })()}

        {/* Premium Gate Modal */}
        {showPremiumGate && (
          <PremiumGate onClose={() => setShowPremiumGate(false)} />
        )}

        {/* AI Mentor */}
        <WarriorAiMentorButton onClick={() => setShowAiMentor(true)} />
        <WarriorAiMentor 
          isOpen={showAiMentor} 
          onClose={() => setShowAiMentor(false)}
          onNavigateToModule={(moduleId) => {
            const section = COURSE_SECTIONS.find(s => s.modules.some(m => m.id === moduleId));
            if (section?.isFree) {
              setSelectedModule(moduleId);
            } else {
              setShowPremiumGate(true);
            }
          }}
        />
      </div>
    </Layout>
  );
};

export default WarriorsWay;
