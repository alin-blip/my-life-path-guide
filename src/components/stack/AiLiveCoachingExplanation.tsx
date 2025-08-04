import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const AiLiveCoachingExplanation: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded border border-blue-500/20">
        <div>
          <h3 className="text-sm font-medium text-blue-400 mb-1">AI Live Coaching</h3>
          <p className="text-xs text-muted-foreground">
            Coaching interactiv pentru depășirea provocărilor
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
            AI Live Coaching oferă un proces de coaching personalizat care te ajută să:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Identifici provocările și obstacolele din viața ta</li>
            <li>Explorezi soluții creative și practice</li>
            <li>Clarifici obiectivele și prioritățile</li>
            <li>Dezvolți un plan de acțiune concret</li>
          </ul>
          <p>
            Procesul folosește întrebări strategice pentru a te ghida către descoperiri personale și acțiuni eficiente.
          </p>
        </div>
      )}
    </div>
  );
};