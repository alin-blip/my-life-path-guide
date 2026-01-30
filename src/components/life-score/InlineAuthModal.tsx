import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePasswordCheck, getPasswordCheckMessages } from '@/hooks/usePasswordCheck';
import { PasswordBreachIndicator } from '@/components/auth/PasswordBreachIndicator';
import { useSecurity } from '@/components/SecurityProvider';

interface InlineAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: 'en' | 'ro';
}

type AuthMode = 'signup' | 'login';

export const InlineAuthModal: React.FC<InlineAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
}) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { logSecurityEvent } = useSecurity();

  // HIBP password breach check
  const passwordCheckState = usePasswordCheck(password, mode === 'signup');
  const passwordCheckMessages = getPasswordCheckMessages(language);

  const t = {
    title: {
      signup: language === 'ro' ? 'Creează cont pentru a continua' : 'Create account to continue',
      login: language === 'ro' ? 'Conectează-te pentru a continua' : 'Sign in to continue',
    },
    description: {
      signup: language === 'ro' 
        ? 'Introdu datele tale pentru a-ți salva planul și a continua' 
        : 'Enter your details to save your plan and continue',
      login: language === 'ro'
        ? 'Conectează-te cu contul existent'
        : 'Sign in with your existing account',
    },
    name: language === 'ro' ? 'Nume (opțional)' : 'Name (optional)',
    email: 'Email',
    password: language === 'ro' ? 'Parolă' : 'Password',
    passwordHint: language === 'ro' ? 'Minim 6 caractere' : 'At least 6 characters',
    submit: {
      signup: language === 'ro' ? 'Creează cont și continuă' : 'Create account & continue',
      login: language === 'ro' ? 'Conectează-te' : 'Sign in',
    },
    switchMode: {
      signup: language === 'ro' ? 'Ai deja cont? Conectează-te' : 'Already have an account? Sign in',
      login: language === 'ro' ? 'Nu ai cont? Creează unul' : "Don't have an account? Sign up",
    },
    errors: {
      invalidEmail: language === 'ro' ? 'Email invalid' : 'Invalid email',
      shortPassword: language === 'ro' ? 'Parola trebuie să aibă minim 6 caractere' : 'Password must be at least 6 characters',
      accountExists: language === 'ro' ? 'Există deja un cont cu acest email. Încearcă să te conectezi.' : 'An account with this email already exists. Try signing in.',
      invalidCredentials: language === 'ro' ? 'Email sau parolă greșită' : 'Invalid email or password',
      generic: language === 'ro' ? 'A apărut o eroare. Încearcă din nou.' : 'An error occurred. Please try again.',
    },
    success: {
      signup: language === 'ro' ? 'Cont creat cu succes!' : 'Account created successfully!',
      login: language === 'ro' ? 'Te-ai conectat cu succes!' : 'Signed in successfully!',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!email || !email.includes('@')) {
      toast({
        title: t.errors.invalidEmail,
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: t.errors.shortPassword,
        variant: 'destructive',
      });
      return;
    }

    // Block signup if password is breached
    if (mode === 'signup' && passwordCheckState.result?.isBreached) {
      toast({
        title: language === 'ro' ? 'Parolă compromisă' : 'Compromised password',
        description: passwordCheckMessages.breached,
        variant: 'destructive',
      });
      logSecurityEvent('Breached password registration blocked (modal)', { 
        breachCount: passwordCheckState.result.breachCount 
      }, 'medium');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Try to create account
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              name: name.trim() || undefined,
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          console.error('Signup error:', error);
          
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            toast({
              title: t.errors.accountExists,
              variant: 'destructive',
            });
            setMode('login');
          } else {
            toast({
              title: t.errors.generic,
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        if (data.user) {
          toast({
            title: t.success.signup,
          });
          onSuccess();
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          console.error('Login error:', error);
          toast({
            title: t.errors.invalidCredentials,
            variant: 'destructive',
          });
          return;
        }

        if (data.user) {
          toast({
            title: t.success.login,
          });
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: t.errors.generic,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#1a2242] to-[#0c1023] border-amber-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl text-amber-100">
            {t.title[mode]}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {t.description[mode]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label htmlFor="name" className="text-amber-100/80 text-sm">
                {t.name}
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 bg-black/30 border-amber-500/20 text-white placeholder:text-gray-500"
                />
              </div>
            </motion.div>
          )}

          <div>
            <Label htmlFor="email" className="text-amber-100/80 text-sm">
              {t.email}
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="pl-10 bg-black/30 border-amber-500/20 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-amber-100/80 text-sm">
              {t.password}
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="pl-10 pr-10 bg-black/30 border-amber-500/20 text-white placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/50 hover:text-amber-500"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t.passwordHint}</p>
            {/* HIBP Password breach indicator - only shown during signup */}
            {mode === 'signup' && (
              <PasswordBreachIndicator 
                state={passwordCheckState} 
                messages={passwordCheckMessages} 
              />
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'ro' ? 'Se procesează...' : 'Processing...'}
              </>
            ) : (
              t.submit[mode]
            )}
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="w-full text-center text-sm text-amber-500/80 hover:text-amber-500 transition-colors"
          >
            {t.switchMode[mode]}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
