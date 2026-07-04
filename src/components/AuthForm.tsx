
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useLanguage } from '@/context/LanguageContext';
import { useSecurity } from './SecurityProvider';
import { SecureInput } from './SecureInput';
import { usePasswordCheck, getPasswordCheckMessages } from '@/hooks/usePasswordCheck';
import { PasswordBreachIndicator } from '@/components/auth/PasswordBreachIndicator';

const AUTH_TIMEOUT_MS = 12000; // 12 second timeout for auth operations

// Helper to wrap auth calls with timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AUTH_TIMEOUT')), ms)
    ),
  ]);
}

enum AuthMode {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD,
  RESET_PASSWORD
}

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitCount, setRateLimitCount] = useState(0);
  const [authServiceStatus, setAuthServiceStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { validateEmail, logSecurityEvent } = useSecurity();
  
  // HIBP password breach check
  const passwordCheckState = usePasswordCheck(password, mode === AuthMode.REGISTER);
  const passwordCheckMessages = getPasswordCheckMessages(language as 'en' | 'ro');
  
  // Check for vision plan flow
  const isVisionPlanFlow = searchParams.get('from') === 'vision-plan';
  const visionScores = searchParams.get('scores');
  const recoveryType = searchParams.get('type');
  
  // New password state for recovery mode
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Where to return the user after auth. Priority:
  //   1. router state.from (in-app navigation)
  //   2. `pending_return_path` from localStorage (survives full email round-trip)
  //   3. /dashboard
  const stateFrom: string | undefined = location.state?.from?.pathname;
  const storedReturn = (() => {
    try {
      const v = localStorage.getItem('pending_return_path');
      // only accept same-origin absolute paths
      return v && v.startsWith('/') && !v.startsWith('//') ? v : null;
    } catch {
      return null;
    }
  })();
  const from = stateFrom || storedReturn || '/dashboard';

  const MAX_RATE_LIMIT = 5;
  const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

  const [backendSlowdown, setBackendSlowdown] = useState(false);

  // Detect recovery mode from URL
  useEffect(() => {
    if (recoveryType === 'recovery') {
      setMode(AuthMode.RESET_PASSWORD);
    }
  }, [recoveryType]);

  // Check auth service connectivity on mount — single call with apikey.
  // A no-apikey probe returns 401 (expected) which polluted logs and caused
  // false alarms; one authenticated GET tells us if auth is truly reachable.
  useEffect(() => {
    const checkAuthService = async () => {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const healthUrl = `${baseUrl}/auth/v1/health`;

      try {
        const res = await fetch(healthUrl, {
          method: 'GET',
          headers: { apikey: apiKey },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          setAuthServiceStatus('ok');
        } else {
          setAuthServiceStatus('error');
          setBackendSlowdown(true);
        }
      } catch {
        setAuthServiceStatus('error');
        setBackendSlowdown(true);
      }
    };
    checkAuthService();
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          const msg = String((error as any)?.message ?? '');
          if (msg.includes('Failed to fetch')) {
            await supabase.auth.signOut({ scope: 'local' });
            setAuthServiceStatus('error');
          }
          return;
        }

        const session = data.session;
        if (session) {
          if (isVisionPlanFlow && visionScores) {
            await setupVisionPlan(session.user.id);
          }
          navigate(isVisionPlanFlow ? '/focus' : from, { replace: true });
        }
      } catch {
        // ignore
      }
    };

    checkAuth();

    const timer = setTimeout(() => {
      setRateLimitCount(0);
    }, RATE_LIMIT_WINDOW);

    return () => clearTimeout(timer);
  }, [navigate, from, isVisionPlanFlow, visionScores, toast, language]);

  const setupVisionPlan = async (userId: string) => {
    if (!visionScores) return;
    
    try {
      const scores = JSON.parse(decodeURIComponent(visionScores));
      
      // Persist scores to DB (source of truth) + cache for instant render
      const { visionScoresService } = await import('@/services/visionScoresService');
      await visionScoresService.save(userId, scores);
      localStorage.removeItem('vision_onboarding_complete');
      
      // Call edge function to create tasks
      const { data, error } = await supabase.functions.invoke('setup-vision-plan', {
        body: {
          user_id: userId,
          scores,
          language: language === 'en' ? 'en' : 'ro',
        },
      });

      if (error) {
        console.error('Error setting up vision plan:', error);
      } else {
        console.log('Vision plan setup successful:', data);
      }
    } catch (e) {
      console.error('Failed to setup vision plan:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (rateLimitCount >= MAX_RATE_LIMIT) {
      toast({
        title: language === 'en' ? "Too many attempts" : "Prea multe încercări",
        description: language === 'en' ? "Please wait 15 minutes before trying again." : "Te rog așteaptă 15 minute înainte de a încerca din nou.",
        variant: "destructive",
      });
      logSecurityEvent('Rate limit exceeded', { email, mode });
      return;
    }

    // Email validation
    if (!validateEmail(email)) {
      toast({
        title: language === 'en' ? "Invalid email" : "Email invalid",
        description: language === 'en' ? "Please enter a valid email address." : "Te rog introdu o adresă de email validă.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRateLimitCount(prev => prev + 1);
    
    try {
      if (mode === AuthMode.REGISTER) {
        if (password !== confirmPassword) {
          toast({
            title: language === 'en' ? "Passwords don't match" : "Parolele nu se potrivesc",
            description: language === 'en' ? "Please ensure both passwords match." : "Asigură-te că ambele parole se potrivesc.",
            variant: "destructive",
          });
          return;
        }

        if (password.length < 8) {
          toast({
            title: language === 'en' ? "Password too short" : "Parola prea scurtă",
            description: language === 'en' ? "Password must be at least 8 characters long." : "Parola trebuie să aibă cel puțin 8 caractere.",
            variant: "destructive",
          });
          return;
        }

        // Block registration if password is breached
        if (passwordCheckState.result?.isBreached) {
          toast({
            title: language === 'en' ? "Compromised password" : "Parolă compromisă",
            description: passwordCheckMessages.breached,
            variant: "destructive",
          });
          logSecurityEvent('Breached password registration blocked', { 
            breachCount: passwordCheckState.result.breachCount 
          }, 'medium');
          return;
        }

        // Persist return path so it survives the full email confirmation
        // round-trip (user clicks link in inbox → fresh browser tab).
        try {
          if (from && from !== '/dashboard') {
            localStorage.setItem('pending_return_path', from);
          }
        } catch {}

        const { data: signUpData, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              // Send the user back to where they started (e.g. /challenge-7-zile)
              // so any pending checkout / plan can auto-resume after confirm.
              emailRedirectTo: `${window.location.origin}${from || '/'}`
            }
          }),
          AUTH_TIMEOUT_MS
        );


        if (error) throw error;

        // Create subscriber record with early_bird_expires_at (3 days from now)
        if (signUpData?.user) {
          const earlyBirdExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.from('subscribers').upsert({
            email: email.toLowerCase().trim(),
            user_id: signUpData.user.id,
            early_bird_expires_at: earlyBirdExpiry,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });
        }

        toast({
          title: language === 'en' ? "Account created" : "Cont creat",
          description: language === 'en' ? "Check your email to confirm your account." : "Verifică-ți email-ul pentru a confirma contul.",
        });
        
        setMode(AuthMode.LOGIN);
        logSecurityEvent('User registration attempt', { email });
      } else if (mode === AuthMode.LOGIN) {
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          AUTH_TIMEOUT_MS
        );

        if (error) throw error;

        logSecurityEvent('Successful login', { email });

        // Consume the pending return path — we've used it now.
        try { localStorage.removeItem('pending_return_path'); } catch {}

        if (isVisionPlanFlow && visionScores && data.user) {
          await setupVisionPlan(data.user.id);
          navigate('/focus', { replace: true });
        } else {
          navigate(from, { replace: true });
        }

      } else if (mode === AuthMode.FORGOT_PASSWORD) {
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth?type=recovery`,
          }),
          AUTH_TIMEOUT_MS
        );

        if (error) throw error;

        toast({
          title: language === 'en' ? "Reset link sent" : "Link de resetare trimis",
          description: language === 'en' ? "Password reset instructions have been sent to your email." : "Instrucțiunile de resetare a parolei au fost trimise pe email.",
        });
        
        setMode(AuthMode.LOGIN);
        logSecurityEvent('Password reset requested', { email });
      } else if (mode === AuthMode.RESET_PASSWORD) {
        if (newPassword.length < 8) {
          toast({
            title: language === 'en' ? "Password too short" : "Parola prea scurtă",
            description: language === 'en' ? "Password must be at least 8 characters long." : "Parola trebuie să aibă cel puțin 8 caractere.",
            variant: "destructive",
          });
          return;
        }
        if (newPassword !== confirmNewPassword) {
          toast({
            title: language === 'en' ? "Passwords don't match" : "Parolele nu se potrivesc",
            description: language === 'en' ? "Please ensure both passwords match." : "Asigură-te că ambele parole se potrivesc.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await withTimeout(
          supabase.auth.updateUser({ password: newPassword }),
          AUTH_TIMEOUT_MS
        );

        if (error) throw error;

        toast({
          title: language === 'en' ? "Password updated" : "Parolă actualizată",
          description: language === 'en' ? "Your password has been changed successfully." : "Parola ta a fost schimbată cu succes.",
        });
        
        logSecurityEvent('Password reset completed', { email });
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      logSecurityEvent('Authentication error', { email, error: error.message, mode });
      
      const msg = String(error?.message ?? '');
      const name = String(error?.name ?? '');
      const status = (error as any)?.status;

      const isTimeout = msg === 'AUTH_TIMEOUT';
      const isNetwork = isTimeout || msg.includes('Failed to fetch') || name === 'AuthRetryableFetchError' || status === 0;
      const isInvalidCreds = msg.toLowerCase().includes('invalid login credentials');
      const isEmailNotConfirmed = msg.toLowerCase().includes('email not confirmed');

      if (isNetwork) {
        setAuthServiceStatus('error');
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {
          // ignore
        }
      }

      const description = isTimeout
        ? (language === 'en'
          ? 'Request timed out. Check your network or disable VPN/adblock.'
          : 'Cererea a expirat. Verifică rețeaua sau dezactivează VPN/adblock.')
        : isNetwork
          ? (language === 'en'
            ? 'Connection issue. Please reload the page (and disable adblock/VPN if needed) then try again.'
            : 'Problemă de conexiune. Reîncarcă pagina (și dezactivează adblock/VPN dacă e cazul) apoi încearcă din nou.')
          : isEmailNotConfirmed
            ? (language === 'en'
              ? 'Please confirm your email before signing in.'
              : 'Te rog confirmă emailul înainte să te autentifici.')
            : isInvalidCreds
              ? (language === 'en'
                ? 'Email or password is incorrect.'
                : 'Emailul sau parola sunt greșite.')
              : (language === 'en'
                ? 'Authentication failed. Please try again.'
                : 'Autentificare eșuată. Te rog încearcă din nou.');

      toast({
        title: language === 'en' ? 'Authentication Error' : 'Eroare de Autentificare',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      
      if (error) {
        toast({
          title: language === 'en' ? 'Google Sign-In Failed' : 'Autentificare Google eșuată',
          description: error.message,
          variant: 'destructive',
        });
        logSecurityEvent('Google sign-in error', { error: error.message });
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Google Sign-In Failed' : 'Autentificare Google eșuată',
        description: error?.message || (language === 'en' ? 'An error occurred' : 'A apărut o eroare'),
        variant: 'destructive',
      });
      logSecurityEvent('Google sign-in error', { error: error?.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('apple', {
        redirect_uri: window.location.origin,
      });
      
      if (error) {
        toast({
          title: language === 'en' ? 'Apple Sign-In Failed' : 'Autentificare Apple eșuată',
          description: error.message,
          variant: 'destructive',
        });
        logSecurityEvent('Apple sign-in error', { error: error.message });
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Apple Sign-In Failed' : 'Autentificare Apple eșuată',
        description: error?.message || (language === 'en' ? 'An error occurred' : 'A apărut o eroare'),
        variant: 'destructive',
      });
      logSecurityEvent('Apple sign-in error', { error: error?.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-3 shadow-lg">
            <span className="font-display font-bold text-white text-2xl">🦅</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {mode === AuthMode.LOGIN && (language === 'en' ? "WELCOME BACK ACHIEVER" : "BINE AI REVENIT")}
          {mode === AuthMode.REGISTER && (language === 'en' ? "JOIN CEO MIND OS" : "ALĂTURĂ-TE CEO MIND OS")}
          {mode === AuthMode.FORGOT_PASSWORD && (language === 'en' ? "RESET PASSWORD" : "RESETEAZĂ PAROLA")}
          {mode === AuthMode.RESET_PASSWORD && (language === 'en' ? "NEW PASSWORD" : "PAROLĂ NOUĂ")}
        </h1>
        <p className="text-muted-foreground">
          {mode === AuthMode.LOGIN && (language === 'en' ? "Sign in to continue your journey" : "Autentifică-te pentru a continua")}
          {mode === AuthMode.REGISTER && (language === 'en' ? "Create your account to unlock your potential" : "Creează-ți contul pentru a-ți debloca potențialul")}
          {mode === AuthMode.FORGOT_PASSWORD && (language === 'en' ? "Enter your email to reset your password" : "Introdu email-ul pentru a reseta parola")}
          {mode === AuthMode.RESET_PASSWORD && (language === 'en' ? "Choose a new password for your account" : "Alege o parolă nouă pentru contul tău")}
        </p>
      </div>

      {/* Auth service status indicator */}
      <div className="mb-4 flex items-center justify-center gap-2 text-sm">
        {authServiceStatus === 'checking' && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">{language === 'en' ? 'Checking connection...' : 'Verificare conexiune...'}</span>
          </>
        )}
        {authServiceStatus === 'ok' && (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-green-500">{language === 'en' ? 'Auth service reachable' : 'Serviciu de autentificare disponibil'}</span>
          </>
        )}
        {authServiceStatus === 'error' && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <span>{language === 'en' ? 'Cannot reach auth service' : 'Nu pot contacta serviciul de autentificare'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {backendSlowdown
                ? (language === 'en'
                  ? 'Backend temporarily unavailable. Please try again in a few minutes.'
                  : 'Backend temporar indisponibil. Te rog încearcă din nou în câteva minute.')
                : (language === 'en'
                  ? 'Try disabling VPN/AdBlock, or use a different network.'
                  : 'Încearcă să dezactivezi VPN/AdBlock sau folosește altă rețea.')}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
        {mode === AuthMode.FORGOT_PASSWORD && (
          <button 
            type="button" 
            onClick={() => setMode(AuthMode.LOGIN)}
            className="text-sm text-muted-foreground hover:text-white flex items-center mb-4"
          >
            ← {language === 'en' ? 'BACK' : 'ÎNAPOI'}
          </button>
        )}
        
        {mode !== AuthMode.RESET_PASSWORD && (
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white">
              {language === 'en' ? 'Email Address' : 'Adresa de Email'}
            </label>
            <SecureInput
              id="email"
              type="email"
              value={email}
              onSecureChange={setEmail}
              placeholder={language === 'en' ? "Enter your email" : "Introdu email-ul"}
              required
              className="bg-muted border-muted text-white"
            />
          </div>
        )}

        {mode === AuthMode.RESET_PASSWORD && (
          <>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-white">
                {language === 'en' ? 'New Password' : 'Parola Nouă'}
              </label>
              <div className="relative">
                <SecureInput
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onSecureChange={setNewPassword}
                  placeholder={language === 'en' ? "Enter new password" : "Introdu parola nouă"}
                  required
                  minLength={8}
                  className="bg-muted border-muted text-white pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmNewPassword" className="text-sm font-medium text-white">
                {language === 'en' ? 'Confirm New Password' : 'Confirmă Parola Nouă'}
              </label>
              <div className="relative">
                <SecureInput
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onSecureChange={setConfirmNewPassword}
                  placeholder={language === 'en' ? "Confirm new password" : "Confirmă parola nouă"}
                  required
                  minLength={8}
                  className="bg-muted border-muted text-white pr-10"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        {(mode === AuthMode.LOGIN || mode === AuthMode.REGISTER) && (
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white">
              {language === 'en' ? 'Password' : 'Parola'}
            </label>
            <div className="relative">
              <SecureInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onSecureChange={setPassword}
                placeholder={language === 'en' ? "Enter your password" : "Introdu parola"}
                required
                minLength={8}
                className="bg-muted border-muted text-white pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* HIBP Password breach indicator - only shown during registration */}
            {mode === AuthMode.REGISTER && (
              <PasswordBreachIndicator 
                state={passwordCheckState} 
                messages={passwordCheckMessages} 
              />
            )}
          </div>
        )}

        {mode === AuthMode.REGISTER && (
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
              {language === 'en' ? 'Confirm Password' : 'Confirmă Parola'}
            </label>
            <div className="relative">
              <SecureInput
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onSecureChange={setConfirmPassword}
                placeholder={language === 'en' ? "Confirm your password" : "Confirmă parola"}
                required
                minLength={8}
                className="bg-muted border-muted text-white pr-10"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {mode === AuthMode.LOGIN && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMode(AuthMode.FORGOT_PASSWORD)}
              className="text-sm text-muted-foreground hover:text-white"
            >
              {language === 'en' ? 'Forgot password?' : 'Ai uitat parola?'}
            </button>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 text-base shadow-lg transition-all duration-200"
          disabled={isLoading || rateLimitCount >= MAX_RATE_LIMIT}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {language === 'en' ? 'Loading...' : 'Se încarcă...'}
            </div>
          ) : (
            <>
              {mode === AuthMode.LOGIN && (language === 'en' ? "SIGN IN" : "AUTENTIFICARE")}
              {mode === AuthMode.REGISTER && (language === 'en' ? "CREATE ACCOUNT" : "CREEAZĂ CONT")}
              {mode === AuthMode.FORGOT_PASSWORD && (language === 'en' ? "SEND RESET LINK" : "TRIMITE LINK RESETARE")}
              {mode === AuthMode.RESET_PASSWORD && (language === 'en' ? "SET NEW PASSWORD" : "SETEAZĂ PAROLA NOUĂ")}
            </>
          )}
        </Button>

        {/* Google Sign-In Divider */}
        {(mode === AuthMode.LOGIN || mode === AuthMode.REGISTER) && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0c1023] px-2 text-muted-foreground">
                  {language === 'en' ? 'or' : 'sau'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading || authServiceStatus === 'error'}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-300 font-medium py-3"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {language === 'en' ? 'Continue with Google' : 'Continuă cu Google'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleAppleSignIn}
              disabled={isLoading || authServiceStatus === 'error'}
              className="w-full bg-black hover:bg-gray-900 text-white border-gray-700 font-medium py-3"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {language === 'en' ? 'Continue with Apple' : 'Continuă cu Apple'}
            </Button>
          </>
        )}

        {mode === AuthMode.REGISTER && (
          <p className="text-xs text-muted-foreground text-center">
            {language === 'en' ? 'By signing up, you agree to our ' : 'Prin înregistrare, ești de acord cu '}
            <Link to="/terms" className="text-primary hover:underline">
              {language === 'en' ? 'Terms of Service' : 'Termenii și Condițiile'}
            </Link>
            {language === 'en' ? ' and ' : ' și '}
            <Link to="/privacy" className="text-primary hover:underline">
              {language === 'en' ? 'Privacy Policy' : 'Politica de Confidențialitate'}
            </Link>
          </p>
        )}

        <div className="text-center mt-4">
          {mode === AuthMode.LOGIN ? (
            <button
              type="button"
              onClick={() => setMode(AuthMode.REGISTER)}
              className="text-sm text-muted-foreground hover:text-white"
            >
              {language === 'en' ? "Don't have an account? " : "Nu ai cont? "}
              <span className="text-primary font-medium">
                {language === 'en' ? "Create one" : "Creează unul"}
              </span>
            </button>
          ) : mode === AuthMode.REGISTER ? (
            <button
              type="button"
              onClick={() => setMode(AuthMode.LOGIN)}
              className="text-sm text-muted-foreground hover:text-white"
            >
              {language === 'en' ? "Already have an account? " : "Ai deja cont? "}
              <span className="text-primary font-medium">
                {language === 'en' ? "Sign in" : "Autentifică-te"}
              </span>
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={async () => {
            try {
              await supabase.auth.signOut({ scope: 'local' });
              localStorage.removeItem('sb-exsbnfmaadjyfblperas-auth-token');
            } catch {
              // ignore
            }
            window.location.reload();
          }}
          className="text-xs text-muted-foreground hover:text-white underline"
        >
          {language === 'en' ? 'Having issues? Reset session' : 'Ai probleme? Resetează sesiunea'}
        </button>
      </div>

      <div className="fixed bottom-5 left-5">
        <button className="text-muted-foreground hover:text-white flex items-center text-sm">
          <HelpCircle className="h-4 w-4 mr-1" />
          SUPPORT
        </button>
      </div>
    </div>
  );
};
