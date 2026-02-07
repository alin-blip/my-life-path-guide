import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const GlobalErrorCapture = () => {
  useEffect(() => {
    const logError = async (errorMessage: string, stackTrace: string, componentName: string) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.from('error_logs').insert({
          user_id: session?.user?.id || null,
          error_message: errorMessage,
          stack_trace: stackTrace,
          component_name: componentName,
          url: window.location.href,
          user_agent: navigator.userAgent,
        });
      } catch (e) {
        // Silently fail - don't create error loops
      }
    };

    const handleError = (event: ErrorEvent) => {
      logError(
        event.message || 'Unknown error',
        event.error?.stack || `at ${event.filename}:${event.lineno}:${event.colno}`,
        'window.onerror'
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack || '' : '';
      logError(message, stack, 'unhandledrejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
};
