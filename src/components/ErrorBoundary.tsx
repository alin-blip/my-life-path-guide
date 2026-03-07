import { Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    const componentName = errorInfo.componentStack
      ?.split('\n')
      .find(line => line.trim().startsWith('at '))
      ?.trim()
      .replace(/^at\s+/, '')
      .split(' ')[0] ?? 'Unknown';

    supabase.auth.getSession().then(({ data: { session } }) => {
      return supabase.from('error_logs').insert({
        user_id: session?.user?.id || null,
        error_message: error.message,
        stack_trace: error.stack || '',
        component_name: componentName,
        url: window.location.href,
        user_agent: navigator.userAgent,
        component_stack: errorInfo.componentStack || '',
      });
    }).catch((logError) => {
      console.error('Failed to log error:', logError);
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-red-500/30 bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-6 w-6" />
                Oops! Ceva nu a mers bine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Ne pare rău, dar aplicația a întâmpinat o eroare neașteptată. 
                Echipa noastră a fost notificată automat.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-red-950/40 p-3 rounded border border-red-500/30">
                  <p className="text-xs text-red-300 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="default"
                >
                  Înapoi la Dashboard
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  Reîncarcă pagina
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
