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
    title: 'Călătoria unui Războinic',
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
    id: 'calea',
    title: 'Calea Războinicului',
    description: 'Principiile fundamentale ale transformării Warriors Way',
    isFree: false,
    modules: [
      { id: 'cod-1', title: 'Prăpastia Sărăciei', duration: '15 min', order: 8, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=HgycdM2Kv9bbG8jElkMm8fdeRETDDyQMppNRwshHc1NqOnExY&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'cod-2', title: 'Vârful Prosperității', duration: '14 min', order: 9, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=mMLUkw-8JK6VJzsGVXUMh9xrO3g7MDHZEUkmUAM6mKhRPiYoJ&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'cod-3', title: 'Principiile Puterii', duration: '16 min', order: 10, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=IKAdFRdcxkNJ1nU_KlwzbC9zBGq6VkXGU0spVXvRaJ8_bC0y7&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'cod-4', title: 'Calea Producției', duration: '18 min', order: 11, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=X2GKGVhFhlDJ3dwf1eMxG9ZR4haC2D3AAw1rIF2Wrhw-xiJ1M&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'cod-5', title: 'Propulsia Puterii', duration: '15 min', order: 12, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=T8MRie5Ru2yX1gcRiwCM9OdXcyUcUVDrdDIEMR-3bPRzD0g-h&videoRatio=1.777778&type=v&skinColor=%232758EB' },
    ]
  },
  {
    id: 'codul',
    title: 'Codul Războinicului',
    description: 'Fapte reale, sentimente autentice și claritatea focusului',
    isFree: false,
    modules: [
      { id: 'cod-6', title: 'Faptele Reale', duration: '14 min', order: 13, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=VZCXh0rFRs9T9wUkGmRwpzvwDRACckCh9fUCbgsVdANBVGxas&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'cod-7', title: 'Sentimente Autentice', duration: '16 min', order: 14, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=jUnp2xOnawLG0lkXjgs9UNrX0EFDHFzxb3gLQQUe_a-vE3VGW&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'cod-8', title: 'Claritatea Focusului și Relevanța', duration: '15 min', order: 15, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=NEofrzS22dHISQgd0w6eAzLUAInXsNIKnBNBjLFQ7MIPPTgqM&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'cod-9', title: 'Rezultatele: Fructele Muncii Tale', duration: '14 min', order: 16, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=rI8YCx83yszNiuMKh1JUhGaMX-PS4M9G5To1CEY8JNhzKiFwa&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'cod-10', title: 'Codul: Îmbrățișarea Adevărului', duration: '15 min', order: 17, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=gsJBvgZA1geEBwFLP2RVtDrlrABbdG4Hbsj2ODEhDaqaU0YwD&videoRatio=1.777778&type=v&skinColor=%232758EB' },
    ]
  },
  {
    id: 'warrior-game',
    title: 'The Warrior Game',
    description: 'Cadrul, libertatea, focusul lunar și săptămânal pentru jocul imposibil',
    isFree: false,
    modules: [
      { id: 'game-11', title: 'Cadru pentru a Porni Jocul', duration: '16 min', order: 18, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=DlcwM4jQFxnLYl-xg9Fd5NaI35BuGG1QHyICfTYxaq2ZFhJgc&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'game-12', title: 'Libertatea: Descoperirea Imposibilului', duration: '18 min', order: 19, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=AQnv1ew43og91VhBPwYOgD9CUtaBIgMETkcRNRt0WvsejggQW&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'game-13', title: 'Concentrarea: Focusul Lunar', duration: '15 min', order: 20, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=ww9en50cyJ3ZCxrL9UR3pt_IDgukUCWQ3SUUSMb5bnsKLJxFF&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'game-14', title: 'Focul: Focusul Săptămânal', duration: '14 min', order: 21, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=rU8QJpWfCl4QI07Ikt_F3qBZH_fECGCMPjpxWwpMUdbjYw00E&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'game-15', title: 'Marea Tapiserie a Jocului', duration: '17 min', order: 22, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=3BK7otzQAkfG0lW_lIE8PopdFVnfhjkASwAZMH9yGOhTKBwfu&videoRatio=1.777778&type=v&skinColor=%232758EB' },
    ]
  },
  {
    id: 'stack',
    title: 'Stack-ul',
    description: 'Procesul de reîncadrare a poveștilor și transformare prin oprire, supunere, luptă și lovitură',
    isFree: false,
    modules: [
      { id: 'stack-16', title: 'Reîncadrarea Poveștilor', duration: '16 min', order: 23, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=s69B0sdFecgBrRrOpxkpkgafSNSXAyhSm5pd1JNIflYDyBWCR&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'stack-17', title: 'Stop: Răgazul Războinicului', duration: '15 min', order: 24, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=0cJHRYbZaVDK0FEV2AQg06t_ZBxVd1T66xpNMuhJaOaKA2EdS&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'stack-18', title: 'Supunerea: Adevărul Războinicului', duration: '17 min', order: 25, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=ywIbngow3hjMj4XgCQtgTRaMV9ZF1TDnmdzSTllXNavnjIU3e&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'stack-19', title: 'Lupta: Bătălia pentru Claritate', duration: '18 min', order: 26, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=XNfUR0zLR4Pa2QBvB48X7d_uiBIAEjnAWw1Cia4EJEMSQullv&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'stack-20', title: 'Lovitura: Apelul la Acțiune', duration: '16 min', order: 27, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=R1wzKMLEZH6md3Flg0YgdgNQNXEuD2TK0U4_NTOYNnIcz2FMc&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'stack-21', title: 'Rezumatul Stack-ului', duration: '14 min', order: 28, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=0uPaj7G6BdaeGQjUOVhXjs9d1krWHzQamwo1EtdQQa_H37jIf&videoRatio=1.777778&type=v&skinColor=%232758EB' },
    ]
  },
  {
    id: 'core4',
    title: 'Core 4',
    description: 'Stăpânirea și puterea în cele 4 domenii fundamentale: Corp, Ființă, Echilibru și Afacere',
    isFree: false,
    modules: [
      { id: 'core4-22', title: 'Stăpânirea și Puterea', duration: '18 min', order: 29, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=4IRSFt32AW9mfmGVMiANew4S2N0peGzCIgtbiTkUCNavJ31AX&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'core4-23', title: 'Corpul: Fitness și Alimentație', duration: '16 min', order: 30, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=BBoWMbDX34aqYVxPAd8ZhQbIXonUzk-_Pd2xEX4jiZMLN3BdY&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'core4-24', title: 'Ființa: Meditația și Memoriile', duration: '15 min', order: 31, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=VtjGFcfNxLiGU9MRiUI76oiB21sERz6_M985QIxdS6VXD0lsQ&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'core4-25', title: 'Echilibrul: Partener și Posteritate', duration: '17 min', order: 32, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=hTBc1jK3SErP31xRy1ZItI3YWQX7SjzROzB8J543UYq-diUFP&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'core4-26', title: 'Afacerea: Descoperirea și Declararea', duration: '16 min', order: 33, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=DkPRhcA5ixWXRRDhUju1sCNwEg1DYvT7tx0OFS9sMO6WUUtdE&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'core4-27', title: 'Joacă Jocul Zilnic Core 4', duration: '14 min', order: 34, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=HcmF3t3PGo7dtl5NhzAEsdczCExc2zHlzIW2FTAZEYKrKUQ8b&videoRatio=1.777778&type=v&skinColor=%232758EB' },
    ]
  },
  {
    id: 'door',
    title: 'The Warriors Door',
    description: 'Ușa producției zilnice: Potențial, Plan, Producție și Profit - sistemul pentru focalizare și rezultate',
    isFree: false,
    modules: [
      { id: 'door-28', title: 'Ușa: Perspectivă și Producție', duration: '18 min', order: 35, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=CLbfjprXBp0bR1PMgQRnsdTTHF5jgjLm1t4aFM0-AKkZ12Aka&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'door-29', title: 'Ușa Posibilităților și Lista Prioritară', duration: '15 min', order: 36, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=ziJUc8NbD8zZ3Um6mRcM9MjHQAjFCsEIkj6BAFpYGpSGMnRwf&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'door-30', title: 'Ușa Războiului și Cadranele Deciziei', duration: '17 min', order: 37, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=37IdKHZqcWN5Q5jdah7oZVtIfNAmM2kG1mgcxTYaIW6_O3DMS&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'door-31', title: 'Ușa și Stack-ul de Război', duration: '16 min', order: 38, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=Q56FSAdVH6fKwlXOxi4DpsQFhV0OKBinn8nRaLihEGLOdwoYW&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'door-32', title: 'Loviturile și Scorul Blackjack', duration: '18 min', order: 39, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=E07YL9TPhSYBwS0GSkWcqhzAKlDMwgyPsF81XX8LIqUuAkLEE&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'door-33', title: 'Jocul Final al Profitului', duration: '15 min', order: 40, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=xwaB1YXWy0OXBQoWgQVr7MFDR1XdEjm_O0zTuANtZ3x9vXNqi&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'door-34', title: 'Ușa: Rezumat Cuprinzător', duration: '14 min', order: 41, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=kwYMDsu6jIyyIyEsa3R_0IfPEW1ScCsET9cdfnpJ0RiOPSpob&videoRatio=1.777778&type=v&skinColor=%232758EB' },
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
