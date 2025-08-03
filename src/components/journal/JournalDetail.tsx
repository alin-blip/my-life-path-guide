
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  lesson: string;
  date: string;
  timestamp?: string;
}

interface JournalDetailProps {
  entry: JournalEntry;
  onBack: () => void;
}

export const JournalDetail: React.FC<JournalDetailProps> = ({ entry, onBack }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="border-indigo-500/30 bg-indigo-950/10">
      <CardHeader>
        <CardTitle className="text-center text-indigo-400 flex items-center justify-center gap-2">
          <BookOpen className="h-5 w-5" />
          {entry.title}
        </CardTitle>
        <div className="flex items-center justify-center gap-1 text-sm text-indigo-400 mt-1">
          <Calendar className="h-4 w-4" />
          {formatDate(entry.date)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
          <h3 className="text-sm font-medium text-indigo-300 mb-2">Intrare:</h3>
          <div className="text-indigo-100 whitespace-pre-wrap">{entry.content}</div>
        </div>
        
        {entry.lesson && (
          <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
            <h3 className="text-sm font-medium text-indigo-300 mb-2">Lecția învățată:</h3>
            <div className="text-indigo-100 whitespace-pre-wrap">{entry.lesson}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-start">
        <Button 
          variant="outline"
          className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-700/50"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Înapoi la lista de intrări
        </Button>
      </CardFooter>
    </Card>
  );
};
