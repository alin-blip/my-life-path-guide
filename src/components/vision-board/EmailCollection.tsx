import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Mail, User, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// FB Pixel Lead tracking is now centralized in AuthContext
import { toast as sonnerToast } from 'sonner';

interface EmailCollectionProps {
  language: 'en' | 'ro';
  onComplete: (email: string, name: string) => void;
  onBack?: () => void;
}

export const EmailCollection: React.FC<EmailCollectionProps> = ({
  language,
  onComplete,
  onBack
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Email required' : 'Email necesar',
        description: language === 'en' 
          ? 'Please enter your email to continue.' 
          : 'Te rugăm să introduci email-ul pentru a continua.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email already exists
      const { data: existingLead } = await supabase
        .from('email_leads')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .eq('lead_magnet', 'vision_board_2026')
        .maybeSingle();

      if (!existingLead) {
        // Insert new lead
        await supabase.from('email_leads').insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          lead_magnet: 'vision_board_2026',
          source: 'vision_board_landing',
          metadata: { language }
        });
      }

      // FB Pixel Lead is now tracked centrally in AuthContext on SIGNED_IN

      // Create FREE account automatically
      const { data: existingSession } = await supabase.auth.getSession();
      
      if (!existingSession?.session) {
        const tempPassword = `Vision${crypto.randomUUID().slice(0, 8)}!`;
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: tempPassword,
          options: {
            data: {
              name: name.trim() || null,
              plan: 'free'
            },
            emailRedirectTo: `${window.location.origin}/vision-2026`
          }
        });

        if (signUpError) {
          if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
            console.log('User already exists, continuing as guest...');
            sonnerToast.info(language === 'en' 
              ? 'Account already exists. Continue to see your Vision Board.' 
              : 'Contul există deja. Continuă pentru a vedea Vision Board-ul.');
          } else {
            console.error('Error creating account:', signUpError);
          }
        } else if (signUpData?.session) {
          sonnerToast.success(language === 'en' 
            ? 'Your Free Plan account has been created!' 
            : 'Contul tău Free Plan a fost creat!');
        } else if (signUpData?.user && !signUpData?.session) {
          sonnerToast.success(language === 'en' 
            ? 'Your account has been created!' 
            : 'Contul tău a fost creat!');
        }
      }

      onComplete(email.trim().toLowerCase(), name.trim());
    } catch (error) {
      console.error('Error saving email:', error);
      // Continue anyway - don't block the user
      onComplete(email.trim().toLowerCase(), name.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {language === 'en' 
            ? 'Your Vision Board is Almost Ready!' 
            : 'Vision Board-ul tău este aproape gata!'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Enter your email to receive your personalized Vision Board and future updates.'
            : 'Introdu email-ul pentru a primi Vision Board-ul personalizat și actualizări viitoare.'}
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {language === 'en' ? 'Your Name (optional)' : 'Numele tău (opțional)'}
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'en' ? 'John Doe' : 'Ion Popescu'}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {language === 'en' ? 'Email Address' : 'Adresa de Email'} *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === 'en' ? 'your@email.com' : 'email@exemplu.ro'}
              required
              className="h-12"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {language === 'en' ? 'Generate My Vision Board' : 'Generează Vision Board-ul meu'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          {language === 'en'
            ? 'We respect your privacy. Unsubscribe at any time.'
            : 'Respectăm confidențialitatea ta. Te poți dezabona oricând.'}
        </p>
      </Card>

      {onBack && (
        <div className="text-center">
          <Button variant="ghost" onClick={onBack}>
            {language === 'en' ? '← Go Back' : '← Înapoi'}
          </Button>
        </div>
      )}
    </div>
  );
};
