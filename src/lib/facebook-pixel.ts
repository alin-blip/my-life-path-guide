// Facebook Pixel Module
// ID: 974405070779975

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

export const FB_PIXEL_ID = '974405070779975';

// Generate a unique event_id for CAPI deduplication (future server-side hook)
const genEventId = () =>
  (globalThis.crypto?.randomUUID?.() as string | undefined) ??
  `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

// Track Lead event
export const trackLead = (params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventID = params?.event_id || genEventId();
    window.fbq('track', 'Lead', { ...(params || {}) }, { eventID });
    console.log('[FB Pixel] Lead event tracked', { eventID });
  }
};

// Track Purchase event
export const trackPurchase = (
  value: number,
  currency: string = 'EUR',
  extra?: { content_ids?: string[]; content_name?: string; event_id?: string }
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventID = extra?.event_id || genEventId();
    window.fbq('track', 'Purchase', {
      value,
      currency,
      ...(extra?.content_ids ? { content_ids: extra.content_ids } : {}),
      ...(extra?.content_name ? { content_name: extra.content_name } : {}),
    }, { eventID });
    console.log(`[FB Pixel] Purchase event tracked: ${value} ${currency}`, { eventID });
  }
};

// Track ViewContent (landing pages, product pages, etc.)
export const trackViewContent = (contentName: string, contentCategory?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const eventID = genEventId();
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      ...(contentCategory ? { content_category: contentCategory } : {}),
    }, { eventID });
    console.log(`[FB Pixel] ViewContent: ${contentName}`, { eventID });
  }
};

// Track custom event
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
    console.log(`[FB Pixel] ${eventName} event tracked`, params);
  }
};

// ===== FUNNEL TRACKING EVENTS =====

// Track quiz completion
export const trackQuizCompleted = (quizType: string, score?: number) => {
  trackEvent('CompleteRegistration', { 
    content_name: quizType,
    value: score,
    currency: 'EUR'
  });
  console.log(`[Funnel] Quiz completed: ${quizType}, score: ${score}`);
};

// Track account creation
export const trackAccountCreated = (source: string) => {
  trackEvent('StartTrial', { 
    content_name: source,
    currency: 'EUR',
    value: 0
  });
  console.log(`[Funnel] Account created from: ${source}`);
};

// Track challenge day started
export const trackChallengeDayStarted = (dayNumber: number) => {
  trackEvent('ViewContent', { 
    content_name: `challenge_day_${dayNumber}`,
    content_type: 'challenge'
  });
  console.log(`[Funnel] Challenge Day ${dayNumber} started`);
};

// Track checkout initiated
export const trackCheckoutInitiated = (planId: string, value: number, currency: string = 'EUR') => {
  trackEvent('InitiateCheckout', { 
    content_name: planId,
    value,
    currency
  });
  console.log(`[Funnel] Checkout initiated: ${planId}, ${value} ${currency}`);
};
