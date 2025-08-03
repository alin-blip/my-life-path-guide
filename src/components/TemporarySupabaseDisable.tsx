// Temporary file to disable all Supabase database calls
// This is needed because the database schema doesn't match the current codebase
// and we need to implement proper authentication first

export const useSupabaseDisable = () => {
  console.warn('Supabase database calls have been temporarily disabled. Using local storage until authentication is implemented.');
  
  return {
    isDisabled: true,
    message: 'Database functionality will be available after implementing authentication'
  };
};