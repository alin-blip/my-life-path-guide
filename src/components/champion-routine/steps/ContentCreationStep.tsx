import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Video, Sparkles, ArrowRight, Loader2, Edit3, Check, BookOpen, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PomodoroTimer } from '../PomodoroTimer';
import { StorytellingStack } from '@/components/content-creation/StorytellingStack';

interface ContentCreationStepProps {
  topic: string;
  script: string;
  pomodoroSessions: number;
  onTopicChange: (topic: string) => void;
  onScriptChange: (script: string) => void;
  onPomodoroComplete: (sessions: number) => void;
  onNext: () => void;
}

type ContentPhase = 'method' | 'topic' | 'storytelling' | 'script' | 'create';
type CreationMethod = 'simple' | 'storytelling';

export function ContentCreationStep({
  topic,
  script,
  pomodoroSessions,
  onTopicChange,
  onScriptChange,
  onPomodoroComplete,
  onNext,
}: ContentCreationStepProps) {
  const [phase, setPhase] = useState<ContentPhase>(topic ? (script ? 'create' : 'script') : 'method');
  const [creationMethod, setCreationMethod] = useState<CreationMethod>('simple');
  const [localTopic, setLocalTopic] = useState(topic || '');
  const [localScript, setLocalScript] = useState(script || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contentType, setContentType] = useState<'reel' | 'video' | 'post'>('reel');

  const handleSelectMethod = (method: CreationMethod) => {
    setCreationMethod(method);
    if (method === 'simple') {
      setPhase('topic');
    } else {
      setPhase('storytelling');
    }
  };

  const handleStorytellingComplete = (generatedScript: string) => {
    setLocalScript(generatedScript);
    onScriptChange(generatedScript);
    onTopicChange('Storytelling Framework');
    setPhase('create');
    toast.success('Script din storytelling confirmat!');
  };

  const handleGenerateScript = async () => {
    if (!localTopic.trim()) {
      toast.error('Te rog introdu un topic pentru video');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: { 
          topic: localTopic,
          contentType: contentType === 'reel' ? 'Reel/TikTok scurt' : contentType === 'video' ? 'YouTube video' : 'social media post'
        }
      });

      if (error) throw error;

      if (data?.script) {
        setLocalScript(data.script);
        onScriptChange(data.script);
        onTopicChange(localTopic);
        setPhase('script');
        toast.success('Script generat cu succes!');
      }
    } catch (error: any) {
      console.error('Error generating script:', error);
      if (error.message?.includes('429')) {
        toast.error('Prea multe cereri. Încearcă din nou în câteva secunde.');
      } else if (error.message?.includes('402')) {
        toast.error('Credits insuficiente. Adaugă credite în workspace.');
      } else {
        toast.error('Nu am putut genera scriptul. Încearcă din nou.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmScript = () => {
    onScriptChange(localScript);
    setPhase('create');
  };

  const handlePomodoroComplete = (sessions: number) => {
    onPomodoroComplete(sessions);
    toast.success(`🍅 Sesiune Pomodoro ${sessions} completă!`);
  };

  // Phase 0: Method selection
  if (phase === 'method') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border-blue-500/20">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-4">
              <Video className="h-10 w-10 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">Content Creation</h1>
            <p className="text-muted-foreground text-lg">
              Alege metoda pentru a crea conținut captivant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simple Topic Option */}
            <button
              onClick={() => handleSelectMethod('simple')}
              className="p-6 rounded-xl border-2 border-border bg-card hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-blue-500 transition-colors">
                  Topic Simplu
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Scrie un topic și AI-ul generează un script rapid. Perfect pentru idei spontane.
              </p>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-1 rounded">⚡ Rapid</span>
              </div>
            </button>

            {/* Storytelling Framework Option */}
            <button
              onClick={() => handleSelectMethod('storytelling')}
              className="p-6 rounded-xl border-2 border-border bg-card hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-purple-500 transition-colors">
                  Framework Storytelling
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                7 elemente ale unei povești captivante. Ghidare pas cu pas pentru scripturi care vând.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">📖 7 Pași</span>
                <span className="bg-muted px-2 py-1 rounded">⭐ Recomandat</span>
              </div>
            </button>
          </div>

          <Button 
            variant="ghost" 
            onClick={onNext}
            className="w-full text-muted-foreground"
          >
            Sari peste content creation
          </Button>
        </Card>
      </div>
    );
  }

  // Phase: Storytelling Framework
  if (phase === 'storytelling') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
        <StorytellingStack
          language="ro"
          onComplete={handleStorytellingComplete}
          onBack={() => setPhase('method')}
        />
      </div>
    );
  }

  // Phase 1: Topic input (Simple method)
  if (phase === 'topic') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border-blue-500/20">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-4">
              <Video className="h-10 w-10 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">Content Creation</h1>
            <p className="text-muted-foreground text-lg">
              Ce video vei crea astăzi? AI-ul te va ajuta cu scriptul.
            </p>
          </div>

          {/* Content type selector */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'reel', label: 'Reel/TikTok', emoji: '📱' },
              { value: 'video', label: 'YouTube', emoji: '🎬' },
              { value: 'post', label: 'Post', emoji: '📝' },
            ].map((type) => (
              <Button
                key={type.value}
                variant={contentType === type.value ? "default" : "outline"}
                onClick={() => setContentType(type.value as any)}
                className="flex-col h-auto py-4"
              >
                <span className="text-2xl mb-1">{type.emoji}</span>
                <span>{type.label}</span>
              </Button>
            ))}
          </div>

          {/* Topic input */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Despre ce este videoul?</label>
            <Textarea
              placeholder="Ex: 5 obiceiuri matinale care îți schimbă viața..."
              value={localTopic}
              onChange={(e) => setLocalTopic(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button 
            onClick={handleGenerateScript}
            disabled={isGenerating || !localTopic.trim()}
            size="lg"
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generez scriptul...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generează Script cu AI
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setPhase('method')}
            className="w-full"
          >
            ← Schimbă metoda
          </Button>

          <Button 
            variant="ghost" 
            onClick={onNext}
            className="w-full text-muted-foreground"
          >
            Sari peste content creation
          </Button>
        </Card>
      </div>
    );
  }

  // Phase 2: Script review/edit
  if (phase === 'script') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border-blue-500/20">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Script pentru: {localTopic}</h1>
            <p className="text-muted-foreground">
              Revizuiește și editează scriptul generat
            </p>
          </div>

          {isEditing ? (
            <Textarea
              value={localScript}
              onChange={(e) => setLocalScript(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
          ) : (
            <div className="bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-sans">{localScript}</pre>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? 'Vizualizare' : 'Editează'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPhase('topic')}
            >
              Regenerează
            </Button>
            <Button 
              onClick={handleConfirmScript}
              className="flex-1 gap-2"
            >
              <Check className="h-4 w-4" />
              Confirmă Script
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Phase 3: Create with Pomodoro
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent border-red-500/20">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">🎬 Creează Videoul</h1>
          <p className="text-muted-foreground">
            Folosește Pomodoro pentru a te concentra pe creare
          </p>
        </div>

        {/* Script preview */}
        <div className="p-3 rounded-lg bg-muted/20 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Topic:</span>
            <Button variant="ghost" size="sm" onClick={() => setPhase('script')}>
              Vezi Script
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{topic}</p>
        </div>

        {/* Pomodoro Timer */}
        <PomodoroTimer 
          onComplete={handlePomodoroComplete}
          initialSessions={pomodoroSessions}
        />

        <Button 
          onClick={onNext}
          size="lg"
          className="w-full gap-2"
        >
          Continuă
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
