import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Sparkles, Save } from 'lucide-react';
import { useBrainDump } from '@/hooks/useBrainDump';
import { BrainDumpItem } from './BrainDumpItem';

export const BrainDumpTab: React.FC = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const { items, analyzing, saving, analyze, updateItem, removeItem, saveAll } = useBrainDump();

  const handleAnalyze = () => analyze(text);

  const handleSave = async () => {
    const ok = await saveAll();
    if (ok) {
      setText('');
      setTitle('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
        <Brain className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Scrie tot ce ai în cap — gânduri, taskuri, idei, mulțumiri. AI-ul le sortează pentru tine ca să dormi liniștit.
        </p>
      </div>

      <Input
        placeholder="Titlu (opțional) — ex: 'seara de joi'"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-sm"
      />

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Lasă tot să curgă... ce ai făcut azi, ce nu a mers, ce idei ai, ce te frământă, pentru ce ești recunoscător..."
        className="min-h-[140px] resize-y"
      />

      <Button
        onClick={handleAnalyze}
        disabled={analyzing || !text.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {analyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            AI analizează...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Analizează cu AI
          </>
        )}
      </Button>

      {items.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Itemi clasificați ({items.length})</h4>
            <span className="text-[10px] text-muted-foreground">Editează / șterge înainte să salvezi</span>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {items.map((it) => (
              <BrainDumpItem
                key={it.id}
                item={it}
                onChange={(patch) => updateItem(it.id, patch)}
                onRemove={() => removeItem(it.id)}
              />
            ))}
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvez...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvează tot și rutează
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
