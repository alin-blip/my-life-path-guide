
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { StackLibrary as StackLibraryComponent } from '@/components/StackLibrary';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, AlertTriangle } from "lucide-react";

const StackLibraryPage = () => {
  const [supabaseConnection, setSupabaseConnection] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkSupabaseConnection();
  }, []);
  
  const checkSupabaseConnection = async () => {
    try {
      if (!supabase) {
        setSupabaseConnection('error');
        setErrorMessage('Supabase client is not initialized');
        return;
      }
      
      // Attempt a simple query to check if Supabase is connected
      const { data, error } = await supabase.from('stack_library').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
        setSupabaseConnection('error');
        setErrorMessage(`Error connecting to Supabase: ${error.message}`);
      } else {
        console.log('Supabase connection successful');
        setSupabaseConnection('connected');
      }
    } catch (err) {
      console.error('Error checking Supabase connection:', err);
      setSupabaseConnection('error');
      setErrorMessage(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Coaching Library
          </h1>
          <p className="text-muted-foreground max-w-md">
            Access your saved coaching sessions and insights.
          </p>
        </div>
        
        {supabaseConnection === 'checking' && (
          <Alert className="bg-blue-500/10 border-blue-500/30 mb-6">
            <AlertTitle className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              Checking Supabase connection...
            </AlertTitle>
            <AlertDescription>
              Verifying connection to the database...
            </AlertDescription>
          </Alert>
        )}
        
        {supabaseConnection === 'connected' && (
          <Alert className="bg-green-500/10 border-green-500/30 mb-6">
            <AlertTitle className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Supabase Connected
            </AlertTitle>
            <AlertDescription>
              Successfully connected to Supabase database.
            </AlertDescription>
          </Alert>
        )}
        
        {supabaseConnection === 'error' && (
          <Alert className="bg-red-500/10 border-red-500/30 mb-6">
            <AlertTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Connection Error
            </AlertTitle>
            <AlertDescription>
              {errorMessage || 'Failed to connect to Supabase. Check console for details.'}
            </AlertDescription>
          </Alert>
        )}
        
        <StackLibraryComponent />
      </div>
    </Layout>
  );
};

export default StackLibraryPage;
