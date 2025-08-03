
// This file extends the Window interface to include the Supabase client
import { SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    supabase?: any; // Using 'any' for simplicity, but you can define a more specific type if needed
  }
}
