import React, { useState, useEffect } from 'react';
import { ProgramsLayout } from '@/components/programs/ProgramsLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, Play, Lock, CheckCircle2, Clock, ChevronRight, ChevronDown,
  Crown, Rocket, ArrowRight, ArrowLeft, Menu, X, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { WarriorVideoPlayer } from '@/components/warriors-way/WarriorVideoPlayer';
import { PremiumGate } from '@/components/warriors-way/PremiumGate';
import { useWarriorsCourse } from '@/hooks/useWarriorsCourse';
import { WarriorAiMentor, WarriorAiMentorButton } from '@/components/warriors-way/WarriorAiMentor';
import { WarriorTrainerPreview } from '@/components/warriors-way/WarriorTrainerPreview';
import { WarriorTrainerSalesLetter } from '@/components/warriors-way/WarriorTrainerSalesLetter';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';


interface CourseModule {
  id: string;
  title: string;
  duration: string;
  order: number;
  videoUrl?: string;
}

interface CourseSection {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  isUpgrade?: boolean;
  modules: CourseModule[];
}

// Course structure
const COURSE_SECTIONS: CourseSection[] = [
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
    description: 'Procesul de reîncadrare a poveștilor și transformare',
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
    description: 'Stăpânirea și puterea în cele 4 domenii fundamentale',
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
    description: 'Ușa producției zilnice: Potențial, Plan, Producție și Profit',
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
  {
    id: 'way',
    title: 'The Warriors Way',
    description: 'Construiește-ți viața în jurul Căii Războinicului',
    isFree: false,
    modules: [
      { id: 'way-35', title: 'Construiește-ți Viața în Jurul Căii', duration: '18 min', order: 42, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=LsEoqFUcFXjWwxUDmTU7VoRPHRgTMBciv0JKfnFNMAbWElipb&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'way-36', title: 'Harta de Focalizare și Misiunea Lunii', duration: '16 min', order: 43, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=gYHVs0gaNTGaj1tSxhOut4GIDoxbHjK6nVZA09tWSx-bDN1g6&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'way-37', title: 'Harta Focului: Victorii Săptămânale', duration: '15 min', order: 44, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=MBs2431jKF-MO3l1OidrDTjzWUL_QzdhNVd1F1E2ZDasE0GKF&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'way-38', title: 'Jocul Zilnic: Măiestria de Astăzi', duration: '17 min', order: 45, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=z8dcxRsOixzNiK8TxF0gTyHO80qYVN8IKJMlbFg26jsRxyfRE&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'way-39', title: 'Cortul Generalului', duration: '16 min', order: 46, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=qtPEkwCbtMlOkEOaGwF_3KFOxSpgZBC94wgNa1phIq9R9CU9R&videoRatio=1.777778&type=v&skinColor=%232758EB' },
      { id: 'way-40', title: 'Odiseea Războinicului Recapturată', duration: '20 min', order: 47, videoUrl: 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=BQ3DRmhqiB9eQulgX21jc097rVkM1gA29wRNNHjjchKME1MFG&videoRatio=1.777778&type=v&skinColor=%232758EB' },
    ]
  },
  {
    id: 'trainer',
    title: 'Warrior Trainer',
    description: 'Devino antrenorul propriei tale vieți - Investiție: 5.000 EUR',
    isFree: false,
    isUpgrade: true,
    modules: [
      { id: 'trainer-intro', title: 'Descoperă Warrior Trainer', duration: '20 min', order: 48, videoUrl: '' },
    ]
  },
];

const WarriorsWay: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [showAiMentor, setShowAiMentor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showTrainerPreview, setShowTrainerPreview] = useState(false);
  const [showTrainerSalesLetter, setShowTrainerSalesLetter] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['intro']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { progress, isModuleCompleted, markModuleComplete, overallProgress } = useWarriorsCourse();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) { setIsAdmin(false); return; }
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

  useEffect(() => {
    const checkPurchase = async () => {
      if (!user) { setHasPurchased(false); return; }
      const { data } = await supabase
        .from('course_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', 'warrior-accelerator')
        .maybeSingle();
      setHasPurchased(!!data);
    };
    checkPurchase();
  }, [user]);

  const totalModules = COURSE_SECTIONS.reduce((acc, section) => acc + section.modules.length, 0);
  const completedModules = progress.filter(p => p.completed).length;

  const isModuleUnlocked = (moduleId: string): boolean => {
    if (isAdmin) return true;
    if (hasPurchased) return true;
    return moduleId === 'intro-1';
  };

  const handleModuleClick = (moduleId: string, section: CourseSection) => {
    if (section.isUpgrade) {
      setShowTrainerPreview(true);
      return;
    }
    if (!isAdmin && !isModuleUnlocked(moduleId)) {
      setShowPremiumGate(true);
      return;
    }
    setSelectedModule(moduleId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleCloseVideo = () => {
    setSelectedModule(null);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (showTrainerSalesLetter) {
    return (
      <ProgramsLayout activeTab="classroom" showNavBar={false}>
        <WarriorTrainerSalesLetter 
          onBack={() => setShowTrainerSalesLetter(false)}
          onEnroll={() => {}}
        />
      </ProgramsLayout>
    );
  }

  if (showTrainerPreview) {
    return (
      <ProgramsLayout activeTab="classroom" showNavBar={false}>
        <WarriorTrainerPreview 
          onBack={() => setShowTrainerPreview(false)}
          onOpenSalesLetter={() => {
            setShowTrainerPreview(false);
            setShowTrainerSalesLetter(true);
          }}
        />
      </ProgramsLayout>
    );
  }

  // Sidebar content (reused in both desktop sidebar and mobile sheet)
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm truncate">Warrior Certified Coach</h2>
            <p className="text-xs text-muted-foreground">{completedModules}/{totalModules} module</p>
          </div>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1 text-right">{overallProgress}%</p>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto">
        {COURSE_SECTIONS.map((section, sectionIndex) => {
          const sectionCompleted = section.modules.filter(m => isModuleCompleted(m.id)).length;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div key={section.id} className="border-b border-border/30">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0',
                  sectionCompleted === section.modules.length
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : section.isFree
                      ? 'bg-amber-500/20 text-amber-500'
                      : 'bg-muted text-muted-foreground'
                )}>
                  {sectionCompleted === section.modules.length ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    sectionIndex + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{section.title}</span>
                    {section.isFree && (
                      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 text-[10px] px-1.5 py-0">
                        FREE
                      </Badge>
                    )}
                    {section.isUpgrade && (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0">
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        UP
                      </Badge>
                    )}
                    {!section.isFree && !section.isUpgrade && (
                      <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{sectionCompleted}/{section.modules.length}</p>
                </div>
                <ChevronDown className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform shrink-0',
                  isExpanded && 'rotate-180'
                )} />
              </button>

              {/* Module list */}
              {isExpanded && (
                <div className="pb-2">
                  {section.modules.map((module) => {
                    const isCompleted = isModuleCompleted(module.id);
                    const isLocked = !isModuleUnlocked(module.id);
                    const isSelected = selectedModule === module.id;

                    return (
                      <button
                        key={module.id}
                        onClick={() => handleModuleClick(module.id, section)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all text-sm',
                          isSelected
                            ? 'bg-primary/10 border-l-2 border-primary'
                            : 'hover:bg-muted/50 border-l-2 border-transparent',
                          isLocked && 'opacity-60'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center w-6 h-6 rounded-full text-xs shrink-0',
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isLocked
                              ? 'bg-muted-foreground/20 text-muted-foreground'
                              : isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                        )}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : isLocked ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-xs font-medium truncate',
                            isCompleted && 'text-emerald-500',
                            isSelected && !isCompleted && 'text-primary'
                          )}>
                            {module.order}. {module.title}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            {module.duration}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Find current module data for content area
  const allModules = COURSE_SECTIONS.flatMap(s => s.modules);
  const currentModule = selectedModule ? allModules.find(m => m.id === selectedModule) : null;
  const currentIndex = selectedModule ? allModules.findIndex(m => m.id === selectedModule) : -1;
  const previousModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;
  const nextSection = nextModule ? COURSE_SECTIONS.find(s => s.modules.some(m => m.id === nextModule.id)) : null;
  const canGoNext = nextSection?.isFree || isAdmin || hasPurchased;

  return (
    <ProgramsLayout activeTab="classroom" showNavBar={false} sidebar={sidebarContent}>
      <div className="flex flex-col h-full">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {selectedModule && currentModule ? (
            /* Video Player + Lesson Content */
            <WarriorVideoPlayer
              moduleId={selectedModule}
              moduleTitle={currentModule.title}
              moduleOrder={currentModule.order}
              videoUrl={currentModule.videoUrl}
              onClose={handleCloseVideo}
              onComplete={async () => { await markModuleComplete(selectedModule); }}
              hasPrevious={!!previousModule}
              hasNext={!!nextModule && !!canGoNext}
              onPrevious={() => previousModule && setSelectedModule(previousModule.id)}
              onNext={() => nextModule && canGoNext && setSelectedModule(nextModule.id)}
            />
          ) : (
            /* Welcome / CTA screen when no module selected */
            <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Link to="/programs" className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Warrior Certified Coach</h1>
                  <p className="text-muted-foreground">Transformă-ți viața prin Calea Războinicului</p>
                </div>
              </div>

              {/* CTA Banner */}
              {!hasPurchased && !isAdmin && (
                <Card className="bg-gradient-to-r from-primary/10 via-amber-500/10 to-orange-500/10 border-primary/20">
                  <CardContent className="py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Rocket className="h-8 w-8 text-primary shrink-0" />
                        <div>
                          <h3 className="font-bold text-lg">Deblochează Toate Cele 47+ Lecții</h3>
                          <p className="text-sm text-muted-foreground">
                            Acces complet la curs + platforma WarriorOS - 970 EUR
                          </p>
                        </div>
                      </div>
                      <Link to="/warrior-launch-accelerator">
                        <Button className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90">
                          <Rocket className="h-4 w-4 mr-2" />
                          Obține Acces Complet
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress Card */}
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

              {/* Prompt to select a lesson */}
              <div className="text-center py-8">
                <Play className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isMobile ? 'Deschide meniul pentru a alege o lecție' : 'Selectează o lecție din sidebar'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Alege un modul din lista din stânga pentru a începe sau continua cursul.
                </p>
                {isMobile && (
                  <Button variant="outline" className="mt-4 gap-2" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-4 w-4" />
                    Deschide Lista de Lecții
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

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
          if (section?.isFree || isAdmin || hasPurchased) {
            setSelectedModule(moduleId);
          } else {
            setShowPremiumGate(true);
          }
        }}
      />
    </ProgramsLayout>
  );
};

export default WarriorsWay;
