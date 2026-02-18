import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ultimateYouDays, totalUltimateYouDays } from '@/data/ultimateYouContent';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, Lock, Play, ChevronLeft, Sparkles, ChevronDown, ChevronUp, BookOpen, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextToSpeechButton } from '@/components/ui/TextToSpeechButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ReactMarkdown from 'react-markdown';

const introRo = `## 🎯 Ce este The Ultimate YOU?

**The Ultimate YOU** este un program transformațional de **18 zile** conceput să te ajute să-ți descoperi și să-ți activezi potențialul maxim. Nu este doar un curs — este o experiență completă de creștere personală care îți va transforma modul în care gândești, simți și acționezi.

## 📚 Cele 3 Module

### 🔥 Modulul 1: Personal Power (Zilele 1-7)
Descoperă puterea deciziilor tale și învață să-ți controlezi stările emoționale. Vei învăța:
- **Puterea Deciziei** — cum o singură decizie îți poate schimba viața
- **Cele 6 Nevoi Umane** — ce te motivează cu adevărat
- **Triad-ul Stărilor** — cum să-ți schimbi instant starea emoțională
- **Arta Sensului** — cum să dai sens oricărei experiențe
- **Reguli și Valori** — cum să trăiești conform valorilor tale
- **Vocabularul Transformațional** — cum cuvintele tale îți modelează realitatea

### ⚡ Modulul 2: Get the Edge (Zilele 8-13)
Obține avantajul competitiv în viață prin strategii de nivel înalt:
- **RPM — Metoda de Planificare Rapidă** — cum să-ți atingi obiectivele de 10x mai repede
- **Energie Pură** — cum să ai energie nelimitată
- **Relații Extraordinare** — cum să construiești conexiuni profunde
- **Libertate Financiară** — strategii pentru abundență financiară

### 💎 Modulul 3: Inner Strength (Zilele 14-18)
Dezvoltă o forță interioară de neclintit:
- **Depășirea Fricilor** — cum să transformi frica în putere
- **Contribuție și Scop** — descoperă-ți misiunea de viață
- **Identitatea Supremă** — devino versiunea ta cea mai puternică
- **Planul de Acțiune Final** — creează un plan concret pentru viitorul tău extraordinar

## 🛠 Cum Funcționează?

Fiecare zi include:
1. **📖 Lecție** — conținut educațional profund, citit sau ascultat cu AI
2. **✍️ Exerciții** — jurnalizare ghidată și reflecții personale
3. **🤖 AI Coach** — un coach AI dedicat care te ghidează prin fiecare lecție
4. **🎯 Breakthrough** — momente de revelație și transformare

## 🚀 Ești Gata?

Acest program nu este pentru cei care caută răspunsuri ușoare. Este pentru cei care sunt pregătiți să facă schimbări reale. **Începe cu Ziua 1** și angajează-te să parcurgi toate cele 18 zile. Viața ta nu va mai fi la fel.`;

const introEn = `## 🎯 What is The Ultimate YOU?

**The Ultimate YOU** is a **18-day** transformational program designed to help you discover and activate your maximum potential. It's not just a course — it's a complete personal growth experience that will transform the way you think, feel, and act.

## 📚 The 3 Modules

### 🔥 Module 1: Personal Power (Days 1-7)
Discover the power of your decisions and learn to control your emotional states. You'll learn:
- **The Power of Decision** — how a single decision can change your life
- **The 6 Human Needs** — what truly motivates you
- **The Triad of States** — how to instantly change your emotional state
- **The Art of Meaning** — how to give meaning to any experience
- **Rules and Values** — how to live according to your values
- **Transformational Vocabulary** — how your words shape your reality

### ⚡ Module 2: Get the Edge (Days 8-13)
Gain the competitive edge in life through high-level strategies:
- **RPM — Rapid Planning Method** — how to achieve your goals 10x faster
- **Pure Energy** — how to have unlimited energy
- **Extraordinary Relationships** — how to build deep connections
- **Financial Freedom** — strategies for financial abundance

### 💎 Module 3: Inner Strength (Days 14-18)
Develop unwavering inner strength:
- **Overcoming Fears** — how to transform fear into power
- **Contribution and Purpose** — discover your life mission
- **The Ultimate Identity** — become your most powerful version
- **The Final Action Plan** — create a concrete plan for your extraordinary future

## 🛠 How Does It Work?

Each day includes:
1. **📖 Lesson** — deep educational content, read or listened to with AI
2. **✍️ Exercises** — guided journaling and personal reflections
3. **🤖 AI Coach** — a dedicated AI coach guiding you through each lesson
4. **🎯 Breakthrough** — moments of revelation and transformation

## 🚀 Are You Ready?

This program is not for those seeking easy answers. It's for those ready to make real changes. **Start with Day 1** and commit to completing all 18 days. Your life will never be the same.`;

const UltimateYouOverview: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<Record<number, any>>({});

  useEffect(() => {
    if (!user) return;
    const fetchAllProgress = async () => {
      const { data } = await supabase
        .from('ultimate_you_progress')
        .select('*')
        .eq('user_id', user.id);
      if (data) {
        const map: Record<number, any> = {};
        data.forEach(p => { map[p.day_number] = p; });
        setProgressData(map);
      }
    };
    fetchAllProgress();
  }, [user]);

  const completedCount = Object.values(progressData).filter(
    p => p.lesson_completed && p.exercise_completed
  ).length;
  const overallProgress = Math.round((completedCount / totalUltimateYouDays) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/programs')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          {language === 'ro' ? 'Înapoi la Programe' : 'Back to Programs'}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <Badge variant="secondary">18 {language === 'ro' ? 'Zile' : 'Days'}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">The Ultimate YOU</h1>
          <p className="text-muted-foreground">
            {language === 'ro'
              ? 'Program de 18 zile pentru a-ți descoperi potențialul maxim. Transformă-ți deciziile, emoțiile și acțiunile pentru o viață extraordinară.'
              : 'An 18-day program to discover your ultimate potential. Transform your decisions, emotions, and actions for an extraordinary life.'}
          </p>
        </div>

        {/* Introduction Section */}
        <Collapsible defaultOpen={completedCount === 0} className="mb-8">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {language === 'ro' ? 'Introducere — Despre ce este acest program' : 'Introduction — What this program is about'}
                </span>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-5 pb-5 border-t border-border pt-4">
                <div className="flex justify-end mb-4">
                  <TextToSpeechButton
                    text={language === 'ro' ? introRo.replace(/[#*\[\]()🎯📚🔥⚡💎🛠🚀📖✍️🤖]/g, '') : introEn.replace(/[#*\[\]()🎯📚🔥⚡💎🛠🚀📖✍️🤖]/g, '')}
                    variant="outline"
                    size="sm"
                    label={language === 'ro' ? 'Ascultă introducerea' : 'Listen to introduction'}
                    className="gap-2"
                  />
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-6 mb-3 first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h3>,
                      p: ({ children }) => <p className="text-muted-foreground mb-3 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="space-y-1.5 mb-4 ml-1">{children}</ul>,
                      ol: ({ children }) => <ol className="space-y-1.5 mb-4 ml-1 list-decimal list-inside">{children}</ol>,
                      li: ({ children }) => <li className="text-muted-foreground text-sm">{children}</li>,
                      strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                    }}
                  >
                    {language === 'ro' ? introRo : introEn}
                  </ReactMarkdown>
                </div>
                <button
                  onClick={() => navigate('/ultimate-you/1')}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Rocket className="h-5 w-5" />
                  {language === 'ro' ? 'Începe cu Ziua 1' : 'Start with Day 1'}
                </button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">
              {language === 'ro' ? 'Progresul tău' : 'Your Progress'}
            </h3>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalUltimateYouDays} {language === 'ro' ? 'completate' : 'completed'}
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: totalUltimateYouDays }, (_, i) => {
            const dayNum = i + 1;
            const dayData = ultimateYouDays.find(d => d.day === dayNum);
            const isImplemented = !!dayData;
            const prog = progressData[dayNum];
            const isComplete = prog?.lesson_completed && prog?.exercise_completed;
            const isStarted = prog && (prog.lesson_completed || prog.exercise_completed);

            return (
              <button
                key={dayNum}
                onClick={() => isImplemented && navigate(`/ultimate-you/${dayNum}`)}
                disabled={!isImplemented}
                className={cn(
                  'w-full flex items-center gap-4 bg-card border rounded-xl p-4 text-left transition-all',
                  isImplemented && 'hover:shadow-md hover:border-primary/30 cursor-pointer',
                  !isImplemented && 'opacity-50 cursor-not-allowed',
                  isComplete && 'border-green-500/30 bg-green-500/5'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm',
                    isComplete && 'bg-green-500 text-white',
                    isStarted && !isComplete && 'bg-primary/20 text-primary',
                    !isStarted && isImplemented && 'bg-muted text-muted-foreground',
                    !isImplemented && 'bg-muted/50 text-muted-foreground/50'
                  )}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : !isImplemented ? <Lock className="h-4 w-4" /> : dayNum}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {language === 'ro' ? 'Ziua' : 'Day'} {dayNum}
                    {dayData && ` — ${language === 'ro' ? dayData.title : dayData.titleEn}`}
                  </p>
                  {isStarted && !isComplete && (
                    <p className="text-xs text-muted-foreground mt-0.5">{language === 'ro' ? 'În progres' : 'In progress'}</p>
                  )}
                  {!isImplemented && (
                    <p className="text-xs text-muted-foreground mt-0.5">{language === 'ro' ? 'În curând' : 'Coming soon'}</p>
                  )}
                </div>
                {isImplemented && !isComplete && <Play className="h-5 w-5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UltimateYouOverview;
