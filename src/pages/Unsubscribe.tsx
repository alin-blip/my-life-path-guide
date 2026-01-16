import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processUnsubscribe = async () => {
      const trackingId = searchParams.get('id');

      if (!trackingId) {
        setStatus('error');
        setMessage('Link invalid. Te rugăm să contactezi suportul.');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('unsubscribe-email', {
          body: {},
          headers: {},
        });

        // Call the function with the tracking ID as query param
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe-email?id=${trackingId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          setStatus('success');
          setMessage('Ai fost dezabonat cu succes. Nu vei mai primi emailuri de la noi.');
        } else {
          throw new Error('Failed to unsubscribe');
        }
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        setMessage('A apărut o eroare. Te rugăm să încerci din nou sau să contactezi suportul.');
      }
    };

    processUnsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Se procesează...'}
            {status === 'success' && 'Dezabonare Confirmată'}
            {status === 'error' && 'A apărut o problemă'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            {message || 'Te rugăm să aștepți...'}
          </p>

          {status === 'success' && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <Mail className="w-5 h-5 inline-block mr-2" />
              Ne pare rău să te vedem plecând. Dacă te-ai dezabonat din greșeală, 
              poți oricând să te înscrii din nou pe site-ul nostru.
            </div>
          )}

          <div className="pt-4">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Înapoi la pagina principală
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
