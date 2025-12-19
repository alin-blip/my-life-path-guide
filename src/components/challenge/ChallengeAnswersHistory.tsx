import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MessageSquare, ChevronDown, Bot, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChallengeAnswersHistoryProps {
  dayNumber: number;
  userId?: string;
}

export const ChallengeAnswersHistory: React.FC<ChallengeAnswersHistoryProps> = ({ 
  dayNumber,
  userId 
}) => {
  const { language } = useLanguage();
  const [answers, setAnswers] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [sessionDate, setSessionDate] = useState<string | null>(null);

  useEffect(() => {
    fetchAnswers();
  }, [dayNumber, userId]);

  const fetchAnswers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch stack session linked to this challenge day
      const { data: session, error } = await supabase
        .from('stack_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_day_number', dayNumber)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching challenge answers:', error);
        setLoading(false);
        return;
      }

      if (session?.answers) {
        // Extract messages from answers
        const sessionAnswers = session.answers as Record<string, any>;
        const messages: Message[] = [];
        
        // Handle different answer formats
        if (sessionAnswers.messages && Array.isArray(sessionAnswers.messages)) {
          messages.push(...sessionAnswers.messages);
        } else if (sessionAnswers.conversation && Array.isArray(sessionAnswers.conversation)) {
          messages.push(...sessionAnswers.conversation);
        } else {
          // Try to extract from numbered keys
          Object.keys(sessionAnswers).forEach(key => {
            const value = sessionAnswers[key];
            if (typeof value === 'object' && value.question && value.answer) {
              messages.push({ role: 'assistant', content: value.question });
              messages.push({ role: 'user', content: value.answer });
            } else if (typeof value === 'string' && value.trim()) {
              messages.push({ role: 'user', content: value });
            }
          });
        }

        setAnswers(messages);
        setSessionDate(session.updated_at);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-muted/30 border-border/50 animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (answers.length === 0) {
    return null;
  }

  const userAnswers = answers.filter(m => m.role === 'user');

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-green-900/10 transition-colors">
            <CardTitle className="flex items-center justify-between text-green-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {language === 'en' ? 'Your Answers' : 'Răspunsurile Tale'}
                </span>
                <Badge variant="secondary" className="bg-green-800/50 text-green-200">
                  {userAnswers.length} {language === 'en' ? 'responses' : 'răspunsuri'}
                </Badge>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
            {sessionDate && (
              <p className="text-sm text-green-200/60">
                {language === 'en' ? 'Completed on' : 'Completat pe'} {new Date(sessionDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ro-RO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {answers.map((message, index) => (
              <div 
                key={index} 
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-amber-300" />
                  </div>
                )}
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-green-600/30 text-green-100 rounded-br-none' 
                      : 'bg-amber-900/30 text-amber-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-green-600/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-green-300" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
