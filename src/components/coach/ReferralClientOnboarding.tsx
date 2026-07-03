import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalDescription } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Target,
  Brain,
  Zap,
  Users,
  Calendar,
  CheckCircle2,
  Flame,
  Trophy,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Crown,
} from 'lucide-react';

interface CoachInfo {
  display_name: string;
  bio: string | null;
}

const content = {
  ro: {
    welcomeTitle: 'Bine ai venit în Echipă! 🎯',
    welcomeSubtitle: 'Coach-ul tău, {coachName}, ți-a oferit acces la un sistem complet de transformare.',
    
    whatYouGet: 'CE AI LA DISPOZIȚIE',
    whatYouGetSubtitle: 'Instrumente folosite de antreprenori de succes pentru rezultate 10X mai rapide',
    
    // Tool categories
    executionTitle: '🎯 EXECUȚIE ZILNICĂ',
    executionSubtitle: 'Sistemul care te ține pe drumul cel bun',
    
    clarityTitle: '🧠 CLARITATE & STRATEGIE',
    claritySubtitle: 'AI care te ghidează prin blocaje',
    
    communityTitle: '👥 COMUNITATE & SUPORT',
    communitySubtitle: 'Nu ești singur în această călătorie',
    
    // Tools
    tool1Name: 'The Door System',
    tool1Desc: 'Planificare săptămânală cu review Domino. Știi exact CE să faci și CÂND.',
    
    tool2Name: 'Core 4 Daily',
    tool2Desc: '8 acțiuni zilnice pentru Corp, Spirit, Relații și Business. Fundația succesului.',
    
    tool3Name: 'Biz 4 Accelerator',
    tool3Desc: 'Content, Engage, Outreach, Close — 4 acțiuni pentru atragere clienți non-stop.',
    
    tool4Name: 'Stacks AI',
    tool4Desc: 'Conversații ghidate pentru claritate emoțională, business și obiective. 24/7.',
    
    tool5Name: 'Obiective Anuale/90 Zile',
    tool5Desc: 'Planuri concrete defalcate în acțiuni săptămânale. Știi mereu unde mergi.',
    
    tool6Name: 'Master Plan (Napoleon Hill)',
    tool6Desc: '13 principii de succes aplicate în viața ta. AI-ul te ghidează pas cu pas.',
    
    tool7Name: 'Brotherhood Community',
    tool7Desc: 'Comunitate de oameni cu aceleași obiective. Responsabilizare reciprocă.',
    
    tool8Name: 'Coach Direct Access',
    tool8Desc: 'Mesaje directe cu {coachName}. Primești suport când ai nevoie.',
    
    // Differentiator
    diffTitle: 'De Ce Acest Sistem Funcționează',
    diff1: 'Nu primești doar informație — primești un SISTEM de execuție',
    diff2: 'AI Coach disponibil 24/7 când te blochezi',
    diff3: 'Streak-uri și XP care te motivează să continui',
    diff4: 'Coach-ul tău vede progresul și intervine când e nevoie',
    
    // CTA
    ctaTitle: 'Ești Gata să Începi?',
    ctaSubtitle: 'Primul pas: completează obiectivele tale anuale',
    
    startButton: 'Începe Acum',
    laterButton: 'Mai târziu',
    
    // Badge
    coachBadge: 'Client VIP',
    
    // First step recommendation
    firstStepTitle: 'Recomandare: Începe cu obiectivele tale',
    firstStepDesc: 'Coach-ul tău te va monitoriza și ghida în atingerea lor.',
  },
  en: {
    welcomeTitle: 'Welcome to the Team! 🎯',
    welcomeSubtitle: 'Your coach, {coachName}, has given you access to a complete transformation system.',
    
    whatYouGet: 'WHAT YOU GET',
    whatYouGetSubtitle: 'Tools used by successful entrepreneurs for 10X faster results',
    
    // Tool categories
    executionTitle: '🎯 DAILY EXECUTION',
    executionSubtitle: 'The system that keeps you on track',
    
    clarityTitle: '🧠 CLARITY & STRATEGY',
    claritySubtitle: 'AI that guides you through blockers',
    
    communityTitle: '👥 COMMUNITY & SUPPORT',
    communitySubtitle: 'You\'re not alone in this journey',
    
    // Tools
    tool1Name: 'The Door System',
    tool1Desc: 'Weekly planning with Domino review. Know exactly WHAT to do and WHEN.',
    
    tool2Name: 'Core 4 Daily',
    tool2Desc: '8 daily actions for Body, Spirit, Relationships, and Business. The foundation of success.',
    
    tool3Name: 'Biz 4 Accelerator',
    tool3Desc: 'Content, Engage, Outreach, Close — 4 actions for non-stop client attraction.',
    
    tool4Name: 'AI Stacks',
    tool4Desc: 'Guided conversations for emotional clarity, business, and objectives. 24/7.',
    
    tool5Name: 'Annual/90-Day Objectives',
    tool5Desc: 'Concrete plans broken into weekly actions. Always know where you\'re going.',
    
    tool6Name: 'Master Plan (Napoleon Hill)',
    tool6Desc: '13 success principles applied to your life. AI guides you step by step.',
    
    tool7Name: 'Brotherhood Community',
    tool7Desc: 'Community of people with the same goals. Mutual accountability.',
    
    tool8Name: 'Direct Coach Access',
    tool8Desc: 'Direct messages with {coachName}. Get support when you need it.',
    
    // Differentiator
    diffTitle: 'Why This System Works',
    diff1: 'You don\'t just get information — you get an EXECUTION system',
    diff2: 'AI Coach available 24/7 when you\'re stuck',
    diff3: 'Streaks and XP that motivate you to continue',
    diff4: 'Your coach sees your progress and intervenes when needed',
    
    // CTA
    ctaTitle: 'Ready to Start?',
    ctaSubtitle: 'First step: complete your annual objectives',
    
    startButton: 'Start Now',
    laterButton: 'Later',
    
    // Badge
    coachBadge: 'VIP Client',
    
    // First step recommendation
    firstStepTitle: 'Recommendation: Start with your objectives',
    firstStepDesc: 'Your coach will monitor and guide you in achieving them.',
  }
};

export const ReferralClientOnboarding: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  
  const [isOpen, setIsOpen] = useState(false);
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const checkReferralStatus = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has seen this onboarding
      const seenKey = `referral_onboarding_seen_${user.id}`;
      const hasSeen = localStorage.getItem(seenKey);
      
      if (hasSeen) {
        setLoading(false);
        return;
      }

      // Check if user is a referral
      const { data: referral, error } = await supabase
        .from('referrals')
        .select(`
          id,
          coach_profiles!inner (
            display_name,
            bio
          )
        `)
        .eq('referred_user_id', user.id)
        .single();

      if (error || !referral) {
        setLoading(false);
        return;
      }

      // User is a referral - show onboarding
      const coachProfile = referral.coach_profiles as unknown as CoachInfo;
      setCoachInfo(coachProfile);
      setIsOpen(true);
    } catch (err) {
      console.error('Error checking referral status:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkReferralStatus();
  }, [checkReferralStatus]);

  const handleClose = () => {
    if (user?.id) {
      localStorage.setItem(`referral_onboarding_seen_${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleStart = () => {
    handleClose();
    // Navigate to objectives
    window.location.href = '/objectives';
  };

  if (loading || !coachInfo) return null;

  const coachName = coachInfo.display_name;

  const tools = [
    {
      category: t.executionTitle,
      categorySubtitle: t.executionSubtitle,
      items: [
        { name: t.tool1Name, desc: t.tool1Desc, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { name: t.tool2Name, desc: t.tool2Desc, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { name: t.tool3Name, desc: t.tool3Desc, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      ]
    },
    {
      category: t.clarityTitle,
      categorySubtitle: t.claritySubtitle,
      items: [
        { name: t.tool4Name, desc: t.tool4Desc, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { name: t.tool5Name, desc: t.tool5Desc, icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
        { name: t.tool6Name, desc: t.tool6Desc, icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-500/10' },
      ]
    },
    {
      category: t.communityTitle,
      categorySubtitle: t.communitySubtitle,
      items: [
        { name: t.tool7Name, desc: t.tool7Desc, icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        { name: t.tool8Name, desc: t.tool8Desc.replace('{coachName}', coachName), icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      ]
    },
  ];

  const differentiators = [t.diff1, t.diff2, t.diff3, t.diff4];

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen} className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
      
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* Header */}
            <ResponsiveModalHeader className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  {t.coachBadge}
                </Badge>
              </div>
              <ResponsiveModalTitle className="text-2xl md:text-3xl font-bold">
                {t.welcomeTitle}
              </ResponsiveModalTitle>
              <ResponsiveModalDescription className="text-base mt-2">
                {t.welcomeSubtitle.replace('{coachName}', coachName)}
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            {/* What You Get Section */}
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-foreground">{t.whatYouGet}</h3>
                <p className="text-sm text-muted-foreground">{t.whatYouGetSubtitle}</p>
              </div>

              <div className="space-y-6">
                {tools.map((category, catIndex) => (
                  <div key={catIndex}>
                    <div className="mb-3">
                      <h4 className="font-semibold text-foreground">{category.category}</h4>
                      <p className="text-xs text-muted-foreground">{category.categorySubtitle}</p>
                    </div>
                    <div className="grid gap-3">
                      {category.items.map((tool, toolIndex) => (
                        <Card key={toolIndex} className="border-border/50">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${tool.bg} shrink-0`}>
                                <tool.icon className={`h-4 w-4 ${tool.color}`} />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-semibold text-sm text-foreground">{tool.name}</h5>
                                <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why This Works */}
            <Card className="mb-6 border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <h4 className="font-semibold text-foreground">{t.diffTitle}</h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {differentiators.map((diff, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{diff}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* First Step Recommendation */}
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">{t.firstStepTitle}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{t.firstStepDesc}</p>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center space-y-3">
              <h4 className="font-bold text-foreground">{t.ctaTitle}</h4>
              <p className="text-sm text-muted-foreground">{t.ctaSubtitle}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button onClick={handleStart} size="lg" className="gap-2">
                  {t.startButton}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button onClick={handleClose} variant="outline" size="lg">
                  {t.laterButton}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      
    </ResponsiveModal>
  );
};
