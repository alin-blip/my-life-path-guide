import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, ArrowRight, Check, BookOpen, Lightbulb } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JournalEntry } from '@/components/journal/JournalEntry';
import { JournalList } from '@/components/journal/JournalList';
import { JournalDetail } from '@/components/journal/JournalDetail';

interface JournalEntryType {
  id: string;
  title: string;
  content: string;
  lesson: string;
  date: string;
  timestamp?: string;
}

interface JournalingStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

const DAILY_PROMPTS = [
  'Ce aș face dacă ar fi imposibil să eșuez?',
  'Care e cea mai mare frică pe care o am azi și cum o transform în fuel?',
  'Ce lecție am învățat ieri pe care nu vreau s-o uit niciodată?',
  'Dacă aș avea doar 1 an de trăit, ce aș schimba ACUM?',
  'Cine e persoana care m-a influențat cel mai mult și ce am învățat?',
  'Care e povestea limitantă pe care mi-o spun cel mai des?',
  'Ce aș face diferit dacă nimeni nu m-ar judeca?',
  'Care e cel mai mare risc pe care l-aș lua dacă aș avea curaj?',
  'Ce obicei mic ar avea cel mai mare impact dacă l-aș face zilnic?',
  'Cui ar trebui să-i spun "mulțumesc" sau "îmi pare rău" azi?',
  'Ce versiune a mea din viitor ar fi mândră de decizia pe care o iau azi?',
  'Care e un lucru pe care-l evit și de ce?',
  'Ce ar fi posibil dacă aș crede 100% în mine?',
  'Care e cel mai important lucru pe care l-am realizat anul acesta?',
];

export function JournalingStep({ completed, onComplete, onNext }: JournalingStepProps) {
  const [showJournal, setShowJournal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("new");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(null);

  // Get today's prompt based on day of year
  const todayPrompt = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  }, []);

  useEffect(() => {
    if (selectedEntry) {
      setActiveTab("detail");
    }
  }, [selectedEntry]);

  const handleStackComplete = () => {
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  const handleEntrySaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("list");
  };

  const handleSelectEntry = (entry: JournalEntryType) => {
    setSelectedEntry(entry);
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
    setActiveTab("list");
  };

  // Completed state
  if (completed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-green-500/20">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Jurnaling Completat!</h1>
            <p className="text-muted-foreground">Ai finalizat sesiunea de jurnaling.</p>
          </div>
          <Button onClick={onNext} size="lg" className="w-full gap-2">
            Continuă <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      </div>
    );
  }

  // Show full journal interface
  if (showJournal) {
    return (
      <div className="min-h-[70vh] px-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="list">Istoric jurnal</TabsTrigger>
            <TabsTrigger value="new">Intrare nouă</TabsTrigger>
            {selectedEntry && (
              <TabsTrigger value="detail">Detalii</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list">
            <JournalList
              onSelectEntry={handleSelectEntry}
              key={`journal-list-${refreshTrigger}`}
            />
          </TabsContent>

          <TabsContent value="new">
            <JournalEntry onEntrySaved={handleEntrySaved} />
          </TabsContent>

          {selectedEntry && (
            <TabsContent value="detail">
              <JournalDetail entry={selectedEntry} onBack={handleBackToList} />
            </TabsContent>
          )}
        </Tabs>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleStackComplete}
              size="lg"
              className="w-full gap-2 bg-green-500 hover:bg-green-600"
            >
              <Check className="h-5 w-5" />
              Finalizează Jurnaling
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Start screen with daily prompt
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/20">
            <PenTool className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold">Jurnaling</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Reflectează, documentează, crește.
          </p>
        </div>

        {/* Daily prompt */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-500 font-medium mb-1">Prompt-ul de azi:</p>
              <p className="text-lg font-medium text-foreground italic">
                "{todayPrompt}"
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-orange-500" />
            Ce poți face:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
            <li>Răspunde la prompt-ul de azi</li>
            <li>Citește intrări anterioare din jurnal</li>
            <li>Documentează lecțiile învățate</li>
          </ul>
        </div>

        <Button
          onClick={() => setShowJournal(true)}
          size="lg"
          className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
        >
          <PenTool className="h-5 w-5" />
          Deschide Jurnalul
        </Button>
      </Card>
    </div>
  );
}
