import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const AngerStackExplanation: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between p-3 bg-red-500/10 rounded border border-red-500/20">
        <div>
          <h3 className="text-sm font-medium text-red-400 mb-1">Alchimia Furiei</h3>
          <p className="text-xs text-muted-foreground">
            Transformă furia în putere constructivă
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
            Alchimia Furiei te ajută să transformi furia în putere și acțiune constructivă:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Identifici sursa reală a furiei tale</li>
            <li>Analizezi situația obiectiv</li>
            <li>Alegi domeniul relevant (relații, muncă, sănătate, etc.)</li>
            <li>Transformi emoția în acțiune constructivă</li>
          </ul>
          <p>
            Procesul te ghidează prin întrebări specifice pentru a găsi soluții concrete în loc să rămâi blocat în emoție.
          </p>
        </div>
      )}
    </div>
  );
};