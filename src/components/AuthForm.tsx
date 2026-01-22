
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useSecurity } from './SecurityProvider';
import { SecureInput } from './SecureInput';

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
  FORGOT_PASSWORD
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
  
  // Check for vision plan flow
  const isVisionPlanFlow = searchParams.get('from') === 'vision-plan';
  const visionScores = searchParams.get('scores');
  
  const from = location.state?.from?.pathname || '/dashboard';
  const MAX_RATE_LIMIT = 5;
  const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

  const [backendSlowdown, setBackendSlowdown] = useState(false);

  // Check auth service connectivity on mount - two-step check
  useEffect(() => {
    const checkAuthService = async () => {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const healthUrl = `${baseUrl}/auth/v1/health`;

      // Step 1: Network reachability (without apikey)
      try {
        const networkRes = await fetch(healthUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        // Even 401/403 means network is OK
        if (!networkRes.ok && networkRes.status !== 401 && networkRes.status !== 403) {
          setAuthServiceStatus('error');
          return;
        }
      } catch {
        // Network unreachable
        setAuthServiceStatus('error');
        return;
      }

      // Step 2: Full auth readiness (with apikey - tests backend DB)
      try {
        const authRes = await fetch(healthUrl, {
          method: 'GET',
          headers: { apikey: apiKey },
          signal: AbortSignal.timeout(8000),
        });
        if (authRes.ok) {
          setAuthServiceStatus('ok');
        } else {
          // Network OK but backend not ready
          setAuthServiceStatus('error');
          setBackendSlowdown(true);
        }
      } catch {
        // Network OK but backend timed out
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
      
      // Store scores for welcome modal
      localStorage.setItem('vision_plan_scores', JSON.stringify(scores));
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

        const { data: signUpData, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`
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
        
        // Check if user has completed quick quiz
        const hasCompletedQuiz = localStorage.getItem('quick_quiz_completed') === 'true';
        
        if (isVisionPlanFlow && visionScores && data.user) {
          await setupVisionPlan(data.user.id);
          navigate('/focus', { replace: true });
        } else if (!hasCompletedQuiz && from === '/dashboard') {
          // Redirect new users to quick quiz for immediate value
          navigate('/quick-quiz', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else if (mode === AuthMode.FORGOT_PASSWORD) {
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth`,
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
          {mode === AuthMode.REGISTER && (language === 'en' ? "JOIN JUMP TO FREEDOM" : "ALĂTURĂ-TE JUMP TO FREEDOM")}
          {mode === AuthMode.FORGOT_PASSWORD && (language === 'en' ? "RESET PASSWORD" : "RESETEAZĂ PAROLA")}
        </h1>
        <p className="text-muted-foreground">
          {mode === AuthMode.LOGIN && (language === 'en' ? "Sign in to continue your freedom journey" : "Autentifică-te pentru a continua călătoria spre libertate")}
          {mode === AuthMode.REGISTER && (language === 'en' ? "Create your account to Have It All" : "Creează-ți contul pentru a avea totul")}
          {mode === AuthMode.FORGOT_PASSWORD && (language === 'en' ? "Enter your email to reset your password" : "Introdu email-ul pentru a reseta parola")}
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
            </>
          )}
        </Button>

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
