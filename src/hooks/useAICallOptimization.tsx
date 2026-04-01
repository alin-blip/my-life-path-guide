import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAICallOptimizationProps {
  debounceMs?: number;
  maxRetries?: number;
}

interface AICallOptions {
  enableCache?: boolean;
  cacheTimeMs?: number;
  showLoadingToast?: boolean;
  loadingMessage?: string;
}

export const useAICallOptimization = ({ 
  debounceMs = 2000, 
  maxRetries = 3 
}: UseAICallOptimizationProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeRequests, setActiveRequests] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestCacheRef = useRef<Map<string, { timestamp: number; response: any }>>(new Map());
  const { toast } = useToast();

  const generateRequestKey = useCallback((params: any): string => {
    return JSON.stringify(params);
  }, []);

  const isRequestActive = useCallback((requestKey: string): boolean => {
    return activeRequests.has(requestKey);
  }, [activeRequests]);

  const getCachedResponse = useCallback((requestKey: string, cacheTimeMs = 30000) => {
    const cached = requestCacheRef.current.get(requestKey);
    if (cached && Date.now() - cached.timestamp < cacheTimeMs) {
      return cached.response;
    }
    return null;
  }, []);

  const executeAICall = useCallback(async <T = any>(
    aiFunction: () => Promise<T>,
    requestParams: any,
    options: AICallOptions = {}
  ): Promise<T | null> => {
    const {
      enableCache = true,
      cacheTimeMs = 30000,
      showLoadingToast = true,
      loadingMessage = "🤖 AI-ul procesează cererea ta..."
    } = options;

    const requestKey = generateRequestKey(requestParams);

    // Check if request is already active
    if (isRequestActive(requestKey)) {
      toast({
        title: "Cerere în curs",
        description: "Te rog așteaptă finalizarea cererii anterioare.",
        variant: "destructive"
      });
      return null;
    }

    // Check cache first
    if (enableCache) {
      const cachedResponse = getCachedResponse(requestKey, cacheTimeMs);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Clear any existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the request
    return new Promise((resolve) => {
      debounceRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          setActiveRequests(prev => new Set([...prev, requestKey]));

          if (showLoadingToast) {
            toast({
              title: loadingMessage,
              description: "Vă rugăm să așteptați...",
            });
          }

          let lastError: Error | null = null;
          
          // Retry logic
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const response = await aiFunction();
              
              // Cache the response
              if (enableCache) {
                requestCacheRef.current.set(requestKey, {
                  timestamp: Date.now(),
                  response
                });
              }
              
              resolve(response);
              return;
            } catch (error) {
              lastError = error as Error;
              console.error(`AI call attempt ${attempt} failed:`, error);
              
              if (attempt < maxRetries) {
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              }
            }
          }
          
          // All retries failed
          toast({
            title: "Eroare AI",
            description: `Nu am putut procesa cererea după ${maxRetries} încercări. Te rog încearcă din nou.`,
            variant: "destructive"
          });
          
          resolve(null);
        } catch (error) {
          console.error('Unexpected error in AI call:', error);
          toast({
            title: "Eroare neașteptată",
            description: "A apărut o eroare neașteptată. Te rog încearcă din nou.",
            variant: "destructive"
          });
          resolve(null);
        } finally {
          setIsLoading(false);
          setActiveRequests(prev => {
            const newSet = new Set(prev);
            newSet.delete(requestKey);
            return newSet;
          });
        }
      }, debounceMs);
    });
  }, [debounceMs, maxRetries, toast, generateRequestKey, isRequestActive, getCachedResponse]);

  const clearCache = useCallback(() => {
    requestCacheRef.current.clear();
  }, []);

  const cancelPendingRequests = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setActiveRequests(new Set());
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    executeAICall,
    clearCache,
    cancelPendingRequests,
    activeRequestsCount: activeRequests.size
  };
};