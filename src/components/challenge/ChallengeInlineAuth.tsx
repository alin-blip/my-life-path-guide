import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { usePasswordCheck, getPasswordCheckMessages } from '@/hooks/usePasswordCheck';
import { PasswordBreachIndicator } from '@/components/auth/PasswordBreachIndicator';
import { useSecurity } from '@/components/SecurityProvider';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChallengeInlineAuthProps {
  language: 'en' | 'ro';
  onSuccess?: () => void;
  utmParams?: { source: string; medium: string; campaign: string };
}

export const ChallengeInlineAuth: React.FC<ChallengeInlineAuthProps> = ({
  language,
  onSuccess,
  utmParams
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateEmail, logSecurityEvent } = useSecurity();
  
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const passwordCheck = usePasswordCheck(password, mode === 'signup');
  const passwordMessages = getPasswordCheckMessages(language);

  const texts = {
    en: {
      googleBtn: 'Continue with Google',
      appleBtn: 'Continue with Apple',
      orEmail: 'or with email',
      emailPlaceholder: 'Your email address',
      passwordPlaceholder: 'Choose a password',
      confirmPasswordPlaceholder: 'Confirm password',
      signupBtn: 'CREATE ACCOUNT & START FREE',
      signupBtnShort: 'START FREE',
      loginBtn: 'Sign In & Continue',
      loginBtnShort: 'Sign In',
      hasAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      loginLink: 'Sign in',
      signupLink: 'Create one',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      invalidEmail: 'Please enter a valid email',
      signupSuccess: 'Account created! Check your email to confirm.',
      loginSuccess: 'Welcome back!',
      error: 'Something went wrong. Please try again.',
      breachedPassword: 'This password has been compromised. Please choose a different one.',
      securityNote: '🔒 Secure • Free • No credit card'
    },
    ro: {
      googleBtn: 'Continuă cu Google',
      appleBtn: 'Continuă cu Apple',
      orEmail: 'sau cu email',
      emailPlaceholder: 'Adresa ta de email',
      passwordPlaceholder: 'Alege o parolă',
      confirmPasswordPlaceholder: 'Confirmă parola',
      signupBtn: 'CREEAZĂ CONT ȘI ÎNCEPE GRATUIT',
      signupBtnShort: 'ÎNCEPE GRATUIT',
      loginBtn: 'Conectează-te și Continuă',
      loginBtnShort: 'Conectează-te',
      hasAccount: 'Ai deja cont?',
      noAccount: 'Nu ai cont?',
      loginLink: 'Conectează-te',
      signupLink: 'Creează unul',
      passwordMismatch: 'Parolele nu se potrivesc',
      passwordTooShort: 'Parola trebuie să aibă minim 6 caractere',
      invalidEmail: 'Te rugăm să introduci un email valid',
      signupSuccess: 'Cont creat! Verifică email-ul pentru confirmare.',
      loginSuccess: 'Bine ai revenit!',
      error: 'Ceva nu a mers. Te rugăm să încerci din nou.',
      breachedPassword: 'Această parolă a fost compromisă. Te rugăm să alegi alta.',
      securityNote: '🔒 Securizat • Gratuit • Fără card bancar'
    }
  };

  const t = texts[language];

  const saveLeadBeforeAuth = async () => {
    try {
      await supabase.from('email_leads').insert({
        email,
        lead_magnet: 'challenge_inline_auth',
        source: 'challenge-7-zile-landing',
        metadata: {
          utm_source: utmParams?.source || '',
          utm_medium: utmParams?.medium || '',
          utm_campaign: utmParams?.campaign || '',
          signup_date: new Date().toISOString(),
          auth_mode: mode
        }
      });
    } catch (error) {
      // Silent fail - lead tracking shouldn't block auth
      console.warn('Lead save failed:', error);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/challenge`,
      });
      
      if (error) {
        logSecurityEvent('OAuth failed', { provider, error: error.message }, 'medium');
        toast({
          title: language === 'en' ? 'Error' : 'Eroare',
          description: t.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: t.error,
        variant: 'destructive'
      });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!validateEmail(email)) {
      toast({
        title: language === 'en' ? 'Invalid email' : 'Email invalid',
        description: t.invalidEmail,
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: language === 'en' ? 'Password too short' : 'Parolă prea scurtă',
        description: t.passwordTooShort,
        variant: 'destructive'
      });
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        toast({
          title: language === 'en' ? 'Mismatch' : 'Nepotrivire',
          description: t.passwordMismatch,
          variant: 'destructive'
        });
        return;
      }

      // Block breached passwords
      if (passwordCheck.result?.isBreached) {
        toast({
          title: language === 'en' ? 'Insecure password' : 'Parolă nesigură',
          description: t.breachedPassword,
          variant: 'destructive'
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // Save lead before auth
      await saveLeadBeforeAuth();

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/challenge`,
            data: {
              signup_source: 'challenge-7-zile-landing',
              utm_source: utmParams?.source || '',
              utm_medium: utmParams?.medium || '',
              utm_campaign: utmParams?.campaign || ''
            }
          }
        });

        if (error) throw error;

        toast({
          title: '🎉 ' + (language === 'en' ? 'Account created!' : 'Cont creat!'),
          description: t.signupSuccess,
        });

        onSuccess?.();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        toast({
          title: '👋 ' + t.loginSuccess,
        });

        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      logSecurityEvent('Email auth failed', { mode, error: error.message }, 'medium');
      
      let errorMessage = t.error;
      if (error.message?.includes('already registered')) {
        errorMessage = language === 'en' 
          ? 'This email is already registered. Try logging in.' 
          : 'Acest email este deja înregistrat. Încearcă să te conectezi.';
      } else if (error.message?.includes('Invalid login')) {
        errorMessage = language === 'en'
          ? 'Invalid email or password.'
          : 'Email sau parolă incorectă.';
      }

      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 bg-card/80 backdrop-blur border-primary/20 mt-8">
      <div className="space-y-4">
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full bg-white hover:bg-gray-50 text-gray-800 border-gray-300 font-medium"
            onClick={() => handleOAuth('google')}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {t.googleBtn}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full bg-black hover:bg-gray-900 text-white border-black font-medium"
            onClick={() => handleOAuth('apple')}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === 'apple' ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )}
            {t.appleBtn}
          </Button>
        </div>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t.orEmail}</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-background"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-background"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mode === 'signup' && (
            <>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* HIBP Password Breach Indicator */}
              <PasswordBreachIndicator
                state={passwordCheck}
                messages={passwordMessages}
              />
            </>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isLoading || (mode === 'signup' && passwordCheck.result?.isBreached)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg py-6 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {language === 'en' ? 'Please wait...' : 'Te rugăm așteaptă...'}
              </>
            ) : (
              <>
                <span className="hidden sm:inline">
                  {mode === 'signup' ? t.signupBtn : t.loginBtn}
                </span>
                <span className="sm:hidden">
                  {mode === 'signup' ? t.signupBtnShort : t.loginBtnShort}
                </span>
              </>
            )}
          </Button>
        </form>

        {/* Mode Toggle */}
        <p className="text-center text-sm text-muted-foreground">
          {mode === 'signup' ? t.hasAccount : t.noAccount}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'signup' ? t.loginLink : t.signupLink}
          </button>
        </p>

        {/* Security Note */}
        <p className="text-xs text-center text-muted-foreground">
          {t.securityNote}
        </p>
      </div>
    </Card>
  );
};
