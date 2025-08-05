import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const DivinePrayerExplanation: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between p-3 bg-indigo-500/10 rounded border border-indigo-500/20">
        <div>
          <h3 className="text-sm font-medium text-indigo-400 mb-1">Dialogul cu Divinitatea</h3>
          <p className="text-xs text-muted-foreground">
            Proces sacru în 17 pași pentru conectarea cu înțelepciunea divină
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="mt-2 p-3 bg-background/50 rounded border text-xs text-muted-foreground space-y-2">
          <p>
            Dialogul cu Divinitatea te ghidează printr-un proces sacru care te ajută să:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Clarifici situațiile dificile prin rugăciune</li>
            <li>Găsești direcția și acțiunea potrivită</li>
            <li>Conectezi cu înțelepciunea divină</li>
            <li>Transformi incertitudinea în acțiune clară</li>
          </ul>
          <p>
            La finalul celor 17 pași vei avea o acțiune concretă pe care să o întreprinzi.
          </p>
        </div>
      )}
    </div>
  );
};