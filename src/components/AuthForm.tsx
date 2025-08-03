
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useSecurity } from './SecurityProvider';
import { SecureInput } from './SecureInput';

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
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { validateEmail, logSecurityEvent } = useSecurity();
  
  const from = location.state?.from?.pathname || '/dashboard';
  const MAX_RATE_LIMIT = 5;
  const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(from, { replace: true });
      }
    };
    checkAuth();

    // Reset rate limit counter after window
    const timer = setTimeout(() => {
      setRateLimitCount(0);
    }, RATE_LIMIT_WINDOW);

    return () => clearTimeout(timer);
  }, [navigate, from]);

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

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: language === 'en' ? "Account created" : "Cont creat",
          description: language === 'en' ? "Check your email to confirm your account." : "Verifică-ți email-ul pentru a confirma contul.",
        });
        
        setMode(AuthMode.LOGIN);
        logSecurityEvent('User registration attempt', { email });
      } else if (mode === AuthMode.LOGIN) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        logSecurityEvent('Successful login', { email });
        navigate(from, { replace: true });
      } else if (mode === AuthMode.FORGOT_PASSWORD) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

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
      
      // Generic error message to prevent information disclosure
      const genericMessage = language === 'en' 
        ? "Authentication failed. Please check your credentials and try again." 
        : "Autentificare eșuată. Te rog verifică datele și încearcă din nou.";
        
      toast({
        title: language === 'en' ? "Authentication Error" : "Eroare de Autentificare",
        description: genericMessage,
        variant: "destructive",
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
          <div className="bg-warrior-accent rounded-md p-2">
            <span className="font-display font-bold text-white text-xl">H</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {mode === AuthMode.LOGIN && (language === 'en' ? "WELCOME BACK" : "BINE AI REVENIT")}
          {mode === AuthMode.REGISTER && (language === 'en' ? "JOIN HAVE IT ALL" : "ALĂTURĂ-TE HAVE IT ALL")}
          {mode === AuthMode.FORGOT_PASSWORD && (language === 'en' ? "RESET PASSWORD" : "RESETEAZĂ PAROLA")}
        </h1>
        <p className="text-muted-foreground">
          {mode === AuthMode.LOGIN && (language === 'en' ? "Sign in to continue your journey" : "Autentifică-te pentru a continua călătoria")}
          {mode === AuthMode.REGISTER && (language === 'en' ? "Create your account to begin" : "Creează-ți contul pentru a începe")}
          {mode === AuthMode.FORGOT_PASSWORD && (language === 'en' ? "Enter your email to reset your password" : "Introdu email-ul pentru a reseta parola")}
        </p>
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
          className="w-full bg-warrior-accent hover:bg-warrior-accent-hover"
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

        <div className="text-center mt-4">
          {mode === AuthMode.LOGIN ? (
            <button
              type="button"
              onClick={() => setMode(AuthMode.REGISTER)}
              className="text-sm text-muted-foreground hover:text-white"
            >
              {language === 'en' ? "Don't have an account? " : "Nu ai cont? "}
              <span className="text-warrior-accent">
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
              <span className="text-warrior-accent">
                {language === 'en' ? "Sign in" : "Autentifică-te"}
              </span>
            </button>
          ) : null}
        </div>
      </form>

      <div className="fixed bottom-5 left-5">
        <button className="text-muted-foreground hover:text-white flex items-center text-sm">
          <HelpCircle className="h-4 w-4 mr-1" />
          SUPPORT
        </button>
      </div>
    </div>
  );
};
