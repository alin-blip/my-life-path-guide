// Resolve user language by email: user_preferences -> auth metadata -> 'ro'
export type EmailLang = 'ro' | 'en';

export async function resolveLeadLanguage(
  supabase: any,
  email: string,
): Promise<EmailLang> {
  try {
    const { data } = await supabase.rpc('get_user_language_by_email', { _email: email });
    const raw = (typeof data === 'string' ? data : '').toLowerCase();
    return raw.startsWith('en') ? 'en' : 'ro';
  } catch {
    return 'ro';
  }
}
