import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Mic, MicOff, Lightbulb, Check } from 'lucide-react';
import { 
  LifebookSubcategory, 
  LifebookSection, 
  Message,
  SECTIONS,
  getSubcategoryInfo,
  getCategoryForSubcategory 
} from './types';
import { getQuestionsForSection } from './questions';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { toast } from 'sonner';
import { TextToSpeechButton } from '@/components/ui/TextToSpeechButton';

const LifebookChat: React.FC = () => {
  const { subcategory, section } = useParams<{ 
    subcategory: LifebookSubcategory; 
    section: LifebookSection 
  }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported 
  } = useVoiceToText({ language: language as 'en' | 'ro' });

  const subcategoryInfo = subcategory ? getSubcategoryInfo(subcategory as LifebookSubcategory) : undefined;
  const categoryInfo = subcategory ? getCategoryForSubcategory(subcategory as LifebookSubcategory) : undefined;
  const sectionInfo = SECTIONS.find(s => s.key === section);
  const sectionQuestions = subcategory && section 
    ? getQuestionsForSection(subcategory as LifebookSubcategory, section as LifebookSection) 
    : undefined;

  useEffect(() => {
    loadDraftOrEntry();
  }, [subcategory, section]);

  useEffect(() => {
    if (transcript) {
      setCurrentMessage(prev => prev + ' ' + transcript);
    }
  }, [transcript]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-save draft every 2 seconds
    const timer = setTimeout(() => {
      if (messages.length > 0) {
        saveDraft();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDraftOrEntry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First check for existing entry
      const { data: entry } = await supabase
        .from('lifebook_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('subcategory', subcategory)
        .eq('section', section)
        .maybeSingle();

      if (entry && entry.messages) {
        const parsedMessages = typeof entry.messages === 'string' 
          ? JSON.parse(entry.messages) 
          : entry.messages;
        setMessages(parsedMessages);
        setCurrentQuestionIndex(parsedMessages.filter((m: Message) => m.role === 'assistant').length);
        return;
      }

      // Check for draft
      const { data: draft } = await supabase
        .from('lifebook_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('subcategory', subcategory)
        .eq('section', section)
        .maybeSingle();

      if (draft && draft.messages) {
        const parsedMessages = typeof draft.messages === 'string' 
          ? JSON.parse(draft.messages) 
          : draft.messages;
        setMessages(parsedMessages);
        setCurrentQuestionIndex(parsedMessages.filter((m: Message) => m.role === 'assistant').length);
        return;
      }

      // Start with first question
      if (sectionQuestions && sectionQuestions.questions.length > 0) {
        const initialMessage: Message = {
          role: 'assistant',
          content: sectionQuestions.questions[0],
          timestamp: new Date()
        };
        setMessages([initialMessage]);
        setCurrentQuestionIndex(1);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || messages.length === 0) return;

      await supabase
        .from('lifebook_drafts')
        .upsert({
          user_id: user.id,
          subcategory: subcategory as string,
          section: section as string,
          messages: JSON.stringify(messages),
          last_saved_at: new Date().toISOString()
        } as any);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleSend = async () => {
    if (!currentMessage.trim() || !sectionQuestions) return;

    const userMessage: Message = {
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage('');

    // Check if there are more questions
    if (currentQuestionIndex < sectionQuestions.questions.length) {
      // Add acknowledgment and next question
      setTimeout(() => {
        const nextQuestion: Message = {
          role: 'assistant',
          content: `Mulțumesc pentru răspuns.\n\n${sectionQuestions.questions[currentQuestionIndex]}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
      }, 500);
    } else {
      // All questions answered - offer to complete section
      setTimeout(() => {
        const completionMessage: Message = {
          role: 'assistant',
          content: language === 'ro'
            ? `Excelent! Ai răspuns la toate întrebările pentru secțiunea "${sectionInfo?.nameRo}". Apasă butonul "Finalizează Secțiunea" pentru a salva și a continua.`
            : `Excellent! You've answered all questions for the "${sectionInfo?.name}" section. Click "Complete Section" to save and continue.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
      }, 500);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate summary from user responses
      const userResponses = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n\n');

      const summary = userResponses.slice(0, 500) + (userResponses.length > 500 ? '...' : '');

      // Save entry
      await supabase
        .from('lifebook_entries')
        .upsert({
          user_id: user.id,
          category: categoryInfo?.key as string,
          subcategory: subcategory as string,
          section: section as string,
          content: JSON.stringify({ responses: messages.filter(m => m.role === 'user').map(m => m.content) }),
          messages: JSON.stringify(messages),
          summary: summary,
          status: 'completed'
        } as any);

      // Delete draft
      await supabase
        .from('lifebook_drafts')
        .delete()
        .eq('user_id', user.id)
        .eq('subcategory', subcategory)
        .eq('section', section);

      toast.success(language === 'ro' ? 'Secțiune finalizată!' : 'Section completed!');

      // Navigate to next section or back to subcategory view
      const currentSectionIndex = SECTIONS.findIndex(s => s.key === section);
      if (currentSectionIndex < SECTIONS.length - 1) {
        navigate(`/lifebook/${subcategory}/${SECTIONS[currentSectionIndex + 1].key}`);
      } else {
        navigate(`/lifebook/${subcategory}`);
      }
    } catch (error) {
      console.error('Error completing section:', error);
      toast.error(language === 'ro' ? 'Eroare la salvare' : 'Error saving');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isComplete = sectionQuestions && currentQuestionIndex >= sectionQuestions.questions.length 
    && messages.filter(m => m.role === 'user').length >= sectionQuestions.questions.length;

  if (!subcategoryInfo || !sectionInfo || !sectionQuestions) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Section not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 gap-2"
            onClick={() => navigate(`/lifebook/${subcategory}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'ro' ? 'Înapoi' : 'Back'}
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{subcategoryInfo.icon}</span>
              <div>
                <h1 className="font-bold text-foreground">
                  {language === 'ro' ? subcategoryInfo.nameRo : subcategoryInfo.name}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {sectionInfo.icon} {language === 'ro' ? sectionInfo.nameRo : sectionInfo.name}
                  <span className="mx-2">•</span>
                  {currentQuestionIndex}/{sectionQuestions.questions.length}
                </p>
              </div>
            </div>

            {sectionQuestions.examples && sectionQuestions.examples.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowExamples(!showExamples)}
              >
                <Lightbulb className="w-4 h-4" />
                {language === 'ro' ? 'Exemple' : 'Examples'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Examples Panel */}
      {showExamples && sectionQuestions.examples && (
        <div className="border-b border-border bg-accent/30 p-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-medium mb-2 text-foreground">
              {language === 'ro' ? 'Exemple de răspunsuri pentru inspirație:' : 'Example responses for inspiration:'}
            </p>
            <div className="space-y-2">
              {sectionQuestions.examples.map((example, i) => (
                <p key={i} className="text-sm text-muted-foreground italic">
                  {example}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[85%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <CardContent className="p-4">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'assistant' && (
                    <div className="mt-2 flex justify-end">
                      <TextToSpeechButton 
                        text={message.content}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          {isComplete ? (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleComplete}
              disabled={isLoading}
            >
              <Check className="w-5 h-5" />
              {language === 'ro' ? 'Finalizează Secțiunea' : 'Complete Section'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder={language === 'ro' ? 'Scrie răspunsul tău...' : 'Type your response...'}
                  className="min-h-[80px] pr-12 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                {isSupported && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`absolute right-2 top-2 ${isListening ? 'text-red-500' : ''}`}
                    onClick={toggleMicrophone}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                )}
              </div>
              <Button
                size="lg"
                onClick={handleSend}
                disabled={!currentMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifebookChat;
