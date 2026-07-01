import React, { useEffect, useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, Sparkles, Loader2, User as UserIcon, Info, Baby } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useParentingChildren, useParentingProfile } from '@/hooks/useParenting';
import { getAgeContext, parentingService } from '@/services/parentingService';

interface Msg { role: 'user' | 'assistant'; content: string; }

const STARTERS_RO = [
  'Am țipat azi la copil și mă simt vinovat. Cum repar?',
  'Copilul meu are 4 ani și lovește când e frustrat. Ce fac?',
  'Cum îi cer scuze fără să-mi pierd autoritatea?',
  'Fiul meu are note bune dar pare tot mai închis. Semnal?',
];
const STARTERS_EN = [
  'I yelled at my kid today and I feel guilty. How do I repair?',
  'My 4-year-old hits when frustrated. What do I do?',
  'How do I apologize without losing authority?',
  'My son has good grades but seems more withdrawn. Warning sign?',
];

const ParentingCoach: React.FC = () => {
  const { childId: routeChildId } = useParams<{ childId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { children } = useParentingChildren();
  const { profile } = useParentingProfile();
  const lang: 'ro' | 'en' = profile?.preferred_language || 'ro';

  const [userId, setUserId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(routeChildId || null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const child = children.find((c) => c.id === childId);
  const ctx = child ? getAgeContext(child.birth_year, child.birth_month) : null;

  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId;
    if (!userId) throw new Error('No user');
    const s = await parentingService.createSession(userId, {
      child_id: childId,
      session_type: 'coach',
      title: child ? `${child.name} · ${new Date().toLocaleDateString()}` : `Coach · ${new Date().toLocaleDateString()}`,
    });
    setSessionId(s.id);
    return s.id;
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending || !userId) return;
    setInput('');
    const nextMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setSending(true);
    try {
      const sid = await ensureSession();
      const reply = await parentingService.coachChat({
        messages: nextMessages,
        child_id: childId || undefined,
        session_id: sid,
        language: lang,
      });
      setMessages((m) => [...m, { role: 'assistant', content: reply || '…' }]);
    } catch (e) {
      toast({
        title: lang === 'en' ? 'Coach unavailable' : 'Coach indisponibil',
        description: (e as Error).message,
        variant: 'destructive',
      });
      setMessages(nextMessages); // rollback assistant expectation
    } finally { setSending(false); }
  };

  const starters = lang === 'en' ? STARTERS_EN : STARTERS_RO;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-4 flex flex-col h-[calc(100vh-100px)]">
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate('/parenting')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {lang === 'en' ? 'Back' : 'Înapoi'}
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> {lang === 'en' ? 'Parenting Coach' : 'Coach Parental'}
            </h1>
          </div>
          {child && ctx && (
            <Badge variant="secondary" className="text-xs">
              <Baby className="w-3 h-3 mr-1" />{child.name} · {ctx.age}{lang === 'en' ? 'y' : 'a'}
            </Badge>
          )}
        </div>

        {/* Child selector */}
        {children.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-xs text-muted-foreground">{lang === 'en' ? 'Context:' : 'Context:'}</span>
            <Button size="sm" variant={childId === null ? 'default' : 'outline'} onClick={() => { setChildId(null); setSessionId(null); setMessages([]); }}>
              {lang === 'en' ? 'General' : 'General'}
            </Button>
            {children.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={childId === c.id ? 'default' : 'outline'}
                onClick={() => { setChildId(c.id); setSessionId(null); setMessages([]); }}
              >
                {c.name}
              </Button>
            ))}
          </div>
        )}

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-4">
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    {lang === 'en'
                      ? 'This coach uses Piaget, Erikson, Baumrind, Gottman, Harvard CDev, Tronick, Assor/Roth. NOT a substitute for clinical care.'
                      : 'Coach-ul folosește Piaget, Erikson, Baumrind, Gottman, Harvard CDev, Tronick, Assor/Roth. NU înlocuiește îngrijirea clinică.'}
                  </AlertDescription>
                </Alert>
                <div className="text-xs text-muted-foreground">{lang === 'en' ? 'Try one of these:' : 'Încearcă una din acestea:'}</div>
                <div className="grid gap-2">
                  {starters.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      className="text-left rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-muted text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </CardContent>
        </Card>

        {/* Input */}
        <div className="shrink-0 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder={lang === 'en' ? 'Ask anything… (Enter to send)' : 'Întreabă orice… (Enter pentru a trimite)'}
            rows={2}
            className="resize-none"
          />
          <Button onClick={() => send()} disabled={sending || !input.trim()} size="lg" className="self-end">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ParentingCoach;
