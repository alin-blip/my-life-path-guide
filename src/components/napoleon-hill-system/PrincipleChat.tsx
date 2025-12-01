import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NapoleonHillProject } from '@/services/napoleonHillProjectService';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrincipleChatProps {
  project: NapoleonHillProject;
  principle: number;
  principleName: string;
  onPrincipleComplete: (principle: number, answer: any, summary: string, actions: any[]) => void;
}

const PRINCIPLE_PROMPTS: Record<number, string> = {
  1: "Care este obiectivul tău specific și măsurabil? Descrie în detaliu ce vrei să realizezi.",
  2: "Ce te face să crezi că vei reuși? Descrie sursele tale de credință și încredere.",
  3: "Cum vei întări zilnic această convingere? Scrie afirmația ta zilnică.",
  4: "Ce cunoștințe îți lipsesc pentru a atinge acest obiectiv?",
  5: "Vizualizează succesul tău. Cum arată viața ta când ai realizat obiectivul?",
  6: "Care sunt pașii concreți pentru a realiza obiectivul? Creează un plan detaliat.",
  7: "Ce decizie fermă iei ACUM? Ce commitment faci?",
  8: "Ce obstacole anticipezi și cum le vei depăși?",
  9: "Cine poate să te susțină în această călătorie? Cine va fi în grupul tău Master Mind?",
  10: "Cum vei canaliza energia ta creativă către acest obiectiv?",
  11: "Ce convingeri limitatoare trebuie să schimbi?",
  12: "Cum vei menține focusul mental și claritatea gândirii?",
  13: "Ce îți spune intuiția despre acest obiectiv?",
  14: "Care este PRIMA acțiune pe care o vei face ASTĂZI?"
};

export const PrincipleChat: React.FC<PrincipleChatProps> = ({
  project,
  principle,
  principleName,
  onPrincipleComplete
}) => {
  const { toast } = useToast();
  const [userAnswer, setUserAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const existingAnswer = project.principle_answers[principle];
  const existingSummary = project.principle_summaries[principle];

  const handleSubmit = async () => {
    if (!userAnswer.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      // Generate AI summary and extract actions
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Bazat pe răspunsul utilizatorului pentru principiul "${principleName}": ${userAnswer}
              
              Te rog să generezi:
              1. Un sumar concis (2-3 propoziții) care să captureze esența răspunsului
              2. 2-4 acțiuni concrete, măsurabile pe care utilizatorul le poate face

              Răspunde în format JSON:
              {
                "summary": "sumar aici...",
                "actions": ["acțiunea 1", "acțiunea 2", ...]
              }`
            }
          ],
          systemPrompt: 'Tu ești un asistent AI care ajută la structurarea răspunsurilor utilizatorului în formate clare și acționabile. Răspunde doar în JSON.'
        }
      });

      if (error) throw error;

      let aiResponse = data.message;
      
      // Try to parse JSON from AI response
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const summary = parsed.summary || aiResponse.substring(0, 200);
          const actions = parsed.actions || [];

          onPrincipleComplete(
            principle,
            userAnswer,
            summary,
            actions.map((action: string) => ({ action, completed: false }))
          );
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseError) {
        // Fallback if JSON parsing fails
        onPrincipleComplete(
          principle,
          userAnswer,
          aiResponse.substring(0, 200),
          []
        );
      }

      setUserAnswer('');
    } catch (error) {
      console.error('Error processing principle:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut procesa răspunsul. Te rog încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground mb-2">
          Principiul {principle}: {principleName}
        </h3>
        <p className="text-muted-foreground">
          {PRINCIPLE_PROMPTS[principle]}
        </p>
      </div>

      {existingAnswer ? (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Răspunsul tău:</p>
            <p className="text-foreground whitespace-pre-wrap">{existingAnswer}</p>
          </div>
          
          {existingSummary && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-semibold text-primary mb-2">Sumar:</p>
              <p className="text-foreground">{existingSummary}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Scrie răspunsul tău aici..."
            rows={8}
            className="resize-none"
          />

          <Button 
            onClick={handleSubmit} 
            disabled={!userAnswer.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesez...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Trimite și Continuă
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};
