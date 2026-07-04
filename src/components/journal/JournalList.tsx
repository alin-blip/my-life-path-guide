import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  lesson: string;
  date: string;
  timestamp?: string;
}

interface JournalListProps {
  onSelectEntry: (entry: JournalEntry) => void;
}

export const JournalList: React.FC<JournalListProps> = ({ onSelectEntry }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setEntries([]);
        return;
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, title, content, lesson, entry_date, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const journalEntries: JournalEntry[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        lesson: item.lesson || '',
        date: item.entry_date,
        timestamp: item.created_at,
      }));

      setEntries(journalEntries);
    } catch (error) {
      console.error("Exception fetching entries:", error);
      toast({
        title: "Eroare la încărcarea datelor",
        description: "Nu am putut încărca intrările din jurnal.",
        variant: "destructive"
      });
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (entryId: string) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="border-indigo-500/30 bg-indigo-950/10 h-full">
      <CardHeader>
        <CardTitle className="text-center text-indigo-400 flex items-center justify-center gap-2">
          <BookOpen className="h-5 w-5" />
          Intrările tale din jurnal
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-indigo-300 py-6">Se încarcă intrările...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-indigo-300 py-6">
            Nu ai încă intrări în jurnal. Creează prima ta intrare!
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="border border-indigo-500/20 rounded-lg overflow-hidden bg-indigo-900/20 hover:bg-indigo-900/30 transition-colors"
                >
                  <div 
                    className="p-3 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    <div>
                      <h3 className="font-medium text-indigo-200">{entry.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-indigo-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.date)}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-300">
                      {expandedEntryId === entry.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {expandedEntryId === entry.id && (
                    <div className="p-4 border-t border-indigo-500/20 bg-indigo-900/10">
                      <p className="text-indigo-200 mb-3 whitespace-pre-wrap">{entry.content}</p>
                      {entry.lesson && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-indigo-300 mb-1">Lecția învățată:</h4>
                          <p className="text-sm text-indigo-200 whitespace-pre-wrap">{entry.lesson}</p>
                        </div>
                      )}
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-700/50"
                          onClick={() => onSelectEntry(entry)}
                        >
                          Vizualizează complet
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
