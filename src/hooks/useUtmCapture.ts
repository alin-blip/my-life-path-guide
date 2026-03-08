import { useEffect, useCallback } from 'react';

const UTM_STORAGE_KEY = 'ceo_mind_os_utm';

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_page: string;
  referrer: string;
  captured_at: string;
}

/**
 * Captures UTM parameters from URL on first visit and stores them in sessionStorage.
 * Persists across page navigations within the same session.
 * Only captures on first visit (doesn't overwrite if already captured).
 */
export function useUtmCapture() {
  useEffect(() => {
    // Only capture if not already captured in this session
    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (existing) return;

    const params = new URLSearchParams(window.location.search);
    const utmData: UtmParams = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
      landing_page: window.location.pathname,
      referrer: document.referrer || '',
      captured_at: new Date().toISOString(),
    };

    // Only store if at least one UTM param is present OR there's a referrer
    const hasUtm = utmData.utm_source || utmData.utm_medium || utmData.utm_campaign;
    const hasReferrer = utmData.referrer && !utmData.referrer.includes(window.location.hostname);

    if (hasUtm || hasReferrer) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    } else {
      // Store landing page even without UTM (for organic tracking)
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    }
  }, []);
}

/**
 * Returns the stored UTM params from the current session.
 */
export function getStoredUtm(): UtmParams | null {
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Returns a flat metadata object suitable for Supabase insert or Stripe metadata.
 */
export function getUtmMetadata(): Record<string, string> {
  const utm = getStoredUtm();
  if (!utm) return {};

  const metadata: Record<string, string> = {};
  if (utm.utm_source) metadata.utm_source = utm.utm_source;
  if (utm.utm_medium) metadata.utm_medium = utm.utm_medium;
  if (utm.utm_campaign) metadata.utm_campaign = utm.utm_campaign;
  if (utm.utm_content) metadata.utm_content = utm.utm_content;
  if (utm.utm_term) metadata.utm_term = utm.utm_term;
  if (utm.landing_page) metadata.landing_page = utm.landing_page;
  if (utm.referrer) metadata.referrer = utm.referrer;
  return metadata;
}
